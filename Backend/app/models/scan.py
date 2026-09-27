from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from ..core.database import Base

class ScanSession(Base):
    __tablename__ = "scan_sessions"
    
    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, nullable=True)
    product_name = Column(String, default="Unidentified Commodity")
    officer_id = Column(String, nullable=True)
    status = Column(String, default="CREATED")  # CREATED, ANALYZING, COMPLETE, FAILED
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="LOW_RISK")
    compliance_status = Column(String, default="PENDING")
    # Case workflow: NO_CASE (compliant) | READY_TO_FORWARD | FORWARDED | CONFIRMED | INVALIDATED | UNDER_REVIEW
    case_status = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ScanImage(Base):
    __tablename__ = "scan_images"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scan_sessions.id"), index=True, nullable=False)
    view_slot = Column(String, default="Front View")
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    status = Column(String, default="UPLOADED")
    quality_status = Column(String, default="GOOD")
    blur_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

