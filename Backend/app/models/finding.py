from sqlalchemy import Column, String, Float, Text, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from ..core.database import Base

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scan_sessions.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    rule_code = Column(String, nullable=False)  # e.g. RULE_6_1_E
    rule_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    expected = Column(String, nullable=True)
    extracted = Column(String, nullable=True)
    status = Column(String, default="COMPLIANT")  # COMPLIANT, POTENTIAL_VIOLATION, NEEDS_REVIEW
    confidence = Column(Float, default=95.0)
    explanation = Column(Text, nullable=True)
    evidence_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scan_sessions.id"), index=True, nullable=False)
    product_id = Column(String, nullable=True)
    rule_code = Column(String, nullable=False)
    category = Column(String, nullable=False)
    affected_field = Column(String, nullable=False)
    extracted_value = Column(String, nullable=True)
    expected_value = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=90.0)
    risk_level = Column(String, default="HIGH_RISK")
    risk_score = Column(Float, default=80.0)
    status = Column(String, default="POTENTIAL_VIOLATION")  # POTENTIAL_VIOLATION, NEEDS_REVIEW, CONFIRMED, INVALIDATED
    evidence_id = Column(String, nullable=True)
    bounding_boxes_json = Column(Text, nullable=True)
    raw_ocr = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

