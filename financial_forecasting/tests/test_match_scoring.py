"""Tests for the invoice-opportunity match scoring algorithm.

The scoring logic lives inside simple_server.search_opportunities as
`calculate_match_score`. We extract and test the algorithm here without
needing a running server or Salesforce connection.

Weights:
  - Name match:     40%  (SequenceMatcher ratio * 100 * 0.4)
  - Amount match:   30%  (percentage closeness * 0.3)
  - Date proximity: 20%  (tiered by days apart * 0.2)
  - Stage bonus:    flat +30/+25/-10/-20 depending on stage group
"""

import sys
import os
from datetime import datetime
from difflib import SequenceMatcher

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from models import OpportunityStage, OPEN_STAGES, COLLECTING_STAGES, CLOSED_STAGES


# ---------------------------------------------------------------------------
# Reproduce the scoring function exactly as in simple_server.py so we can
# test it without importing the FastAPI app or hitting Salesforce.
# ---------------------------------------------------------------------------
def calculate_match_score(opp, customer_name, invoice_amount, invoice_date):
    """Exact copy of the scoring logic from simple_server.search_opportunities."""
    score = 0
    explanation = {}

    # Name matching (40% weight)
    if customer_name and opp.get('AccountName'):
        name_ratio = SequenceMatcher(
            None,
            customer_name.lower(),
            opp['AccountName'].lower(),
        ).ratio() * 100
        score += name_ratio * 0.4
        explanation['name_match'] = name_ratio

    # Amount matching (30% weight)
    if invoice_amount and opp.get('Amount'):
        opp_amount = float(opp['Amount'])
        amount_diff = abs(opp_amount - invoice_amount)
        amount_ratio = max(0, 100 - (amount_diff / max(opp_amount, invoice_amount) * 100))
        score += amount_ratio * 0.3
        explanation['amount_match'] = amount_ratio

    # Date proximity (20% weight)
    if invoice_date and opp.get('CloseDate'):
        try:
            inv_date = datetime.strptime(invoice_date, '%Y-%m-%d')
            close_date = datetime.strptime(opp['CloseDate'], '%Y-%m-%d')
            days_diff = abs((inv_date - close_date).days)

            if days_diff <= 30:
                date_score = 100
            elif days_diff <= 90:
                date_score = 100 - ((days_diff - 30) * 1.5)
            elif days_diff <= 180:
                date_score = max(0, 10 - ((days_diff - 90) / 30))
            else:
                date_score = 0

            score += date_score * 0.2
            explanation['date_proximity_days'] = days_diff
        except Exception:
            pass

    # Stage weighting (flat bonus/penalty)
    stage = opp.get('StageName', '')
    _collecting_values = {s.value for s in COLLECTING_STAGES}
    _closed_values = {s.value for s in CLOSED_STAGES}
    _open_values = {s.value for s in OPEN_STAGES}
    if stage in _collecting_values:
        score += 30
        explanation['stage_bonus'] = 'Active collection'
    elif stage == OpportunityStage.CLOSED_COMPLETED.value:
        score += 25
        explanation['stage_bonus'] = 'Completed'
    elif stage in (
        OpportunityStage.CLOSED_LOST.value,
        OpportunityStage.CLOSED_DID_NOT_FULFILL.value,
        OpportunityStage.WITHDRAWN.value,
    ):
        score -= 20
        explanation['stage_bonus'] = 'Closed/Lost'
    elif stage in _open_values:
        score -= 10
        explanation['stage_bonus'] = 'Open pipeline'
    else:
        score -= 10
        explanation['stage_bonus'] = 'Unknown stage'

    return score, explanation


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
def make_opp(**overrides):
    base = {
        'Id': 'OPP-001',
        'Name': 'Spring Grant 2026',
        'AccountName': 'Pursuit Foundation',
        'Amount': 50000,
        'StageName': OpportunityStage.COLLECTING.value,
        'CloseDate': '2026-03-15',
    }
    base.update(overrides)
    return base


