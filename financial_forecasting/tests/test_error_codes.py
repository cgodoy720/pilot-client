"""Tests for error codes — verifies frontend/backend parity and usage."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from error_codes import ErrorCode, AppError


class TestErrorCodeEnum:
    """Verify all required error codes exist and are unique."""

    def test_validation_codes(self):
        assert ErrorCode.VALIDATION_ERROR.value == "VALIDATION_ERROR"
        assert ErrorCode.INVALID_STAGE.value == "INVALID_STAGE"
        assert ErrorCode.INVALID_AMOUNT.value == "INVALID_AMOUNT"
        assert ErrorCode.INVALID_DATE.value == "INVALID_DATE"
        assert ErrorCode.INVALID_ID_FORMAT.value == "INVALID_ID_FORMAT"
        assert ErrorCode.MISSING_REQUIRED_FIELD.value == "MISSING_REQUIRED_FIELD"

    def test_entity_codes(self):
        assert ErrorCode.ENTITY_NOT_FOUND.value == "ENTITY_NOT_FOUND"
        assert ErrorCode.ENTITY_ALREADY_EXISTS.value == "ENTITY_ALREADY_EXISTS"
        assert ErrorCode.ENTITY_CONFLICT.value == "ENTITY_CONFLICT"

    def test_business_logic_codes(self):
        assert ErrorCode.CAPACITY_GATE.value == "CAPACITY_GATE"
        assert ErrorCode.STAGE_TRANSITION_INVALID.value == "STAGE_TRANSITION_INVALID"
        assert ErrorCode.SYNC_IN_PROGRESS.value == "SYNC_IN_PROGRESS"
        assert ErrorCode.INVOICE_ALREADY_EXISTS.value == "INVOICE_ALREADY_EXISTS"
        assert ErrorCode.CUSTOMER_MAPPING_MISSING.value == "CUSTOMER_MAPPING_MISSING"

    def test_service_codes(self):
        assert ErrorCode.SERVICE_UNAVAILABLE.value == "SERVICE_UNAVAILABLE"
        assert ErrorCode.AUTHENTICATION_FAILED.value == "AUTHENTICATION_FAILED"
        assert ErrorCode.AUTHORIZATION_DENIED.value == "AUTHORIZATION_DENIED"
        assert ErrorCode.EXTERNAL_API_ERROR.value == "EXTERNAL_API_ERROR"
        assert ErrorCode.TIMEOUT.value == "TIMEOUT"

    def test_data_codes(self):
        assert ErrorCode.CSV_PARSE_ERROR.value == "CSV_PARSE_ERROR"
        assert ErrorCode.DATA_INTEGRITY_ERROR.value == "DATA_INTEGRITY_ERROR"
        assert ErrorCode.ENRICHMENT_FAILED.value == "ENRICHMENT_FAILED"

    def test_all_codes_unique(self):
        values = [e.value for e in ErrorCode]
        assert len(values) == len(set(values))

    def test_codes_are_strings(self):
        for code in ErrorCode:
            assert isinstance(code.value, str)
            assert code.value == code.value.upper()  # all SCREAMING_SNAKE


class TestAppError:
    def test_creates_with_code_and_message(self):
        err = AppError(ErrorCode.VALIDATION_ERROR, "bad input")
        assert err.code == ErrorCode.VALIDATION_ERROR
        assert err.message == "bad input"
        assert err.details == {}

    def test_includes_details(self):
        err = AppError(ErrorCode.ENTITY_NOT_FOUND, "not found", {"id": "123"})
        assert err.details == {"id": "123"}

    def test_string_repr_contains_code(self):
        err = AppError(ErrorCode.CAPACITY_GATE, "score missing")
        assert "CAPACITY_GATE" in str(err)
        assert "score missing" in str(err)

    def test_is_exception(self):
        err = AppError(ErrorCode.TIMEOUT, "timed out")
        assert isinstance(err, Exception)
        with pytest.raises(AppError):
            raise err


class TestFrontendBackendParity:
    """Verify that backend error codes match what the frontend expects.

    The frontend errorCodes.ts defines the same set of codes. This test
    reads the .ts file and checks that every code exists in the Python enum.
    """

    def test_frontend_codes_match_backend(self):
        ts_path = os.path.join(
            os.path.dirname(__file__), '..', 'frontend', 'src', 'utils', 'errorCodes.ts'
        )
        if not os.path.exists(ts_path):
            pytest.skip("errorCodes.ts not found — frontend not available")

        with open(ts_path) as f:
            content = f.read()

        backend_codes = {e.value for e in ErrorCode}

        # Extract codes from TS: lines like   VALIDATION_ERROR: 'VALIDATION_ERROR',
        import re
        ts_codes = set(re.findall(r"(\w+):\s*'(\w+)'", content))
        ts_code_values = {value for _, value in ts_codes}

        # Every TS code should exist in Python
        missing_in_backend = ts_code_values - backend_codes
        assert not missing_in_backend, f"Codes in TS but not Python: {missing_in_backend}"

        # Every Python code should exist in TS
        missing_in_frontend = backend_codes - ts_code_values
        assert not missing_in_frontend, f"Codes in Python but not TS: {missing_in_frontend}"
