from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
from ..core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    barcode = Column(String, index=True)
    mrp = Column(Float, default=0.0)
    declared_net_qty = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    packer = Column(String, nullable=True)
    importer = Column(String, nullable=True)
    batch_lot = Column(String, nullable=True)
    country_of_origin = Column(String, default="India")
    current_status = Column(String, default="COMPLIANT")
    risk_level = Column(String, default="LOW_RISK")
    last_inspection = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

