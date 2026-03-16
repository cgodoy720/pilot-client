"""Tests for pure calculation functions in forecasting_engine.py.

Focuses on the pure functions (no I/O, no mocking needed) and the
deterministic methods on ForecastingEngine that only read from cache.
"""

import sys
import os
from datetime import date, timedelta
from decimal import Decimal

import pytest

# Add parent to path so we can import from financial_forecasting
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from forecasting_engine import (
    calculate_weighted_pipeline,
    calculate_expected_revenue_in_window,
    identify_risk_factors,
    ForecastAssumptions,
    ForecastingEngine,
)
from models import OpportunityStage, PaymentTerms, ForecastingMetrics, PaymentForecast


# ---------------------------------------------------------------------------
# calculate_weighted_pipeline
# ---------------------------------------------------------------------------
class TestCalculateWeightedPipeline:
    def test_empty_list(self):
        assert calculate_weighted_pipeline([]) == Decimal('0')

    def test_single_opportunity(self):
        opps = [{"Amount": 100000, "Probability": 50}]
        assert calculate_weighted_pipeline(opps) == Decimal('50000')

    def test_multiple_opportunities(self):
        opps = [
            {"Amount": 100000, "Probability": 50},
            {"Amount": 200000, "Probability": 25},
        ]
        # 100k * 0.5 + 200k * 0.25 = 50k + 50k = 100k
        assert calculate_weighted_pipeline(opps) == Decimal('100000')

    def test_missing_fields_default_to_zero(self):
        opps = [{"Amount": 100000}, {}]
        assert calculate_weighted_pipeline(opps) == Decimal('0')

    def test_zero_probability(self):
        opps = [{"Amount": 100000, "Probability": 0}]
        assert calculate_weighted_pipeline(opps) == Decimal('0')

    def test_full_probability(self):
        opps = [{"Amount": 100000, "Probability": 100}]
        assert calculate_weighted_pipeline(opps) == Decimal('100000')


# ---------------------------------------------------------------------------
# calculate_expected_revenue_in_window
# ---------------------------------------------------------------------------
class TestCalculateExpectedRevenueInWindow:
    def test_empty_list(self):
        result = calculate_expected_revenue_in_window([], date(2026, 3, 1), 30)
        assert result == Decimal('0')

    def test_opportunity_within_window(self):
        opps = [
            {"Amount": 100000, "Probability": 50, "CloseDate": "2026-03-15"},
        ]
        result = calculate_expected_revenue_in_window(opps, date(2026, 3, 1), 30)
        assert result == Decimal('50000')

    def test_opportunity_outside_window(self):
        opps = [
            {"Amount": 100000, "Probability": 50, "CloseDate": "2026-06-01"},
        ]
        result = calculate_expected_revenue_in_window(opps, date(2026, 3, 1), 30)
        assert result == Decimal('0')

    def test_opportunity_on_cutoff_date_is_included(self):
        opps = [
            {"Amount": 100000, "Probability": 80, "CloseDate": "2026-03-31"},
        ]
        # Window: March 1 + 30 days = March 31 (inclusive)
        result = calculate_expected_revenue_in_window(opps, date(2026, 3, 1), 30)
        assert result == Decimal('80000')

    def test_missing_close_date_is_skipped(self):
        opps = [
            {"Amount": 100000, "Probability": 50},
            {"Amount": 50000, "Probability": 100, "CloseDate": "2026-03-10"},
        ]
        result = calculate_expected_revenue_in_window(opps, date(2026, 3, 1), 30)
        assert result == Decimal('50000')


# ---------------------------------------------------------------------------
# identify_risk_factors
# ---------------------------------------------------------------------------
class TestIdentifyRiskFactors:
    def test_overdue_close_date(self):
        risks = identify_risk_factors(
            opp={},
            stage=OpportunityStage.QUALIFYING,
            close_date=date(2026, 3, 1),
            amount=Decimal('10000'),
            account_win_rate=None,
            today=date(2026, 3, 10),
        )
        assert "Overdue close date" in risks

    def test_close_date_within_one_week(self):
        risks = identify_risk_factors(
            opp={},
            stage=OpportunityStage.CONTRACT_CREATION,
            close_date=date(2026, 3, 15),
            amount=Decimal('10000'),
            account_win_rate=None,
            today=date(2026, 3, 10),
        )
        assert "Close date within 1 week" in risks

    def test_early_stage_near_term_close(self):
        risks = identify_risk_factors(
            opp={},
            stage=OpportunityStage.LEAD_GEN,
            close_date=date(2026, 3, 20),
            amount=Decimal('10000'),
            account_win_rate=None,
            today=date(2026, 3, 1),
        )
        assert "Early stage with near-term close date" in risks

    def test_large_deal_size(self):
        risks = identify_risk_factors(
            opp={},
            stage=OpportunityStage.CONTRACT_CREATION,
            close_date=date(2026, 6, 1),
            amount=Decimal('150000'),
            account_win_rate=None,
            today=date(2026, 3, 1),
        )
        assert "Large deal size" in risks

    def test_low_account_win_rate(self):
        risks = identify_risk_factors(
            opp={},
            stage=OpportunityStage.CONTRACT_CREATION,
            close_date=date(2026, 6, 1),
            amount=Decimal('10000'),
            account_win_rate=0.2,
            today=date(2026, 3, 1),
        )
        assert "Low historical win rate for account" in risks

    def test_extended_payment_terms(self):
        risks = identify_risk_factors(
            opp={"Payment_Terms__c": "Net 90"},
            stage=OpportunityStage.CONTRACT_CREATION,
            close_date=date(2026, 6, 1),
            amount=Decimal('10000'),
            account_win_rate=None,
            today=date(2026, 3, 1),
        )
        assert "Extended payment terms" in risks

    def test_no_risks_for_healthy_opportunity(self):
        risks = identify_risk_factors(
            opp={"Payment_Terms__c": "Net 30"},
            stage=OpportunityStage.CONTRACT_CREATION,
            close_date=date(2026, 6, 1),
            amount=Decimal('50000'),
            account_win_rate=0.7,
            today=date(2026, 3, 1),
        )
        assert risks == []


