from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# SQLite 数据库连接（用于股票数据）
SQLITE_DATABASE_URL = f"sqlite:///{settings.SQLITE_DATABASE_PATH}"
sqlite_engine = create_engine(
    SQLITE_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

# PostgreSQL 数据库连接（用于 Celery）
if settings.POSTGRES_DATABASE_URL:
    postgres_engine = create_engine(settings.POSTGRES_DATABASE_URL, pool_pre_ping=True)
    PostgresSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=postgres_engine)
else:
    postgres_engine = None
    PostgresSessionLocal = None

# 为了保持兼容性，默认使用 SQLite 连接
engine = sqlite_engine

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_postgres_db():
    if not PostgresSessionLocal:
        raise Exception("PostgreSQL connection not configured")
    db = PostgresSessionLocal()
    try:
        yield db
    finally:
        db.close() 