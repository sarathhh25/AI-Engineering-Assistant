import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from Backend.scope_classifier import evaluate_scope, ScopeDecision, STANDARD_REFUSAL_MESSAGE, STANDARD_INSUFFICIENT_CONTEXT_MESSAGE
from Backend.main import app

client = TestClient(app)

def test_scope_classifier_world_cup():
    known_files = ["README.md", "backend/main.py", "frontend/package.json"]
    d = evaluate_scope("Who won the 2022 World Cup?", "Bug_trage_agent", "Python", known_files)
    assert d == ScopeDecision.OUT_OF_SCOPE

def test_scope_classifier_valid_query():
    known_files = ["README.md", "backend/main.py", "frontend/package.json"]
    d = evaluate_scope("what is this project about?", "Bug_trage_agent", "Python", known_files)
    assert d == ScopeDecision.IN_SCOPE

def test_scope_classifier_typo_tolerance():
    known_files = ["README.md", "backend/main.py", "frontend/package.json"]
    d = evaluate_scope("what is this projectabout", "Bug_trage_agent", "Python", known_files)
    assert d == ScopeDecision.IN_SCOPE

def test_chat_endpoint_exact_refusal_on_unrelated_query():
    # Use workspace repo which requires no remote token
    res = client.post(
        "/api/chat",
        json={
            "message": "Who won the 2022 World Cup in Qatar?",
            "repo": "ai-engineering-assistant"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("reply") == "Sorry i was not able to provide answers."
    assert data.get("scope") == "OUT_OF_SCOPE"

def test_chat_endpoint_insufficient_context_on_nonexistent_feature():
    # Query for feature not present in local workspace
    res = client.post(
        "/api/chat",
        json={
            "message": "Where is the quantum teleportation module implemented in this project?",
            "repo": "ai-engineering-assistant"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("reply") == "I could not verify this from the selected repository's available files."
    assert data.get("scope") == "INSUFFICIENT_REPOSITORY_CONTEXT"
