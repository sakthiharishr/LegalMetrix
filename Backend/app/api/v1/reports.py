import csv
import re
import io
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import HTMLResponse, StreamingResponse, Response
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.scan import ScanSession
from ...models.finding import Finding
from ...models.verification import VerificationRecord
from ...models.user import User
from ...schemas.report import (
    ReportAnalyticsResponse, ReportingPeriod, ReportSummary, ActivityPoint,
    ComplianceTrendPoint, FindingCategoryStat, RiskDistributionStat,
    ReportRecurringIssue, OfficerReviewOutcome
)
from ..deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


def _period(days: int):
    end = datetime.now(timezone.utc)
    return end - timedelta(days=days), end


def _range_days(value) -> int:
    """'7d' / '30d' / '90d' / '1y' / '12m' -> days (1..365); anything unreadable -> 30."""
    text = str(value or "").strip().lower()
    match = re.fullmatch(r"(\d+)\s*([dwmy]?)", text)
    if not match:
        return 30
    number, unit = int(match.group(1)), match.group(2) or "d"
    return max(1, min(365, number * {"d": 1, "w": 7, "m": 30, "y": 365}[unit]))


def _buckets(first_day, last_day, days: int):
    """(granularity, [(first, last, label)]) covering first_day..last_day."""
    if days <= 31:
        return "day", [(d, d, d.strftime("%d %b")) for d in (last_day - timedelta(days=days - 1 - i) for i in range(days))]
    if days <= 120:
        out, cursor = [], last_day
        while cursor >= first_day:
            begin = max(first_day, cursor - timedelta(days=6))
            out.append((begin, cursor, begin.strftime("%d %b")))
            cursor = begin - timedelta(days=1)
        return "week", out[::-1]
    out, year, month = [], last_day.year, last_day.month
    while (year, month) >= (first_day.year, first_day.month):
        begin = max(first_day, first_day.replace(year=year, month=month, day=1))
        nxt = (year + (month == 12), month % 12 + 1)
        end_of_month = first_day.replace(year=nxt[0], month=nxt[1], day=1) - timedelta(days=1)
        out.append((begin, min(end_of_month, last_day), begin.strftime("%b %Y")))
        year, month = (year - 1, 12) if month == 1 else (year, month - 1)
    return "month", out[::-1]


def _get_report_data(days: int, db: Session):
    start, end = _period(days)
    scans = db.query(ScanSession).filter(ScanSession.created_at >= start).all()
    findings = db.query(Finding).filter(Finding.created_at >= start).all()
    reviews = db.query(VerificationRecord).filter(VerificationRecord.created_at >= start).all()
    products = {s.product_id for s in scans if s.product_id}

    summary = ReportSummary(
        totalInspections=len(scans),
        productsInspected=len(products),
        potentialFindings=sum(f.status in ("POTENTIAL_VIOLATION", "NEEDS_REVIEW") for f in findings),
        officerReviews=len(reviews),
        confirmedFindings=sum(str(f.status) == "CONFIRMED" for f in findings),
        invalidatedFindings=sum(str(f.status) == "INVALIDATED" for f in findings),
        needsFurtherReview=sum(str(f.status) == "NEEDS_REVIEW" for f in findings),
    )

    # One bar per day for a week or month, per week for a quarter, per month for a year,
    # so every chart covers the whole selected period with a readable number of bars.
    activity = []
    trend = []
    granularity, buckets = _buckets(start.date(), end.date(), days)
    for first, last, label in buckets:
        items = [s for s in scans if s.created_at and first <= s.created_at.date() <= last]
        activity.append(ActivityPoint(date=first.isoformat(), label=label, count=len(items)))
        trend.append(ComplianceTrendPoint(
            date=first.isoformat(), label=label,
            compliant=sum(str(s.compliance_status) == "COMPLIANT" for s in items),
            potentialFindings=sum(str(s.compliance_status) in ("POTENTIAL_VIOLATION", "VIOLATION_CONFIRMED") for s in items),
            needsReview=sum(str(s.compliance_status) == "NEEDS_REVIEW" for s in items),
        ))

    cat = Counter(f.category for f in findings)
    total = max(1, len(findings))
    categories = [
        FindingCategoryStat(category=str(k), count=v, percentage=round(v / total * 100))
        for k, v in cat.most_common()
    ]
    risk = Counter(s.risk_level or "LOW_RISK" for s in scans)
    risk_dist = [RiskDistributionStat(level=str(k), count=v) for k, v in risk.items()]

    groups = {}
    for f in findings:
        groups.setdefault((f.rule_code, f.affected_field), []).append(f)
    recurring = []
    for (rule, field), vals in groups.items():
        if len(vals) >= 2:
            recurring.append(ReportRecurringIssue(
                id=f"REC-{rule}-{field}",
                pattern=str(vals[0].description),
                occurrences=len(vals),
                affectedProducts=len({v.product_id or v.scan_id for v in vals}),
                lastDetected=max(v.created_at for v in vals).isoformat(),
            ))

    outcomes = Counter(r.decision or "PENDING_REVIEW" for r in reviews)
    analytics = ReportAnalyticsResponse(
        reportingPeriod=ReportingPeriod(start=start.isoformat(), end=end.isoformat()),
        granularity=granularity,
        summary=summary,
        inspectionActivity=activity,
        complianceTrend=trend,
        findingCategories=categories,
        riskDistribution=risk_dist,
        recurringIssues=recurring,
        officerReviewOutcomes=[OfficerReviewOutcome(outcome=str(k), count=v) for k, v in outcomes.items()],
    )
    return start, end, scans, findings, reviews, analytics


