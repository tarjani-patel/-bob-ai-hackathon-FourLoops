from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AuditEvent(BaseModel):
    id: str
    timestamp: str
    action: str  # e.g. "COMPLIANCE_EVALUATION", "PATIENT_ECRF_UPDATE", "CAPA_STATUS_CHANGE", "CAPA_CREATED"
    performedBy: str
    role: str
    siteId: Optional[str] = None
    targetId: Optional[str] = None  # patientId, capaId, deviationId
    details: Dict[str, Any] = Field(default_factory=dict)
