from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ComplianceAnalyzeRequest(BaseModel):
    siteId: Optional[str] = None
    patientId: Optional[str] = None
    forceRecalculate: bool = True

class ComplianceAnalyzeResponse(BaseModel):
    analysisTimestamp: str
    analyzedPatientsCount: int
    deviationsDetectedCount: int
    criticalDeviationsCount: int
    majorDeviationsCount: int
    minorDeviationsCount: int
    adminDeviationsCount: int
    capasGeneratedCount: int
    trialRiskScore: int
    trialRiskBand: str
    compliancePercentage: float
    highRiskSitesCount: int
    auditEventId: str
    message: str
