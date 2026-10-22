from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()


@router.get("/health", summary="System Health & Database Connectivity")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    pgvector_status = "unknown"

    try:
        # Check basic DB connection
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e!s}"

    try:
        # Check pgvector extension status
        res = db.execute(
            text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
        ).fetchone()
        pgvector_status = "installed" if res else "not installed"
    except Exception:
        pgvector_status = "skipped / sqlite"

    return {
        "status": "online",
        "service": "See My Mind & NOYA AI Core API",
        "database": db_status,
        "pgvector": pgvector_status,
    }
