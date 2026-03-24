"""Source router: maps ProspectType → data source activation matrix.

Each ProspectType has a SourceConfig that specifies which of the 13 data
source groups to activate, skip, or conditionally include. Conditional
sources are only queried if prior data suggests relevance.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from ..prospect_type import ProspectType


@dataclass(frozen=True)
class SourceConfig:
    """Which data sources to activate for a given prospect type.

    Boolean fields: True = always query, False = skip.
    String fields: "yes" | "conditional" | "skip" for sources
    that have conditional logic handled in the cluster.
    """
    fec_core: bool = True
    fec_extended: str = "skip"       # "yes" | "conditional" | "skip"
    propublica: str = "skip"         # "yes" | "conditional" | "skip"
    sec_company: str = "skip"        # "yes" | "conditional" | "skip"
    edgar_search: str = "skip"       # "yes" | "conditional" | "skip"
    edgar_form4: bool = False
    usaspending: str = "skip"        # "yes" | "conditional" | "skip"
    wikipedia: bool = True           # always True
    opencorporates: bool = False
    lda: str = "skip"                # "yes" | "conditional" | "skip"
    finra: bool = False
    federal_register: str = "skip"   # "yes" | "conditional" | "skip"
    web_search: bool = True          # always True
    search_limits: dict = field(default_factory=dict)


# --- Per-type configurations (from plan Section 2 templates) ---

_CORPORATE = SourceConfig(
    fec_core=True,
    fec_extended="conditional",      # if FEC data exists
    propublica="skip",               # corporations don't file 990s
    sec_company="yes",
    edgar_search="yes",
    edgar_form4=True,                # insider transactions = wealth signal
    usaspending="yes",
    wikipedia=True,
    opencorporates=True,
    lda="conditional",               # rare but valuable
    finra=True,                      # financial professional status
    federal_register="skip",
    web_search=True,
)

_GOVERNMENT = SourceConfig(
    fec_core=True,
    fec_extended="yes",              # committee involvement, expenditures
    propublica="skip",               # government entities don't file 990s
    sec_company="skip",
    edgar_search="conditional",      # only if CIK found (advisory roles on public cos)
    edgar_form4=False,
    usaspending="yes",
    wikipedia=True,
    opencorporates=False,
    lda="yes",                       # key for government prospects
    finra=False,
    federal_register="yes",          # appointments, rule-making
    web_search=True,
)

_FOUNDATION = SourceConfig(
    fec_core=True,
    fec_extended="skip",
    propublica="yes",                # core — revenue, assets, grants, officer comp
    sec_company="skip",
    edgar_search="conditional",      # only if wiki suggests public investments
    edgar_form4=False,
    usaspending="yes",
    wikipedia=True,
    opencorporates=True,
    lda="skip",
    finra=False,
    federal_register="skip",
    web_search=True,
)

_NONPROFIT = SourceConfig(
    fec_core=True,
    fec_extended="skip",
    propublica="yes",                # core — org financials
    sec_company="skip",
    edgar_search="skip",             # less relevant than for foundations
    edgar_form4=False,
    usaspending="yes",
    wikipedia=True,
    opencorporates=True,
    lda="skip",
    finra=False,
    federal_register="skip",
    web_search=True,
)

_ACADEMIC = SourceConfig(
    fec_core=True,
    fec_extended="skip",
    propublica="yes",                # university 990 filings
    sec_company="skip",
    edgar_search="conditional",      # only if large university with investments
    edgar_form4=False,
    usaspending="yes",               # federal research grants
    wikipedia=True,
    opencorporates=False,
    lda="skip",
    finra=False,
    federal_register="yes",          # research grant announcements
    web_search=True,
)

_DAF = SourceConfig(
    # Research the PERSON behind the fund, not the DAF entity
    fec_core=True,
    fec_extended="conditional",      # if FEC data exists
    propublica="skip",               # DAF sponsor's 990 not useful
    sec_company="conditional",       # if person has CIK
    edgar_search="conditional",      # if person has SEC presence
    edgar_form4=True,                # insider transactions = wealth signal
    usaspending="skip",              # DAFs don't receive federal awards
    wikipedia=True,
    opencorporates=True,
    lda="skip",
    finra=True,                      # donor may be financial professional
    federal_register="skip",
    web_search=True,
)

_INDIVIDUAL = SourceConfig(
    fec_core=True,
    fec_extended="conditional",      # if FEC data exists
    propublica="conditional",        # if affiliated org discovered (Sprint 4 full implementation)
    sec_company="conditional",       # if person has CIK
    edgar_search="yes",
    edgar_form4=True,                # insider transactions = direct wealth
    usaspending="conditional",       # if org discovered (Sprint 4 full implementation)
    wikipedia=True,
    opencorporates=True,
    lda="conditional",               # if wiki/web suggests govt connections
    finra=True,
    federal_register="conditional",  # if wiki/web suggests govt connections (Sprint 4)
    web_search=True,
)

_UNKNOWN = SourceConfig(
    # All sources with reduced limits (shallow pass)
    fec_core=True,
    fec_extended="conditional",
    propublica="yes",
    sec_company="yes",
    edgar_search="yes",
    edgar_form4=True,
    usaspending="yes",
    wikipedia=True,
    opencorporates=True,
    lda="yes",
    finra=True,
    federal_register="yes",
    web_search=True,
    search_limits={
        "fec_core": 5,
        "fec_extended": 3,
        "propublica": 3,
        "edgar_search": 5,
        "edgar_form4": 3,
        "usaspending": 5,
        "opencorporates": 3,
        "lda": 3,
        "federal_register": 3,
    },
)


_CONFIG_MAP: dict[ProspectType, SourceConfig] = {
    ProspectType.CORPORATE: _CORPORATE,
    ProspectType.GOVERNMENT: _GOVERNMENT,
    ProspectType.FOUNDATION: _FOUNDATION,
    ProspectType.NONPROFIT: _NONPROFIT,
    ProspectType.ACADEMIC: _ACADEMIC,
    ProspectType.DAF: _DAF,
    ProspectType.INDIVIDUAL: _INDIVIDUAL,
    ProspectType.UNKNOWN: _UNKNOWN,
}


def get_source_config(prospect_type: ProspectType) -> SourceConfig:
    """Look up the data source activation matrix for a prospect type."""
    return _CONFIG_MAP.get(prospect_type, _UNKNOWN)
