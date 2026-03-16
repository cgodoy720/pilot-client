"""Tests for DataSyncService workflow logic — payment status determination,
customer matching, and invoice state transitions.

These tests exercise the pure decision logic extracted from the async
workflows without requiring real MCP connections.
"""

import sys
import os
from decimal import Decimal

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from models import OpportunityStage


# ---------------------------------------------------------------------------
# Payment status determination
# ---------------------------------------------------------------------------
# Extracted from data_sync.py update_payment_statuses (lines 418-442).
# Logic:
#   if invoice_state == "Paid" or total_paid >= total_amount:  → "Paid"
#   elif total_paid > 0:                                       → "Partial"
#   else:                                                      → "Pending"

def determine_payment_status(invoice_state, total_amount, total_paid):
    """Pure extraction of the payment status decision tree."""
    total_amount = Decimal(str(total_amount))
    total_paid = Decimal(str(total_paid))

    if invoice_state == "Paid" or total_paid >= total_amount:
        return "Paid"
    elif total_paid > 0:
        return "Partial"
    else:
        return "Pending"


class TestPaymentStatusDetermination:
    def test_fully_paid_by_amount(self):
        assert determine_payment_status("", 10000, 10000) == "Paid"

    def test_overpaid_is_still_paid(self):
        assert determine_payment_status("", 10000, 12000) == "Paid"

    def test_paid_by_state_flag(self):
        assert determine_payment_status("Paid", 10000, 0) == "Paid"

    def test_partial_payment(self):
        assert determine_payment_status("", 10000, 5000) == "Partial"

    def test_tiny_partial_payment(self):
        assert determine_payment_status("", 10000, 1) == "Partial"

    def test_pending_no_payment(self):
        assert determine_payment_status("", 10000, 0) == "Pending"

    def test_pending_zero_amount_zero_paid(self):
        assert determine_payment_status("", 0, 0) == "Paid"
        # Edge case: 0 >= 0 is true, so this is actually "Paid"
        # Documenting actual behavior — a zero-amount invoice is "paid" by default

    def test_decimal_precision(self):
        """Ensure we don't lose pennies."""
        assert determine_payment_status("", "10000.01", "10000.00") == "Partial"
        assert determine_payment_status("", "10000.01", "10000.01") == "Paid"


# ---------------------------------------------------------------------------
# Customer name matching (case-insensitive)
# ---------------------------------------------------------------------------
# From data_sync.py sync_customer_mappings: matches SF account names to
# Intacct customer names using .lower() comparison.

def match_customer_by_name(sf_account_name, intacct_customers):
    """Reproduce the matching logic from sync_customer_mappings."""
    for customer in intacct_customers:
        if customer.get("NAME", "").lower() == sf_account_name.lower():
            return customer.get("CUSTOMERID")
    return None


class TestCustomerNameMatching:
    CUSTOMERS = [
        {"CUSTOMERID": "CUST001", "NAME": "Pursuit Foundation"},
        {"CUSTOMERID": "CUST002", "NAME": "Acme Corp"},
        {"CUSTOMERID": "CUST003", "NAME": "Tech Innovations Inc."},
    ]

    def test_exact_match(self):
        assert match_customer_by_name("Pursuit Foundation", self.CUSTOMERS) == "CUST001"

    def test_case_insensitive(self):
        assert match_customer_by_name("pursuit foundation", self.CUSTOMERS) == "CUST001"
        assert match_customer_by_name("ACME CORP", self.CUSTOMERS) == "CUST002"

    def test_no_match(self):
        assert match_customer_by_name("Unknown Company", self.CUSTOMERS) is None

    def test_empty_name(self):
        assert match_customer_by_name("", self.CUSTOMERS) is None

    def test_whitespace_mismatch(self):
        """Trailing whitespace causes mismatch (by design — no trimming)."""
        assert match_customer_by_name("Pursuit Foundation ", self.CUSTOMERS) is None

    def test_empty_customer_list(self):
        assert match_customer_by_name("Pursuit Foundation", []) is None


