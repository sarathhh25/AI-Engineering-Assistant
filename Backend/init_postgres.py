"""
init_postgres.py  –  Create the PostgreSQL database and seed sample data.

Usage:
    python Backend/init_postgres.py

The script will:
  1. Connect to the default 'postgres' database and CREATE DATABASE ai_copilot_db (if it doesn't exist).
  2. Create all tables defined in database.py.
  3. Seed 3 sample users with hashed passwords, chat sessions, messages,
     user settings, and repositories.
"""

import os
import sys
import datetime

# Ensure the project root is on sys.path so we can import Backend.*
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

# ---------------------------------------------------------------------------
# Step 1 – Create the database itself (connect to 'postgres' maintenance DB)
# ---------------------------------------------------------------------------
DB_NAME = "ai_copilot_db"
PG_BASE_URL = os.getenv(
    "PG_BASE_URL",
    "postgresql://postgres:Yashwanth12%40@localhost:5432",
)

print(f"🔧 Connecting to PostgreSQL at {PG_BASE_URL} ...")

# Use the default postgres database to issue CREATE DATABASE
maintenance_engine = create_engine(
    f"{PG_BASE_URL}/postgres",
    isolation_level="AUTOCOMMIT",   # CREATE DATABASE cannot run inside a transaction
)

with maintenance_engine.connect() as conn:
    result = conn.execute(
        text("SELECT 1 FROM pg_database WHERE datname = :name"),
        {"name": DB_NAME},
    )
    if result.fetchone():
        print(f"✅ Database '{DB_NAME}' already exists.")
    else:
        conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
        print(f"✅ Database '{DB_NAME}' created successfully.")

maintenance_engine.dispose()

# ---------------------------------------------------------------------------
# Step 2 – Create tables using the models from database.py
# ---------------------------------------------------------------------------
os.environ["DATABASE_URL"] = f"{PG_BASE_URL}/{DB_NAME}"

# Re-import after setting DATABASE_URL so the engine picks it up
from Backend.database import (
    Base, engine, SessionLocal,
    User, UserSession, ChatSession, Message, UserSetting, Repository,
    hash_password,
)

Base.metadata.create_all(bind=engine)
print("✅ All tables created / verified.")

# ---------------------------------------------------------------------------
# Step 3 – Seed sample data
# ---------------------------------------------------------------------------
db = SessionLocal()
_utcnow = lambda: datetime.datetime.now(datetime.timezone.utc)

