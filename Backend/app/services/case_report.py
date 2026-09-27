"""Single-case violation report (flow step 9): one PDF per scan with the evidence an officer needs."""
import io
import json
from datetime import datetime, timezone
from typing import List, Optional

import cv2
from sqlalchemy.orm import Session

from ..models.analysis import ScanAnalysis
from ..models.evidence import EvidenceRecord
from ..models.finding import ComplianceCheck, Finding
from ..models.product import Product
from ..models.scan import ScanImage, ScanSession
from ..models.user import User
from ..models.verification import AuditLog, VerificationRecord
from .rule_engine import LEGAL_METROLOGY_RULES

FIELDS = [
    ("Product name", "product_name"), ("Brand", "brand"), ("MRP", "mrp"), ("Unit sale price", "unit_sale_price"),
    ("Net quantity", "net_quantity"), ("Batch / lot", "batch_lot"), ("Mfg / packing date", "manufacturing_date"),
    ("Use by / expiry", "use_by_date"), ("Manufacturer", "manufacturer"), ("Consumer care phone", "consumer_phone"),
    ("Consumer care email", "consumer_email"), ("Country of origin", "country_of_origin"),
]
STATUS_LABEL = {
    "COMPLIANT": "Compliant", "NEEDS_REVIEW": "Needs review", "POTENTIAL_VIOLATION": "Potential violation",
    "CONFIRMED": "Violation confirmed", "INVALIDATED": "Invalidated", "VIOLATION_CONFIRMED": "Violation confirmed",
    "NO_CASE": "No case (compliant)", "READY_TO_FORWARD": "Ready to forward", "FORWARDED": "Forwarded to legal officer",
    "UNDER_REVIEW": "Further review requested",
}


def _t(value) -> str:
    """Report fonts have no rupee glyph; escape markup characters too."""
    text = str(value if value not in (None, "") else "Not detected").replace("₹", "Rs. ")
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _evidence_image(path: str, boxes: List[dict], max_w: float, max_h: float):
    """The source photo with the OCR text used as evidence outlined, as a reportlab Image."""
    from reportlab.platypus import Image
    image = cv2.imread(path)
    if image is None:
        return None
    for box in boxes:
        points = box.get("box") or []
        if len(points) >= 4:
            xs, ys = [int(p[0]) for p in points], [int(p[1]) for p in points]
            cv2.rectangle(image, (min(xs), min(ys)), (max(xs), max(ys)), (0, 0, 230), max(2, image.shape[1] // 300))
    h, w = image.shape[:2]
    scale = min(1.0, 1400 / max(h, w))
    image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale < 1 else image
    ok, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 80])
    if not ok:
        return None
    ratio = min(max_w / image.shape[1], max_h / image.shape[0])
    return Image(io.BytesIO(encoded.tobytes()), width=image.shape[1] * ratio, height=image.shape[0] * ratio)


