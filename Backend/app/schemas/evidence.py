from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class BoundingBox(BaseModel):
    id: str
    x: float
    y: float
    width: float
    height: float
    label: str
    type: str

class SupportingTextItem(BaseModel):
    label: str
    text: str

class EvidenceImage(BaseModel):
    id: str
    url: str
    viewSlot: str
    fileName: str
    isPrimary: bool = False

class EvidenceBlock(BaseModel):
    primaryImage: str
    images: List[EvidenceImage] = []
    boundingBoxes: List[BoundingBox]
    supportingText: Optional[List[SupportingTextItem]] = None

class ConfidenceMetrics(BaseModel):
    ocr: float
    extraction: float
    finding: float

class TraceabilityBlock(BaseModel):
    scanId: str
    findingId: str
    evidenceId: str
    sourceImage: str
    analysisTimestamp: str
    analysisVersion: str
    ruleEngineVersion: str

class EvidenceFindingDetail(BaseModel):
    status: str
    category: str
    affectedField: str
    extractedValue: str
    expectedValue: str
    confidence: float
    riskContribution: str
    description: str

class EvidenceProduct(BaseModel):
    name: str
    brand: str

class EvidenceRuleReference(BaseModel):
    id: str
    title: str
    source: str
    referenceText: str

class EvidenceRisk(BaseModel):
    score: int
    level: str
    factors: List[str]

class EvidenceResponse(BaseModel):
    scanId: str
    findingId: str
    product: EvidenceProduct
    finding: EvidenceFindingDetail
    evidence: EvidenceBlock
    ruleReference: EvidenceRuleReference
    confidenceMetrics: ConfidenceMetrics
    risk: EvidenceRisk
    traceability: TraceabilityBlock