# ===========================================================================
# Name matching (40%)
# ===========================================================================
class TestNameMatching:
    def test_exact_match_gives_full_name_score(self):
        opp = make_opp(AccountName='Pursuit Foundation')
        score, expl = calculate_match_score(opp, 'Pursuit Foundation', None, None)
        assert expl['name_match'] == 100.0
        # 100 * 0.4 = 40, plus stage bonus 30 = 70
        assert score == pytest.approx(70.0)

    def test_case_insensitive(self):
        opp = make_opp(AccountName='pursuit FOUNDATION')
        _, expl = calculate_match_score(opp, 'Pursuit Foundation', None, None)
        assert expl['name_match'] == 100.0

    def test_partial_match(self):
        opp = make_opp(AccountName='Pursuit Foundation Inc.')
        _, expl = calculate_match_score(opp, 'Pursuit Foundation', None, None)
        # Should be high but < 100 due to "Inc." suffix
        assert 70 < expl['name_match'] < 100

    def test_poor_match(self):
        opp = make_opp(AccountName='Acme Corporation')
        _, expl = calculate_match_score(opp, 'Zebra Industries', None, None)
        assert expl['name_match'] < 50

    def test_missing_account_name(self):
        opp = make_opp(AccountName=None)
        score, expl = calculate_match_score(opp, 'Pursuit', None, None)
        assert 'name_match' not in expl

    def test_missing_customer_name(self):
        opp = make_opp()
        score, expl = calculate_match_score(opp, None, None, None)
        assert 'name_match' not in expl


# ===========================================================================
# Amount matching (30%)
# ===========================================================================
class TestAmountMatching:
    def test_exact_amount(self):
        opp = make_opp(Amount=50000)
        _, expl = calculate_match_score(opp, None, 50000.0, None)
        assert expl['amount_match'] == 100.0

    def test_close_amount(self):
        opp = make_opp(Amount=50000)
        _, expl = calculate_match_score(opp, None, 48000.0, None)
        # diff=2000, max=50000 → 4% off → score = 96
        assert expl['amount_match'] == pytest.approx(96.0)

    def test_very_different_amount(self):
        opp = make_opp(Amount=100000)
        _, expl = calculate_match_score(opp, None, 10000.0, None)
        # diff=90000, max=100000 → 90% off → score = 10
        assert expl['amount_match'] == pytest.approx(10.0)

    def test_wildly_different_floors_to_zero(self):
        opp = make_opp(Amount=100000)
        _, expl = calculate_match_score(opp, None, 1.0, None)
        assert expl['amount_match'] == pytest.approx(0.0, abs=0.1)

    def test_missing_opp_amount(self):
        opp = make_opp(Amount=None)
        _, expl = calculate_match_score(opp, None, 50000.0, None)
        assert 'amount_match' not in expl

    def test_missing_invoice_amount(self):
        opp = make_opp(Amount=50000)
        _, expl = calculate_match_score(opp, None, None, None)
        assert 'amount_match' not in expl


# ===========================================================================
# Date proximity (20%)
# ===========================================================================
class TestDateProximity:
    def test_same_day(self):
        opp = make_opp(CloseDate='2026-03-15')
        score, expl = calculate_match_score(opp, None, None, '2026-03-15')
        assert expl['date_proximity_days'] == 0
        # 100 * 0.2 = 20, plus stage bonus 30
        assert score == pytest.approx(50.0)

    def test_within_30_days(self):
        opp = make_opp(CloseDate='2026-03-15')
        _, expl = calculate_match_score(opp, None, None, '2026-04-10')
        assert expl['date_proximity_days'] == 26
        # Still 100 because <= 30

    def test_31_to_90_day_range(self):
        opp = make_opp(CloseDate='2026-03-15')
        _, expl = calculate_match_score(opp, None, None, '2026-05-15')
        days = expl['date_proximity_days']
        assert 30 < days <= 90
        # date_score = 100 - ((days - 30) * 1.5)

    def test_91_to_180_day_range(self):
        opp = make_opp(CloseDate='2026-03-15')
        _, expl = calculate_match_score(opp, None, None, '2026-07-15')
        days = expl['date_proximity_days']
        assert 90 < days <= 180

    def test_beyond_180_days_zero(self):
        opp = make_opp(CloseDate='2026-03-15')
        score, expl = calculate_match_score(opp, None, None, '2027-03-15')
        assert expl['date_proximity_days'] == 365
        # date_score = 0, so only stage bonus
        assert score == pytest.approx(30.0)

    def test_invalid_date_skipped(self):
        opp = make_opp(CloseDate='not-a-date')
        _, expl = calculate_match_score(opp, None, None, '2026-03-15')
        assert 'date_proximity_days' not in expl

    def test_missing_close_date(self):
        opp = make_opp(CloseDate=None)
        _, expl = calculate_match_score(opp, None, None, '2026-03-15')
        assert 'date_proximity_days' not in expl


