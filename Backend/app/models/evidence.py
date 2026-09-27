from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from datetime import datetime, timezone
from ..core.database import Base


class EvidenceRecord(Base):
    """Immutable linkage between a finding and the original uploaded image.

    The source image itself remains under Backend/uploads/. This record stores
    the exact image used as evidence plus the OCR/visual regions that support
    the finding, so an officer can trace a finding back to its source.
    """

    __tablename__ = "evidence_records"

    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scan_sessions.id"), index=True, nullable=False)
    finding_id = Column(String, ForeignKey("findings.id"), index=True, nullable=False)
    image_id = Column(String, ForeignKey("scan_images.id"), index=True, nullable=False)
    image_path = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    image_file_name = Column(String, nullable=True)
    evidence_type = Column(String, default="ORIGINAL_IMAGE_REGION")
    bounding_boxes_json = Column(Text, nullable=True)
    supporting_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
