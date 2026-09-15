from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class InvestigationalProduct(BaseModel):
    name: str = "Cardio-X"
    code: str = "BC-4089"
    targetDoseMg: int = 100
    unit: str = "mg"
    frequency: str = "Once daily (QD)"
    route: str = "Oral"
    acceptableRangeMg: List[int] = [95, 105]

class SiteInfo(BaseModel):
    id: str
    code: str
    name: str
    location: str
    pi: str
    cra: str
    patientCount: int = 0

class ProtocolVisitRule(BaseModel):
    visitNumber: int
    name: str
    targetDay: int
    windowDaysMinus: int
    windowDaysPlus: int
    windowDescription: str
    requiredProcedures: List[str]

class ProhibitedMedicationRule(BaseModel):
    name: str
    genericClass: str
    rationale: str
    severity: str

class LaboratoryRules(BaseModel):
    mandatoryBeforeVisit3: str
    cbcWindowDaysBeforeV3: int = 7

class ProtocolConfig(BaseModel):
    trialId: str = "CT-101"
    trialName: str = "Cardio-X Phase III"
    indication: str = "Cardiovascular Disease (Heart Failure with Reduced Ejection Fraction)"
    phase: str = "Phase III"
    sponsor: str = "BioCardia Therapeutics / Global Clinical Innovations"
    protocolVersion: str = "v3.2"
    lastAmendmentDate: str = "2026-01-15"
    irbApprovalNumber: str = "IRB-2025-CV-8821"
    targetEnrollment: int = 100
    investigationalProduct: InvestigationalProduct = Field(default_factory=InvestigationalProduct)
    sites: List[SiteInfo] = Field(default_factory=list)
    visits: List[ProtocolVisitRule] = Field(default_factory=list)
    laboratoryRules: LaboratoryRules
    prohibitedMedications: List[ProhibitedMedicationRule] = Field(default_factory=list)
    severityWeights: Dict[str, int] = Field(default_factory=dict)
    riskModifiers: Dict[str, int] = Field(default_factory=dict)
    riskBands: Dict[str, Any] = Field(default_factory=dict)

class PatientProfile(BaseModel):
    patientId: str
    deviationCount: int = 0
    basePoints: int = 0
    repeatedModifier: int = 0
    multipleCategoryModifier: int = 0
    totalRiskScore: int = 0
    riskBand: str = "Low"
    compliancePercentage: float = 100.0
    status: str = "Active"
    deviations: List[Any] = Field(default_factory=list)

class SiteTrendHistoryPoint(BaseModel):
    week: str
    score: int
    isForecast: Optional[bool] = False

class SiteTrendPrediction(BaseModel):
    trend: str = "Stable"
    predictedScore: int = 0
    predictedBand: str = "Low"
    projectedChange: int = 0
    predictionRationale: str = ""
    history: List[SiteTrendHistoryPoint] = Field(default_factory=list)
    disclaimer: str = "Estimated trajectory based on 30-day deviation velocity & cluster density."

class SiteRiskSummary(BaseModel):
    siteId: str
    siteCode: str
    siteName: str
    location: str
    pi: str
    cra: str
    patientCount: int
    affectedPatientCount: int
    deviationCount: int
    rawRiskPoints: int
    score: int
    riskBand: str
    criticalCount: int
    majorCount: int
    minorCount: int
    adminCount: int
    riskDrivers: List[str] = Field(default_factory=list)
    categoryBreakdown: Dict[str, int] = Field(default_factory=dict)
    deviations: Optional[List[Any]] = None
    patientProfiles: Optional[List[PatientProfile]] = None
    trend: Optional[SiteTrendPrediction] = None

class TrialMetrics(BaseModel):
    trialId: str
    trialName: str
    phase: str
    totalPatients: int
    totalSites: int
    totalDeviations: int
    openDeviations: int
    criticalDeviations: int
    majorDeviations: int
    trialRiskScore: int
    trialRiskBand: str
    compliancePercentage: float
    highRiskSitesCount: int
    mediumRiskSitesCount: int
    siteRiskList: List[SiteRiskSummary] = Field(default_factory=list)
    executiveInsight: Optional[Dict[str, Any]] = None
