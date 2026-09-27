import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.scan import ScanSession, ScanImage
from ...models.analysis import ScanAnalysis
from ...models.finding import ComplianceCheck, Finding
from ...models.user import User
from ...schemas.analysis import FullAnalysisResponse, AnalysisSummary, ExtractedField, ComplianceCheckItem, PotentialFindingItem, RiskAssessment, AnalysisImage, RuleReference
from ...services.rule_engine import LEGAL_METROLOGY_RULES
from ..deps import get_current_user

router = APIRouter(prefix="/analysis", tags=["Compliance Analysis"])


@router.get("/available")
def get_available_analysis_scans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return recent analyzed products for the direct Compliance Analysis page."""
    rows = (
        db.query(ScanSession, ScanAnalysis)
        .join(ScanAnalysis, ScanAnalysis.scan_id == ScanSession.id)
        .filter((ScanSession.officer_id == current_user.id) | (ScanSession.officer_id.is_(None)))
        .order_by(ScanSession.created_at.desc())
        .all()
    )
    seen_products = set()
    items = []
    for scan, analysis in rows:
        product_key = scan.product_id or scan.product_name or scan.id
        if product_key in seen_products:
            continue
        seen_products.add(product_key)
        findings = db.query(Finding).filter(Finding.scan_id == scan.id).all()
        items.append({
            "scanId": scan.id,
            "productId": scan.product_id,
            "productName": scan.product_name or "Unidentified Commodity",
            "status": scan.compliance_status or scan.status or "PENDING",
            "riskLevel": scan.risk_level or "LOW_RISK",
            "riskScore": int(scan.risk_score or 0),
            "findingCount": len(findings),
            "createdAt": scan.created_at.isoformat() if scan.created_at else None,
        })
    return {"total": len(items), "items": items}


@router.get("/{scan_id}", response_model=FullAnalysisResponse)
def get_full_analysis(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if session.officer_id and session.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")

    analysis = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis has not been completed for this scan")

    fields = json.loads(analysis.extracted_json or "{}")
    db_checks = db.query(ComplianceCheck).filter(ComplianceCheck.scan_id == scan_id).all()
    db_findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    db_images = db.query(ScanImage).filter(ScanImage.scan_id == scan_id).order_by(ScanImage.created_at.asc()).all()

    images = [AnalysisImage(id=img.id, viewName=img.view_slot, url=img.url, isPrimary=(i == 0)) for i, img in enumerate(db_images)]
    extracted = []
    field_map = [
        ("Product Name", "product_name"), ("Brand", "brand"), ("MRP", "mrp"),
        ("Unit Sale Price", "unit_sale_price"), ("Net Quantity", "net_quantity"), ("Manufacturer", "manufacturer"),
        ("Packer", "packer"), ("Importer", "importer"), ("Batch/Lot", "batch_lot"),
        ("Date of Mfg/Packing", "manufacturing_date"), ("Use By / Expiry", "use_by_date"), ("Consumer Care Email", "consumer_email"),
        ("Consumer Care Phone", "consumer_phone"), ("Country of Origin", "country_of_origin"),
        ("QR Manufacturing Unit", "qr_manufacturing_unit"), ("QR Manufacturing Address", "qr_manufacturing_address"),
    ]
    for label, key in field_map:
        extracted.append(ExtractedField(field=label, value=str(fields.get(key) or "Not detected"), confidence=float((fields.get("field_confidence") or {}).get(key, analysis.extraction_confidence) or 0)))

    checks = []
    for c in db_checks:
        rule = LEGAL_METROLOGY_RULES.get(c.rule_code, {
            "ruleId": c.rule_code, "ruleName": c.rule_name, "description": c.description or ""
        })
        checks.append(ComplianceCheckItem(
            id=c.id, name=c.name, expected=c.expected or "", extracted=c.extracted or "Not detected",
            status=c.status, confidence=c.confidence, explanation=c.explanation or "",
            ruleReference=RuleReference(ruleId=rule["ruleId"], ruleName=rule["ruleName"], description=rule.get("description", "")),
            evidenceAvailable=c.evidence_available,
        ))

    findings = [PotentialFindingItem(
        id=f.id, category=f.category, field=f.affected_field, description=f.description,
        confidence=f.confidence, risk=f.risk_level, evidenceId=f.evidence_id or "", status=f.status
    ) for f in db_findings]

    return FullAnalysisResponse(
        scanId=scan_id,
        caseStatus=session.case_status,
        timestamp=analysis.created_at.isoformat() if analysis.created_at else datetime.now(timezone.utc).isoformat(),
        productName=session.product_name or "Unidentified Commodity",
        summary=AnalysisSummary(
            status=session.compliance_status or "PENDING",
            totalChecks=len(checks),
            passedChecks=sum(c.status == "COMPLIANT" for c in checks),
            potentialFindings=len([f for f in findings if f.status == "POTENTIAL_VIOLATION"]),
            needsReview=len([c for c in checks if c.status == "NEEDS_REVIEW"]),
        ),
        images=images,
        extractedData=extracted,
        complianceChecks=checks,
        findings=findings,
        risk=RiskAssessment(
            score=int(session.risk_score or 0), level=session.risk_level or "LOW_RISK",
            factors=[f.description for f in db_findings[:5]] or ["No potential finding detected."],
        ),
    )


@router.get("/{scan_id}/ocr")
def get_ocr_result(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="OCR analysis not found")
    return {"scanId": scan_id, "text": analysis.raw_ocr, "items": json.loads(analysis.ocr_items_json or "[]"), "confidence": analysis.ocr_confidence, "engine": "RapidOCR"}


@router.get("/{scan_id}/compliance")
def get_compliance_result(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    checks = db.query(ComplianceCheck).filter(ComplianceCheck.scan_id == scan_id).all()
    if not checks:
        raise HTTPException(status_code=404, detail="Compliance analysis not found")
    return {"scanId": scan_id, "checks": [
        {"id": c.id, "name": c.name, "status": c.status, "expected": c.expected, "extracted": c.extracted, "confidence": c.confidence, "explanation": c.explanation, "ruleCode": c.rule_code}
        for c in checks
    ]}


@router.get("/{scan_id}/risk")
def get_risk_result(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"scanId": scan_id, "score": scan.risk_score or 0, "level": scan.risk_level or "LOW_RISK", "factors": [f.description for f in db.query(Finding).filter(Finding.scan_id == scan_id).limit(5).all()]}


@router.get("/{scan_id}/history")
def get_analysis_history(scan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"scanId": scan_id, "status": scan.status, "createdAt": scan.created_at.isoformat() if scan.created_at else None}
