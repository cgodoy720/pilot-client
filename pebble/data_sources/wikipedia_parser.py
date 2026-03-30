"""Wikipedia wikitext parser: infobox extraction, board memberships, career history.

Pragmatic regex-based parsing — no full wikitext parser dependency.
"""

import re

# Infobox template pattern: {{Infobox person|...}} or {{Infobox ...|...}}
_INFOBOX_RE = re.compile(
    r"\{\{Infobox[^|]*\|(.*?)\}\}(?=\s*\n|\s*$|\s*\{\{|\s*\|)",
    re.DOTALL | re.IGNORECASE,
)

# Single infobox field: | key = value (multiline until next | or }})
_FIELD_RE = re.compile(
    r"\|\s*([a-z_\d]+)\s*=\s*(.*?)(?=\n\s*\||\n\s*\}\}|$)",
    re.DOTALL | re.IGNORECASE,
)

# Board/trustee/commissioner patterns in article text
_BOARD_RE = re.compile(
    r"(?:(?:board\s+(?:of\s+)?(?:directors?|trustees?|governors?|commissioners?))"
    r"|(?:(?:trustee|commissioner|board\s+member|director)\s+(?:of|at|for)))"
    r"\s+(?:of\s+)?(?:the\s+)?([A-Z][\w\s&,'.()-]+?)(?=[,;.\n]|$)",
    re.IGNORECASE,
)

# Role patterns: "served as X of/at Y", "appointed X of Y", "became X of Y", etc.
_ROLE_RE = re.compile(
    r"(?:(?:served?|appointed|became|elected|named|is|was|as)\s+(?:the\s+)?)"
    r"((?:chairman|chairwoman|chair|president|ceo|cfo|coo|chief\s+\w+\s+officer|"
    r"director|vice\s+president|vp|executive\s+director|managing\s+director|"
    r"secretary|treasurer|partner|founder|co-founder|general\s+counsel|"
    r"chancellor|dean|provost|superintendent|commissioner|governor|senator|"
    r"representative|mayor|administrator|head)"
    r"(?:\s+(?:of|at|for|and\s+\w+))?)"
    r"\s+(?:of\s+|at\s+|for\s+)?(?:the\s+)?"
    r"([A-Z][\w\s&,'.()-]+?)(?=[,;.\n]|$)",
    re.IGNORECASE,
)

# Temporal markers
_FORMER_RE = re.compile(r"\b(?:former(?:ly)?|ex-|retired|past|previous(?:ly)?|until|left|resigned|stepped\s+down)\b", re.IGNORECASE)
_CURRENT_RE = re.compile(r"\b(?:current(?:ly)?|present|serves?\s+as|serving\s+as|is\s+the|since\s+\d{4})\b", re.IGNORECASE)

# Common infobox fields of interest
_INFOBOX_FIELDS = {
    # Person fields
    "occupation", "title", "organization", "boards", "known_for",
    "alma_mater", "birth_date", "nationality", "spouse", "children",
    "net_worth", "employer", "party", "office", "term_start", "term_end",
    "predecessor", "successor", "education", "residence", "awards",
    "name", "birth_name", "birth_place", "death_date", "death_place",
    # Organization fields (Infobox company / Infobox organization)
    "industry", "website", "homepage", "type", "founded", "headquarters",
    "num_employees", "revenue", "founder",
}


def _clean_wikitext(text: str) -> str:
    """Strip common wikitext markup from a value."""
    # Remove [[link|display]] -> display, [[link]] -> link
    text = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", text)
    # Remove {{small|...}}, {{nowrap|...}}, etc.
    text = re.sub(r"\{\{(?:small|nowrap|flatlist|plainlist|unbulleted list)[|}]", "", text, flags=re.IGNORECASE)
    # Remove remaining {{ }} (but not nested deeply)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Remove <ref>...</ref> and <ref ... />
    text = re.sub(r"<ref[^>]*(?:>.*?</ref>|/>)", "", text, flags=re.DOTALL)
    # Clean up whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_infobox_block(wikitext: str) -> str | None:
    """Extract the full infobox block from wikitext, handling nested braces."""
    start = wikitext.lower().find("{{infobox")
    if start == -1:
        return None

    depth = 0
    i = start
    while i < len(wikitext) - 1:
        if wikitext[i:i+2] == "{{":
            depth += 1
            i += 2
        elif wikitext[i:i+2] == "}}":
            depth -= 1
            if depth == 0:
                return wikitext[start:i+2]
            i += 2
        else:
            i += 1
    return None


def parse_infobox(wikitext: str) -> dict:
    """Extract structured fields from MediaWiki infobox templates.

    Returns dict of field_name -> cleaned_value for known person-relevant fields.
    """
    block = _extract_infobox_block(wikitext)
    if not block:
        return {}

    result = {}
    for match in _FIELD_RE.finditer(block):
        key = match.group(1).strip().lower()
        value = _clean_wikitext(match.group(2))
        if key in _INFOBOX_FIELDS and value:
            result[key] = value
    return result


def _temporal_status(context: str) -> str:
    """Determine if a mention is current, former, or unknown based on surrounding text."""
    if _FORMER_RE.search(context):
        return "former"
    if _CURRENT_RE.search(context):
        return "current"
    return "unknown"


def extract_board_memberships(text: str) -> list[dict]:
    """Scan article text for board/trustee/commissioner mentions.

    Returns list of {organization, role, temporal_status: current|former|unknown}.
    """
    memberships = []
    seen = set()

    for match in _BOARD_RE.finditer(text):
        org = match.group(1).strip().rstrip(".,;")
        if not org or len(org) < 3 or org.lower() in seen:
            continue
        seen.add(org.lower())

        # Get surrounding context (100 chars before and after) for temporal detection
        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 100)
        context = text[start:end]

        memberships.append({
            "organization": org,
            "role": "board member",
            "temporal_status": _temporal_status(context),
        })

    return memberships


def extract_career_history(text: str) -> list[dict]:
    """Extract positions/roles from article text.

    Returns list of {title, organization, temporal_status}.
    """
    positions = []
    seen = set()

    for match in _ROLE_RE.finditer(text):
        title = match.group(1).strip().rstrip(".,;")
        # Strip trailing prepositions that get captured in the title group
        title = re.sub(r"\s+(?:of|at|for|and\s+\w+)$", "", title, flags=re.IGNORECASE)
        org = match.group(2).strip().rstrip(".,;")

        if not title or not org or len(org) < 3:
            continue

        key = (title.lower(), org.lower())
        if key in seen:
            continue
        seen.add(key)

        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 100)
        context = text[start:end]

        positions.append({
            "title": title,
            "organization": org,
            "temporal_status": _temporal_status(context),
        })

    return positions
