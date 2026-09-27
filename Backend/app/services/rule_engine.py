"""Conservative LegalMetrix compliance evaluation.

The engine distinguishes:
- COMPLIANT: evidence was detected with sufficient confidence.
- NEEDS_REVIEW: AI could not reliably determine the field.
- POTENTIAL_VIOLATION: the package contains a positive signal that conflicts with a rule.

AI never makes the final enforcement decision; officer verification does that.
"""
import re
from calendar import monthrange
from datetime import date
from typing import Any, Dict, Optional

LEGAL_METROLOGY_RULES = {
    "RULE_6_1_A": {"ruleId": "RULE_6_1_A", "ruleName": "Rule 6(1)(a)", "title": "Manufacturer / Packer / Importer Identity", "description": "Manufacturer, packer or importer identity and address should be declared as applicable.", "referenceText": "Declaration relating to manufacturer, packer or importer identity and address."},
    "RULE_6_1_B": {"ruleId": "RULE_6_1_B", "ruleName": "Rule 6(1)(b)", "title": "Generic Name of Commodity", "description": "The common or generic name of the commodity should be declared.", "referenceText": "Declaration of the common or generic name of the commodity."},
    "RULE_6_1_C": {"ruleId": "RULE_6_1_C", "ruleName": "Rule 6(1)(c)", "title": "Net Quantity", "description": "Net quantity should be declared using an appropriate standard unit of weight, measure or number.", "referenceText": "Declaration of net quantity in the applicable standard unit."},
    "RULE_6_1_D": {"ruleId": "RULE_6_1_D", "ruleName": "Rule 6(1)(d)", "title": "Month and Year of Manufacture / Packing", "description": "The applicable month and year of manufacture, packing or import should be declared.", "referenceText": "Declaration of the applicable month and year."},
    "RULE_6_1_E": {"ruleId": "RULE_6_1_E", "ruleName": "Rule 6(1)(e)", "title": "Maximum Retail Price (MRP) Declaration", "description": "MRP should be identifiable and presented with the applicable tax-inclusive declaration.", "referenceText": "Declaration of retail sale price / MRP with the applicable tax-inclusive wording."},
    "RULE_6_1_F": {"ruleId": "RULE_6_1_F", "ruleName": "Rule 6(1)(f)", "title": "Consumer Care Details", "description": "Consumer complaint contact information should be declared as applicable.", "referenceText": "Declaration of the person/office and contact information for consumer complaints."},
    "RULE_6_1_E_USP": {"ruleId": "RULE_6_1_E_USP", "ruleName": "Rule 6(1)(e) (unit sale price)", "title": "Unit Sale Price", "description": "Unit sale price should be declared with the MRP and must equal MRP divided by the net quantity.", "referenceText": "Declaration of unit sale price along with the retail sale price."},
    "RULE_DATE_VALIDITY": {"ruleId": "RULE_DATE_VALIDITY", "ruleName": "Rule 6(1)(d) (date validity)", "title": "Date Validity", "description": "Declared dates must be plausible: not manufactured in the future, and not past the use-by / best-before date.", "referenceText": "Declared month and year of manufacture / packing and the use-by or best-before date."},
    "RULE_6_1_G": {"ruleId": "RULE_6_1_G", "ruleName": "Rule 6(1)(g)", "title": "Country of Origin", "description": "Country of origin should be declared for imported products as applicable.", "referenceText": "Declaration of country of origin/manufacture/assembly for imported products."},
}


def _check(rule, name, expected, extracted, status, confidence, explanation):
    return {"id": f"CHK-{rule['ruleId'].split('_')[-1]}", "name": name, "expected": expected, "extracted": extracted or "Not detected", "status": status, "confidence": round(confidence, 2), "explanation": explanation, "ruleReference": rule, "evidenceAvailable": True}


def _finding(rule, category, field, description, confidence, risk, extracted="", expected="", risk_score=0, status="NEEDS_REVIEW"):
    return {"id": f"FND-{rule['ruleId']}", "ruleCode": rule["ruleId"], "category": category, "field": field, "description": description, "confidence": round(confidence, 2), "risk": risk, "riskScore": risk_score, "extractedValue": extracted, "expectedValue": expected, "evidenceId": f"EVD-{rule['ruleId']}", "status": status}


def _parse_date(value: str, end_of_month: bool = False) -> Optional[date]:
    """dd/mm/yy or mm/yy (as produced by the extractor) -> date."""
    parts = [int(p) for p in re.findall(r"\d+", str(value or ""))]
    try:
        if len(parts) == 3:
            d, m, y = parts
            return date(y % 100 + 2000, m, d)
        if len(parts) == 2:
            m, y = parts
            y = y % 100 + 2000
            return date(y, m, monthrange(y, m)[1] if end_of_month else 1)
    except ValueError:
        pass
    return None


