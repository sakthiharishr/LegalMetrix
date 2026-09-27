from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class ReportingPeriod(BaseModel):
    start: str
    end: str

class ReportSummary(BaseModel):
    totalInspections: int
    productsInspected: int
    potentialFindings: int
    officerReviews: int
    confirmedFindings: int
    invalidatedFindings: int
    needsFurtherReview: int

class ActivityPoint(BaseModel):
    date: str
    count: int
    label: Optional[str] = None

class ComplianceTrendPoint(BaseModel):
    date: str
    label: Optional[str] = None
    compliant: int
    potentialFindings: int
    needsReview: int

class FindingCategoryStat(BaseModel):
    category: str
    count: int
    percentage: int

class RiskDistributionStat(BaseModel):
    level: str
    count: int

class ReportRecurringIssue(BaseModel):
    id: str
    pattern: str
    occurrences: int
    affectedProducts: int
    lastDetected: str

class OfficerReviewOutcome(BaseModel):
    outcome: str
    count: int

class ReportAnalyticsResponse(BaseModel):
    reportingPeriod: ReportingPeriod
    granularity: str = "day"  # day | week | month
    summary: ReportSummary
    inspectionActivity: List[ActivityPoint]
    complianceTrend: List[ComplianceTrendPoint]
    findingCategories: List[FindingCategoryStat]
    riskDistribution: List[RiskDistributionStat]
    recurringIssues: List[ReportRecurringIssue]
    officerReviewOutcomes: List[OfficerReviewOutcome]

