from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from datetime import datetime, timezone
from ..core.database import Base

class VerificationRecord(Base):
    __tablename__ = "verification_records"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, index=True, nullable=False)
    finding_id = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING_OFFICER_REVIEW")  # PENDING_OFFICER_REVIEW, COMPLETED
    decision = Column(String, nullable=True)  # CONFIRM_FINDING, INVALIDATE_FINDING, NEEDS_FURTHER_REVIEW
    remarks = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, index=True, nullable=False)
    finding_id = Column(String, index=True, nullable=True)
    actor = Column(String, nullable=False)  # SYSTEM, AI_ANALYSIS, OFFICER
    action = Column(String, nullable=False)
    status = Column(String, default="SUCCESS")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

