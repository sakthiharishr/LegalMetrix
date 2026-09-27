from typing import List, Optional, Any
from pydantic import BaseModel
from .evidence import BoundingBox, EvidenceProduct, EvidenceImage

class TimelineEvent(BaseModel):
    timestamp: str
    actor: str
    action: str
    status: str

class VerificationFindingDetail(BaseModel):
    status: str
    category: str
    affectedField: str
    extractedValue: str
    expectedValue: str
    confidence: float
    riskScore: float
    riskLevel: str
    riskFactors: List[str]
    description: str

class VerificationEvidence(BaseModel):
    primaryImage: str
    images: List[EvidenceImage] = []
    boundingBoxes: List[BoundingBox]

class VerificationRuleReference(BaseModel):
    id: str
    title: str
    source: str
    referenceText: str

class VerificationResponse(BaseModel):
    scanId: str
    findingId: str
    status: str  # PENDING_OFFICER_REVIEW, COMPLETED
    product: EvidenceProduct
    finding: VerificationFindingDetail
    findings: List[VerificationFindingDetail] = []
    evidence: VerificationEvidence
    ruleReference: VerificationRuleReference
    timeline: List[TimelineEvent]
    decision: Optional[str] = None
    remarks: Optional[str] = None
    reviewedAt: Optional[str] = None
    reviewedBy: Optional[str] = None

class SubmitVerificationRequest(BaseModel):
    decision: str  # CONFIRM_FINDING, INVALIDATE_FINDING, NEEDS_FURTHER_REVIEW
    remarks: Optional[str] = ""
    # Optional human-corrected field values. Existing frontend requests remain valid.
    fieldCorrections: Optional[dict[str, Any]] = None

