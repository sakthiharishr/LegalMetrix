import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.scan import ScanSession, ScanImage
from ...models.analysis import ScanAnalysis
from ...models.finding import Finding
from ...models.product import Product
from ...models.evidence import EvidenceRecord
from ...models.user import User
from ...schemas.evidence import EvidenceResponse, EvidenceProduct, EvidenceFindingDetail, EvidenceBlock, EvidenceImage, BoundingBox, SupportingTextItem, EvidenceRuleReference, ConfidenceMetrics, EvidenceRisk, TraceabilityBlock
from ...services.rule_engine import LEGAL_METROLOGY_RULES
from ..deps import get_current_user

router = APIRouter(tags=["Violation Evidence"])


@router.get("/evidence/available")
def get_available_evidence_cases(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return product/scan-level cases that have pending AI findings for direct Evidence navigation."""
    findings = (
        db.query(Finding)
        .join(ScanSession, Finding.scan_id == ScanSession.id)
        .filter(
            Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]),
            (ScanSession.officer_id == current_user.id) | (ScanSession.officer_id.is_(None)),
        )
        .order_by(Finding.created_at.desc())
        .all()
    )
    grouped = {}
    for finding in findings:
        scan = db.query(ScanSession).filter(ScanSession.id == finding.scan_id).first()
        if not scan:
            continue
        key = scan.id
        if key not in grouped:
            product = db.query(Product).filter(Product.id == scan.product_id).first() if scan.product_id else None
            grouped[key] = {
                "scanId": scan.id,
                "productId": scan.product_id,
                "productName": product.name if product else (scan.product_name or "Unidentified Commodity"),
                "brand": product.brand if product else "Unknown",
                "riskLevel": finding.risk_level or scan.risk_level or "MEDIUM_RISK",
                "riskScore": int(finding.risk_score or scan.risk_score or 0),
                "findingCount": 0,
                "createdAt": finding.created_at.isoformat() if finding.created_at else scan.created_at.isoformat(),
            }
        grouped[key]["findingCount"] += 1
        if (finding.risk_score or 0) > grouped[key]["riskScore"]:
            grouped[key]["riskScore"] = int(finding.risk_score or 0)
            grouped[key]["riskLevel"] = finding.risk_level or grouped[key]["riskLevel"]
    items = list(grouped.values())
    return {"total": len(items), "items": items}


def _boxes(items):
    boxes = []
    for item in items:
        points = item.get("box") or []
        if len(points) < 4:
            continue
        xs = [float(p[0]) for p in points]
        ys = [float(p[1]) for p in points]
        boxes.append(BoundingBox(
            id=item.get("id", "OCR"), x=min(xs), y=min(ys),
            width=max(xs) - min(xs), height=max(ys) - min(ys),
            label=item.get("text", "OCR text"), type="ocr"
        ))
    return boxes


def _ensure_evidence(db, finding, images, ocr_items):
    """Backfill evidence for older scans that pre-date evidence_records."""
    record = db.query(EvidenceRecord).filter(EvidenceRecord.finding_id == finding.id).first()
    if record:
        return record
    if not images:
        return None

    relevant = []
    try:
        relevant = json.loads(finding.bounding_boxes_json or "[]")
    except (TypeError, ValueError):
        relevant = []

    source = next((img for item in relevant for img in images if item.get("image_id") == img.id), images[0])
    evidence_id = finding.evidence_id or f"EVD-{finding.id[-8:].upper()}"
    record = EvidenceRecord(
        id=evidence_id,
        scan_id=finding.scan_id,
        finding_id=finding.id,
        image_id=source.id,
        image_path=source.file_path,
        image_url=source.url,
        image_file_name=source.file_name,
        evidence_type="ORIGINAL_IMAGE_REGION",
        bounding_boxes_json=json.dumps(relevant, ensure_ascii=False),
        supporting_text="\n".join(str(i.get("text", "")).strip() for i in relevant if i.get("text")),
    )
    finding.evidence_id = evidence_id
    db.add(record)
    db.commit()
    return record


@router.get("/scans/{scan_id}/evidence")
def get_scan_evidence(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if scan.officer_id and scan.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    finding = db.query(Finding).filter(Finding.scan_id == scan_id).order_by(Finding.created_at.asc()).first()
    if not finding:
        return {"state": "NO_FINDINGS", "scanId": scan_id, "findingId": None, "message": "No violation evidence is available because no finding was detected for this scan.", "totalFindings": 0}

    return get_finding_evidence(scan_id, finding.id, db, current_user)


@router.get("/scans/{scan_id}/findings/{finding_id}/evidence", response_model=EvidenceResponse)
def get_finding_evidence(scan_id: str, finding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    finding = db.query(Finding).filter(Finding.id == finding_id, Finding.scan_id == scan_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found for this scan")

    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if scan and scan.officer_id and scan.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    analysis = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan_id).first()
    product = db.query(Product).filter(Product.id == scan.product_id).first() if scan and scan.product_id else None
    images = db.query(ScanImage).filter(ScanImage.scan_id == scan_id).order_by(ScanImage.created_at.asc()).all()

    ocr_items = json.loads(analysis.ocr_items_json or "[]") if analysis else []
    evidence_record = _ensure_evidence(db, finding, images, ocr_items)

    try:
        evidence_items = json.loads(evidence_record.bounding_boxes_json or "[]") if evidence_record else []
    except (TypeError, ValueError):
        evidence_items = []

    boxes = _boxes(evidence_items)
    supporting_text = evidence_record.supporting_text if evidence_record else (analysis.raw_ocr if analysis else (finding.raw_ocr or ""))
    image_url = evidence_record.image_url if evidence_record else (images[0].url if images else "")
    image_id = evidence_record.image_id if evidence_record else (images[0].id if images else "")
    all_images = [
        EvidenceImage(
            id=img.id,
            url=img.url,
            viewSlot=img.view_slot or "Package View",
            fileName=img.file_name,
            isPrimary=(img.id == image_id),
        )
        for img in images
    ]

    rule = LEGAL_METROLOGY_RULES.get(finding.rule_code, {"ruleId": finding.rule_code, "ruleName": finding.rule_code, "description": ""})
    return EvidenceResponse(
        scanId=scan_id,
        findingId=finding_id,
        product=EvidenceProduct(name=product.name if product else (scan.product_name if scan else "Unidentified Commodity"), brand=product.brand if product else "Unknown"),
        finding=EvidenceFindingDetail(
            status=finding.status, category=finding.category, affectedField=finding.affected_field,
            extractedValue=finding.extracted_value or "Not detected", expectedValue=finding.expected_value or "Not specified",
            confidence=finding.confidence, riskContribution=finding.risk_level, description=finding.description,
        ),
        evidence=EvidenceBlock(
            primaryImage=image_url,
            images=all_images,
            boundingBoxes=boxes,
            supportingText=[SupportingTextItem(label="Evidence OCR", text=supporting_text or "No supporting OCR text stored.")],
        ),
        ruleReference=EvidenceRuleReference(
            id=rule["ruleId"], title=rule.get("ruleName", rule["ruleId"]),
            source="Legal Metrology (Packaged Commodities) Rules, 2011", referenceText=rule.get("referenceText", "")
        ),
        confidenceMetrics=ConfidenceMetrics(
            ocr=analysis.ocr_confidence if analysis else 0.0,
            extraction=analysis.extraction_confidence if analysis else 0.0,
            finding=finding.confidence,
        ),
        risk=EvidenceRisk(score=int(finding.risk_score or 0), level=finding.risk_level, factors=[finding.description]),
        traceability=TraceabilityBlock(
            scanId=scan_id, findingId=finding_id, evidenceId=evidence_record.id if evidence_record else finding.evidence_id or "",
            sourceImage=image_id,
            analysisTimestamp=analysis.created_at.isoformat() if analysis else datetime.now(timezone.utc).isoformat(),
            analysisVersion=analysis.analysis_version if analysis else "LM-AI-1.0", ruleEngineVersion="PCR-2011-RE.v1"
        )
    )


@router.get("/evidence/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_by_id(evidence_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Resolve a persistent evidence ID to its finding-backed evidence payload."""
    record = db.query(EvidenceRecord).filter(EvidenceRecord.id == evidence_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return get_finding_evidence(record.scan_id, record.finding_id, db, current_user)
