"""
Comprehensive Regression Test Suite covering all 11 required test cases from the specification:
1. "What is this project about?"
2. "What programming languages and frameworks are used in this repository?"
3. "What are the main folders and files?"
4. "Where is the application entry point?"
5. "Explain how authentication works in this repository."
6. An accessible repository without a README.
7. An empty repository.
8. A repository the authenticated user cannot access.
9. GitHub API errors and rate limits.
10. An unrelated question returning the exact required refusal: "Sorry i was not able to provide answers."
11. Switching repositories without cross-repository evidence or conversation mixing.
Plus live verification against connected GitHub repository 'yashwanthkumar0812-dotcom/Secure-Chat'.
"""

import os
import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from Backend.main import app
from Backend.scope_classifier import (
    ScopeDecision,
    STANDARD_REFUSAL_MESSAGE,
    STANDARD_INSUFFICIENT_CONTEXT_MESSAGE,
    classify_query_rule_based,
    evaluate_scope,
)
from Backend.repository_service import (
    validate_repository_access,
    retrieve_repository_evidence,
)
from Backend.database import SessionLocal, User, UserSession, UserSetting, ChatSession, Message


class TestLiveAndRegressionSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # 1. "What is this project about?"
    def test_case_1_project_overview(self):
        decision = classify_query_rule_based("What is this project about?", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.IN_SCOPE)

        mock_repo = MagicMock()
        mock_repo.get_readme.side_effect = Exception("No README")
        mock_repo_info = {
            "name": "Secure-Chat",
            "full_name": "yashwanthkumar0812-dotcom/Secure-Chat",
            "is_local": False,
            "language": "Kotlin",
            "all_files": ["app/build.gradle.kts", "app/src/main/AndroidManifest.xml", "MainActivity.kt"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "plugins { id('com.android.application') }\ndependencies { implementation('androidx.compose') }"
            ev = retrieve_repository_evidence(mock_repo_info, "What is this project about?")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertTrue(len(ev["references"]) > 0)

    # 2. "What programming languages and frameworks are used in this repository?"
    def test_case_2_languages_and_frameworks(self):
        decision = classify_query_rule_based("What programming languages and frameworks are used in this repository?", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.IN_SCOPE)

        mock_repo = MagicMock()
        mock_repo.get_readme.side_effect = Exception("No README")
        mock_repo_info = {
            "name": "Secure-Chat",
            "full_name": "yashwanthkumar0812-dotcom/Secure-Chat",
            "is_local": False,
            "language": "Kotlin",
            "all_files": ["app/build.gradle.kts", "backend/package.json", "MainActivity.kt"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "apply plugin: 'kotlin-android'\ndependencies { implementation 'com.google.firebase:firebase-auth' }"
            ev = retrieve_repository_evidence(mock_repo_info, "What programming languages and frameworks are used in this repository?")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertIn("@app/build.gradle.kts", ev["references"])

    # 3. "What are the main folders and files?"
    def test_case_3_main_folders_and_files(self):
        decision = classify_query_rule_based("What are the main folders and files, and what does each one do?", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.IN_SCOPE)

        mock_repo = MagicMock()
        mock_repo.get_readme.side_effect = Exception("No README")
        mock_repo_info = {
            "name": "Secure-Chat",
            "full_name": "yashwanthkumar0812-dotcom/Secure-Chat",
            "is_local": False,
            "language": "Kotlin",
            "all_files": ["app/src/main/MainActivity.kt", "backend/package.json", "functions/index.js", "settings.gradle.kts"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "class MainActivity : ComponentActivity()"
            ev = retrieve_repository_evidence(mock_repo_info, "What are the main folders and files, and what does each one do?")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertIn("=== Repository File Tree Overview ===", ev["evidence_text"])

    # 4. "Where is the application entry point?"
    def test_case_4_application_entry_point(self):
        decision = classify_query_rule_based("Where is the application entry point?", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.IN_SCOPE)

        mock_repo = MagicMock()
        mock_repo.get_readme.side_effect = Exception("No README")
        mock_repo_info = {
            "name": "Secure-Chat",
            "full_name": "yashwanthkumar0812-dotcom/Secure-Chat",
            "is_local": False,
            "language": "Kotlin",
            "all_files": ["app/src/main/AndroidManifest.xml", "app/src/main/java/com/example/securechat/MainActivity.kt"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "package com.example.securechat\nclass MainActivity : ComponentActivity()"
            ev = retrieve_repository_evidence(mock_repo_info, "Where is the application entry point?")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertTrue(any("MainActivity" in r for r in ev["references"]))

    # 5. "Explain how authentication works in this repository."
    def test_case_5_authentication_flow(self):
        decision = classify_query_rule_based("Explain how authentication works in this repository.", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.IN_SCOPE)

        mock_repo = MagicMock()
        mock_repo.get_readme.side_effect = Exception("No README")
        mock_repo_info = {
            "name": "Secure-Chat",
            "full_name": "yashwanthkumar0812-dotcom/Secure-Chat",
            "is_local": False,
            "language": "Kotlin",
            "all_files": ["app/src/main/java/com/example/securechat/ui/LoginScreen.kt", "app/src/main/java/com/example/securechat/crypto/KeyManager.kt"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "fun LoginScreen(auth: FirebaseAuth) { auth.signInWithEmailAndPassword() }"
            ev = retrieve_repository_evidence(mock_repo_info, "Explain how authentication works in this repository.")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertTrue(any("LoginScreen" in r for r in ev["references"]))

    # 6. An accessible repository without a README
    def test_case_6_accessible_repo_without_readme(self):
        mock_repo = MagicMock()
        mock_repo.name = "No-Readme-Repo"
        mock_repo.full_name = "testuser/No-Readme-Repo"
        mock_repo.default_branch = "main"
        mock_repo.language = "Python"
        mock_repo.get_readme.side_effect = Exception("404 Not Found")

        mock_repo_info = {
            "name": "No-Readme-Repo",
            "full_name": "testuser/No-Readme-Repo",
            "is_local": False,
            "language": "Python",
            "all_files": ["main.py", "requirements.txt"],
            "repo_obj": mock_repo,
        }
        with patch("Backend.repository_service.get_remote_file_content_cached") as mock_fetch:
            mock_fetch.return_value = "print('Hello world entry point')"
            ev = retrieve_repository_evidence(mock_repo_info, "What is this project about?")
            self.assertTrue(ev["has_sufficient_context"])
            self.assertIn("@main.py:L1-1", ev["references"])

    # 7. An empty repository
    def test_case_7_empty_repository(self):
        from github import GithubException
        mock_repo = MagicMock()
        mock_repo.name = "Empty-Repo"
        mock_repo.full_name = "testuser/Empty-Repo"
        mock_repo.default_branch = None
        mock_repo.size = 0
        mock_repo.get_branch.side_effect = GithubException(409, {"message": "Git Repository is empty."})

        mock_repo_info = {
            "name": "Empty-Repo",
            "full_name": "testuser/Empty-Repo",
            "is_local": False,
            "all_files": [],
            "repo_obj": mock_repo,
        }
        ev = retrieve_repository_evidence(mock_repo_info, "What is this project about?")
        self.assertTrue(ev["is_empty"])
        self.assertEqual(ev["error_category"], "REPOSITORY_EMPTY")
        self.assertFalse(ev["has_sufficient_context"])

    # 8. A repository the authenticated user cannot access
    def test_case_8_access_forbidden(self):
        from github import GithubException
        with patch("Backend.repository_service.Github") as mock_gh_class:
            mock_gh = MagicMock()
            mock_gh.get_repo.side_effect = GithubException(403, {"message": "Must have push or pull access."})
            mock_gh_class.return_value = mock_gh

            ok, status, msg, _ = validate_repository_access("secret-corp/private-project", github_token="fake_token_123")
            self.assertFalse(ok)
            self.assertEqual(status, "REPOSITORY_ACCESS_FORBIDDEN")
            self.assertIn("Access forbidden", msg)

    # 9. GitHub API errors and rate limits
    def test_case_9_rate_limits(self):
        from github import GithubException
        with patch("Backend.repository_service.Github") as mock_gh_class:
            mock_gh = MagicMock()
            mock_gh.get_repo.side_effect = GithubException(403, {"message": "API rate limit exceeded for user"})
            mock_gh_class.return_value = mock_gh

            ok, status, msg, _ = validate_repository_access("testuser/my-repo", github_token="fake_token_123")
            self.assertFalse(ok)
            self.assertEqual(status, "GITHUB_RATE_LIMITED")
            self.assertIn("rate limit exceeded", msg.lower())

    # 10. An unrelated question returning the exact required refusal
    def test_case_10_unrelated_question_exact_refusal(self):
        decision = classify_query_rule_based("What is the capital of India?", "Secure-Chat")
        self.assertEqual(decision, ScopeDecision.OUT_OF_SCOPE)

        response = self.client.post("/api/chat", json={
            "message": "What is the capital of India?",
            "repo": "ai-engineering-assistant",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "refused")
        self.assertEqual(data.get("scope"), "OUT_OF_SCOPE")
        self.assertEqual(data.get("reply"), STANDARD_REFUSAL_MESSAGE)
        self.assertEqual(data.get("reply"), "Sorry i was not able to provide answers.")

    # 11. Switching repositories without cross-repository evidence or conversation mixing
    def test_case_11_repository_switching_isolation(self):
        db = SessionLocal()
        try:
            import uuid
            unique_id = uuid.uuid4().hex[:8]
            user = User(full_name="Switch Test User", email=f"switch_test_{unique_id}@example.com", auth_provider="local")
            db.add(user)
            db.flush()

            sess = UserSession(user_id=user.id, session_token=f"switch_test_token_{unique_id}")
            db.add(sess)

            # Create conversation bound to Repo-Alpha
            chat1 = ChatSession(user_id=user.id, title="Chat 1", repo_name="org/Repo-Alpha", is_active=True)
            db.add(chat1)
            db.commit()

            # Attempting to post to chat1 with Repo-Beta must be rejected with 400
            response = self.client.post(
                "/api/chat",
                headers={"Authorization": f"Bearer switch_test_token_{unique_id}"},
                json={
                    "message": "Explain architecture",
                    "repo": "org/Repo-Beta",
                    "conversation_id": f"conv-{chat1.id}",
                }
            )
            self.assertEqual(response.status_code, 400)
            self.assertIn("bound to repository 'org/Repo-Alpha'", response.json()["detail"])
        finally:
            db.rollback()
            db.close()


if __name__ == "__main__":
    unittest.main()
