from datetime import datetime, timezone
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.verification import VerificationRecord, AuditLog
from ...models.finding import Finding
from ...models.scan import ScanSession, ScanImage
from ...models.analysis import ScanAnalysis
from ...models.product import Product
from ...models.evidence import EvidenceRecord
from ...models.user import User
from ...schemas.verification import VerificationResponse, SubmitVerificationRequest, TimelineEvent, VerificationFindingDetail, VerificationEvidence, VerificationRuleReference
from ...schemas.evidence import BoundingBox, EvidenceProduct, EvidenceImage
from ...services.rule_engine import LEGAL_METROLOGY_RULES
from ...services.learning_service import record_verified_feedback
from ..deps import get_current_user

router = APIRouter(tags=["Officer Verification"])


@router.get("/pending")
def get_pending_verifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return one queue item per product/scan, not one item per finding.

    A product may have several AI findings. The officer should see one case for
    that product and review all of its pending violations together.
    """
    findings = (
        db.query(Finding)
        .join(ScanSession, Finding.scan_id == ScanSession.id)
        .filter(
            Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]),
            (ScanSession.officer_id == current_user.id) | (ScanSession.officer_id.is_(None)),
            # Flow step 10 -> 11: only cases forwarded to the officer (older scans have no case status).
            (ScanSession.case_status.in_(["FORWARDED", "UNDER_REVIEW"])) | (ScanSession.case_status.is_(None)),
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
                "productName": product.name if product else (scan.product_name or "Unidentified Commodity"),
                "brand": product.brand if product else "Unknown",
                "riskLevel": finding.risk_level or "MEDIUM_RISK",
                "riskScore": finding.risk_score or 0,
                "createdAt": finding.created_at.isoformat() if finding.created_at else scan.created_at.isoformat(),
                "violations": [],
            }
        item = grouped[key]
        item["violations"].append({
            "findingId": finding.id,
            "affectedField": finding.affected_field,
            "description": finding.description,
            "status": finding.status,
            "riskLevel": finding.risk_level or "MEDIUM_RISK",
            "riskScore": finding.risk_score or 0,
        })
        if (finding.risk_score or 0) > item["riskScore"]:
            item["riskScore"] = finding.risk_score or 0
            item["riskLevel"] = finding.risk_level or item["riskLevel"]

    items = list(grouped.values())
    return {"total": len(items), "items": items}


def _pending_finding(scan_id, db):
    """Return the first finding that still needs officer attention."""
    return (
        db.query(Finding)
        .filter(
            Finding.scan_id == scan_id,
            Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]),
        )
        .order_by(Finding.created_at.asc())
        .first()
    )


def _workspace(scan_id, finding_id, db, current_user):
    finding = db.query(Finding).filter(Finding.id == finding_id, Finding.scan_id == scan_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    product = db.query(Product).filter(Product.id == scan.product_id).first() if scan and scan.product_id else None
    evidence_record = db.query(EvidenceRecord).filter(EvidenceRecord.finding_id == finding_id).first()
    image = db.query(ScanImage).filter(ScanImage.id == evidence_record.image_id).first() if evidence_record else db.query(ScanImage).filter(ScanImage.scan_id == scan_id).order_by(ScanImage.created_at.asc()).first()
    analysis = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan_id).first()
    vr = db.query(VerificationRecord).filter(VerificationRecord.scan_id == scan_id, VerificationRecord.finding_id == finding_id).first()
    audit_logs = db.query(AuditLog).filter(AuditLog.scan_id == scan_id).order_by(AuditLog.timestamp.asc()).all()
    timeline = [TimelineEvent(timestamp=log.timestamp.isoformat(), actor=log.actor, action=log.action, status=log.status) for log in audit_logs]

    boxes = []
    evidence_items = []
    if evidence_record:
        try:
            evidence_items = json.loads(evidence_record.bounding_boxes_json or "[]")
        except (TypeError, ValueError):
            evidence_items = []
    elif analysis:
        evidence_items = json.loads(analysis.ocr_items_json or "[]")
    for item in evidence_items:
            points = item.get("box") or []
            if len(points) >= 4:
                xs = [float(p[0]) for p in points]; ys = [float(p[1]) for p in points]
                boxes.append(BoundingBox(id=item.get("id", "OCR"), x=min(xs), y=min(ys), width=max(xs)-min(xs), height=max(ys)-min(ys), label=item.get("text", "OCR text"), type="ocr"))

    rule = LEGAL_METROLOGY_RULES.get(finding.rule_code, {"ruleId": finding.rule_code, "ruleName": finding.rule_code, "referenceText": ""})
    pending_findings = (
        db.query(Finding)
        .filter(Finding.scan_id == scan_id, Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]))
        .order_by(Finding.created_at.asc())
        .all()
    )
    all_finding_details = []
    for pf in pending_findings:
        all_finding_details.append(VerificationFindingDetail(
            status=pf.status, category=pf.category, affectedField=pf.affected_field,
            extractedValue=pf.extracted_value or "Not detected", expectedValue=pf.expected_value or "Not specified",
            confidence=pf.confidence, riskScore=pf.risk_score or 0, riskLevel=pf.risk_level,
            riskFactors=[pf.description], description=pf.description,
        ))
    all_images = [
        EvidenceImage(
            id=img.id, url=img.url, viewSlot=img.view_slot or "Package View",
            fileName=img.file_name, isPrimary=(img.id == (evidence_record.image_id if evidence_record else (image.id if image else "")))
        )
        for img in db.query(ScanImage).filter(ScanImage.scan_id == scan_id).order_by(ScanImage.created_at.asc()).all()
    ]

    return VerificationResponse(
        scanId=scan_id, findingId=finding_id,
        status=vr.status if vr else "PENDING_OFFICER_REVIEW",
        decision=vr.decision if vr else None, remarks=vr.remarks if vr else None,
        reviewedAt=vr.reviewed_at.isoformat() if vr and vr.reviewed_at else None,
        reviewedBy=vr.reviewed_by if vr else None,
        product=EvidenceProduct(name=product.name if product else (scan.product_name if scan else "Unidentified Commodity"), brand=product.brand if product else "Unknown"),
        finding=VerificationFindingDetail(
            status=finding.status, category=finding.category, affectedField=finding.affected_field,
            extractedValue=finding.extracted_value or "Not detected", expectedValue=finding.expected_value or "Not specified",
            confidence=finding.confidence, riskScore=finding.risk_score or 0, riskLevel=finding.risk_level,
            riskFactors=[finding.description], description=finding.description,
        ),
        findings=all_finding_details,
        evidence=VerificationEvidence(primaryImage=(evidence_record.image_url if evidence_record else (image.url if image else "")), images=all_images, boundingBoxes=boxes),
        ruleReference=VerificationRuleReference(id=rule["ruleId"], title=rule.get("ruleName", rule["ruleId"]), source="Legal Metrology (Packaged Commodities) Rules, 2011", referenceText=rule.get("referenceText", "")),
        timeline=timeline,
    )


@router.get("/scans/{scan_id}/verification")
def get_scan_verification_workspace(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Resolve a specific scan, or the newest pending scan when the UI opens /verification without IDs."""
    if scan_id == "latest":
        scan = (
            db.query(ScanSession)
            .join(Finding, Finding.scan_id == ScanSession.id)
            .filter(Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]),
                    ScanSession.case_status.in_(["FORWARDED", "UNDER_REVIEW"]) | ScanSession.case_status.is_(None))
            .order_by(ScanSession.created_at.desc(), Finding.created_at.asc())
            .first()
        )
        if not scan:
            return {
                "state": "NO_FINDINGS",
                "scanId": None,
                "findingId": None,
                "message": "No findings are currently awaiting officer verification.",
                "totalFindings": 0,
            }
        scan_id = str(scan.id)
    else:
        scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan session not found")
    if scan.officer_id and scan.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    finding = _pending_finding(scan_id, db)
    if not finding:
        total = db.query(Finding).filter(Finding.scan_id == scan_id).count()
        return {
            "state": "NO_FINDINGS",
            "scanId": scan_id,
            "findingId": None,
            "message": (
                "No findings require officer verification."
                if total == 0
                else "All findings for this scan have already been reviewed."
            ),
            "totalFindings": total,
        }

    return _workspace(scan_id, finding.id, db, current_user)


