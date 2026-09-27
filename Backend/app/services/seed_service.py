from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from ..models import User, Product, ScanSession, ScanImage, ComplianceCheck, Finding, VerificationRecord, AuditLog
from ..core.security import get_password_hash

def seed_initial_data(db: Session):
    """Seed default officer, products, and sample inspection records if tables are empty."""
    # 1. Seed Officer User
    existing_user = db.query(User).filter(User.id == "OFF-7842").first()
    if not existing_user:
        officer = User(
            id="OFF-7842",
            name="Rajesh Kumar Verma",
            designation="Legal Metrology Inspector",
            badge_number="LM-DEL-2024-049",
            jurisdiction="New Delhi Central Enforcement Zone",
            role="SENIOR_ENFORCEMENT_OFFICER",
            email="r.verma.lm@delhi.gov.in",
            # Development password: password
            hashed_password=get_password_hash("password"),
            avatar_url=None
        )
        db.add(officer)

    # 2. Seed Default Products
    existing_product = db.query(Product).first()
    if not existing_product:
        p1 = Product(
            id="PRODUCT-001",
            name="NutriCrunch Wheat Biscuits",
            brand="GoldenHarvest Foods",
            category="Packaged Food & Confectionery",
            barcode="8901030948215",
            mrp=120.0,
            declared_net_qty="400 g",
            manufacturer="GoldenHarvest Foods Pvt Ltd",
            packer="GoldenHarvest Packaging Unit 3",
            country_of_origin="India",
            current_status="POTENTIAL_VIOLATION",
            risk_level="HIGH_RISK",
        )
        p2 = Product(
            id="PRODUCT-002",
            name="PureClean Anti-Bacterial Hand Wash 500ml",
            brand="Apex Personal Care Pvt Ltd",
            category="Cosmetics & Hygiene",
            barcode="8902519102441",
            mrp=185.0,
            declared_net_qty="500 ml",
            manufacturer="Apex Personal Care Pvt Ltd",
            packer="Apex Unit 1",
            country_of_origin="India",
            current_status="COMPLIANT",
            risk_level="LOW_RISK",
        )
        p3 = Product(
            id="PRODUCT-003",
            name="SpeedMax Synthetic Engine Lubricant 1L",
            brand="PetroNova Lubes India",
            category="Automotive Oils",
            barcode="8906002143099",
            mrp=650.0,
            declared_net_qty="1 L",
            manufacturer="PetroNova Lubes India",
            packer="PetroNova Unit 4",
            country_of_origin="India",
            current_status="NEEDS_REVIEW",
            risk_level="MEDIUM_RISK",
        )
        db.add_all([p1, p2, p3])

    # 3. Seed Sample Scan Session & Findings
    existing_scan = db.query(ScanSession).filter(ScanSession.id == "SCN-MOCK-2026-001").first()
    if not existing_scan:
        scan = ScanSession(
            id="SCN-MOCK-2026-001",
            product_id="PRODUCT-001",
            product_name="NutriCrunch Wheat Biscuits (Family Pack)",
            officer_id="OFF-7842",
            status="COMPLETE",
            risk_score=78.0,
            risk_level="HIGH_RISK",
            compliance_status="POTENTIAL_VIOLATION"
        )
        db.add(scan)

        img = ScanImage(
            id="IMG-1",
            scan_id="SCN-MOCK-2026-001",
            view_slot="Front View",
            file_path="mock/front.jpg",
            file_name="package_front.jpg",
            url="https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80",
            status="UPLOADED",
            quality_status="GOOD",
            blur_score=95.0
        )
        db.add(img)

        # Finding FND-001
        fnd = Finding(
            id="FND-001",
            scan_id="SCN-MOCK-2026-001",
            product_id="PRODUCT-001",
            rule_code="RULE_6_1_E",
            category="MRP Declaration",
            affected_field="MRP",
            extracted_value="₹120.00",
            expected_value='Must include "inclusive of all taxes"',
            description='The phrase "inclusive of all taxes" is missing next to the MRP. Mandatory under PCR 2011 Rule 6(1)(e).',
            confidence=95.0,
            risk_level="HIGH_RISK",
            risk_score=82.0,
            status="POTENTIAL_VIOLATION",
            evidence_id="EVD-001",
            raw_ocr="NET WT 500g\nMRP ₹120.00\nMFG 05/2026"
        )
        db.add(fnd)

        # Verification record
        vr = VerificationRecord(
            id="VR-001",
            scan_id="SCN-MOCK-2026-001",
            finding_id="FND-001",
            status="PENDING_OFFICER_REVIEW"
        )
        db.add(vr)

        # Initial Audit logs
        now = datetime.now(timezone.utc)
        db.add_all([
            AuditLog(id="LOG-1", scan_id="SCN-MOCK-2026-001", finding_id="FND-001", actor="SYSTEM", action="Scan Created", timestamp=now - timedelta(hours=1)),
            AuditLog(id="LOG-2", scan_id="SCN-MOCK-2026-001", finding_id="FND-001", actor="SYSTEM", action="OCR Completed", timestamp=now - timedelta(minutes=59)),
            AuditLog(id="LOG-3", scan_id="SCN-MOCK-2026-001", finding_id="FND-001", actor="AI_ANALYSIS", action="Potential Finding Identified", timestamp=now - timedelta(minutes=58)),
            AuditLog(id="LOG-4", scan_id="SCN-MOCK-2026-001", finding_id="FND-001", actor="SYSTEM", action="Evidence Generated", timestamp=now - timedelta(minutes=57)),
        ])

    db.commit()

