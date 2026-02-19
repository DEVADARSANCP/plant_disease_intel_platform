"""
SQLite database via SQLAlchemy (synchronous engine).
DB file: backend/jomee.db  (auto-created on first run)
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DB_PATH = os.path.join(os.path.dirname(__file__), "jomee.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def init_db():
    """Create all tables that don't exist yet."""
    from models.db_models import FarmerProfile, CropListing, InputListing, BuyerInquiry  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
