from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class HistorySummaryResponse(BaseModel):
    totalProducts: int
    totalInspections: int
    potentialFindings: int
    reviewedFindings: int

class ProductSearchItem(BaseModel):
    productId: str
    name: str
    brand: str
    lastInspection: str
    inspectionCount: int
    currentStatus: str
    riskLevel: str
    openFindings: int
    lastOfficerDecision: str

class ProductSearchResponse(BaseModel):
    products: List[ProductSearchItem]
    total: int
    page: int
    pageSize: int

class ProductIdentity(BaseModel):
    name: str
    brand: str
    manufacturer: Optional[str] = None
    packer: Optional[str] = None
    importer: Optional[str] = None
    batchLot: Optional[str] = None
    countryOfOrigin: Optional[str] = "India"

class ProductSummaryStats(BaseModel):
    totalInspections: int
    compliantInspections: int
    potentialFindings: int
    officerConfirmations: int
    officerInvalidations: int
    needsFurtherReview: int

class ProductTrendPoint(BaseModel):
    inspectionId: str
    status: str
    date: str

class ProductDetailResponse(BaseModel):
    productId: str
    identity: ProductIdentity
    currentStatus: str
    summary: ProductSummaryStats
    trend: List[ProductTrendPoint]

