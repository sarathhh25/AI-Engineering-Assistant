"""
Cryptographic service for encrypting and decrypting sensitive tokens (e.g. GitHub OAuth tokens).
Uses AES-128-CBC with HMAC-SHA256 authenticated encryption via cryptography.fernet.Fernet.
Derives a 32-byte url-safe base64 key from environment variables.
"""

import os
import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet


def _get_encryption_key() -> bytes:
    """
    Derives a 32-byte url-safe base64 Fernet key from environment variables:
    APP_ENCRYPTION_KEY, SECRET_KEY, NEXTAUTH_SECRET, or DATABASE_URL.
    In production environments, a dedicated encryption secret is strictly required.
    """
    env = (os.getenv("NODE_ENV") or os.getenv("ENVIRONMENT") or os.getenv("ENV") or "development").lower()
    is_production = env in ("production", "prod")

    configured_secret = (
        os.getenv("APP_ENCRYPTION_KEY")
        or os.getenv("SECRET_KEY")
        or os.getenv("NEXTAUTH_SECRET")
    )

    if configured_secret:
        raw_secret = configured_secret.strip()
    elif is_production:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: Production encryption key is not set. "
            "Please configure APP_ENCRYPTION_KEY or NEXTAUTH_SECRET in your production environment variables."
        )
    else:
        # Development fallback only
        db_url = os.getenv("DATABASE_URL")
        raw_secret = db_url.strip() if db_url else "ai-engineering-assistant-local-dev-key-2026"

    # Create a 32-byte digest using SHA-256
    digest = hashlib.sha256(raw_secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def encrypt_token(plain_token: str) -> str:
    """
    Encrypts a plaintext access token into a Fernet token string.
    Returns empty string if plain_token is empty.
    """
    if not plain_token:
        return ""
    try:
        fernet = Fernet(_get_encryption_key())
        encrypted_bytes = fernet.encrypt(plain_token.encode("utf-8"))
        return encrypted_bytes.decode("utf-8")
    except Exception as e:
        raise RuntimeError(f"Token encryption failed: {e}") from e


def decrypt_token(encrypted_token: Optional[str]) -> Optional[str]:
    """
    Decrypts an encrypted Fernet token string back into plaintext.
    Returns None if token is invalid, expired, or corrupted.
    """
    if not encrypted_token:
        return None
    try:
        fernet = Fernet(_get_encryption_key())
        decrypted_bytes = fernet.decrypt(encrypted_token.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception:
        # Never log raw token material or detailed crypto internals
        return None