def build_case_report(db: Session, scan: ScanSession) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    analysis: Optional[ScanAnalysis] = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan.id).first()
    fields = json.loads(analysis.extracted_json or "{}") if analysis else {}
    product = db.query(Product).filter(Product.id == scan.product_id).first() if scan.product_id else None
    images = db.query(ScanImage).filter(ScanImage.scan_id == scan.id).order_by(ScanImage.created_at.asc()).all()
    checks = db.query(ComplianceCheck).filter(ComplianceCheck.scan_id == scan.id).all()
    findings = db.query(Finding).filter(Finding.scan_id == scan.id).order_by(Finding.risk_score.desc()).all()
    reviews = db.query(VerificationRecord).filter(VerificationRecord.scan_id == scan.id).all()
    timeline = db.query(AuditLog).filter(AuditLog.scan_id == scan.id).order_by(AuditLog.timestamp.asc()).all()
    inspector = db.query(User).filter(User.id == scan.officer_id).first() if scan.officer_id else None

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=14 * mm, bottomMargin=14 * mm,
                            title=f"Violation report {scan.id}")
    width = A4[0] - 32 * mm
    styles = getSampleStyleSheet()
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8.5, leading=11)
    cell = ParagraphStyle("cell", parent=styles["Normal"], fontSize=8.5, leading=10.5)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], spaceBefore=10, spaceAfter=6)

    def table(rows, widths, header=True):
        data = [[Paragraph(f"<font color='white'><b>{_t(c)}</b></font>" if header and i == 0 else _t(c), cell) for c in row]
                for i, row in enumerate(rows)]
        style = [("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b8c0cc")), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                 ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]
        if header:
            style.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#172033")))
        t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
        t.setStyle(TableStyle(style))
        return t

    open_or_confirmed = [f for f in findings if f.status in ("POTENTIAL_VIOLATION", "CONFIRMED")]
    title = "Violation Report" if open_or_confirmed else "Inspection Report"
    story = [
        Paragraph("LEGAL METRIX", styles["Title"]),
        Paragraph(f"{title} - Legal Metrology (Packaged Commodities) Rules, 2011", styles["Heading2"]),
        Paragraph(f"Generated {datetime.now(timezone.utc).strftime('%d %b %Y, %H:%M UTC')}", small),
        Spacer(1, 8),
        table([
            ["Case / scan ID", scan.id],
            ["Product", scan.product_name or (product.name if product else "")],
            ["Brand", fields.get("brand") or (product.brand if product else "")],
            ["Inspected on", scan.created_at.strftime("%d %b %Y, %H:%M") if scan.created_at else ""],
            ["Inspector", inspector.name if inspector else ""],
            ["Compliance result", STATUS_LABEL.get(scan.compliance_status or "", scan.compliance_status or "")],
            ["Case status", STATUS_LABEL.get(scan.case_status or "", scan.case_status or "Not forwarded")],
            ["Risk", f"{int(scan.risk_score or 0)} / 100 ({(scan.risk_level or 'LOW_RISK').replace('_', ' ').title()})"],
        ], [45 * mm, width - 45 * mm], header=False),
        Paragraph("Declarations read from the pack", h2),
        table([["Declaration", "Value read"]] + [[label, fields.get(key)] for label, key in FIELDS], [45 * mm, width - 45 * mm]),
        Paragraph("Compliance checks", h2),
        table([["Check", "Rule", "Result", "Found on pack", "Explanation"]] + [
            [c.name, c.rule_name or c.rule_code, STATUS_LABEL.get(c.status, c.status), c.extracted, c.explanation] for c in checks
        ], [34 * mm, 26 * mm, 24 * mm, 32 * mm, width - 116 * mm]),
    ]

    story.append(Paragraph(f"Findings ({len(findings)})", h2))
    if not findings:
        story.append(Paragraph("No findings: every checked declaration was detected and valid.", small))
    for index, finding in enumerate(findings, 1):
        rule = LEGAL_METROLOGY_RULES.get(finding.rule_code, {})
        evidence = db.query(EvidenceRecord).filter(EvidenceRecord.finding_id == finding.id).first()
        boxes = json.loads(evidence.bounding_boxes_json or "[]") if evidence else []
        if evidence:
            boxes = [b for b in boxes if not b.get("image_id") or b.get("image_id") == evidence.image_id]
        block = [
            Paragraph(f"<b>{index}. {_t(finding.description)}</b>", styles["Normal"]),
            Spacer(1, 3),
            table([
                ["Status", STATUS_LABEL.get(finding.status, finding.status)],
                ["Rule", f"{rule.get('ruleName', finding.rule_code)} - {rule.get('description', '')}"],
                ["Declaration", finding.affected_field],
                ["Found on pack", finding.extracted_value],
                ["Expected", finding.expected_value],
                ["Risk", f"{int(finding.risk_score or 0)} / 100 ({(finding.risk_level or '').replace('_', ' ').title()})"],
                ["AI confidence", f"{finding.confidence or 0:.0f}%"],
                ["Evidence", f"{evidence.id} - {evidence.image_file_name}" if evidence else "No evidence image"],
            ], [30 * mm, width - 30 * mm], header=False),
        ]
        if evidence:
            picture = _evidence_image(evidence.image_path, boxes, width * 0.8, 100 * mm)
            if picture:
                block += [Spacer(1, 4), picture, Paragraph("Red outlines mark the text used as evidence.", small)]
        story += [KeepTogether(block), Spacer(1, 10)]

    story.append(Paragraph("Officer decision", h2))
    if reviews:
        story.append(table([["Decision", "Remarks", "Reviewed by", "Reviewed on"]] + [
            [r.decision.replace("_", " ").title() if r.decision else r.status, r.remarks, r.reviewed_by,
             r.reviewed_at.strftime("%d %b %Y, %H:%M") if r.reviewed_at else ""] for r in reviews
        ], [38 * mm, width - 108 * mm, 34 * mm, 36 * mm]))
    else:
        story.append(Paragraph("No officer decision has been recorded yet.", small))

    if timeline:
        story.append(Paragraph("Case timeline", h2))
        story.append(table([["When", "Who", "Action"]] + [
            [log.timestamp.strftime("%d %b %Y, %H:%M") if log.timestamp else "", log.actor, log.action] for log in timeline
        ], [36 * mm, 30 * mm, width - 66 * mm]))

    story.append(Paragraph("Package photos", h2))
    photos = [p for p in (_evidence_image(img.file_path, [], width / 2 - 4 * mm, 60 * mm) for img in images) if p]
    if photos:
        rows = [photos[i:i + 2] + [""] * (2 - len(photos[i:i + 2])) for i in range(0, len(photos), 2)]
        story.append(Table(rows, colWidths=[width / 2, width / 2]))
    story += [Spacer(1, 10), Paragraph(
        "AI-assisted analysis. Findings are potential issues for officer verification; the officer's decision is authoritative.", small)]

    doc.build(story)
    return buffer.getvalue()
