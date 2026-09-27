from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...core.database import get_db
from ...models.product import Product
from ...models.scan import ScanSession, ScanImage
from ...models.finding import Finding
from ...models.verification import VerificationRecord
from ...models.user import User
from ...schemas.product import HistorySummaryResponse, ProductSearchResponse, ProductSearchItem, ProductDetailResponse, ProductIdentity, ProductSummaryStats, ProductTrendPoint
from ..deps import get_current_user

router = APIRouter(prefix="/products", tags=["Product Compliance History"])


@router.get("/history/summary", response_model=HistorySummaryResponse)
def get_history_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_products = db.query(Product).count()
    total_inspections = db.query(ScanSession).count()
    potential_findings = db.query(Finding).filter(Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"])).count()
    reviewed_findings = db.query(VerificationRecord).filter(VerificationRecord.status == "COMPLETED").count()
    return HistorySummaryResponse(totalProducts=total_products, totalInspections=total_inspections, potentialFindings=potential_findings, reviewedFindings=reviewed_findings)


@router.get("/search", response_model=ProductSearchResponse)
def search_products(search: Optional[str] = Query(None), status: Optional[str] = Query(None), riskLevel: Optional[str] = Query(None), page: int = Query(1, ge=1), pageSize: int = Query(10, ge=1, le=100), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Product)
    if search:
        s = f"%{search}%"
        query = query.filter((Product.name.ilike(s)) | (Product.brand.ilike(s)) | (Product.barcode.ilike(s)) | (Product.id.ilike(s)))
    if status and status != "ALL":
        query = query.filter(Product.current_status == status)
    if riskLevel and riskLevel != "ALL":
        query = query.filter(Product.risk_level == riskLevel)

    total = query.count()
    products = query.order_by(Product.last_inspection.desc()).offset((page - 1) * pageSize).limit(pageSize).all()
    items = []
    for p in products:
        scans = db.query(ScanSession).filter(ScanSession.product_id == p.id).all()
        findings = db.query(Finding).filter(Finding.product_id == p.id, Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"])).count()
        last_decision = "N/A"
        finding_ids = [f.id for f in db.query(Finding).filter(Finding.product_id == p.id).all()]
        if finding_ids:
            vr = db.query(VerificationRecord).filter(VerificationRecord.finding_id.in_(finding_ids)).order_by(VerificationRecord.reviewed_at.desc()).first()
            if vr:
                last_decision = vr.decision or "PENDING_REVIEW"
        items.append(ProductSearchItem(productId=p.id, name=p.name, brand=p.brand, lastInspection=p.last_inspection.isoformat() if p.last_inspection else "", inspectionCount=len(scans), currentStatus=p.current_status, riskLevel=p.risk_level, openFindings=findings, lastOfficerDecision=last_decision))
    return ProductSearchResponse(products=items, total=total, page=page, pageSize=pageSize)


@router.get("/{product_id}/history", response_model=ProductDetailResponse)
def get_product_history(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    scans = db.query(ScanSession).filter(ScanSession.product_id == product_id).order_by(ScanSession.created_at.asc()).all()
    finding_count = db.query(Finding).filter(Finding.product_id == product_id).count()
    confirmed = db.query(Finding).filter(Finding.product_id == product_id, Finding.status == "CONFIRMED").count()
    invalidated = db.query(Finding).filter(Finding.product_id == product_id, Finding.status == "INVALIDATED").count()
    further = db.query(Finding).filter(Finding.product_id == product_id, Finding.status.in_(["NEEDS_REVIEW", "POTENTIAL_VIOLATION"])).count()
    compliant = sum(1 for s in scans if s.compliance_status == "COMPLIANT")
    return ProductDetailResponse(
        productId=product_id,
        identity=ProductIdentity(name=p.name, brand=p.brand, manufacturer=p.manufacturer, packer=p.packer, importer=p.importer, batchLot=p.batch_lot, countryOfOrigin=p.country_of_origin),
        currentStatus=p.current_status,
        summary=ProductSummaryStats(totalInspections=len(scans), compliantInspections=compliant, potentialFindings=finding_count, officerConfirmations=confirmed, officerInvalidations=invalidated, needsFurtherReview=further),
        trend=[ProductTrendPoint(inspectionId=s.id, status=s.compliance_status or s.status, date=s.created_at.isoformat()) for s in scans],
    )


@router.get("/{product_id}/inspections")
def get_product_inspections(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(ScanSession).filter(ScanSession.product_id == product_id).order_by(ScanSession.created_at.desc()).all()
    return [{"id": s.id, "date": s.created_at.isoformat(), "status": s.compliance_status or s.status, "findingCount": db.query(Finding).filter(Finding.scan_id == s.id).count(), "riskLevel": s.risk_level} for s in scans]


@router.get("/{product_id}/findings")
def get_product_findings(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Older inspections may have a missing Finding.product_id even though
    # their ScanSession is correctly linked to the product. Include those
    # findings so historical officer review is not lost.
    scan_rows = db.query(ScanSession.id).filter(ScanSession.product_id == product_id).all()
    scan_ids = [row[0] for row in scan_rows]

    query = db.query(Finding).filter(Finding.product_id == product_id)
    if scan_ids:
        query = db.query(Finding).filter(
            (Finding.product_id == product_id)
            | ((Finding.product_id.is_(None)) & Finding.scan_id.in_(scan_ids))
        )

    findings = query.order_by(Finding.created_at.desc()).all()
    output = []
    for f in findings:
        vr = db.query(VerificationRecord).filter(VerificationRecord.finding_id == f.id).first()
        output.append({
            "id": f.id,
            "scanId": f.scan_id,
            "date": f.created_at.isoformat(),
            "category": f.category,
            "affectedField": f.affected_field,
            "confidence": f.confidence,
            "riskLevel": f.risk_level,
            "status": f.status,
            "officerDecision": (vr.decision if vr and vr.decision else ("PENDING_REVIEW" if f.status in ("POTENTIAL_VIOLATION", "NEEDS_REVIEW") else f.status)),
            "hasEvidence": bool(f.evidence_id),
        })
    return output


@router.get("/{product_id}/recurring-issues")
def get_product_recurring_issues(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    findings = db.query(Finding).filter(Finding.product_id == product_id).all()
    grouped = {}
    for f in findings:
        key = f"{f.rule_code}:{f.affected_field}"
        grouped.setdefault(key, []).append(f)
    return [{"id": key, "pattern": values[0].description, "occurrences": len(values), "lastDetected": max(v.created_at for v in values).isoformat(), "status": "ACTIVE_PATTERN" if any(v.status in ("POTENTIAL_VIOLATION", "CONFIRMED") for v in values) else "RESOLVED"} for key, values in grouped.items()]


@router.get("/{product_id}/evidence")
def get_product_evidence(product_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    findings = db.query(Finding).filter(Finding.product_id == product_id, Finding.evidence_id.isnot(None)).order_by(Finding.created_at.desc()).all()
    images = {}
    for f in findings:
        image = db.query(ScanImage).filter_by(scan_id=f.scan_id).first()
        images[f.id] = image.url if image else ""
    return [{"id": f.evidence_id, "scanId": f.scan_id, "findingId": f.id, "thumbnailUrl": images.get(f.id, ""), "date": f.created_at.isoformat(), "category": f.category, "status": f.status} for f in findings]
