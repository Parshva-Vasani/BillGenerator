import os
# pyrefly: ignore [missing-import]
from sqlmodel import SQLModel, create_engine, Session

# Use Neon DB string from environment, fallback to sqlite for local testing
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
