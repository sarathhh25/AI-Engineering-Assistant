"""
GitHub Integration & OAuth Service.
Handles official GitHub OAuth flow, secure token encryption,
user repository discovery with pagination, repository selection,
and connection lifecycle management.
"""

import os
import secrets
import datetime
from typing import Optional, Dict, Any, List, Tuple
import httpx
from sqlalchemy.orm import Session

try:
    from Backend.database import User, UserSetting, OAuthState, Repository
    from Backend.crypto_service import encrypt_token, decrypt_token
except ImportError:
    from database import User, UserSetting, OAuthState, Repository
    from crypto_service import encrypt_token, decrypt_token


GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_BASE = "https://api.github.com"
DEFAULT_OAUTH_SCOPES = "repo,read:user,user:email"


def get_oauth_credentials() -> Tuple[Optional[str], Optional[str], str]:
    """
    Retrieves GitHub OAuth credentials and redirect URI from environment.
    Supports GITHUB_INTEGRATION_CLIENT_ID, GITHUB_CLIENT_ID, GITHUB_ID, NEXT_PUBLIC_GITHUB_CLIENT_ID,
    and GITHUB_INTEGRATION_CLIENT_SECRET, GITHUB_CLIENT_SECRET, GITHUB_SECRET.
    """
    client_id = (
        os.getenv("GITHUB_INTEGRATION_CLIENT_ID")
        or os.getenv("GITHUB_CLIENT_ID")
        or os.getenv("GITHUB_ID")
        or os.getenv("NEXT_PUBLIC_GITHUB_CLIENT_ID")
        or ""
    ).strip().strip(' "\'')
    client_secret = (
        os.getenv("GITHUB_INTEGRATION_CLIENT_SECRET")
        or os.getenv("GITHUB_CLIENT_SECRET")
        or os.getenv("GITHUB_SECRET")
        or ""
    ).strip().strip(' "\'')
    backend_base = (os.getenv("BACKEND_URL") or "http://10.144.212.47:8000").rstrip("/")
    redirect_uri = (
        os.getenv("GITHUB_REDIRECT_URI")
        or f"{backend_base}/api/integrations/github/callback"
    ).strip().strip(' "\'')

    if client_id in ("your_github_client_id_here", "your_client_id_here", ""):
        client_id = None
    if client_secret in ("your_github_client_secret_here", "your_client_secret_here", ""):
        client_secret = None

    return (
        client_id,
        client_secret,
        redirect_uri,
    )


