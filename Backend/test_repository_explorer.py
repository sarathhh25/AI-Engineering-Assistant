"""
Automated Test Suite for Real GitHub Repository Explorer.
Covers all 10 requirements from Section 7:
1. Fetching the default branch and all accessible branches.
2. Switching from one branch to another.
3. Rendering real nested directories and files.
4. Opening a real source file and showing its actual content.
5. Private repository access and expired credentials.
6. Empty repositories and missing files.
7. GitHub API rate limits and network errors.
8. Large or truncated Git trees.
9. Preventing stale code from appearing after repository or branch switches.
10. Ensuring failed API calls never display placeholder source code as if it were real.
"""

import os
import sys
import secrets
import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from github import GithubException

# Testing environment
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["APP_ENCRYPTION_KEY"] = "dGVzdF9lbmNyeXB0aW9uX2tleV8zMl9ieXRlc19sb25nISE="

base_dir = os.path.dirname(os.path.abspath(__file__))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from Backend.database import init_db, SessionLocal, User, UserSession, UserSetting
from Backend.main import app
from Backend.repository_service import (
    build_nested_file_tree,
    clear_repository_caches,
    _TREE_CACHE,
    _FILE_CONTENT_CACHE,
)


class TestRepositoryExplorer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def setUp(self):
        clear_repository_caches()
        self.db = SessionLocal()

        # Clean any prior test user records
        test_uids = [u.id for u in self.db.query(User).filter(User.email.like("explorer_%@example.com")).all()]
        if test_uids:
            self.db.query(UserSession).filter(UserSession.user_id.in_(test_uids)).delete(synchronize_session=False)
            self.db.query(UserSetting).filter(UserSetting.user_id.in_(test_uids)).delete(synchronize_session=False)
            self.db.query(User).filter(User.id.in_(test_uids)).delete(synchronize_session=False)
            self.db.commit()

        # Create test user with active session
        self.user = User(
            full_name="Explorer Tester",
            email=f"explorer_{secrets.token_hex(4)}@example.com",
            auth_provider="local",
        )
        self.db.add(self.user)
        self.db.flush()

        self.session_token = f"explorer_test_token_{secrets.token_hex(6)}"
        self.session = UserSession(user_id=self.user.id, session_token=self.session_token)
        self.db.add(self.session)

        # Connect user with mock token
        self.setting = UserSetting(
            user_id=self.user.id,
            github_username="explorer_user",
            github_token="ghp_mock_valid_token_12345",
            selected_repo="owner/my-cool-project",
        )
        self.db.add(self.setting)
        self.db.commit()

        self.auth_headers = {"Authorization": f"Bearer {self.session_token}"}

    def tearDown(self):
        clear_repository_caches()
        try:
            test_uids = [u.id for u in self.db.query(User).filter(User.email.like("explorer_%@example.com")).all()]
            if test_uids:
                self.db.query(UserSession).filter(UserSession.user_id.in_(test_uids)).delete(synchronize_session=False)
                self.db.query(UserSetting).filter(UserSetting.user_id.in_(test_uids)).delete(synchronize_session=False)
                self.db.query(User).filter(User.id.in_(test_uids)).delete(synchronize_session=False)
                self.db.commit()
        except Exception:
            pass
        self.db.close()

    # 1. Fetching the default branch and all accessible branches
    @patch("Backend.repository_service.Github")
    def test_1_fetching_default_branch_and_all_accessible_branches(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.full_name = "owner/my-cool-project"
        mock_repo.id = 123456
        mock_repo.default_branch = "develop"

        # Mock 3 branches
        b1 = MagicMock()
        b1.name = "feature-login"
        b1.commit.sha = "sha_login_111"
        b1.protected = False

        b2 = MagicMock()
        b2.name = "develop"
        b2.commit.sha = "sha_develop_222"
        b2.protected = True

        b3 = MagicMock()
        b3.name = "main"
        b3.commit.sha = "sha_main_333"
        b3.protected = True

        mock_repo.get_branches.return_value = [b1, b2, b3]
        mock_gh.get_repo.return_value = mock_repo

        res = self.client.post(
            "/api/github/branches",
            headers=self.auth_headers,
            json={"repo": "owner/my-cool-project"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["default_branch"], "develop")
        self.assertEqual(data["total_branches"], 3)
        self.assertEqual(data["repo_id"], 123456)

        # Default branch should be prioritized at index 0
        branches = data["branches"]
        self.assertEqual(branches[0]["name"], "develop")
        self.assertTrue(branches[0]["is_default"])
        self.assertEqual(branches[0]["commit_sha"], "sha_develop_222")

        # All branches returned with commit SHA and indicators
        names = [b["name"] for b in branches]
        self.assertIn("feature-login", names)
        self.assertIn("main", names)
        self.assertIn("develop", names)

    # 2. Switching from one branch to another returns distinct trees
    @patch("Backend.repository_service.Github")
    def test_2_switching_from_one_branch_to_another(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.full_name = "owner/my-cool-project"
        mock_repo.id = 123456
        mock_repo.default_branch = "main"
        mock_gh.get_repo.return_value = mock_repo

        # Branch 'main' tree
        item_main = MagicMock()
        item_main.path = "app/main.py"
        item_main.type = "blob"
        item_main.size = 120
        item_main.sha = "sha_file_main"

        # Branch 'feature-v2' tree
        item_feat = MagicMock()
        item_feat.path = "app/v2_feature.py"
        item_feat.type = "blob"
        item_feat.size = 250
        item_feat.sha = "sha_file_v2"

        tree_main = MagicMock()
        tree_main.tree = [item_main]
        tree_main.truncated = False

        tree_feat = MagicMock()
        tree_feat.tree = [item_feat]
        tree_feat.truncated = False

        def get_git_tree_side_effect(sha_or_ref, recursive=True):
            if "feature-v2" in sha_or_ref or sha_or_ref == "sha_v2":
                return tree_feat
            return tree_main

        def get_branch_side_effect(branch_name):
            b = MagicMock()
            b.name = branch_name
            b.commit.sha = "sha_v2" if branch_name == "feature-v2" else "sha_main"
            return b

        mock_repo.get_git_tree.side_effect = get_git_tree_side_effect
        mock_repo.get_branch.side_effect = get_branch_side_effect

        # Fetch tree for main branch
        res_main = self.client.post(
            "/api/github/tree",
            headers=self.auth_headers,
            json={"repo": "owner/my-cool-project", "branch": "main"},
        )
        self.assertEqual(res_main.status_code, 200)
        main_tree = res_main.json()
        self.assertEqual(main_tree["branch"], "main")
        self.assertEqual(main_tree["tree"][0]["name"], "app")
        self.assertEqual(main_tree["tree"][0]["children"][0]["name"], "main.py")

        # Switch to feature-v2 branch
        res_feat = self.client.post(
            "/api/github/tree",
            headers=self.auth_headers,
            json={"repo": "owner/my-cool-project", "branch": "feature-v2"},
        )
        self.assertEqual(res_feat.status_code, 200)
        feat_tree = res_feat.json()
        self.assertEqual(feat_tree["branch"], "feature-v2")
        self.assertEqual(feat_tree["tree"][0]["name"], "app")
        self.assertEqual(feat_tree["tree"][0]["children"][0]["name"], "v2_feature.py")

    # 3. Rendering real nested directories and files correctly
    def test_3_rendering_nested_directories_and_files(self):
        items = [
            {"path": "src/components/Header.tsx", "type": "blob", "size": 1024, "sha": "s1"},
            {"path": "src/components/Footer.tsx", "type": "blob", "size": 512, "sha": "s2"},
            {"path": "src/index.ts", "type": "blob", "size": 256, "sha": "s3"},
            {"path": "package.json", "type": "blob", "size": 400, "sha": "s4"},
            {"path": "docs/architecture/spec.md", "type": "blob", "size": 2048, "sha": "s5"},
        ]

        nested = build_nested_file_tree(items)

        # Root level should have 'docs' (folder), 'src' (folder), 'package.json' (file)
        root_names = [n["name"] for n in nested]
        self.assertEqual(root_names, ["docs", "src", "package.json"])

        # Check 'src' folder
        src_folder = next(n for n in nested if n["name"] == "src")
        self.assertEqual(src_folder["type"], "folder")
        src_children = [c["name"] for c in src_folder["children"]]
        self.assertEqual(src_children, ["components", "index.ts"])

        # Check 'components' folder
        comp_folder = next(c for c in src_folder["children"] if c["name"] == "components")
        self.assertEqual(comp_folder["type"], "folder")
        comp_children = [c["name"] for c in comp_folder["children"]]
        self.assertEqual(comp_children, ["Footer.tsx", "Header.tsx"])

    # 4. Opening a real source file and showing its actual content
    @patch("Backend.repository_service.Github")
    def test_4_opening_real_source_file_and_showing_content(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.full_name = "owner/my-cool-project"
        mock_repo.id = 123456
        mock_repo.default_branch = "main"
        mock_gh.get_repo.return_value = mock_repo

        mock_file = MagicMock()
        real_code = "import { useState } from 'react';\n\nexport function RealComponent() {\n  return <div>Genuine GitHub Source</div>;\n}\n"
        mock_file.decoded_content = real_code.encode("utf-8")
        mock_file.size = len(real_code)
        mock_file.sha = "blob_sha_xyz"
        mock_repo.get_contents.return_value = mock_file

        res = self.client.post(
            "/api/github/file-content",
            headers=self.auth_headers,
            json={"repo": "owner/my-cool-project", "path": "src/Component.tsx", "ref": "main"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["content"], real_code)
        self.assertEqual(data["language"], "typescript")
        self.assertEqual(data["path"], "src/Component.tsx")
        self.assertFalse(data["is_binary"])
        self.assertFalse(data["is_truncated"])
        self.assertEqual(data["status"], "success")

    # 5. Private repository access and expired credentials
    @patch("Backend.repository_service.Github")
    def test_5_private_repo_access_and_expired_credentials(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        # Simulate GitHub token expired / revoked (HTTP 401)
        mock_gh.get_repo.side_effect = GithubException(401, {"message": "Bad credentials"})

        res = self.client.post(
            "/api/github/branches",
            headers=self.auth_headers,
            json={"repo": "owner/private-repo"},
        )
        self.assertIn(res.status_code, (401, 403))
        self.assertIn("permissions", res.json()["detail"].lower())

    # 6. Empty repositories and missing files
    @patch("Backend.repository_service.Github")
    def test_6_empty_repositories_and_missing_files(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.full_name = "owner/empty-repo"
        mock_repo.id = 777
        mock_repo.default_branch = "main"
        mock_repo.size = 0
        mock_repo.get_branches.side_effect = GithubException(409, {"message": "Git Repository is empty."})
        mock_repo.get_git_tree.side_effect = GithubException(409, {"message": "Git Repository is empty."})
        mock_gh.get_repo.return_value = mock_repo

        # Empty repo branch query
        res_branches = self.client.post(
            "/api/github/branches",
            headers=self.auth_headers,
            json={"repo": "owner/empty-repo"},
        )
        self.assertEqual(res_branches.status_code, 200)
        self.assertEqual(res_branches.json()["status"], "empty")
        self.assertEqual(res_branches.json()["branches"], [])

        # Empty repo tree query
        res_tree = self.client.post(
            "/api/github/tree",
            headers=self.auth_headers,
            json={"repo": "owner/empty-repo", "branch": "main"},
        )
        self.assertEqual(res_tree.status_code, 200)
        self.assertEqual(res_tree.json()["status"], "empty")
        self.assertEqual(res_tree.json()["tree"], [])

        # Missing file query (404)
        mock_repo.get_contents.side_effect = GithubException(404, {"message": "Not Found"})
        res_file = self.client.post(
            "/api/github/file-content",
            headers=self.auth_headers,
            json={"repo": "owner/empty-repo", "path": "does_not_exist.py"},
        )
        self.assertEqual(res_file.status_code, 404)
        self.assertIn("not found", res_file.json()["detail"].lower())

    # 7. GitHub API rate limits and network errors
    @patch("Backend.repository_service.Github")
    def test_7_github_api_rate_limits_and_network_errors(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_gh.get_repo.side_effect = GithubException(403, {"message": "API rate limit exceeded"})

        res = self.client.post(
            "/api/github/tree",
            headers=self.auth_headers,
            json={"repo": "owner/rate-limited-repo"},
        )
        self.assertEqual(res.status_code, 429)
        self.assertIn("rate limit", res.json()["detail"].lower())

    # 8. Large or truncated Git trees
    @patch("Backend.repository_service.Github")
    def test_8_large_or_truncated_git_trees(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.full_name = "owner/massive-repo"
        mock_repo.id = 8888
        mock_repo.default_branch = "main"
        mock_gh.get_repo.return_value = mock_repo

        mock_item = MagicMock()
        mock_item.path = "huge/file.py"
        mock_item.type = "blob"
        mock_item.size = 5000
        mock_item.sha = "sha_huge"

        mock_tree = MagicMock()
        mock_tree.tree = [mock_item]
        mock_tree.truncated = True  # Truncated response from GitHub
        mock_repo.get_git_tree.return_value = mock_tree

        res = self.client.post(
            "/api/github/tree",
            headers=self.auth_headers,
            json={"repo": "owner/massive-repo", "branch": "main"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_truncated"])
        self.assertEqual(len(data["tree"]), 1)

    # 9. Preventing stale code from appearing after repository or branch switches
    @patch("Backend.repository_service.Github")
    def test_9_preventing_stale_code_after_repo_or_branch_switches(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh

        repo_a = MagicMock()
        repo_a.full_name = "owner/repo-a"
        repo_a.id = 101
        repo_a.default_branch = "main"

        file_a = MagicMock()
        file_a.decoded_content = b"content of repo A"
        file_a.size = 17
        file_a.sha = "sha_a"
        repo_a.get_contents.return_value = file_a

        repo_b = MagicMock()
        repo_b.full_name = "owner/repo-b"
        repo_b.id = 102
        repo_b.default_branch = "main"

        file_b = MagicMock()
        file_b.decoded_content = b"content of repo B"
        file_b.size = 17
        file_b.sha = "sha_b"
        repo_b.get_contents.return_value = file_b

        def get_repo_side_effect(name):
            return repo_a if "repo-a" in name else repo_b

        mock_gh.get_repo.side_effect = get_repo_side_effect

        # Fetch file from Repo A
        res_a = self.client.post(
            "/api/github/file-content",
            headers=self.auth_headers,
            json={"repo": "owner/repo-a", "path": "app/page.tsx", "ref": "main"},
        )
        self.assertEqual(res_a.json()["content"], "content of repo A")

        # Fetch file with same path from Repo B
        res_b = self.client.post(
            "/api/github/file-content",
            headers=self.auth_headers,
            json={"repo": "owner/repo-b", "path": "app/page.tsx", "ref": "main"},
        )
        self.assertEqual(res_b.json()["content"], "content of repo B")

        # Ensure Repo A cache didn't pollute Repo B
        self.assertNotEqual(res_a.json()["content"], res_b.json()["content"])

    # 10. Ensuring failed API calls never display placeholder source code
    @patch("Backend.repository_service.Github")
    def test_10_failed_api_calls_never_display_placeholder_code(self, mock_gh_cls):
        mock_gh = MagicMock()
        mock_gh_cls.return_value = mock_gh
        mock_repo = MagicMock()
        mock_repo.get_contents.side_effect = RuntimeError("Fatal network drop")
        mock_gh.get_repo.return_value = mock_repo

        res = self.client.post(
            "/api/github/file-content",
            headers=self.auth_headers,
            json={"repo": "owner/my-cool-project", "path": "components/sidebar-left.tsx"},
        )
        # Endpoint MUST return error, NEVER 200 with placeholder demo code
        self.assertNotEqual(res.status_code, 200)
        self.assertNotIn("export function demo()", res.text)
        self.assertNotIn("Active file loaded", res.text)


if __name__ == "__main__":
    unittest.main()
