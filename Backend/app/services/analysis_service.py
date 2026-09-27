import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from ..models.analysis import ScanAnalysis
from ..models.finding import ComplianceCheck, Finding
from ..models.product import Product
from ..models.scan import ScanSession, ScanImage
from .extraction_service import extract_fields
from .ocr_service import run_ocr
from .qr_service import extract_manufacturing_details, scan_qr
from .rule_engine import analyze_packaging_compliance
from .evidence_service import create_evidence_for_finding
from ..models.evidence import EvidenceRecord


def _field_items(field: str, ocr_items: List[Dict[str, Any]], fields: Dict[str, Any]) -> List[Dict[str, Any]]:
    terms = {
        "MRP": r"MRP|RETAIL",
        "Net Quantity": r"NET\s*(?:QUANTITY|WT|WEIGHT)|\d+(?:\.\d+)?\s*(?:ML|L|LTR|G|KG|MG)",
        "Manufacture / Packing Date": r"MFG|MFD|MANUFACT|DATE|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}",
        "Batch/Lot": r"BATCH|LOT",
        "Manufacturer / Packer / Importer": r"MANUFACT|PARLE\s+AGRO|PVT|LTD|INDUSTR|FOODS|BEVERAGES|PACKER|IMPORTER",
        "Commodity Name": r"DRINK|JUICE|BISCUIT|FOOD|WATER|MILK|SNACK",
        "Consumer Care": r"CONSUMER|CUSTOMER|HELPLINE|CALL\s+US|@",
        "Country of Origin": r"COUNTRY\s+OF\s+ORIGIN|MADE\s+IN|ORIGIN",
        # Expiry is often "best before N months from mfg", so the manufacture date is part of the evidence.
        "Use By / Expiry": r"BEST\s*BEFORE|USE\s*BY|EXPIR|MFG\.?\s*DATE|\bMFD\b|\bPKD\b",
        "Unit Sale Price": r"U\.?S\.?P|UNIT\s*SALE|\bPER\s*(?:ML|G|KG|L)\b|/\s*(?:ML|G|KG|L)\b",
    }
    pattern = terms.get(field)
    if not pattern:
        return []
    matches = [item for item in ocr_items if re_search(pattern, str(item.get("text", "")))]
    key = {"Manufacture / Packing Date": "manufacturing_date", "Batch/Lot": "batch_lot", "MRP": "mrp", "Net Quantity": "net_quantity",
           "Use By / Expiry": "use_by_date", "Unit Sale Price": "unit_sale_price"}.get(field, "")
    value = str(fields.get(key) or "")
    if value:
        matches.extend(item for item in ocr_items if value.lower() in str(item.get("text", "")).lower() and item not in matches)
    # Evidence should point at one photo: the one holding most of the matching text.
    by_image: Dict[str, int] = {}
    for item in matches:
        by_image[str(item.get("image_id"))] = by_image.get(str(item.get("image_id")), 0) + 1
    if by_image:
        best = max(by_image, key=lambda k: by_image[k])
        matches = [item for item in matches if str(item.get("image_id")) == best]
    return matches[:12]


def re_search(pattern: str, value: str) -> bool:
    import re
    return bool(re.search(pattern, value, re.I))