UNIT_TO_BASE = {"ml": ("ml", 1), "l": ("ml", 1000), "g": ("g", 1), "kg": ("g", 1000), "mg": ("g", 0.001)}


def _usp_mismatch(mrp: str, quantity: str, usp: str) -> Optional[str]:
    """Unit sale price must equal MRP / net quantity. Returns an explanation when it does not."""
    q = re.fullmatch(r"([\d.]+)(ml|l|g|kg|mg)", str(quantity or "").strip(), re.I)
    u = re.fullmatch(r"([\d.]+)/(\d*)\s*(ml|l|g|kg|mg)", str(usp or "").replace(" ", ""), re.I)
    if not (q and u and mrp):
        return None
    try:
        q_base, q_factor = UNIT_TO_BASE[q.group(2).lower()]
        u_base, u_factor = UNIT_TO_BASE[u.group(3).lower()]
        if q_base != u_base:
            return None
        per = float(u.group(2) or 1) * u_factor  # the unit price is quoted per this many base units
        expected = float(mrp) / (float(q.group(1)) * q_factor) * per
        declared = float(u.group(1))
    except (ValueError, ZeroDivisionError):
        return None
    # Printed unit prices are rounded to paise, so allow that rounding plus 5%.
    if abs(declared - expected) > max(0.011, 0.05 * expected):
        return f"declared {declared:g} per {u.group(2) or ''}{u.group(3)} but MRP / quantity gives {expected:.2f}"
    return None