@router.get("/analytics", response_model=ReportAnalyticsResponse)
def get_report_analytics(
    days: int = Query(30, ge=1, le=365),
    range: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if range:
        days = _range_days(range)
    return _get_report_data(days, db)[-1]


def _csv_response(scans, findings, reviews):
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow([
        "scan_id", "inspection_date", "product_name", "compliance_status",
        "risk_level", "risk_score", "finding_id", "finding_category",
        "affected_field", "finding_status", "officer_decision", "reviewed_by",
        "reviewed_at", "remarks"
    ])
    review_map = {r.finding_id: r for r in reviews}
    if not scans:
        writer.writerow([])
    for scan in scans:
        scan_findings = [f for f in findings if f.scan_id == scan.id]
        if not scan_findings:
            writer.writerow([
                scan.id, scan.created_at.isoformat(), scan.product_name or "",
                scan.compliance_status or scan.status or "", scan.risk_level or "",
                scan.risk_score or 0, "", "", "", "", "", "", "", ""
            ])
            continue
        for finding in scan_findings:
            review = review_map.get(finding.id)
            writer.writerow([
                scan.id, scan.created_at.isoformat(), scan.product_name or "",
                scan.compliance_status or scan.status or "", scan.risk_level or "",
                scan.risk_score or 0, finding.id, finding.category or "",
                finding.affected_field or "", finding.status or "",
                review.decision if review else "PENDING_REVIEW",
                review.reviewed_by if review else "",
                review.reviewed_at.isoformat() if review and review.reviewed_at else "",
                review.remarks if review else "",
            ])
    data = output.getvalue().encode("utf-8-sig")
    return Response(
        content=data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=legalmetrix_enforcement_dataset.csv"},
    )


@router.post("/export/csv")
def export_csv(
    payload: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    days = _range_days((payload or {}).get("range"))
    _, _, scans, findings, reviews, _ = _get_report_data(max(1, min(days, 365)), db)
    return _csv_response(scans, findings, reviews)


@router.post("/export/pdf")
def export_pdf(
    payload: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    days = _range_days((payload or {}).get("range"))
    start, end, scans, findings, reviews, analytics = _get_report_data(max(1, min(days, 365)), db)

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("LMTitle", parent=styles["Title"], alignment=TA_CENTER, spaceAfter=12)
    story = [
        Paragraph("LEGAL METRIX", title),
        Paragraph("Legal Metrology Compliance & Enforcement Report", styles["Heading2"]),
        Paragraph(f"Reporting period: {start.date()} to {end.date()}", styles["Normal"]),
        Spacer(1, 14),
    ]

    summary_rows = [
        ["Metric", "Value"],
        ["Total Inspections", analytics.summary.totalInspections],
        ["Products Inspected", analytics.summary.productsInspected],
        ["Potential / Review Findings", analytics.summary.potentialFindings],
        ["Officer Reviews", analytics.summary.officerReviews],
        ["Confirmed Findings", analytics.summary.confirmedFindings],
        ["Invalidated Findings", analytics.summary.invalidatedFindings],
        ["Needs Further Review", analytics.summary.needsFurtherReview],
    ]
    table = Table(summary_rows, colWidths=[280, 180])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#172033")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [table, Spacer(1, 18), Paragraph("Finding Summary", styles["Heading2"])]

    finding_rows = [["Finding", "Field", "Status", "Risk"]]
    for f in findings[:50]:
        finding_rows.append([
            str(f.category or "")[:45], str(f.affected_field or "")[:35],
            str(f.status or ""), str(f.risk_level or ""),
        ])
    if len(finding_rows) == 1:
        finding_rows.append(["No findings", "", "", ""])
    ft = Table(finding_rows, colWidths=[155, 130, 110, 80], repeatRows=1)
    ft.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#172033")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
    ]))
    story += [ft, Spacer(1, 18)]

    story.append(Paragraph("Scanned Products / Inspections", styles["Heading2"]))
    scan_rows = [["Scan ID", "Product", "Date", "Status", "Risk"]]
    for scan in scans[:100]:
        scan_rows.append([
            str(scan.id),
            str(scan.product_name or "Unidentified Commodity")[:40],
            scan.created_at.strftime("%Y-%m-%d") if scan.created_at else "",
            str(scan.compliance_status or scan.status or "")[:22],
            str(scan.risk_level or "")[:15],
        ])
    if len(scan_rows) == 1:
        scan_rows.append(["No inspections", "", "", "", ""])
    st = Table(scan_rows, colWidths=[105, 175, 75, 100, 70], repeatRows=1)
    st.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#172033")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
    ]))
    story += [st, Spacer(1, 18), Paragraph("Officer review records are included in the inspection dataset and audit trail.", styles["Normal"])]
    doc.build(story)  # type: ignore
    buffer.seek(0)
    return StreamingResponse(
        buffer, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=legalmetrix_compliance_report.pdf"},
    )


