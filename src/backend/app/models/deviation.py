from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, model_validator

class SeverityEnum(str, Enum):
    CRITICAL = "Critical"
    MAJOR = "Major"
    MINOR = "Minor"
    ADMINISTRATIVE = "Administrative"

class DeviationStatusEnum(str, Enum):
    OPEN = "Open"
    IN_REVIEW = "In Review"
    ESCALATED = "Escalated"
    RESOLVED = "Resolved"

class DeviationExplanation(BaseModel):
    rootCauseCategory: str
    regulatoryImpact: str
    clinicalSignificance: str
    auditSummary: str

class Deviation(BaseModel):
    id: str
    patientId: str
    siteId: str
    siteName: str
    category: str
    type: str
    severity: str
    severityWeight: int
    expected: str
    actual: str
    detectedAt: str
    status: str = "Open"
    explanation: str
    recommendedAction: str
    siteCode: Optional[str] = None
    ruleViolated: Optional[str] = None
    date: Optional[str] = None
    evidence: Optional[str] = None
    clinicalExplanation: Optional[DeviationExplanation] = None

    @model_validator(mode="after")
    def populate_aliases(self):
        if not self.siteCode:
            self.siteCode = self.siteId
        if not self.ruleViolated:
            self.ruleViolated = self.expected
        if not self.date:
            self.date = self.detectedAt.split("T")[0] if "T" in self.detectedAt else self.detectedAt
        if not self.evidence:
            self.evidence = self.actual
        return self
