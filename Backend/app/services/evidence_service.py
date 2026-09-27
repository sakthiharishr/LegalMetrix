import json
import os
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from ..models.evidence import EvidenceRecord
from ..models.finding import Finding
from ..models.scan import ScanImage


def _choose_source_image(
    scan_images: List[ScanImage],
    relevant_boxes: List[Dict[str, Any]],
) -> Optional[ScanImage]:
    if not scan_images:
        return None

    # Prefer the image that actually produced the field/finding OCR boxes.
    for box in relevant_boxes:
        image_id = box.get("image_id")
        if image_id:
            match = next((img for img in scan_images if img.id == image_id), None)
            if match:
                return match

    # Safe fallback: first uploaded package view.
    return scan_images[0]


def create_evidence_for_finding(
    db: Session,
    finding: Finding,
    scan_images: List[ScanImage],
    relevant_boxes: Optional[List[Dict[str, Any]]] = None,
) -> Optional[EvidenceRecord]:
    """Create the persistent finding -> source image evidence link.

    No image is copied or modified here. The original upload remains the
    immutable source under Backend/uploads/. The evidence record stores the
    image path/URL and the OCR bounding boxes used by the UI for highlighting.
    """
    relevant_boxes = relevant_boxes or []
    image = _choose_source_image(scan_images, relevant_boxes)
    if not image:
        return None

    # Re-analysis should not leave multiple evidence records for one finding.
    existing = db.query(EvidenceRecord).filter(EvidenceRecord.finding_id == finding.id).first()
    if existing:
        return existing

    evidence_id = finding.evidence_id or f"EVD-{uuid.uuid4().hex[:8].upper()}"
    supporting_text = "\n".join(
        str(item.get("text", "")).strip()
        for item in relevant_boxes
        if str(item.get("text", "")).strip()
    )

    record = EvidenceRecord(
        id=evidence_id,
        scan_id=finding.scan_id,
        finding_id=finding.id,
        image_id=image.id,
        image_path=image.file_path,
        image_url=image.url,
        image_file_name=image.file_name,
        evidence_type="ORIGINAL_IMAGE_REGION",
        bounding_boxes_json=json.dumps(relevant_boxes, ensure_ascii=False),
        supporting_text=supporting_text,
    )
    finding.evidence_id = evidence_id  # type: ignore
    db.add(record)
    return record