@router.get("/scans/{scan_id}/pdf")
def export_case_report(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Flow step 9: the violation report for one case, with evidence, for the legal officer."""
    from fastapi import HTTPException
    from ...services.case_report import build_case_report

    scan = db.query(ScanSession).filter(ScanSession.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan session not found")
    if scan.officer_id and scan.officer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This scan does not belong to the current officer")
    if scan.status != "COMPLETE":
        raise HTTPException(status_code=400, detail="Run the analysis before generating the report.")
    return Response(
        content=build_case_report(db, scan), media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=LegalMetrix_{scan_id}_report.pdf"},
    )


@router.get("/digest", response_class=HTMLResponse)
def ministry_digest(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start, end, scans, findings, reviews, analytics = _get_report_data(days, db)
    rows = "".join(
        f"<tr><td>{f.category}</td><td>{f.affected_field}</td><td>{f.status}</td><td>{f.risk_level}</td></tr>"
        for f in findings[:100]
    ) or "<tr><td colspan='4'>No findings recorded.</td></tr>"
    html = f"""<!doctype html><html><head><meta charset='utf-8'><title>Legal Metrix Ministry Digest</title>
    <style>body{{font-family:Arial,sans-serif;margin:40px;color:#172033}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #bbb;padding:8px;text-align:left}}th{{background:#172033;color:white}}.cards{{display:flex;gap:20px;margin:20px 0}}.card{{border:1px solid #ddd;padding:15px;min-width:150px}}</style></head>
    <body><h1>LEGAL METRIX</h1><h2>Enforcement Ministry Digest</h2>
    <p>Reporting period: {start.date()} to {end.date()}</p>
    <div class='cards'><div class='card'><b>Inspections</b><br>{analytics.summary.totalInspections}</div>
    <div class='card'><b>Potential Findings</b><br>{analytics.summary.potentialFindings}</div>
    <div class='card'><b>Officer Reviews</b><br>{analytics.summary.officerReviews}</div>
    <div class='card'><b>Confirmed</b><br>{analytics.summary.confirmedFindings}</div></div>
    <h3>Finding Summary</h3><table><tr><th>Category</th><th>Affected Field</th><th>Status</th><th>Risk</th></tr>{rows}</table></body></html>"""
    return HTMLResponse(content=html)
