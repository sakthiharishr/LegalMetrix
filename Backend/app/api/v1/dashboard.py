from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.scan import ScanSession
from ...models.finding import Finding
from ...models.verification import VerificationRecord
from ...models.product import Product
from ...models.user import User
from ...schemas.dashboard import DashboardSummaryResponse, TrendPoint, RiskDistributionResponse, RiskDistributionTier, ViolationCategory, HighPriorityInspection, RecentInspection, RecurringPattern, RiskScoreDetailsResponse, RiskBreakdownFactor, IntelligenceAlert
from ..deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])


def _since(period):
    days = {"7d": 7, "30d": 30, "90d": 90}[period]
    return datetime.now(timezone.utc) - timedelta(days=days)


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(ScanSession).all()
    total = len(scans)
    compliant = sum(s.compliance_status == "COMPLIANT" for s in scans)
    potential = sum(s.compliance_status == "POTENTIAL_VIOLATION" for s in scans)
    # Dashboard review count is product/case-level: one product with multiple
    # pending findings appears once in the officer queue.
    pending_case_ids = {
        scan_id for (scan_id,) in db.query(Finding.scan_id)
        .filter(Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"]))
        .distinct().all()
    }
    review = len(pending_case_ids)
    high = sum((s.risk_level or "") == "HIGH_RISK" for s in scans)
    rate = f"{(compliant / total * 100):.1f}% compliance rate" if total else "No inspections yet"
    return DashboardSummaryResponse(totalScanned=total, totalScannedTrend="Live database count", compliant=compliant, compliantTrend=rate, potentialViolations=potential, potentialViolationsTrend="AI-detected product cases", needsReview=review, needsReviewTrend="Awaiting officer decision", highRisk=high, highRiskTrend="Priority inspection queue")


@router.get("/compliance-trends", response_model=List[TrendPoint])
def get_compliance_trends(period: str = Query("7d", pattern="^(7d|30d|90d)$"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start = _since(period)
    scans = db.query(ScanSession).filter(ScanSession.created_at >= start).all()
    days = {"7d": 7, "30d": 30, "90d": 90}[period]
    bucket_count = min(days, 30)
    today = datetime.now(timezone.utc).date()
    points = []
    for i in range(bucket_count):
        day = today - timedelta(days=bucket_count - 1 - i)
        items = [s for s in scans if s.created_at.date() == day]
        points.append(TrendPoint(label=day.strftime("%d %b"), compliant=sum(s.compliance_status == "COMPLIANT" for s in items), potentialViolation=sum(s.compliance_status == "POTENTIAL_VIOLATION" for s in items), needsReview=sum(s.compliance_status == "NEEDS_REVIEW" for s in items)))
    return points


@router.get("/risk-distribution", response_model=RiskDistributionResponse)
def get_risk_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(ScanSession).all(); total = len(scans)
    counts = Counter(s.risk_level or "LOW_RISK" for s in scans)
    def tier(key, label):
        count = counts.get(key, 0); return RiskDistributionTier(count=count, percentage=round(count / total * 100) if total else 0, label=label)
    return RiskDistributionResponse(highRisk=tier("HIGH_RISK", "High Risk"), mediumRisk=tier("MEDIUM_RISK", "Medium Risk"), lowRisk=tier("LOW_RISK", "Low Risk"), total=total)


@router.get("/violations", response_model=List[ViolationCategory])
def get_violations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    findings = db.query(Finding).all(); total = len(findings); counter = Counter((f.category, f.rule_code) for f in findings)
    return [ViolationCategory(category=cat, rule=rule, count=count, percentage=round(count / total * 100) if total else 0, severity="HIGH" if any(f.risk_level == "HIGH_RISK" for f in findings if f.category == cat) else "MEDIUM") for (cat, rule), count in counter.most_common()]


@router.get("/high-priority", response_model=List[HighPriorityInspection])
def get_high_priority(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(ScanSession).filter(ScanSession.risk_level == "HIGH_RISK").order_by(ScanSession.risk_score.desc()).limit(20).all()
    output=[]
    for s in scans:
        p=db.query(Product).filter(Product.id==s.product_id).first(); f=db.query(Finding).filter(Finding.scan_id==s.id).order_by(Finding.risk_score.desc()).first()
        output.append(HighPriorityInspection(id=s.id, findingId=f.id if f else None, productName=s.product_name, barcode=(p.barcode or "") if p else "", category=p.category if p else "Unclassified", risk=s.risk_level, finding=f.description if f else "High risk scan", lastScan=s.created_at.isoformat(), status=s.compliance_status, riskScore=s.risk_score or 0))
    return output


@router.get("/recent-inspections", response_model=List[RecentInspection])
def get_recent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans=db.query(ScanSession).order_by(ScanSession.created_at.desc()).limit(20).all(); out=[]
    for s in scans:
        officer=db.query(User).filter(User.id==s.officer_id).first() if s.officer_id else None
        p=db.query(Product).filter(Product.id==s.product_id).first()
        out.append(RecentInspection(id=s.id, productName=s.product_name, barcode=(p.barcode or "") if p else "", timestamp=s.created_at.isoformat(), result=s.compliance_status or s.status, risk=s.risk_level or "LOW_RISK", officer=officer.name if officer else "System", status=s.status))
    return out


@router.get("/recurring-patterns", response_model=List[RecurringPattern])
def get_recurring(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    findings=db.query(Finding).all(); groups={}
    for f in findings: groups.setdefault((f.rule_code,f.affected_field),[]).append(f)
    out=[]
    for (rule,field), vals in groups.items():
        if len(vals)<2: continue
        manufacturers=[]
        for f in vals:
            p=db.query(Product).filter(Product.id==f.product_id).first() if f.product_id else None
            if p and p.manufacturer: manufacturers.append(p.manufacturer)
        out.append(RecurringPattern(id=f"REC-{rule}-{field}", pattern=vals[0].description, occurrences=len(vals), manufacturer=manufacturers[0] if manufacturers else "Multiple/Unknown", affectedProducts=str(len(set(v.product_id for v in vals if v.product_id))), risk=max((v.risk_level for v in vals), default="MEDIUM_RISK"), statusText="ACTIVE_PATTERN", actionRoute="/history", ruleViolated=rule))
    return out


@router.get("/risk-score-details", response_model=RiskScoreDetailsResponse)
def risk_score_details(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan=db.query(ScanSession).order_by(ScanSession.created_at.desc()).first()
    if not scan: return RiskScoreDetailsResponse(score=0,maxScore=100,level="LOW_RISK",inspectedProduct="No inspection",breakdown=[],advisoryNote="No scan has been analyzed yet.")
    findings=db.query(Finding).filter(Finding.scan_id==scan.id).all()
    breakdown=[RiskBreakdownFactor(factor=f.category, score=min(100,int(f.risk_score or 0)), max=100, detail=f.description) for f in findings[:5]]
    return RiskScoreDetailsResponse(score=int(scan.risk_score or 0), maxScore=100, level=scan.risk_level or "LOW_RISK", inspectedProduct=scan.product_name, breakdown=breakdown, advisoryNote="Risk is an AI-assisted prioritization signal; officer verification remains authoritative.")


@router.get("/alerts", response_model=List[IntelligenceAlert])
def alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    out=[]
    high=db.query(ScanSession).filter(ScanSession.risk_level=="HIGH_RISK").count()
    pending = db.query(Finding.scan_id).filter(Finding.status.in_(["POTENTIAL_VIOLATION", "NEEDS_REVIEW"])).distinct().count()
    if high: out.append(IntelligenceAlert(id="ALERT-HIGH",severity="HIGH",message=f"{high} high-risk scan(s) require priority attention.",actionLabel="Open Dashboard",route="/dashboard"))
    if pending: out.append(IntelligenceAlert(id="ALERT-PENDING",severity="MEDIUM",message=f"{pending} product case(s) are awaiting officer verification.",actionLabel="Review Findings",route="/verification"))
    return out
