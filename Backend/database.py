from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

# Replace with your actual PostgreSQL username and password
DATABASE_URL = "postgresql://postgres:password@localhost:5432/copilot_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Chat Message Table
class MessageRecord(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True) # To group messages by chat session
    repo_name = Column(String)
    role = Column(String) # 'user' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Automatically create the tables when the app starts
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()