def analyze_scan(db: Session, scan: ScanSession) -> Dict[str, Any]:
    images = db.query(ScanImage).filter(ScanImage.scan_id == scan.id).order_by(ScanImage.created_at.asc()).all()
    if not images:
        raise ValueError("At least one package image is required before analysis.")

    scan.status = "ANALYZING"
    db.commit()

    ocr_outputs = []
    qr_results_all = []
    all_ocr_items: List[Dict[str, Any]] = []

    for image in images:
        ocr_result = run_ocr(image.file_path)
        for item in ocr_result.get("items", []):
            item["image_id"] = image.id
            item["image_url"] = image.url
            item["view_slot"] = image.view_slot
        ocr_outputs.append(ocr_result)
        all_ocr_items.extend(ocr_result.get("items", []))

        for qr in scan_qr(image.file_path):
            qr["image_id"] = image.id
            qr["image_url"] = image.url
            qr["view_slot"] = image.view_slot
            qr_results_all.append(qr)

    raw_text = "\n".join(item["text"] for item in ocr_outputs if item.get("text"))
    ocr_confidence = sum(float(item.get("confidence", 0)) for item in ocr_outputs) / len(ocr_outputs) if ocr_outputs else 0.0
    qr_details = extract_manufacturing_details(qr_results_all)
    fields = extract_fields(raw_text, ocr_items=all_ocr_items, qr_details=qr_details, ocr_confidence=ocr_confidence)
    fields["qr_payloads"] = [
        {"payload": q["payload"], "data": q.get("data", {}), "image_id": q.get("image_id"), "view_slot": q.get("view_slot"), "box": q.get("box", [])}
        for q in qr_results_all
    ]
    fields["qr_detected"] = bool(qr_results_all)
    fields["qr_manufacturing_details"] = qr_details

    evaluation = analyze_packaging_compliance(raw_text, metadata=fields)

    existing = db.query(ScanAnalysis).filter(ScanAnalysis.scan_id == scan.id).first()
    analysis_record = existing or ScanAnalysis(id=f"ANL-{uuid.uuid4().hex[:10].upper()}", scan_id=scan.id)
    if not existing:
        db.add(analysis_record)

    analysis_record.raw_ocr = raw_text
    analysis_record.ocr_items_json = json.dumps(all_ocr_items, ensure_ascii=False)
    analysis_record.extracted_json = json.dumps(fields, ensure_ascii=False)
    analysis_record.ocr_confidence = round(ocr_confidence, 2)
    field_confidences = fields.get("field_confidence", {})
    nonzero = [float(v) for v in field_confidences.values() if float(v) > 0]
    analysis_record.extraction_confidence = round(sum(nonzero) / len(nonzero), 2) if nonzero else 0.0
    analysis_record.analysis_version = "LM-AI-2.0-HITL-QR"
    analysis_record.created_at = datetime.now(timezone.utc)

    db.query(EvidenceRecord).filter(EvidenceRecord.scan_id == scan.id).delete(synchronize_session=False)
    db.query(ComplianceCheck).filter(ComplianceCheck.scan_id == scan.id).delete(synchronize_session=False)
    db.query(Finding).filter(Finding.scan_id == scan.id).delete(synchronize_session=False)

    for check in evaluation["complianceChecks"]:
        db.add(ComplianceCheck(
            id=f"{check['id']}-{scan.id}", scan_id=scan.id, name=check["name"],
            rule_code=check["ruleReference"]["ruleId"], rule_name=check["ruleReference"]["ruleName"],
            description=check["ruleReference"]["description"], expected=check["expected"], extracted=check["extracted"],
            status=check["status"], confidence=check["confidence"], explanation=check["explanation"],
            evidence_available=check.get("evidenceAvailable", True),
        ))

    field_map = {
        "MRP": "MRP", "Net Quantity": "Net Quantity", "Manufacture / Packing Date": "Manufacture / Packing Date",
        "Manufacturer / Packer / Importer": "Manufacturer / Packer / Importer", "Commodity Name": "Commodity Name",
        "Consumer Care": "Consumer Care", "Country of Origin": "Country of Origin",
    }
    finding_records = []
    for finding in evaluation["findings"]:
        relevant = _field_items(field_map.get(finding["field"], finding["field"]), all_ocr_items, fields)
        finding_record = Finding(
            id=f"{finding['id']}-{scan.id}", scan_id=scan.id, product_id=scan.product_id,
            rule_code=finding.get("ruleCode", "UNSPECIFIED"), category=finding["category"], affected_field=finding["field"],
            extracted_value=finding.get("extractedValue", ""), expected_value=finding.get("expectedValue", ""),
            description=finding["description"], confidence=finding["confidence"], risk_level=finding["risk"],
            risk_score=finding.get("riskScore", evaluation["risk"]["score"]), status=finding["status"],
            evidence_id=f"EVD-{uuid.uuid4().hex[:8].upper()}",
            bounding_boxes_json=json.dumps(relevant, ensure_ascii=False), raw_ocr=raw_text,
        )
        db.add(finding_record)
        finding_records.append(finding_record)
        create_evidence_for_finding(db, finding_record, images, relevant)

    product_name = fields.get("product_name") or "Unidentified Commodity"
    scan.product_name = product_name
    scan.risk_score = float(evaluation["risk"]["score"])
    scan.risk_level = evaluation["risk"]["level"]
    scan.compliance_status = evaluation["summary"]["status"]
    scan.status = "COMPLETE"
    # Flow steps 5/5A/10: a compliant pack closes here; anything with findings waits to be forwarded.
    scan.case_status = "READY_TO_FORWARD" if evaluation["findings"] else "NO_CASE"

    if product_name != "Unidentified Commodity":
        product = db.query(Product).filter(Product.id == scan.product_id).first() if scan.product_id else None
        if not product:
            product = Product(id=f"PROD-{uuid.uuid4().hex[:10].upper()}", name=product_name, brand=fields.get("brand") or "Unknown", category="Unclassified")
            db.add(product)
            scan.product_id = product.id
        product.name = product_name
        product.brand = fields.get("brand") or product.brand
        if fields.get("mrp"):
            try:
                product.mrp = float(fields["mrp"].replace(",", ""))
            except (ValueError, TypeError):
                pass
        product.declared_net_qty = fields.get("net_quantity") or product.declared_net_qty
        product.manufacturer = fields.get("manufacturer") or fields.get("qr_manufacturing_unit") or product.manufacturer
        product.packer = fields.get("packer") or product.packer
        product.importer = fields.get("importer") or product.importer
        product.batch_lot = fields.get("batch_lot") or product.batch_lot
        product.country_of_origin = fields.get("country_of_origin") or product.country_of_origin
        product.current_status = scan.compliance_status
        product.risk_level = scan.risk_level
        product.last_inspection = datetime.now(timezone.utc)
        # The product record may only exist now; link this scan's findings to it for history and reports.
        for record in finding_records:
            record.product_id = scan.product_id

    db.commit()
    return evaluation
