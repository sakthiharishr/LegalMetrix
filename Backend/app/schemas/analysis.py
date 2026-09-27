from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class AnalysisSummary(BaseModel):
    status: str
    totalChecks: int
    passedChecks: int
    potentialFindings: int
    needsReview: int

class ExtractedField(BaseModel):
    field: str
    value: str
    confidence: float

class RuleReference(BaseModel):
    ruleId: str
    ruleName: str
    description: str

class ComplianceCheckItem(BaseModel):
    id: str
    name: str
    expected: str
    extracted: str
    status: str
    confidence: float
    explanation: str
    ruleReference: RuleReference
    evidenceAvailable: bool

class PotentialFindingItem(BaseModel):
    id: str
    category: str
    field: str
    description: str
    confidence: float
    risk: str
    evidenceId: str
    status: str

class RiskAssessment(BaseModel):
    score: int
    level: str
    factors: List[str]

class AnalysisImage(BaseModel):
    id: str
    viewName: str
    url: str
    isPrimary: bool

class FullAnalysisResponse(BaseModel):
    scanId: str
    caseStatus: Optional[str] = None
    timestamp: str
    productName: str
    summary: AnalysisSummary
    images: List[AnalysisImage]
    extractedData: List[ExtractedField]
    complianceChecks: List[ComplianceCheckItem]
    findings: List[PotentialFindingItem]
    risk: RiskAssessment

