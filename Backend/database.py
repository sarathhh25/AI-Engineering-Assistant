import os
import datetime
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime,
    Boolean, ForeignKey, JSON, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import bcrypt

# Ensure environment variables are loaded
base_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(base_dir)
load_dotenv(dotenv_path=os.path.join(root_dir, ".env"))
load_dotenv()

# ---------------------------------------------------------------------------
# Password hashing utility (bcrypt - direct)
# ---------------------------------------------------------------------------


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# Database engine & session
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    env = (os.getenv("NODE_ENV") or os.getenv("ENVIRONMENT") or "development").lower()
    if env in ("production", "prod"):
        raise RuntimeError(
            "CRITICAL CONFIGURATION ERROR: DATABASE_URL is not set in production. "
            "Please configure DATABASE_URL via environment variable / .env."
        )
    # Default local SQLite database file in the repository root for zero-config dev
    sqlite_path = os.path.join(root_dir, "copilot_db.db").replace("\\", "/")
    DATABASE_URL = f"sqlite:///{sqlite_path}"

from sqlalchemy.pool import StaticPool

# SQLite compat
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
if DATABASE_URL.startswith("sqlite") and ":memory:" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args=connect_args, poolclass=StaticPool)
else:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_utcnow = lambda: datetime.datetime.now(datetime.timezone.utc)


# ===========================================================================
# Models
# ===========================================================================

class User(Base):
    """Registered platform users (email/password or OAuth)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)          # NULL for OAuth-only users
    auth_provider = Column(String(50), default="local")         # local | google | github
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    repositories = relationship("Repository", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"


class UserSession(Base):
    """Active auth sessions / tokens per user."""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="sessions")


class ChatSession(Base):
    """A conversation thread belonging to a user."""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="New Chat")
    repo_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("Message", back_populates="chat_session", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    """Individual chat messages within a session."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)       # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)      # optional structured data (refs, model info, etc.)
    created_at = Column(DateTime, default=_utcnow)

    chat_session = relationship("ChatSession", back_populates="messages")
    user = relationship("User", back_populates="messages")


class UserSetting(Base):
    """Per-user configuration / preferences (one row per user)."""
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    gemini_api_key = Column(String(255), nullable=True)
    github_token = Column(String(255), nullable=True)  # legacy / fallback plaintext field
    github_user_id = Column(String(100), nullable=True)
    github_username = Column(String(100), nullable=True)
    github_avatar_url = Column(String(500), nullable=True)
    github_token_encrypted = Column(Text, nullable=True)  # Secure AES-encrypted token
    github_scope = Column(String(255), nullable=True)
    github_connected_at = Column(DateTime, nullable=True)
    selected_repo = Column(String(255), nullable=True)
    preferred_model = Column(String(100), default="gemini-3.6-flash")
    theme = Column(String(20), default="dark")
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    user = relationship("User", back_populates="settings")


class OAuthState(Base):
    """Secure OAuth state nonce store for CSRF protection during GitHub authorization."""
    __tablename__ = "oauth_states"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    redirect_url = Column(String(500), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User")


class Repository(Base):
    """Repositories associated with a user."""
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    repo_name = Column(String(255), nullable=False)
    repo_owner = Column(String(255), nullable=True)
    default_branch = Column(String(100), default="main")
    language = Column(String(50), nullable=True)
    is_favorite = Column(Boolean, default=False)
    last_accessed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="repositories")

    __table_args__ = (
        UniqueConstraint("user_id", "repo_name", name="uq_user_repo"),
    )


# ---------------------------------------------------------------------------
# Keep the legacy alias so existing main.py imports don't break during transition
# ---------------------------------------------------------------------------
MessageRecord = Message


# ---------------------------------------------------------------------------
# DB lifecycle helpers
# ---------------------------------------------------------------------------
def init_db():
    """Create all tables and ensure schema columns exist."""
    from sqlalchemy import inspect, text
    try:
        Base.metadata.create_all(bind=engine)

        # Ensure newly introduced columns exist for existing databases
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        with engine.begin() as conn:
            if "user_settings" in table_names:
                existing_cols = {c["name"] for c in inspector.get_columns("user_settings")}
                new_col_defs = [
                    ("github_user_id", "VARCHAR(100)"),
                    ("github_username", "VARCHAR(100)"),
                    ("github_avatar_url", "VARCHAR(500)"),
                    ("github_token_encrypted", "TEXT"),
                    ("github_scope", "VARCHAR(255)"),
                    ("github_connected_at", "TIMESTAMP"),
                    ("selected_repo", "VARCHAR(255)"),
                ]
                for col_name, col_type in new_col_defs:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE user_settings ADD COLUMN {col_name} {col_type}"))
                        except Exception:
                            pass

            if "chat_sessions" in table_names:
                existing_cols = {c["name"] for c in inspector.get_columns("chat_sessions")}
                if "repo_name" not in existing_cols:
                    try:
                        conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN repo_name VARCHAR(255)"))
                    except Exception:
                        pass
                if "is_active" not in existing_cols:
                    try:
                        conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                    except Exception:
                        pass

        print("[OK] Database tables created / verified successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize database tables: {e}")


def get_db():
    """FastAPI dependency that yields a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
