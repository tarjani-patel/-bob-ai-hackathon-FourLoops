from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator

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
    currentRisk: Optional[int] = None
    predictedRisk: Optional[int] = None
    predictionDirection: Optional[str] = "Stable"
    explanation: Optional[str] = None
    history: List[SiteTrendHistoryPoint] = Field(default_factory=list)
    disclaimer: str = "Estimated trajectory based on 30-day deviation velocity & cluster density."

class TopRiskDriverItem(BaseModel):
    driver: str
    severity: Optional[str] = "Major"
    count: Optional[int] = 1

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
    repeatedDeviationCount: int = 0
    numberOfCategories: int = 0
    categoryCount: int = 0
    recentDeviationCount: int = 0
    riskDrivers: List[str] = Field(default_factory=list)
    topDrivers: List[TopRiskDriverItem] = Field(default_factory=list)
    topRiskDrivers: List[TopRiskDriverItem] = Field(default_factory=list)
    categoryBreakdown: Dict[str, int] = Field(default_factory=dict)
    deviations: Optional[List[Any]] = None
    patientProfiles: Optional[List[PatientProfile]] = None
    trend: Optional[SiteTrendPrediction] = None
    # Compatibility aliases
    riskLevel: Optional[str] = None
    totalDeviations: Optional[int] = None
    affectedPatients: Optional[int] = None
    piName: Optional[str] = None
    criticalDeviations: Optional[int] = None
    trendDirection: Optional[str] = None
    trendChangePercent: Optional[str] = None
    projectedChange: Optional[int] = None
    currentRisk: Optional[int] = None
    predictedRisk: Optional[int] = None
    predictedScore: Optional[int] = None
    predictedBand: Optional[str] = None
    predictionDirection: Optional[str] = None
    predictionRationale: Optional[str] = None
    disclaimer: Optional[str] = None

    @model_validator(mode="after")
    def populate_site_aliases(self):
        if not self.riskLevel:
            self.riskLevel = self.riskBand
        if self.totalDeviations is None:
            self.totalDeviations = self.deviationCount
        if self.affectedPatients is None:
            self.affectedPatients = self.affectedPatientCount
        if not self.piName:
            self.piName = self.pi
        if self.criticalDeviations is None:
            self.criticalDeviations = self.criticalCount
        if self.currentRisk is None:
            self.currentRisk = self.score
        if not self.categoryCount:
            self.categoryCount = self.numberOfCategories or len(self.categoryBreakdown)
        if not self.numberOfCategories:
            self.numberOfCategories = self.categoryCount

        if self.trend:
            if not self.trendDirection:
                self.trendDirection = self.trend.trend
            if self.projectedChange is None:
                self.projectedChange = self.trend.projectedChange
            if not self.trendChangePercent:
                sign = "+" if self.trend.projectedChange > 0 else ""
                self.trendChangePercent = f"{sign}{self.trend.projectedChange}" if self.trend.projectedChange != 0 else "0"
            if self.predictedScore is None:
                self.predictedScore = self.trend.predictedScore
            if self.predictedRisk is None:
                self.predictedRisk = self.trend.predictedScore
            if not self.predictedBand:
                self.predictedBand = self.trend.predictedBand
            if not self.predictionDirection:
                self.predictionDirection = self.trend.predictionDirection or ("Increasing" if self.trend.trend == "Worsening" else "Decreasing" if self.trend.trend == "Improving" else "Stable")
            if not self.predictionRationale:
                self.predictionRationale = self.trend.predictionRationale
            if not self.disclaimer:
                self.disclaimer = self.trend.disclaimer

        if not self.topDrivers and self.riskDrivers:
            self.topDrivers = [TopRiskDriverItem(driver=d) for d in self.riskDrivers]
        if not self.topRiskDrivers and self.topDrivers:
            self.topRiskDrivers = self.topDrivers
        return self

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
