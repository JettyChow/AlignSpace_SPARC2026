from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from fastapi import HTTPException, Request


MOCK_USER = {
    "user_id": "mock-user-1",
    "clerk_user_id": None,
    "email": None,
    "first_name": None,
    "last_name": None,
    "display_name": "Local Mock User",
    "role": None,
    "firm_id": "firm_default",
    "auth_source": "mock",
}


def _clerk_issuer() -> str | None:
    return os.getenv("CLERK_ISSUER") or os.getenv("CLERK_JWT_ISSUER")


def _clerk_jwks_url() -> str | None:
    explicit_url = os.getenv("CLERK_JWKS_URL")
    if explicit_url:
        return explicit_url

    issuer = _clerk_issuer()
    if not issuer:
        return None

    return f"{issuer.rstrip('/')}/.well-known/jwks.json"


def _clerk_audience() -> str | None:
    return os.getenv("CLERK_AUDIENCE")


@lru_cache(maxsize=8)
def _jwk_client(jwks_url: str):
    try:
        from jwt import PyJWKClient
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Clerk JWT verification dependency is not installed. Install PyJWT[crypto].",
        ) from exc

    return PyJWKClient(jwks_url)


def get_bearer_token(request: Request | None) -> str | None:
    if request is None:
        return None

    authorization = request.headers.get("authorization") or request.headers.get("Authorization")
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    return token


def verify_clerk_token(token: str) -> dict[str, Any]:
    jwks_url = _clerk_jwks_url()
    if not jwks_url:
        raise HTTPException(
            status_code=503,
            detail="Clerk JWT verification is not configured. Set CLERK_ISSUER or CLERK_JWKS_URL.",
        )

    try:
        import jwt
        from jwt.exceptions import InvalidTokenError, PyJWKClientError
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Clerk JWT verification dependency is not installed. Install PyJWT[crypto].",
        ) from exc

    issuer = _clerk_issuer()
    audience = _clerk_audience()
    options = {
        "verify_signature": True,
        "verify_exp": True,
        "verify_nbf": True,
        "verify_iat": True,
        "verify_iss": bool(issuer),
        "verify_aud": bool(audience),
    }

    try:
        signing_key = _jwk_client(jwks_url).get_signing_key_from_jwt(token)
        decode_kwargs: dict[str, Any] = {
            "key": signing_key.key,
            "algorithms": ["RS256"],
            "options": options,
        }
        if issuer:
            decode_kwargs["issuer"] = issuer
        if audience:
            decode_kwargs["audience"] = audience

        return jwt.decode(token, **decode_kwargs)
    except (InvalidTokenError, PyJWKClientError) as exc:
        raise HTTPException(status_code=401, detail="Invalid Clerk token.") from exc


def _claims_to_user(claims: dict[str, Any]) -> dict[str, Any]:
    clerk_user_id = claims.get("sub")
    email = (
        claims.get("email")
        or claims.get("primary_email_address")
        or claims.get("email_address")
    )
    first_name = claims.get("first_name") or claims.get("given_name")
    last_name = claims.get("last_name") or claims.get("family_name")
    display_name = (
        claims.get("name")
        or " ".join(value for value in [first_name, last_name] if value).strip()
        or email
        or clerk_user_id
        or "Authenticated User"
    )
    metadata = (
        claims.get("metadata")
        or claims.get("public_metadata")
        or claims.get("unsafe_metadata")
        or {}
    )
    role = metadata.get("role")

    return {
        "user_id": clerk_user_id or "clerk-user",
        "clerk_user_id": clerk_user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "display_name": display_name,
        "role": role,
        "firm_id": "firm_default",
        "auth_source": "clerk_jwt",
    }


def current_user_from_request(request: Request | None) -> dict[str, Any]:
    token = get_bearer_token(request)
    if not token:
        return dict(MOCK_USER)

    claims = verify_clerk_token(token)
    return _claims_to_user(claims)
