from ..core.database import Base, engine, SessionLocal
from ..models import User, Product, ScanSession, ScanImage, ComplianceCheck, Finding, VerificationRecord, AuditLog
from ..services.seed_service import seed_initial_data

def init_db():
    """Create tables and seed initial enforcement data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

