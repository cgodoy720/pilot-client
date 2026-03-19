"""Authentication utilities — JWT, Fernet encryption, user extraction from cookies."""

import os
import json
import secrets
import hashlib
import base64
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

from jose import jwt, JWTError
from cryptography.fernet import Fernet
from fastapi import Request

logger = logging.getLogger(__name__)

# JWT secret — shared by JWT signing and Fernet key derivation
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

# Production detection
FRONTEND_URL = os.getenv('FRONTEND_URL') or 'http://localhost:3000'
IS_PRODUCTION = FRONTEND_URL.startswith('https')

if IS_PRODUCTION:
    if not os.getenv('JWT_SECRET_KEY') or len(JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "Production requires JWT_SECRET_KEY (min 32 chars). "
            "Generate with: openssl rand -hex 32"
        )


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_access_token(data: dict) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token and return payload."""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


async def get_current_user(request: Request) -> Optional[Dict]:
    """Get current authenticated user from cookie."""
    token = request.cookies.get("access_token")
    if not token:
        return None
    payload = verify_token(token)
    if payload:
        # Backward compat: main.py endpoints reference user["user_id"]
        payload["user_id"] = payload.get("email", "unknown")
    return payload


# ---------------------------------------------------------------------------
# Fernet encryption for token cookies (SF / Google)
# ---------------------------------------------------------------------------

_fernet: Optional[Fernet] = None


def _derive_fernet_key(secret: str) -> bytes:
    """Derive a Fernet-compatible key from an arbitrary secret string."""
    key_bytes = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(key_bytes)


def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        _fernet = Fernet(_derive_fernet_key(JWT_SECRET_KEY))
    return _fernet


def encrypt_tokens(data: dict) -> str:
    """Encrypt a dict for cookie storage."""
    return get_fernet().encrypt(json.dumps(data).encode()).decode()


def decrypt_tokens(encrypted: str) -> Optional[dict]:
    """Decrypt a cookie value back to a dict."""
    try:
        return json.loads(get_fernet().decrypt(encrypted.encode()).decode())
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Cookie helpers
# ---------------------------------------------------------------------------

def cookie_params() -> dict:
    """Common cookie parameters (samesite, secure, httponly, max_age)."""
    return {
        "httponly": True,
        "max_age": 3600 * 24 * 30,
        "samesite": "none" if IS_PRODUCTION else "lax",
        "secure": IS_PRODUCTION,
    }


# ---------------------------------------------------------------------------
# FastAPI dependency wrapper
# ---------------------------------------------------------------------------

async def get_current_user_dep(request: Request) -> Optional[Dict]:
    """FastAPI Depends() wrapper — returns user dict or None (allows unauthenticated)."""
    return await get_current_user(request)