def create_authorization_url(
    user_id: int,
    redirect_url: Optional[str] = None,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Generates a secure OAuth authorization URL with a cryptographically random state nonce.
    Persists the nonce in oauth_states table to prevent CSRF attacks.
    """
    client_id, client_secret, backend_redirect_uri = get_oauth_credentials()

    if not client_id or not client_secret or client_id == "your_github_client_id_here":
        raise ValueError(
            "GitHub OAuth application is not configured. Please set GITHUB_CLIENT_ID and "
            "GITHUB_CLIENT_SECRET in your environment or .env file before connecting GitHub."
        )

    # 32-byte secure random state
    state = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10)

    if db:
        # Clean up expired states for this user
        db.query(OAuthState).filter(
            (OAuthState.user_id == user_id) |
            (OAuthState.expires_at < datetime.datetime.now(datetime.timezone.utc))
        ).delete(synchronize_session=False)

        frontend_base = (os.getenv("FRONTEND_URL") or os.getenv("NEXTAUTH_URL") or "http://10.144.212.47:3000").rstrip("/")
        oauth_state = OAuthState(
            state=state,
            user_id=user_id,
            redirect_url=redirect_url or f"{frontend_base}/dashboard?tab=integrations",
            expires_at=expires_at,
        )
        db.add(oauth_state)
        db.commit()

    query_params = {
        "client_id": client_id,
        "redirect_uri": backend_redirect_uri,
        "scope": DEFAULT_OAUTH_SCOPES,
        "state": state,
        "allow_signup": "true",
    }
    encoded_params = "&".join(f"{k}={v}" for k, v in query_params.items())
    auth_url = f"{GITHUB_AUTH_URL}?{encoded_params}"

    return {
        "authorization_url": auth_url,
        "state": state,
        "expires_in_seconds": 600,
    }


async def process_oauth_callback(
    code: Optional[str],
    state: Optional[str],
    error: Optional[str],
    db: Session,
) -> Tuple[bool, str, str, Optional[Dict[str, Any]]]:
    """
    Validates OAuth state, exchanges code for access token with GitHub,
    retrieves real user profile, encrypts token, and persists connection.
    Returns (success, message, redirect_destination, user_info).
    """
    frontend_base = (os.getenv("FRONTEND_URL") or os.getenv("NEXTAUTH_URL") or "http://10.144.212.47:3000").rstrip("/")
    default_redirect = f"{frontend_base}/dashboard?tab=integrations"

    # Handle GitHub user cancellation / error
    if error:
        return (
            False,
            f"GitHub authorization was cancelled or denied: {error}",
            f"{default_redirect}?github_error=cancelled",
            None,
        )

    if not code or not state:
        return (
            False,
            "Missing authorization code or state parameter from GitHub callback.",
            f"{default_redirect}?github_error=invalid_request",
            None,
        )

    # Validate state against DB
    now = datetime.datetime.now(datetime.timezone.utc)
    oauth_record = db.query(OAuthState).filter(OAuthState.state == state).first()

    if not oauth_record:
        return (
            False,
            "Invalid or unrecognized OAuth state. Request may have expired or originated from an untrusted source.",
            f"{default_redirect}?github_error=invalid_state",
            None,
        )

    # Check expiration (offset-naive vs offset-aware safe comparison)
    exp = oauth_record.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=datetime.timezone.utc)
    if exp < now:
        db.delete(oauth_record)
        db.commit()
        return (
            False,
            "OAuth state has expired. Please restart the GitHub connection flow.",
            f"{default_redirect}?github_error=state_expired",
            None,
        )

    user_id = oauth_record.user_id
    redirect_target = oauth_record.redirect_url or default_redirect

    # Delete state immediately to prevent replay
    db.delete(oauth_record)
    db.commit()

    client_id, client_secret, backend_redirect_uri = get_oauth_credentials()
    if not client_id or not client_secret:
        return (
            False,
            "Server GitHub credentials not configured.",
            f"{redirect_target}?github_error=missing_credentials",
            None,
        )

    # Exchange code for access token using standard OAuth 2.0 form data
    token_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": backend_redirect_uri,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_resp = await client.post(
                GITHUB_TOKEN_URL,
                data=token_payload,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "AI-Engineering-Assistant",
                },
            )

            if token_resp.status_code != 200:
                err_text = token_resp.text[:100]
                return (
                    False,
                    f"GitHub token exchange returned HTTP {token_resp.status_code}",
                    f"{redirect_target}?github_error=token_exchange_failed&err_desc={urllib.parse.quote(err_text)}",
                    None,
                )

            token_data = token_resp.json()
            if "error" in token_data:
                err_msg = token_data.get("error_description", token_data["error"])
                return (
                    False,
                    f"GitHub OAuth error: {err_msg}",
                    f"{redirect_target}?github_error=token_exchange_failed&err_desc={urllib.parse.quote(err_msg)}",
                    None,
                )

            access_token = token_data.get("access_token")
            if not access_token:
                return (
                    False,
                    "No access token returned from GitHub.",
                    f"{redirect_target}?github_error=no_token",
                    None,
                )

            # Retrieve user profile from GitHub
            user_resp = await client.get(
                f"{GITHUB_API_BASE}/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "AI-Engineering-Assistant",
                },
            )

            if user_resp.status_code != 200:
                return (
                    False,
                    f"Failed to fetch GitHub profile (HTTP {user_resp.status_code})",
                    f"{redirect_target}?github_error=profile_fetch_failed",
                    None,
                )

            gh_user = user_resp.json()

    except Exception as exc:
        return (
            False,
            f"Network error during GitHub authorization: {exc}",
            f"{redirect_target}?github_error=network_error",
            None,
        )

    # Encrypt access token before storing
    encrypted_token = encrypt_token(access_token)
    gh_username = gh_user.get("login")
    gh_user_id = str(gh_user.get("id"))
    gh_avatar = gh_user.get("avatar_url")
    gh_scope = token_data.get("scope", DEFAULT_OAUTH_SCOPES)

    # Persist connection to UserSetting
    user_setting = db.query(UserSetting).filter(UserSetting.user_id == user_id).first()
    if not user_setting:
        user_setting = UserSetting(user_id=user_id)
        db.add(user_setting)

    user_setting.github_user_id = gh_user_id
    user_setting.github_username = gh_username
    user_setting.github_avatar_url = gh_avatar
    user_setting.github_token_encrypted = encrypted_token
    user_setting.github_scope = gh_scope
    user_setting.github_connected_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    success_redirect = redirect_target
    separator = "&" if "?" in success_redirect else "?"
    success_redirect = f"{success_redirect}{separator}github_status=connected&gh_user={gh_username}"

    return (
        True,
        f"Successfully connected GitHub account @{gh_username}",
        success_redirect,
        {
            "username": gh_username,
            "avatar_url": gh_avatar,
            "user_id": gh_user_id,
        },
    )


def get_user_decrypted_token(user: Optional[User]) -> Optional[str]:
    """
    Safely retrieves and decrypts the user's stored GitHub token.
    Falls back to legacy plaintext token or server GITHUB_TOKEN if no user token exists.
    """
    if not user or not user.settings:
        return None

    # Try encrypted token first
    if user.settings.github_token_encrypted:
        decrypted = decrypt_token(user.settings.github_token_encrypted)
        if decrypted:
            return decrypted

    # Fallback to legacy plaintext token field if present
    if user.settings.github_token and user.settings.github_token != "your_github_personal_access_token_here":
        return user.settings.github_token.strip().strip(' "\'')

    return None


async def get_github_connection_status(user: Optional[User], db: Session) -> Dict[str, Any]:
    """
    Returns the real GitHub connection status for the authenticated user.
    Never exposes token material in responses.
    """
    client_id, client_secret, _ = get_oauth_credentials()
    is_configured = bool(client_id and client_secret)

    if not user or not user.settings or not (user.settings.github_token_encrypted or user.settings.github_token):
        return {
            "connected": False,
            "status": "Disconnected",
            "configured": is_configured,
            "username": None,
            "avatar_url": None,
            "selected_repo": None,
            "scopes": [],
            "connected_at": None,
        }

    token = get_user_decrypted_token(user)
    if not token:
        return {
            "connected": False,
            "status": "Error",
            "configured": is_configured,
            "message": "Stored credentials could not be decrypted.",
            "username": user.settings.github_username,
            "avatar_url": user.settings.github_avatar_url,
            "selected_repo": user.settings.selected_repo,
            "scopes": [],
            "connected_at": None,
        }

    scopes = [s.strip() for s in (user.settings.github_scope or DEFAULT_OAUTH_SCOPES).split(",") if s.strip()]

    return {
        "connected": True,
        "status": "Connected",
        "configured": is_configured,
        "username": user.settings.github_username,
        "avatar_url": user.settings.github_avatar_url,
        "selected_repo": user.settings.selected_repo or "ai-engineering-assistant",
        "scopes": scopes,
        "connected_at": user.settings.github_connected_at.isoformat() if user.settings.github_connected_at else None,
    }


async def list_user_repositories(
    user: Optional[User],
    db: Session,
    page: int = 1,
    per_page: int = 50,
) -> Dict[str, Any]:
    """
    Fetches real repositories from the GitHub REST API for the connected user.
    Respects user permissions and handles pagination.
    """
    token = get_user_decrypted_token(user)
    if not token:
        # Check if server-level fallback token is configured
        fallback_token = os.getenv("GITHUB_TOKEN", "").strip().strip(' "\'')
        if fallback_token and fallback_token != "your_github_personal_access_token_here":
            token = fallback_token
        else:
            raise PermissionError(
                "GitHub is not connected. Please connect your GitHub account in Integrations Hub."
            )

    per_page = max(1, min(per_page, 100))
    page = max(1, page)

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AI-Engineering-Assistant",
    }
    params = {
        "sort": "updated",
        "direction": "desc",
        "per_page": per_page,
        "page": page,
        "affiliation": "owner,collaborator,organization_member",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(f"{GITHUB_API_BASE}/user/repos", headers=headers, params=params)

        if resp.status_code == 401:
            # Token revoked or expired
            if user and user.settings:
                user.settings.github_token_encrypted = None
                db.commit()
            raise PermissionError("GitHub access token is invalid, expired, or has been revoked.")

        if resp.status_code == 403:
            raise PermissionError(
                "GitHub API rate limit exceeded or access forbidden for this account."
            )

        if resp.status_code != 200:
            raise RuntimeError(f"GitHub API returned error HTTP {resp.status_code}: {resp.text}")

        repos_raw = resp.json()

        link_header = resp.headers.get("link", "")
        has_next = 'rel="next"' in link_header

        sanitized_repos = []
        for r in repos_raw:
            sanitized_repos.append({
                "id": r.get("id"),
                "name": r.get("name"),
                "full_name": r.get("full_name"),
                "description": r.get("description") or "",
                "private": r.get("private", False),
                "default_branch": r.get("default_branch", "main"),
                "html_url": r.get("html_url", ""),
                "language": r.get("language") or "Code",
                "updated_at": r.get("updated_at"),
                "stars": r.get("stargazers_count", 0),
                "open_issues_count": r.get("open_issues_count", 0),
                "permissions": r.get("permissions", {}),
            })

        selected = (user.settings.selected_repo if (user and user.settings) else None) or "ai-engineering-assistant"

        return {
            "repositories": sanitized_repos,
            "total_retrieved": len(sanitized_repos),
            "page": page,
            "has_next": has_next,
            "selected_repo": selected,
        }


async def select_active_repository(
    user: Optional[User],
    repo_name: str,
    db: Session,
) -> Dict[str, Any]:
    """
    Validates that the selected repository is accessible via the user's GitHub connection,
    persists the selection in user_settings, and updates repository access records.
    """
    clean_name = repo_name.strip()
    if not clean_name:
        raise ValueError("Repository name cannot be empty.")

    token = get_user_decrypted_token(user) or os.getenv("GITHUB_TOKEN", "").strip().strip(' "\'')

    # Allow local workspace repo
    is_local = clean_name.lower() in ("ai-engineering-assistant", "ai_engineering_assistant")

    repo_details: Dict[str, Any] = {
        "name": clean_name,
        "full_name": clean_name,
        "default_branch": "main",
        "language": "TypeScript / Python",
    }

    if not is_local:
        if not token or token == "your_github_personal_access_token_here":
            raise PermissionError("GitHub connection required to select a remote repository.")

        # Verify access with GitHub API
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AI-Engineering-Assistant",
        }

        endpoint = f"{GITHUB_API_BASE}/repos/{clean_name}" if "/" in clean_name else f"{GITHUB_API_BASE}/user/repos"
        async with httpx.AsyncClient(timeout=15.0) as client:
            if "/" in clean_name:
                resp = await client.get(endpoint, headers=headers)
            else:
                resp = await client.get(f"{GITHUB_API_BASE}/repos/{clean_name}", headers=headers)
                if resp.status_code == 404:
                    # Try searching among user repos
                    all_resp = await client.get(f"{GITHUB_API_BASE}/user/repos", headers=headers, params={"per_page": 100})
                    if all_resp.status_code == 200:
                        matched = next((r for r in all_resp.json() if r["name"].lower() == clean_name.lower()), None)
                        if matched:
                            resp = await client.get(matched["url"], headers=headers)

            if resp.status_code in (404, 403, 401):
                raise PermissionError(
                    f"Cannot access repository '{clean_name}' (GitHub HTTP {resp.status_code}). "
                    "Verify repository name, visibility, and that your GitHub account has read permissions."
                )

            if resp.status_code == 200:
                data = resp.json()
                repo_details = {
                    "name": data.get("name"),
                    "full_name": data.get("full_name"),
                    "default_branch": data.get("default_branch", "main"),
                    "language": data.get("language") or "Unknown",
                    "private": data.get("private", False),
                    "description": data.get("description", ""),
                }

    # Persist in UserSetting and Repository table
    if user:
        if not user.settings:
            user.settings = UserSetting(user_id=user.id)
            db.add(user.settings)
        user.settings.selected_repo = clean_name

        # Update or create Repository table row
        repo_owner = repo_details.get("full_name", "").split("/")[0] if "/" in repo_details.get("full_name", "") else None
        existing_repo = db.query(Repository).filter(
            Repository.user_id == user.id,
            Repository.repo_name == clean_name,
        ).first()

        now = datetime.datetime.now(datetime.timezone.utc)
        if existing_repo:
            existing_repo.last_accessed = now
            existing_repo.default_branch = repo_details.get("default_branch", "main")
            existing_repo.language = repo_details.get("language")
        else:
            new_repo = Repository(
                user_id=user.id,
                repo_name=clean_name,
                repo_owner=repo_owner,
                default_branch=repo_details.get("default_branch", "main"),
                language=repo_details.get("language"),
                last_accessed=now,
            )
            db.add(new_repo)

        db.commit()

    return {
        "status": "success",
        "selected_repo": clean_name,
        "repository": repo_details,
    }


def disconnect_github_account(user: Optional[User], db: Session) -> Dict[str, Any]:
    """
    Safely disconnects GitHub for the user by clearing encrypted token and metadata.
    """
    if not user:
        raise PermissionError("Authentication required to disconnect GitHub.")

    if user.settings:
        user.settings.github_token_encrypted = None
        user.settings.github_username = None
        user.settings.github_user_id = None
        user.settings.github_avatar_url = None
        user.settings.github_scope = None
        user.settings.github_connected_at = None
        user.settings.selected_repo = None
        db.commit()

    return {
        "status": "success",
        "message": "GitHub account successfully disconnected.",
    }


async def sync_token_from_session(user: User, raw_token: str, db: Session) -> Dict[str, Any]:
    """
    Verifies and securely encrypts a token received from an authenticated session.
    """
    if not raw_token or raw_token == "your_github_personal_access_token_here":
        raise ValueError("Invalid token provided.")

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{GITHUB_API_BASE}/user",
            headers={
                "Authorization": f"Bearer {raw_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "AI-Engineering-Assistant",
            },
        )
        if resp.status_code != 200:
            raise PermissionError(f"Provided token is not valid on GitHub (HTTP {resp.status_code}).")

        gh_user = resp.json()

    encrypted = encrypt_token(raw_token)
    if not user.settings:
        user.settings = UserSetting(user_id=user.id)
        db.add(user.settings)

    user.settings.github_user_id = str(gh_user.get("id"))
    user.settings.github_username = gh_user.get("login")
    user.settings.github_avatar_url = gh_user.get("avatar_url")
    user.settings.github_token_encrypted = encrypted
    user.settings.github_connected_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    return {
        "status": "success",
        "username": gh_user.get("login"),
        "avatar_url": gh_user.get("avatar_url"),
    }