try:
    # Skip seeding if users already exist
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"ℹ️  {existing_users} user(s) already exist – skipping seed.")
        sys.exit(0)

    # ---- Users ----
    user_sarath = User(
        full_name="Sarath Kumar",
        email="sarath@example.com",
        password_hash=hash_password("password123"),
        auth_provider="local",
        avatar_url=None,
        is_active=True,
    )
    user_devbot = User(
        full_name="Dev Bot",
        email="devbot@example.com",
        password_hash=hash_password("password123"),
        auth_provider="local",
        avatar_url=None,
        is_active=True,
    )
    user_admin = User(
        full_name="Admin User",
        email="admin@copilot.com",
        password_hash=hash_password("admin123"),
        auth_provider="local",
        avatar_url=None,
        is_active=True,
    )
    db.add_all([user_sarath, user_devbot, user_admin])
    db.flush()  # populate IDs

    print(f"   👤 Created users: Sarath (id={user_sarath.id}), Dev Bot (id={user_devbot.id}), Admin (id={user_admin.id})")

    # ---- User Settings ----
    db.add_all([
        UserSetting(user_id=user_sarath.id, preferred_model="gemini-2.5-flash", theme="dark"),
        UserSetting(user_id=user_devbot.id, preferred_model="gemini-2.0-flash", theme="dark"),
        UserSetting(user_id=user_admin.id, preferred_model="gemini-2.5-pro", theme="light"),
    ])

    # ---- Repositories ----
    repo_sarath_1 = Repository(
        user_id=user_sarath.id,
        repo_name="ai-engineering-assistant",
        repo_owner="sarathhh25",
        default_branch="main",
        language="TypeScript",
        is_favorite=True,
        last_accessed=_utcnow(),
    )
    repo_sarath_2 = Repository(
        user_id=user_sarath.id,
        repo_name="fastapi-microservice",
        repo_owner="sarathhh25",
        default_branch="develop",
        language="Python",
        is_favorite=False,
    )
    repo_devbot = Repository(
        user_id=user_devbot.id,
        repo_name="ai-engineering-assistant",
        repo_owner="sarathhh25",
        default_branch="main",
        language="TypeScript",
        is_favorite=True,
        last_accessed=_utcnow(),
    )
    repo_admin = Repository(
        user_id=user_admin.id,
        repo_name="copilot-infra",
        repo_owner="copilot-org",
        default_branch="main",
        language="Terraform",
        is_favorite=True,
    )
    db.add_all([repo_sarath_1, repo_sarath_2, repo_devbot, repo_admin])

    # ---- Chat Sessions & Messages ----

    # Sarath – Chat 1
    chat_s1 = ChatSession(
        user_id=user_sarath.id,
        title="Project Architecture Review",
        repo_name="ai-engineering-assistant",
        is_active=True,
    )
    db.add(chat_s1)
    db.flush()

    db.add_all([
        Message(
            chat_session_id=chat_s1.id,
            user_id=user_sarath.id,
            role="user",
            content="What is the architecture of this project?",
        ),
        Message(
            chat_session_id=chat_s1.id,
            user_id=user_sarath.id,
            role="assistant",
            content="The AI Engineering Copilot uses a Next.js 16 frontend with React 19, "
                    "a FastAPI Python backend with Gemini AI integration, and PostgreSQL for persistence. "
                    "The frontend handles auth via NextAuth.js and communicates with the backend REST API.",
        ),
        Message(
            chat_session_id=chat_s1.id,
            user_id=user_sarath.id,
            role="user",
            content="How are chat messages persisted?",
        ),
        Message(
            chat_session_id=chat_s1.id,
            user_id=user_sarath.id,
            role="assistant",
            content="Chat messages are stored in the `messages` table in PostgreSQL, "
                    "linked to a `chat_sessions` record and the authenticated `user`. "
                    "Each message stores the role (user/assistant), content, and an optional metadata JSON field.",
        ),
    ])

    # Sarath – Chat 2
    chat_s2 = ChatSession(
        user_id=user_sarath.id,
        title="Bug Fix: CORS Issue",
        repo_name="ai-engineering-assistant",
        is_active=False,
    )
    db.add(chat_s2)
    db.flush()

    db.add_all([
        Message(
            chat_session_id=chat_s2.id,
            user_id=user_sarath.id,
            role="user",
            content="I'm getting CORS errors when the frontend calls the backend API.",
        ),
        Message(
            chat_session_id=chat_s2.id,
            user_id=user_sarath.id,
            role="assistant",
            content="The CORS middleware in FastAPI needs to include your frontend origin. "
                    "Update the `allow_origins` list in `main.py` to include `http://localhost:3000`.",
        ),
    ])

    # Dev Bot – Chat
    chat_d1 = ChatSession(
        user_id=user_devbot.id,
        title="Code Review: Auth Module",
        repo_name="ai-engineering-assistant",
        is_active=True,
    )
    db.add(chat_d1)
    db.flush()

    db.add_all([
        Message(
            chat_session_id=chat_d1.id,
            user_id=user_devbot.id,
            role="user",
            content="Review the authentication module for security vulnerabilities.",
        ),
        Message(
            chat_session_id=chat_d1.id,
            user_id=user_devbot.id,
            role="assistant",
            content="The auth module uses bcrypt for password hashing which is secure. "
                    "However, I recommend adding rate limiting on the login endpoint "
                    "and implementing JWT token expiration with refresh tokens.",
        ),
    ])

    # Admin – Chat
    chat_a1 = ChatSession(
        user_id=user_admin.id,
        title="Infrastructure Setup",
        repo_name="copilot-infra",
        is_active=True,
    )
    db.add(chat_a1)
    db.flush()

    db.add_all([
        Message(
            chat_session_id=chat_a1.id,
            user_id=user_admin.id,
            role="user",
            content="Set up the production PostgreSQL instance on AWS RDS.",
        ),
        Message(
            chat_session_id=chat_a1.id,
            user_id=user_admin.id,
            role="assistant",
            content="To set up PostgreSQL on AWS RDS, create a `db.t3.medium` instance "
                    "with Multi-AZ deployment enabled. Use the `ai_copilot_db` database name "
                    "and configure the security group to allow inbound from your ECS cluster.",
        ),
    ])

    # ---- User Sessions (auth tokens) ----
    import secrets
    db.add_all([
        UserSession(
            user_id=user_sarath.id,
            session_token=secrets.token_urlsafe(32),
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 Chrome/130",
            expires_at=_utcnow() + datetime.timedelta(days=7),
        ),
        UserSession(
            user_id=user_admin.id,
            session_token=secrets.token_urlsafe(32),
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 Firefox/128",
            expires_at=_utcnow() + datetime.timedelta(days=7),
        ),
    ])

    db.commit()
    print("✅ Seed data inserted successfully!")

    # ---- Summary ----
    print("\n" + "=" * 60)
    print("  DATABASE SETUP COMPLETE")
    print("=" * 60)
    print(f"  Database : {DB_NAME}")
    print(f"  Users    : {db.query(User).count()}")
    print(f"  Sessions : {db.query(UserSession).count()}")
    print(f"  Chats    : {db.query(ChatSession).count()}")
    print(f"  Messages : {db.query(Message).count()}")
    print(f"  Settings : {db.query(UserSetting).count()}")
    print(f"  Repos    : {db.query(Repository).count()}")
    print("=" * 60)
    print("\n  Sample login credentials:")
    print("  ─────────────────────────────────────────")
    print("  sarath@example.com   / password123")
    print("  devbot@example.com   / password123")
    print("  admin@copilot.com    / admin123")
    print("  ─────────────────────────────────────────\n")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
