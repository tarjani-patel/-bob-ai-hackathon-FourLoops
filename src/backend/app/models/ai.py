"""Pydantic schemas for IBM watsonx.ai Granite integration."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AIHealthResponse(BaseModel):
    status: str
    configured: bool
    model: str
    url: str
    message: str

class ExplainDeviationRequest(BaseModel):
    deviationId: str
    patientId: str
    siteId: str
    siteName: Optional[str] = None
    category: str
    type: str
    severity: str
    expected: str
    actual: str
    evidence: Optional[str] = None

class DeviationExplanationAIResponse(BaseModel):
    explanation: str
    likelyContributingFactors: List[str] = Field(default_factory=list)
    clinicalImpact: str
    limitations: str
    modelUsed: str = "ibm/granite-4-h-small"
    confidence: Optional[str] = "Moderate to High"
    humanReviewNotice: str = "AI-assisted clinical interpretation powered by IBM Granite. Protocol non-compliance verified by deterministic compliance engine. Subject to human clinical review under 21 CFR 312."

class SiteInsightRequest(BaseModel):
    siteId: str
    siteName: str
    score: int
    riskBand: str
    trend: Optional[str] = "Stable"
    predictedScore: Optional[int] = None
    criticalCount: Optional[int] = 0
    majorCount: Optional[int] = 0
    deviationCount: Optional[int] = 0
    topDrivers: Optional[List[str]] = Field(default_factory=list)
    recentDeviations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class SiteInsightAIResponse(BaseModel):
    riskAssessment: str
    importantPatterns: List[str] = Field(default_factory=list)
    contributingFactors: List[str] = Field(default_factory=list)
    emergingRiskExplanation: str
    recommendedInvestigationAreas: List[str] = Field(default_factory=list)
    modelUsed: str = "ibm/granite-4-h-small"
    humanReviewNotice: str = "AI-assisted site pattern synthesis powered by IBM Granite. Site risk indices are deterministically calculated from verified trial deviations."

class CAPARecommendationRequest(BaseModel):
    capaId: Optional[str] = None
    siteId: str
    siteName: Optional[str] = None
    category: str
    problemStatement: str
    evidence: str
    existingHypothesis: Optional[str] = None
    linkedDeviations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class CAPARecommendationAIResponse(BaseModel):
    rootCauseHypothesis: str
    correctiveAction: str
    preventiveAction: str
    suggestedOwner: str
    priorityRationale: str
    modelUsed: str = "ibm/granite-4-h-small"
    humanReviewNotice: str = "Corrective and preventive action recommendations proposed by IBM Granite foundation model. Formal authorization requires human Sponsor approval under 21 CFR 312 / GCP §5.20."
