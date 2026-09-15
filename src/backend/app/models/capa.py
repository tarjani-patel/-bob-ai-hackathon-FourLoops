from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, model_validator

class CAPAStatusEnum(str, Enum):
    DRAFT = "Draft"
    PENDING_REVIEW = "Pending Review"
    REVIEW_PENDING = "Review Pending"
    APPROVED = "Approved"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    REJECTED = "Rejected"
    CLOSED = "Closed"

class CAPAPriorityEnum(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

CAPAStatus = CAPAStatusEnum
CAPAPriority = CAPAPriorityEnum

class CAPAComment(BaseModel):
    author: str
    role: str
    date: str
    text: str

class CAPAActionItem(BaseModel):
    step: str
    targetDays: int = 14
    owner: str = "Assigned Lead"
    verification: str = "Source Data Verification"

class CAPA(BaseModel):
    id: str
    siteId: str
    siteName: str
    title: str
    category: str
    linkedDeviationIds: List[str] = Field(default_factory=list)
    linkedDeviationsCount: int = 0
    affectedPatients: List[str] = Field(default_factory=list)
    patientId: Optional[str] = None
    problemStatement: str
    evidence: str
    rootCauseHypothesis: str
    correctiveAction: str
    preventiveAction: str
    owner: str = "Principal Investigator"
    suggestedOwner: Optional[str] = None
    dueDate: str = "2026-03-15"
    priority: str = "High"
    status: str = "Pending Review"
    rejectionReason: Optional[str] = None
    humanReviewRequired: bool = True
    createdDate: str = "2026-02-14"
    lastUpdated: str = "2026-02-15"
    comments: List[CAPAComment] = Field(default_factory=list)
    # UI compatibility structures
    history: Optional[List[CAPAComment]] = None
    evidenceList: Optional[List[str]] = None
    rootCauses: Optional[List[str]] = None
    actions: Optional[List[CAPAActionItem]] = None

    @model_validator(mode="after")
    def populate_capa_aliases(self):
        if not self.suggestedOwner:
            self.suggestedOwner = self.owner
        if not self.history:
            self.history = self.comments
        if not self.comments and self.history:
            self.comments = self.history
        if not self.linkedDeviationsCount:
            self.linkedDeviationsCount = len(self.linkedDeviationIds)
        if not self.patientId and self.affectedPatients:
            self.patientId = self.affectedPatients[0]

        # Populate structured evidence list if absent
        if not self.evidenceList and self.evidence:
            self.evidenceList = [line.strip() for line in self.evidence.split("\n") if line.strip()]
            if not self.evidenceList:
                self.evidenceList = [self.evidence]

        # Populate structured 5-whys root causes list if absent
        if not self.rootCauses and self.rootCauseHypothesis:
            self.rootCauses = [line.strip() for line in self.rootCauseHypothesis.split("\n") if line.strip()]
            if not self.rootCauses:
                self.rootCauses = [self.rootCauseHypothesis]

        # Populate actions list if absent
        if not self.actions:
            self.actions = [
                CAPAActionItem(
                    step="Execute immediate corrective protocol actions",
                    targetDays=7,
                    owner=self.owner,
                    verification="Clinical Quality Verification"
                ),
                CAPAActionItem(
                    step="Implement preventive monitoring & workflow checklist",
                    targetDays=14,
                    owner=self.owner,
                    verification="Audit Trail Sign-Off"
                )
            ]
        return self

class CAPACreate(BaseModel):
    siteId: str
    siteName: str
    title: str
    category: str
    linkedDeviationIds: List[str] = Field(default_factory=list)
    affectedPatients: List[str] = Field(default_factory=list)
    patientId: Optional[str] = None
    problemStatement: str
    evidence: str
    rootCauseHypothesis: str
    correctiveAction: str
    preventiveAction: str
    owner: str
    dueDate: str
    priority: str = "High"
    status: str = "Pending Review"

class CAPAUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    suggestedOwner: Optional[str] = None
    dueDate: Optional[str] = None
    rootCauseHypothesis: Optional[str] = None
    correctiveAction: Optional[str] = None
    preventiveAction: Optional[str] = None
    newComment: Optional[str] = None

class CAPAApproveRequest(BaseModel):
    comment: Optional[str] = "CAPA formally approved and authorized under 21 CFR 312 GCP governance."

class CAPARejectRequest(BaseModel):
    reason: Optional[str] = None
    rejectionReason: Optional[str] = None
    comment: Optional[str] = None

    @model_validator(mode="after")
    def populate_reason(self):
        if not self.reason and self.rejectionReason:
            self.reason = self.rejectionReason
        elif not self.rejectionReason and self.reason:
            self.rejectionReason = self.reason
        return self

class CAPACommentRequest(BaseModel):
    text: str
    author: Optional[str] = None
    role: Optional[str] = None