def _conf(metadata, field, default=0.0):
    fc = metadata.get("field_confidence") or {}
    value = fc.get(field)
    if value is None:
        value = default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def analyze_packaging_compliance(extracted_text: str = "", metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
    metadata = metadata or {}
    text = extracted_text or ""
    checks, findings = [], []

    manufacturer = metadata.get("manufacturer") or metadata.get("packer") or metadata.get("importer")
    qr_address = metadata.get("qr_manufacturing_address") or ""
    has_address = bool(qr_address or re.search(r"\b\d{6}\b|\b(?:road|street|industrial|plot|nagar|estate)\b", text, re.I))
    mc = _conf(metadata, "manufacturer", 0)
    if manufacturer and has_address:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_A"], "Manufacturer / Packer / Importer", "Identity and applicable address", manufacturer, "COMPLIANT", max(mc, 85), "Identity and address evidence was detected from package text and/or QR manufacturing information."))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_A"], "Manufacturer / Packer / Importer", "Identity and applicable address", manufacturer, "NEEDS_REVIEW", max(55, mc), "AI could not reliably verify the complete applicable identity/address declaration."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_A"], "Manufacturer Details", "Manufacturer / Packer / Importer", "Identity/address evidence needs officer verification.", max(55, mc), "MEDIUM_RISK", manufacturer or "Not detected", "Applicable identity and address", 35))

    product_name = metadata.get("product_name")
    pc = _conf(metadata, "product_name", 0)
    if product_name and pc >= 75:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_B"], "Commodity Name", "Common/generic commodity name", product_name, "COMPLIANT", pc, "A commodity name was extracted with sufficient confidence."))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_B"], "Commodity Name", "Common/generic commodity name", product_name, "NEEDS_REVIEW", pc or 60, "Commodity name could not be reliably extracted."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_B"], "Product Identification", "Commodity Name", "Commodity name requires targeted officer verification.", pc or 60, "MEDIUM_RISK", product_name or "Not detected", "Commodity name", 30))

    quantity = metadata.get("net_quantity")
    qc = _conf(metadata, "net_quantity", 0)
    if quantity and qc >= 75:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_C"], "Net Quantity", "Declared quantity with applicable standard unit", quantity, "COMPLIANT", qc, "A quantity and unit were detected with sufficient confidence."))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_C"], "Net Quantity", "Declared quantity with applicable standard unit", quantity, "NEEDS_REVIEW", qc or 60, "Net quantity could not be reliably determined."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_C"], "Net Quantity", "Net Quantity", "Net quantity needs targeted officer verification.", qc or 60, "MEDIUM_RISK", quantity or "Not detected", "Quantity + unit", 35))

    imperial = re.search(r"\b\d+(?:\.\d+)?\s*(?:FL\.?\s*OZ|OZ|OUNCES?|LBS?|POUNDS?|GALLONS?|GAL|QUARTS?|PINTS?)\b", text, re.I)
    if imperial and not quantity:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_C"], "Net Quantity Unit", "Quantity in a standard (metric) unit", imperial.group(0), "POTENTIAL_VIOLATION", 85, "The quantity is declared only in a non-metric unit."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_C"], "Net Quantity", "Net Quantity", f"Net quantity is declared as '{imperial.group(0)}' without a standard metric unit.", 85, "HIGH_RISK", imperial.group(0), "Standard unit (g, kg, ml, l, number)", 75, status="POTENTIAL_VIOLATION"))

    date_value = metadata.get("manufacturing_date")
    dc = _conf(metadata, "manufacturing_date", 0)
    if date_value and dc >= 75:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_D"], "Manufacture / Packing Date", "Applicable month and year", date_value, "COMPLIANT", dc, "A manufacture/packing date was extracted with sufficient confidence."))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_D"], "Manufacture / Packing Date", "Applicable month and year", date_value, "NEEDS_REVIEW", dc or 60, "The date could not be reliably determined from available package evidence."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_D"], "Date Declaration", "Manufacture / Packing Date", "Manufacture/packing date needs targeted officer verification.", dc or 60, "MEDIUM_RISK", date_value or "Not detected", "Applicable month and year", 30))

    mrp = metadata.get("mrp")
    mc = _conf(metadata, "mrp", 0)
    # OCR drops or swaps letters in this small print ("inclusive of al taxes", "INCLOFALLTAXES").
    inclusive = bool(metadata.get("mrp_tax_inclusive")) or bool(re.search(r"in[ck][li1]\w*\s*\.?\s*(?:of)?\s*a[li1]+\s*tax", text, re.I))
    if mrp and mc >= 75 and inclusive:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "Maximum Retail Price (MRP)", "MRP with applicable tax-inclusive wording", f"₹{mrp}", "COMPLIANT", mc, "MRP and tax-inclusive wording were detected."))
    elif mrp and mc >= 85 and not re.search(r"TAX", text, re.I):
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "Maximum Retail Price (MRP)", "MRP with applicable tax-inclusive wording", f"₹{mrp}", "POTENTIAL_VIOLATION", mc, "MRP is printed but no 'inclusive of all taxes' wording appears anywhere on the pack."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "MRP Declaration", "MRP", "MRP is declared without the mandatory 'inclusive of all taxes' wording.", mc, "HIGH_RISK", f"₹{mrp}", "MRP + 'inclusive of all taxes'", 70, status="POTENTIAL_VIOLATION"))
    elif mrp and mc >= 75:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "Maximum Retail Price (MRP)", "MRP with applicable tax-inclusive wording", f"₹{mrp}", "NEEDS_REVIEW", mc, "MRP was detected; the tax-inclusive wording needs targeted verification."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "MRP Declaration", "MRP", "MRP was detected, but the related tax-inclusive declaration needs officer verification.", mc, "MEDIUM_RISK", f"₹{mrp}", "MRP + applicable tax-inclusive wording", 35))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "Maximum Retail Price (MRP)", "MRP with applicable tax-inclusive wording", mrp, "NEEDS_REVIEW", mc or 60, "MRP could not be reliably determined."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_E"], "MRP Declaration", "MRP", "MRP needs targeted officer verification.", mc or 60, "MEDIUM_RISK", mrp or "Not detected", "MRP declaration", 35))

    usp = metadata.get("unit_sale_price")
    mismatch = _usp_mismatch(mrp, quantity, usp) if mrp and quantity and usp else None
    if mismatch:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E_USP"], "Unit Sale Price", "MRP / net quantity", usp, "POTENTIAL_VIOLATION", min(mc, qc) or 80, f"Unit sale price does not match: {mismatch}."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_E_USP"], "MRP Declaration", "Unit Sale Price", f"Unit sale price does not match MRP / net quantity ({mismatch}).", min(mc, qc) or 80, "HIGH_RISK", usp, "MRP / net quantity", 70, status="POTENTIAL_VIOLATION"))
    elif usp:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E_USP"], "Unit Sale Price", "Unit sale price with the MRP", usp, "COMPLIANT", _conf(metadata, "unit_sale_price", 85), "Unit sale price is declared" + (" and matches MRP / net quantity." if mrp and quantity else ".")))
    elif mrp and re.fullmatch(r"[\d.]+(?:ml|l|g|kg|mg)", str(quantity or "")):
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_E_USP"], "Unit Sale Price", "Unit sale price with the MRP", "", "NEEDS_REVIEW", 60, "No unit sale price was detected next to the MRP."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_E_USP"], "MRP Declaration", "Unit Sale Price", "Unit sale price was not detected; verify it is printed with the MRP.", 60, "MEDIUM_RISK", "Not detected", "Unit sale price", 30))

    today = date.today()
    made = _parse_date(date_value)
    use_by = _parse_date(metadata.get("use_by_date"), end_of_month=True)
    if made and (made - today).days > 31:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_DATE_VALIDITY"], "Date Validity", "Manufacture date not in the future", date_value, "POTENTIAL_VIOLATION", dc or 80, f"The manufacture/packing date {date_value} is in the future."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_DATE_VALIDITY"], "Date Declaration", "Manufacture / Packing Date", f"Manufacture/packing date {date_value} is later than today.", dc or 80, "HIGH_RISK", date_value, "A date on or before today", 80, status="POTENTIAL_VIOLATION"))
    elif use_by and use_by < today:
        value = metadata.get("use_by_date")
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_DATE_VALIDITY"], "Date Validity", "Within use-by / best-before date", value, "POTENTIAL_VIOLATION", _conf(metadata, "use_by_date", 80), f"The use-by / best-before date {value} has passed; the product should not be on sale."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_DATE_VALIDITY"], "Date Declaration", "Use By / Expiry", f"Product is past its use-by / best-before date ({value}).", _conf(metadata, "use_by_date", 80), "HIGH_RISK", value, f"A date after {today.strftime('%d/%m/%y')}", 90, status="POTENTIAL_VIOLATION"))
    elif made or use_by:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_DATE_VALIDITY"], "Date Validity", "Plausible dates, not expired", metadata.get("use_by_date") or date_value, "COMPLIANT", dc or 80, "Declared dates are plausible and the product is within its shelf life." if use_by else "The manufacture date is plausible."))

    email, phone = metadata.get("consumer_email"), metadata.get("consumer_phone")
    cc = max(_conf(metadata, "consumer_email", 0), _conf(metadata, "consumer_phone", 0))
    if email or phone:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_F"], "Consumer Care Details", "Applicable consumer complaint contact", " / ".join(x for x in (phone, email) if x), "COMPLIANT", max(cc, 80), "Consumer-care contact information was detected."))
    else:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_F"], "Consumer Care Details", "Applicable consumer complaint contact", "", "NEEDS_REVIEW", 60, "No reliable consumer-care contact was detected."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_F"], "Consumer Information", "Consumer Care", "Consumer-care contact information needs targeted verification.", 60, "MEDIUM_RISK", "Not detected", "Applicable complaint contact", 25))

    imported = bool(re.search(r"imported|importer|country of origin|made in", text, re.I))
    origin = metadata.get("country_of_origin")
    oc = _conf(metadata, "country_of_origin", 0)
    if imported and origin:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_G"], "Country of Origin", "Country of origin for imported product", origin, "COMPLIANT", max(oc, 80), "Country-of-origin information was detected."))
    elif imported:
        checks.append(_check(LEGAL_METROLOGY_RULES["RULE_6_1_G"], "Country of Origin", "Country of origin for imported product", "", "NEEDS_REVIEW", 60, "Import-related wording was detected but country of origin was not reliably extracted."))
        findings.append(_finding(LEGAL_METROLOGY_RULES["RULE_6_1_G"], "Origin Declaration", "Country of Origin", "Country of origin needs targeted officer verification.", 60, "MEDIUM_RISK", "Not detected", "Country of origin", 30))

    # Batch/lot is an AI extraction target. A missing/uncertain batch value is NOT declared a legal violation here.
    batch = metadata.get("batch_lot")
    bc = _conf(metadata, "batch_lot", 0)
    if batch and bc >= 75:
        metadata["batch_review_required"] = False
    elif batch or bc > 0:
        metadata["batch_review_required"] = True
    else:
        metadata["batch_review_required"] = False

    passed = sum(c["status"] == "COMPLIANT" for c in checks)
    needs_review = sum(c["status"] == "NEEDS_REVIEW" for c in checks)
    potential = sum(c["status"] == "POTENTIAL_VIOLATION" for c in checks)
    review_findings = len(findings)
    # Risk follows the most serious finding; every further finding adds a little.
    ranked = sorted((f["riskScore"] for f in findings), reverse=True)
    score = min(100, ranked[0] + 5 * (len(ranked) - 1)) if ranked else 0
    level = "HIGH_RISK" if score >= 70 else "MEDIUM_RISK" if score >= 40 else "LOW_RISK"
    overall = "POTENTIAL_VIOLATION" if potential else "NEEDS_REVIEW" if needs_review or review_findings else "COMPLIANT"

    return {"summary": {"status": overall, "totalChecks": len(checks), "passedChecks": passed, "potentialFindings": potential, "needsReview": needs_review}, "complianceChecks": checks, "findings": findings, "risk": {"score": score, "level": level, "factors": [f["description"] for f in findings[:5]] or ["AI extraction did not identify a current review item."]}}
