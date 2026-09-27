from ..core.database import Base, engine, SessionLocal
from ..models import User, Product, ScanSession, ScanImage, ComplianceCheck, Finding, VerificationRecord, AuditLog
from ..services.seed_service import seed_initial_data

def _add_missing_columns():
    """create_all() does not add new columns to existing tables; add them so old databases keep working."""
    from sqlalchemy import inspect, text
    columns = {c["name"] for c in inspect(engine).get_columns("scan_sessions")}
    if "case_status" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE scan_sessions ADD COLUMN case_status VARCHAR"))
    # Findings saved before their product existed were never linked to it; link them from their scan.
    with engine.begin() as conn:
        conn.execute(text(
            "UPDATE findings SET product_id = (SELECT product_id FROM scan_sessions WHERE scan_sessions.id = findings.scan_id) "
            "WHERE product_id IS NULL"
        ))


def init_db():
    """Create tables and seed initial enforcement data."""
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