# ---------------------------------------------------------------------------
# ForecastAssumptions — verify defaults are documented
# ---------------------------------------------------------------------------
class TestForecastAssumptions:
    def test_default_values_are_positive(self):
        assert ForecastAssumptions.DEFAULT_CASH_POSITION > 0
        assert ForecastAssumptions.DEFAULT_MONTHLY_EXPENSES > 0
        assert ForecastAssumptions.DEFAULT_AVG_PAYMENT_DELAY_DAYS > 0
        assert ForecastAssumptions.DEFAULT_COLLECTION_RATE > 0


# ---------------------------------------------------------------------------
# ForecastingEngine — deterministic methods (no async I/O)
# ---------------------------------------------------------------------------
class TestForecastingEngineCalculations:
    """Tests for ForecastingEngine methods that only read from cache."""

    @pytest.fixture
    def engine(self):
        """Engine with a pre-populated cache (no real MCP client needed)."""
        engine = ForecastingEngine(mcp_client=None)
        engine.historical_data_cache = {
            "closed_opportunities": [
                {"Id": "1", "AccountId": "A1", "Amount": 50000, "StageName": "Closed / Completed",
                 "CreatedDate": "2025-01-01", "CloseDate": "2025-03-01"},
                {"Id": "2", "AccountId": "A1", "Amount": 30000, "StageName": "Closed / Completed",
                 "CreatedDate": "2025-04-01", "CloseDate": "2025-06-01"},
                {"Id": "3", "AccountId": "A1", "Amount": 40000, "StageName": "Closed Lost",
                 "CreatedDate": "2025-07-01", "CloseDate": "2025-09-01"},
                {"Id": "4", "AccountId": "A2", "Amount": 80000, "StageName": "Closed / Completed",
                 "CreatedDate": "2025-02-01", "CloseDate": "2025-05-01"},
            ],
            "invoices": [],
            "payments": [],
        }
        return engine

    # -- _get_account_historical_win_rate --
    def test_account_win_rate_with_sufficient_data(self, engine):
        # A1 has 3 opps: 2 won, 1 lost → 2/3 ≈ 0.667
        rate = engine._get_account_historical_win_rate("A1")
        assert rate is not None
        assert abs(rate - 2 / 3) < 0.001

    def test_account_win_rate_insufficient_data(self, engine):
        # A2 has only 1 opp → needs at least 3
        assert engine._get_account_historical_win_rate("A2") is None

    def test_account_win_rate_unknown_account(self, engine):
        assert engine._get_account_historical_win_rate("UNKNOWN") is None

    # -- _get_deal_size_adjustment --
    def test_deal_size_normal(self, engine):
        # Avg closed amount = (50k+30k+40k+80k)/4 = 50k
        # Amount 50k is average → 1.0
        assert engine._get_deal_size_adjustment(Decimal('50000')) == 1.0

    def test_deal_size_very_large(self, engine):
        # >2x avg (>100k) → 0.85
        assert engine._get_deal_size_adjustment(Decimal('150000')) == 0.85

    def test_deal_size_large(self, engine):
        # >1.5x avg (>75k) but <2x → 0.92
        assert engine._get_deal_size_adjustment(Decimal('80000')) == 0.92

    def test_deal_size_small(self, engine):
        # <0.5x avg (<25k) → 1.05
        assert engine._get_deal_size_adjustment(Decimal('20000')) == 1.05

    def test_deal_size_empty_cache(self):
        engine = ForecastingEngine(mcp_client=None)
        engine.historical_data_cache = {"closed_opportunities": []}
        assert engine._get_deal_size_adjustment(Decimal('50000')) == 1.0

    # -- _calculate_average_sales_cycle --
    def test_average_sales_cycle(self, engine):
        # Cycles: (Mar1-Jan1)=59d, (Jun1-Apr1)=61d, (Sep1-Jul1)=62d, (May1-Feb1)=89d
        avg = engine._calculate_average_sales_cycle(
            engine.historical_data_cache["closed_opportunities"]
        )
        assert isinstance(avg, int)
        assert avg > 0

    def test_average_sales_cycle_empty(self, engine):
        assert engine._calculate_average_sales_cycle([]) == 60  # default

    # -- _calculate_at_risk_opportunities --
    def test_at_risk_overdue(self, engine):
        opps = [
            {"CloseDate": "2026-01-01", "Amount": 50000, "Probability": 80, "StageName": "Qualifying"},
        ]
        # Close date is in the past → at risk
        result = engine._calculate_at_risk_opportunities(opps)
        assert result == Decimal('50000')

    def test_at_risk_large_low_probability(self, engine):
        opps = [
            {"CloseDate": "2027-01-01", "Amount": 60000, "Probability": 20, "StageName": "Qualifying"},
        ]
        result = engine._calculate_at_risk_opportunities(opps)
        assert result == Decimal('60000')

    def test_not_at_risk(self, engine):
        opps = [
            {"CloseDate": "2027-01-01", "Amount": 40000, "Probability": 80, "StageName": "Contract Creation"},
        ]
        result = engine._calculate_at_risk_opportunities(opps)
        assert result == Decimal('0')

    # -- _calculate_concentration_risk --
    def test_concentration_risk_single_customer(self, engine):
        opps = [
            {"AccountId": "A1", "Amount": 100000},
        ]
        assert engine._calculate_concentration_risk(opps) == 1.0

    def test_concentration_risk_diversified(self, engine):
        opps = [
            {"AccountId": "A1", "Amount": 20000},
            {"AccountId": "A2", "Amount": 20000},
            {"AccountId": "A3", "Amount": 20000},
            {"AccountId": "A4", "Amount": 20000},
            {"AccountId": "A5", "Amount": 20000},
        ]
        # Max is 20% → low risk → 0.1
        assert engine._calculate_concentration_risk(opps) == 0.1

    def test_concentration_risk_empty(self, engine):
        assert engine._calculate_concentration_risk([]) == 0.0

    # -- _generate_recommendations --
    def test_recommendations_low_win_rate(self, engine):
        metrics = ForecastingMetrics(
            total_pipeline_value=Decimal('0'),
            weighted_pipeline_value=Decimal('0'),
            expected_revenue_30_days=Decimal('100000'),
            expected_revenue_60_days=Decimal('0'),
            expected_revenue_90_days=Decimal('0'),
            average_deal_size=Decimal('10000'),
            average_sales_cycle_days=60,
            win_rate=0.15,
            payment_collection_rate=0.90,
            average_payment_delay_days=8,
            cash_conversion_cycle_days=45,
            overdue_invoices_amount=Decimal('0'),
            at_risk_opportunities_amount=Decimal('0'),
            concentration_risk_score=0.1,
        )
        recs = engine._generate_recommendations(metrics, [])
        assert any("lost opportunities" in r.lower() for r in recs)

    def test_recommendations_high_concentration(self, engine):
        metrics = ForecastingMetrics(
            total_pipeline_value=Decimal('0'),
            weighted_pipeline_value=Decimal('0'),
            expected_revenue_30_days=Decimal('100000'),
            expected_revenue_60_days=Decimal('0'),
            expected_revenue_90_days=Decimal('0'),
            average_deal_size=Decimal('10000'),
            average_sales_cycle_days=60,
            win_rate=0.50,
            payment_collection_rate=0.90,
            average_payment_delay_days=8,
            cash_conversion_cycle_days=45,
            overdue_invoices_amount=Decimal('0'),
            at_risk_opportunities_amount=Decimal('0'),
            concentration_risk_score=0.8,
        )
        recs = engine._generate_recommendations(metrics, [])
        assert any("concentration" in r.lower() for r in recs)

    # -- _generate_risk_alerts --
    def test_risk_alerts_overdue_invoices(self, engine):
        metrics = ForecastingMetrics(
            total_pipeline_value=Decimal('0'),
            weighted_pipeline_value=Decimal('0'),
            expected_revenue_30_days=Decimal('0'),
            expected_revenue_60_days=Decimal('0'),
            expected_revenue_90_days=Decimal('0'),
            average_deal_size=Decimal('0'),
            average_sales_cycle_days=0,
            win_rate=0.0,
            payment_collection_rate=0.0,
            average_payment_delay_days=0,
            cash_conversion_cycle_days=0,
            overdue_invoices_amount=Decimal('30000'),
            at_risk_opportunities_amount=Decimal('0'),
            concentration_risk_score=0.0,
        )
        alerts = engine._generate_risk_alerts(metrics, [])
        assert any("overdue" in a.lower() for a in alerts)