# ===========================================================================
# Stage bonuses / penalties
# ===========================================================================
class TestStageScoring:
    def test_collecting_stage_max_bonus(self):
        opp = make_opp(StageName=OpportunityStage.COLLECTING.value)
        score, expl = calculate_match_score(opp, None, None, None)
        assert score == 30
        assert 'Active' in expl['stage_bonus']

    def test_closed_completed_bonus(self):
        opp = make_opp(StageName=OpportunityStage.CLOSED_COMPLETED.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == 25

    def test_closed_lost_penalty(self):
        opp = make_opp(StageName=OpportunityStage.CLOSED_LOST.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -20

    def test_did_not_fulfill_penalty(self):
        opp = make_opp(StageName=OpportunityStage.CLOSED_DID_NOT_FULFILL.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -20

    def test_withdrawn_penalty(self):
        opp = make_opp(StageName=OpportunityStage.WITHDRAWN.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -20

    def test_open_stage_slight_penalty(self):
        opp = make_opp(StageName=OpportunityStage.QUALIFYING.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -10

    def test_unknown_stage_penalty(self):
        opp = make_opp(StageName='SomeNewStage')
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -10

    def test_empty_stage_penalty(self):
        opp = make_opp(StageName='')
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == -10


# ===========================================================================
# Combined scoring
# ===========================================================================
class TestCombinedScoring:
    def test_perfect_match_all_signals(self):
        """Exact name, exact amount, same date, collecting stage → maximum score."""
        opp = make_opp(
            AccountName='Pursuit Foundation',
            Amount=50000,
            CloseDate='2026-03-15',
            StageName=OpportunityStage.COLLECTING.value,
        )
        score, expl = calculate_match_score(opp, 'Pursuit Foundation', 50000.0, '2026-03-15')
        # name: 100*0.4=40, amount: 100*0.3=30, date: 100*0.2=20, stage: +30 = 120
        assert score == pytest.approx(120.0)
        assert expl['name_match'] == 100.0
        assert expl['amount_match'] == 100.0
        assert expl['date_proximity_days'] == 0

    def test_good_match_but_lost_stage(self):
        """Perfect signals but closed/lost → significantly lower score."""
        opp = make_opp(
            AccountName='Pursuit Foundation',
            Amount=50000,
            CloseDate='2026-03-15',
            StageName=OpportunityStage.CLOSED_LOST.value,
        )
        score, _ = calculate_match_score(opp, 'Pursuit Foundation', 50000.0, '2026-03-15')
        # 40 + 30 + 20 - 20 = 70
        assert score == pytest.approx(70.0)

    def test_no_signals_only_stage(self):
        """No invoice data provided — score is purely from stage."""
        opp = make_opp(StageName=OpportunityStage.COLLECTING.value)
        score, _ = calculate_match_score(opp, None, None, None)
        assert score == 30

    def test_ordering_by_score(self):
        """Verify that better-matched opps score higher for ranking."""
        good_opp = make_opp(AccountName='Pursuit Foundation', Amount=50000)
        bad_opp = make_opp(AccountName='Random Corp', Amount=5000)
        good_score, _ = calculate_match_score(good_opp, 'Pursuit Foundation', 50000.0, None)
        bad_score, _ = calculate_match_score(bad_opp, 'Pursuit Foundation', 50000.0, None)
        assert good_score > bad_score
