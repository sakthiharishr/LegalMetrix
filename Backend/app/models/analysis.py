from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from datetime import datetime, timezone
from ..core.database import Base


class ScanAnalysis(Base):
    __tablename__ = "scan_analyses"

    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scan_sessions.id"), unique=True, index=True, nullable=False)
    raw_ocr = Column(Text, default="")
    ocr_items_json = Column(Text, default="[]")
    extracted_json = Column(Text, default="{}")
    ocr_confidence = Column(Float, default=0.0)
    extraction_confidence = Column(Float, default=0.0)
    analysis_version = Column(String, default="LM-AI-1.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