@router.get("/scans/{scan_id}/findings/{finding_id}/verification", response_model=VerificationResponse)
def get_verification_workspace(scan_id: str, finding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _workspace(scan_id, finding_id, db, current_user)


@router.post("/scans/{scan_id}/findings/{finding_id}/verification", response_model=VerificationResponse)
def submit_verification(scan_id: str, finding_id: str, payload: SubmitVerificationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.decision not in {"CONFIRM_FINDING", "INVALIDATE_FINDING", "NEEDS_FURTHER_REVIEW"}:
        raise HTTPException(status_code=400, detail="Unsupported verification decision")

    finding = db.query(Finding).filter(Finding.id == finding_id, Finding.scan_id == scan_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    # A product-level officer decision must be based on the complete uploaded package evidence.
    # The frontend requires explicit review of every uploaded image; this server-side check also
    # prevents a decision when the scan has no source images at all.
    image_count = db.query(ScanImage).filter(ScanImage.scan_id == scan_id).count()
    if image_count == 0:
        raise HTTPException(status_code=400, detail="Cannot submit officer decision: no package images are available for this scan.")

    now = datetime.now(timezone.utc)
    vr = db.query(VerificationRecord).filter(VerificationRecord.scan_id == scan_id, VerificationRecord.finding_id == finding_id).first()
    if not vr:
        vr = VerificationRecord(id=f"VR-{uuid.uuid4().hex[:8].upper()}", scan_id=scan_id, finding_id=finding_id)
        db.add(vr)

    vr.status = "COMPLETED"  # type: ignore
    vr.decision = payload.decision  # type: ignore
    vr.remarks = payload.remarks  # type: ignore
    vr.reviewed_at = now  # type: ignore
    vr.reviewed_by = current_user.name  # type: ignore

    # Store optional officer corrections as supervised learning examples.
    # This is offline feedback collection, not uncontrolled live fine-tuning.
    record_verified_feedback(
        scan_id=scan_id,
        finding_id=finding_id,
        field_corrections=payload.fieldCorrections,
        officer=current_user.name,
        decision=payload.decision,
        remarks=payload.remarks or "",
    )

    # One officer decision applies to the product-level case and therefore all
    # pending AI findings belonging to this scan.
    pending_findings = (
        db.query(Finding)
        .filter(Finding.scan_id == scan_id, Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]))
        .all()
    )
    target_findings = pending_findings or [finding]
    for target in target_findings:
        if payload.decision == "CONFIRM_FINDING":
            target.status = "CONFIRMED"  # type: ignore
        elif payload.decision == "INVALIDATE_FINDING":
            target.status = "INVALIDATED"  # type: ignore
        else:
            target.status = "NEEDS_REVIEW"  # type: ignore
        db.add(AuditLog(id=f"LOG-{uuid.uuid4().hex[:8].upper()}", scan_id=scan_id, finding_id=target.id, actor="OFFICER", action=f"Product Review Submitted: {payload.decision}", status="COMPLETED", timestamp=now))

    # Flow steps 12A/12B -> 13: the officer's decision becomes the case outcome and the product's status.
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if scan:
        outcome = {"CONFIRM_FINDING": ("CONFIRMED", "VIOLATION_CONFIRMED"),
                   "INVALIDATE_FINDING": ("INVALIDATED", "COMPLIANT")}.get(payload.decision, ("UNDER_REVIEW", "NEEDS_REVIEW"))
        scan.case_status, scan.compliance_status = outcome
        product = db.query(Product).filter(Product.id == scan.product_id).first() if scan.product_id else None
        if product:
            product.current_status = outcome[1]
            product.risk_level = "LOW_RISK" if outcome[0] == "INVALIDATED" else scan.risk_level
    db.commit()
    return _workspace(scan_id, finding_id, db, current_user)
