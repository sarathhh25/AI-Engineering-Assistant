"""
Comprehensive Automated Test Suite for Real GitHub Integration in AI Engineering Assistant.
Covers:
1. Missing environment variables / setup errors
2. OAuth authorization URL generation with secure random state
3. Authorization cancellation handling
4. Invalid / mismatched OAuth state rejection
5. Successful OAuth code exchange and encrypted token persistence
6. Profile retrieval and status reporting (zero token disclosure)
7. Repository listing, pagination, and visibility
8. Token expiry and revocation handling
9. Repository selection persistence
10. Repository access denial
11. Disconnecting GitHub account
12. Preventing cross-user token or repository leakage
13. Chat grounding in real GitHub repository files
14. Chat refusing unrelated questions (repository-only scope maintained)
15. GitHub API retrieval failure returns clean error without hallucinated fallback
"""

import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Set testing environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GITHUB_CLIENT_ID"] = "test_client_id_123"
os.environ["GITHUB_CLIENT_SECRET"] = "test_client_secret_456"
os.environ["GITHUB_REDIRECT_URI"] = "http://localhost:8000/api/integrations/github/callback"
os.environ["APP_ENCRYPTION_KEY"] = "dGVzdF9lbmNyeXB0aW9uX2tleV8zMl9ieXRlc19sb25nISE="

import sys
base_dir = os.path.dirname(os.path.abspath(__file__))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

try:
    from Backend.database import init_db, SessionLocal, User, UserSession, UserSetting, OAuthState, Repository
    from Backend.crypto_service import encrypt_token, decrypt_token
    from Backend.main import app
    from Backend.scope_classifier import STANDARD_REFUSAL_MESSAGE
    from Backend.github_service import create_authorization_url
except ImportError:
    from database import init_db, SessionLocal, User, UserSession, UserSetting, OAuthState, Repository
    from crypto_service import encrypt_token, decrypt_token
    from main import app
    from scope_classifier import STANDARD_REFUSAL_MESSAGE
    from github_service import create_authorization_url


class TestGitHubIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def setUp(self):
        self.db = SessionLocal()
        # Clean test tables (only test accounts)
        test_user_ids = [u.id for u in self.db.query(User).filter(User.email.like("%@example.com%")).all()]
        if test_user_ids:
            self.db.query(OAuthState).filter(OAuthState.user_id.in_(test_user_ids)).delete(synchronize_session=False)
            self.db.query(UserSession).filter(UserSession.user_id.in_(test_user_ids)).delete(synchronize_session=False)
            self.db.query(UserSetting).filter(UserSetting.user_id.in_(test_user_ids)).delete(synchronize_session=False)
            self.db.query(Repository).filter(Repository.user_id.in_(test_user_ids)).delete(synchronize_session=False)
            self.db.query(User).filter(User.id.in_(test_user_ids)).delete(synchronize_session=False)
            self.db.commit()

        # Create primary test user
        self.user = User(
            full_name="Alice Engineer",
            email="alice@example.com",
            auth_provider="local",
        )
        self.db.add(self.user)
        self.db.flush()

        self.user_token = "alice_session_token_123"
        self.session = UserSession(user_id=self.user.id, session_token=self.user_token)
        self.db.add(self.session)

        self.user_setting = UserSetting(user_id=self.user.id, selected_repo="ai-engineering-assistant")
        self.db.add(self.user_setting)
        self.db.commit()

        self.auth_headers = {"Authorization": f"Bearer {self.user_token}"}

    def tearDown(self):
        self.db.close()

    # 1. Missing credentials error
    def test_1_missing_credentials_returns_error(self):
        with patch.dict(os.environ, {"GITHUB_CLIENT_ID": "", "GITHUB_CLIENT_SECRET": ""}):
            res = self.client.get("/api/integrations/github/authorize", headers=self.auth_headers)
            self.assertEqual(res.status_code, 400)
            self.assertIn("not configured", res.json()["detail"])

    # 2. OAuth authorization URL generation
    def test_2_start_github_authorization(self):
        res = self.client.get("/api/integrations/github/authorize", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("authorization_url", data)
        self.assertIn("state", data)
        self.assertIn("https://github.com/login/oauth/authorize", data["authorization_url"])
        self.assertIn("client_id=test_client_id_123", data["authorization_url"])
        self.assertIn("scope=repo", data["authorization_url"])

        # Verify state nonce stored in DB
        state_record = self.db.query(OAuthState).filter(OAuthState.state == data["state"]).first()
        self.assertIsNotNone(state_record)
        self.assertEqual(state_record.user_id, self.user.id)

    # 3. User cancels authorization
    def test_3_oauth_callback_user_cancelled(self):
        res = self.client.get(
            "/api/integrations/github/callback?error=access_denied&error_description=The+user+cancelled",
            follow_redirects=False,
        )
        self.assertEqual(res.status_code, 302)
        location = res.headers["location"]
        self.assertIn("github_error=cancelled", location)

    # 4. Invalid or expired state rejection
    def test_4_oauth_callback_invalid_state(self):
        res = self.client.get(
            "/api/integrations/github/callback?code=mock_code&state=nonexistent_state_nonce",
            follow_redirects=False,
        )
        self.assertEqual(res.status_code, 302)
        location = res.headers["location"]
        self.assertIn("github_error=invalid_state", location)

    # 5. Successful OAuth code exchange and encrypted token persistence
    @patch("github_service.httpx.AsyncClient")
    def test_5_oauth_callback_success(self, mock_client_cls):
        # Create valid state nonce
        from github_service import create_authorization_url
        auth_data = create_authorization_url(user_id=self.user.id, redirect_url="http://localhost:3000/integrations", db=self.db)
        state_nonce = auth_data["state"]

        # Mock GitHub responses
        mock_client = MagicMock()

        # Token exchange response
        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {
            "access_token": "gho_testaccesstoken12345",
            "scope": "repo,read:user,user:email",
            "token_type": "bearer",
        }

        # User profile response
        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = {
            "id": 987654,
            "login": "octocat_developer",
            "avatar_url": "https://avatars.githubusercontent.com/u/987654",
            "name": "Octocat Dev",
        }

        async def mock_post(*args, **kwargs):
            return mock_token_resp

        async def mock_get(*args, **kwargs):
            return mock_user_resp

        mock_client.post = mock_post
        mock_client.get = mock_get
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_cls.return_value = mock_client

        res = self.client.get(
            f"/api/integrations/github/callback?code=valid_gh_code&state={state_nonce}",
            follow_redirects=False,
        )
        self.assertEqual(res.status_code, 302)
        self.assertIn("github_status=connected", res.headers["location"])
        self.assertIn("gh_user=octocat_developer", res.headers["location"])

        # Verify database persisted encrypted token
        self.db.expire_all()
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        self.assertEqual(setting.github_username, "octocat_developer")
        self.assertIsNotNone(setting.github_token_encrypted)
        # Token must be encrypted, not stored in plaintext
        self.assertNotEqual(setting.github_token_encrypted, "gho_testaccesstoken12345")
        # Decryption must match
        decrypted = decrypt_token(setting.github_token_encrypted)
        self.assertEqual(decrypted, "gho_testaccesstoken12345")

    # 6. Status reporting with zero token exposure
    def test_6_get_github_status(self):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_username = "alice_dev"
        setting.github_avatar_url = "https://avatar.url/alice"
        setting.github_token_encrypted = encrypt_token("gho_secret_token")
        setting.selected_repo = "alice_dev/super-app"
        self.db.commit()

        res = self.client.get("/api/integrations/github/status", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["connected"])
        self.assertEqual(data["username"], "alice_dev")
        self.assertEqual(data["selected_repo"], "alice_dev/super-app")
        # Ensure raw token is NEVER exposed
        self.assertNotIn("token", data)
        self.assertNotIn("gho_secret_token", str(data))

    # 7. Repository listing and pagination
    @patch("github_service.httpx.AsyncClient")
    def test_7_list_user_repositories(self, mock_client_cls):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_valid_token")
        self.db.commit()

        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"link": '<https://api.github.com/user/repos?page=2>; rel="next"'}
        mock_resp.json.return_value = [
            {
                "id": 101,
                "name": "project-one",
                "full_name": "alice_dev/project-one",
                "description": "An awesome project",
                "private": False,
                "default_branch": "main",
                "html_url": "https://github.com/alice_dev/project-one",
                "language": "Python",
                "stargazers_count": 42,
                "open_issues_count": 3,
                "permissions": {"admin": True, "push": True, "pull": True},
            },
            {
                "id": 102,
                "name": "secret-repo",
                "full_name": "alice_dev/secret-repo",
                "description": "Private microservice",
                "private": True,
                "default_branch": "main",
                "html_url": "https://github.com/alice_dev/secret-repo",
                "language": "TypeScript",
                "stargazers_count": 5,
                "open_issues_count": 1,
                "permissions": {"admin": False, "push": True, "pull": True},
            },
        ]

        async def mock_get(*args, **kwargs):
            return mock_resp

        mock_client.get = mock_get
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_cls.return_value = mock_client

        res = self.client.get("/api/integrations/github/repositories?page=1&per_page=50", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_retrieved"], 2)
        self.assertTrue(data["has_next"])
        self.assertEqual(data["repositories"][0]["name"], "project-one")
        self.assertFalse(data["repositories"][0]["private"])
        self.assertEqual(data["repositories"][1]["name"], "secret-repo")
        self.assertTrue(data["repositories"][1]["private"])

    # 8. Token revoked or expired handling
    @patch("github_service.httpx.AsyncClient")
    def test_8_token_revoked_handles_gracefully(self, mock_client_cls):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_revoked_token")
        self.db.commit()

        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 401  # Revoked on GitHub
        mock_resp.text = '{"message": "Bad credentials"}'

        async def mock_get(*args, **kwargs):
            return mock_resp

        mock_client.get = mock_get
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_cls.return_value = mock_client

        res = self.client.get("/api/integrations/github/repositories", headers=self.auth_headers)
        self.assertEqual(res.status_code, 403)
        self.assertIn("revoked", res.json()["detail"])

        # Verify token was wiped from DB
        self.db.expire_all()
        updated_setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        self.assertIsNone(updated_setting.github_token_encrypted)

    # 9. Repository selection persistence
    @patch("github_service.httpx.AsyncClient")
    def test_9_select_active_repository(self, mock_client_cls):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_valid_token")
        self.db.commit()

        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "name": "super-ai-service",
            "full_name": "alice_dev/super-ai-service",
            "default_branch": "main",
            "language": "Python",
            "private": True,
            "description": "AI Pipeline",
        }

        async def mock_get(*args, **kwargs):
            return mock_resp

        mock_client.get = mock_get
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_cls.return_value = mock_client

        res = self.client.post(
            "/api/integrations/github/select-repo",
            json={"repo": "alice_dev/super-ai-service"},
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["selected_repo"], "alice_dev/super-ai-service")

        # Check DB persistence
        self.db.expire_all()
        updated_setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        self.assertEqual(updated_setting.selected_repo, "alice_dev/super-ai-service")

        repo_record = self.db.query(Repository).filter(Repository.user_id == self.user.id).first()
        self.assertEqual(repo_record.repo_name, "alice_dev/super-ai-service")

    # 10. Repository access denial
    @patch("github_service.httpx.AsyncClient")
    def test_10_select_repository_denied(self, mock_client_cls):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_valid_token")
        self.db.commit()

        mock_client = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 404  # Not found or no permission

        async def mock_get(*args, **kwargs):
            return mock_resp

        mock_client.get = mock_get
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_cls.return_value = mock_client

        res = self.client.post(
            "/api/integrations/github/select-repo",
            json={"repo": "unauthorized-org/private-repo"},
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Cannot access repository", res.json()["detail"])

    # 11. Disconnect GitHub account
    def test_11_disconnect_github(self):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_secret")
        setting.github_username = "alice_dev"
        self.db.commit()

        res = self.client.post("/api/integrations/github/disconnect", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("disconnected", res.json()["message"])

        self.db.expire_all()
        updated_setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        self.assertIsNone(updated_setting.github_token_encrypted)
        self.assertIsNone(updated_setting.github_username)

    # 12. Prevent cross-user access
    def test_12_prevent_cross_user_access(self):
        # Create second user
        user2 = User(full_name="Bob Attacker", email="bob@example.com", auth_provider="local")
        self.db.add(user2)
        self.db.flush()
        user2_token = "bob_session_token_456"
        self.db.add(UserSession(user_id=user2.id, session_token=user2_token))
        self.db.add(UserSetting(user_id=user2.id))
        self.db.commit()

        # Connect GitHub only for Alice
        setting1 = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting1.github_token_encrypted = encrypt_token("alice_secret_token")
        setting1.github_username = "alice_dev"
        self.db.commit()

        # Bob requests status
        bob_headers = {"Authorization": f"Bearer {user2_token}"}
        res_bob = self.client.get("/api/integrations/github/status", headers=bob_headers)
        self.assertEqual(res_bob.status_code, 200)
        self.assertFalse(res_bob.json()["connected"])
        self.assertIsNone(res_bob.json()["username"])

    # 13. Chat retrieves real repository evidence
    @patch("Backend.main.get_gemini_client", return_value=None)
    @patch("Backend.repository_service.Github")
    def test_13_chat_retrieves_github_evidence(self, mock_github_class, mock_gemini):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_valid_oauth_token")
        setting.selected_repo = "alice_dev/auth-microservice"
        self.db.commit()

        mock_instance = MagicMock()
        mock_repo = MagicMock()
        mock_repo.name = "auth-microservice"
        mock_repo.full_name = "alice_dev/auth-microservice"
        mock_repo.default_branch = "main"
        mock_repo.language = "Python"

        # Mock Tree
        mock_item1 = MagicMock()
        mock_item1.path = "app/routes.py"
        mock_item1.type = "blob"
        mock_tree = MagicMock()
        mock_tree.tree = [mock_item1]
        mock_repo.get_git_tree.return_value = mock_tree

        # Mock README
        mock_readme = MagicMock()
        mock_readme.decoded_content = b"# Auth Microservice\nHandles JWT authentication and permissions."
        mock_repo.get_readme.return_value = mock_readme

        # Mock file content
        mock_file = MagicMock()
        mock_file.decoded_content = b"def authenticate_user():\n    return 'auth_token'\n"
        mock_repo.get_contents.return_value = mock_file

        mock_instance.get_repo.return_value = mock_repo
        mock_github_class.return_value = mock_instance

        res = self.client.post(
            "/api/chat",
            json={"message": "Where is user authentication handled in this repository?"},
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("scope"), "IN_SCOPE")
        self.assertIn("@README.md", data.get("references", []))

    # 14. Chat refuses off-topic questions
    def test_14_chat_refuses_off_topic(self):
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_valid_oauth_token")
        setting.selected_repo = "ai-engineering-assistant"
        self.db.commit()

        res = self.client.post(
            "/api/chat",
            json={"message": "What is Python?"},
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("scope"), "OUT_OF_SCOPE")
        self.assertEqual(data.get("reply"), STANDARD_REFUSAL_MESSAGE)

    # 15. GitHub API retrieval failure returns clean error without hallucinated fallback
    @patch("Backend.repository_service.Github")
    def test_15_github_api_failure_no_fallback(self, mock_github_class):
        from github import GithubException
        setting = self.db.query(UserSetting).filter(UserSetting.user_id == self.user.id).first()
        setting.github_token_encrypted = encrypt_token("gho_expired_token")
        setting.selected_repo = "alice_dev/private-repo"
        self.db.commit()

        mock_instance = MagicMock()
        mock_instance.get_repo.side_effect = GithubException(status=401, data={"message": "Bad credentials"})
        mock_github_class.return_value = mock_instance

        res = self.client.post(
            "/api/chat",
            json={"message": "Explain architecture of this repo."},
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data.get("scope"), ("GITHUB_AUTH_FAILED", "REPOSITORY_ACCESS_ERROR"))
        self.assertEqual(data.get("status"), "refused")
        self.assertNotIn("Here is an overview of the architecture", data.get("reply", ""))


if __name__ == "__main__":
    unittest.main()