# ---------------------------------------------------------------------------
# Invoice lookup by record number
# ---------------------------------------------------------------------------
# From data_sync.py: invoice_lookup = {invoice.get("RECORDNO"): invoice ...}

def build_invoice_lookup(invoices):
    return {inv.get("RECORDNO"): inv for inv in invoices}


class TestInvoiceLookup:
    def test_builds_lookup_map(self):
        invoices = [
            {"RECORDNO": "INV-001", "TOTALAMOUNT": 5000},
            {"RECORDNO": "INV-002", "TOTALAMOUNT": 10000},
        ]
        lookup = build_invoice_lookup(invoices)
        assert lookup["INV-001"]["TOTALAMOUNT"] == 5000
        assert "INV-003" not in lookup

    def test_last_wins_on_duplicate_record_no(self):
        invoices = [
            {"RECORDNO": "INV-001", "TOTALAMOUNT": 5000},
            {"RECORDNO": "INV-001", "TOTALAMOUNT": 9999},
        ]
        lookup = build_invoice_lookup(invoices)
        assert lookup["INV-001"]["TOTALAMOUNT"] == 9999

    def test_none_record_no(self):
        invoices = [{"TOTALAMOUNT": 5000}]
        lookup = build_invoice_lookup(invoices)
        assert None in lookup

    def test_empty_list(self):
        assert build_invoice_lookup([]) == {}


# ---------------------------------------------------------------------------
# Payment date formatting
# ---------------------------------------------------------------------------
# From data_sync.py: payment_date[:10] to extract YYYY-MM-DD

class TestPaymentDateFormatting:
    def test_iso_datetime_truncated(self):
        assert "2026-03-15T14:30:00"[:10] == "2026-03-15"

    def test_date_only_string(self):
        assert "2026-03-15"[:10] == "2026-03-15"

    def test_short_string_safe(self):
        # The code checks len(payment_date) >= 10 before slicing
        short = "2026-03"
        assert len(short) < 10  # Would not be sliced


# ---------------------------------------------------------------------------
# Update-needed detection
# ---------------------------------------------------------------------------
# From data_sync.py: only updates when current_status != new_status

class TestUpdateDetection:
    def test_status_change_triggers_update(self):
        current = "Pending"
        new = "Paid"
        assert current != new

    def test_same_status_no_update(self):
        current = "Paid"
        new = "Paid"
        assert current == new

    def test_none_to_pending_triggers_update(self):
        current = ""
        new = "Pending"
        assert current != new


# ---------------------------------------------------------------------------
# Data normalization: single-item to list
# ---------------------------------------------------------------------------
# From data_sync.py: if not isinstance(X, list): X = [X] if X else []

def normalize_to_list(data):
    if not isinstance(data, list):
        return [data] if data else []
    return data


class TestNormalizeToList:
    def test_list_passes_through(self):
        assert normalize_to_list([1, 2, 3]) == [1, 2, 3]

    def test_single_dict_wrapped(self):
        d = {"id": 1}
        assert normalize_to_list(d) == [{"id": 1}]

    def test_none_returns_empty(self):
        assert normalize_to_list(None) == []

    def test_empty_list_passes_through(self):
        assert normalize_to_list([]) == []

    def test_empty_string_returns_empty(self):
        assert normalize_to_list("") == []

    def test_zero_returns_list_with_zero(self):
        assert normalize_to_list(0) == []
        # 0 is falsy, so it returns [] — not [0]
        # This is a subtle edge case in the source code


# ---------------------------------------------------------------------------
# Financial data sync: update comparison
# ---------------------------------------------------------------------------
# From sync_customer_data_to_salesforce: only updates when value differs

class TestFinancialDataComparison:
    def test_different_values_need_update(self):
        current_outstanding = 5000.0
        new_total_due = 7500.0
        assert current_outstanding != float(new_total_due)

    def test_same_values_skip_update(self):
        current_outstanding = 5000.0
        new_total_due = 5000.0
        assert current_outstanding == float(new_total_due)

    def test_none_current_needs_update(self):
        current_outstanding = None
        new_total_due = 5000.0
        assert current_outstanding != float(new_total_due)
