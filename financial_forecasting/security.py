"""Security utilities — SOQL injection prevention and input validation."""

import re
from fastapi import HTTPException


# Salesforce IDs are 15 or 18 alphanumeric characters
_SF_ID_PATTERN = re.compile(r'^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$')


def validate_salesforce_id(value: str, field_name: str = "id") -> str:
    """Validate that a value is a valid Salesforce ID format.

    Raises HTTPException(400) if the value doesn't match the expected pattern.
    Returns the validated value for convenience.
    """
    if not value or not _SF_ID_PATTERN.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Salesforce ID format for {field_name}",
        )
    return value


# SOSL reserved characters that must be backslash-escaped
_SOSL_RESERVED = re.compile(r'([?&|!{}\[\]()^~*:\\\"\'+\-])')


def escape_sosl_string(value: str) -> str:
    """Escape a string value for safe inclusion in a SOSL FIND clause.

    SOSL has different reserved characters than SOQL:
    ? & | ! { } [ ] ( ) ^ ~ * : \\ " ' + -
    """
    if not value:
        return value
    return _SOSL_RESERVED.sub(r'\\\1', value)


def escape_soql_string(value: str) -> str:
    """Escape a string value for safe inclusion in a SOQL query.

    Handles single quotes and backslashes which are the primary
    injection vectors in SOQL.
    """
    if not value:
        return value
    # Escape backslashes first, then single quotes
    return value.replace("\\", "\\\\").replace("'", "\\'")
