"""Stable error codes for the financial forecasting system.

Used across backend services for consistent error handling.
Must stay in sync with frontend errorCodes.ts.
"""

from enum import Enum


class ErrorCode(str, Enum):
    """Stable error codes used in API responses and error handling."""

    # Validation errors
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_STAGE = "INVALID_STAGE"
    INVALID_AMOUNT = "INVALID_AMOUNT"
    INVALID_DATE = "INVALID_DATE"
    INVALID_ID_FORMAT = "INVALID_ID_FORMAT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"

    # Entity errors
    ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND"
    ENTITY_ALREADY_EXISTS = "ENTITY_ALREADY_EXISTS"
    ENTITY_CONFLICT = "ENTITY_CONFLICT"

    # Business logic errors
    CAPACITY_GATE = "CAPACITY_GATE"
    STAGE_TRANSITION_INVALID = "STAGE_TRANSITION_INVALID"
    SYNC_IN_PROGRESS = "SYNC_IN_PROGRESS"
    INVOICE_ALREADY_EXISTS = "INVOICE_ALREADY_EXISTS"
    CUSTOMER_MAPPING_MISSING = "CUSTOMER_MAPPING_MISSING"

    # Service errors
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED"
    AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED"
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    TIMEOUT = "TIMEOUT"

    # Data errors
    CSV_PARSE_ERROR = "CSV_PARSE_ERROR"
    DATA_INTEGRITY_ERROR = "DATA_INTEGRITY_ERROR"
    ENRICHMENT_FAILED = "ENRICHMENT_FAILED"


class AppError(Exception):
    """Structured error for consistent error handling."""

    def __init__(self, code: ErrorCode, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(f"{code.value}: {message}")
