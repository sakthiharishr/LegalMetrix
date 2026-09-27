from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    totalScanned: int
    totalScannedTrend: str
    compliant: int
    compliantTrend: str
    potentialViolations: int
    potentialViolationsTrend: str
    needsReview: int
    needsReviewTrend: str
    highRisk: int
    highRiskTrend: str

class TrendPoint(BaseModel):
    label: str
    compliant: int
    potentialViolation: int
    needsReview: int

class RiskDistributionTier(BaseModel):
    count: int
    percentage: int
    label: str

class RiskDistributionResponse(BaseModel):
    highRisk: RiskDistributionTier
    mediumRisk: RiskDistributionTier
    lowRisk: RiskDistributionTier
    total: int

class ViolationCategory(BaseModel):
    category: str
    rule: str
    count: int
    percentage: int
    severity: str

class HighPriorityInspection(BaseModel):
    id: str
    findingId: Optional[str] = None
    productName: str
    barcode: str
    category: str
    risk: str
    finding: str
    lastScan: str
    status: str
    riskScore: float

class RecentInspection(BaseModel):
    id: str
    productName: str
    barcode: str
    timestamp: str
    result: str
    risk: str
    officer: str
    status: str

class RecurringPattern(BaseModel):
    id: str
    pattern: str
    occurrences: int
    manufacturer: str
    affectedProducts: str
    risk: str
    statusText: str
    actionRoute: str
    ruleViolated: str

class RiskBreakdownFactor(BaseModel):
    factor: str
    score: int
    max: int
    detail: str

class RiskScoreDetailsResponse(BaseModel):
    score: int
    maxScore: int
    level: str
    inspectedProduct: str
    breakdown: List[RiskBreakdownFactor]
    advisoryNote: str

class IntelligenceAlert(BaseModel):
    id: str
    severity: str
    message: str
    actionLabel: str
    route: str

