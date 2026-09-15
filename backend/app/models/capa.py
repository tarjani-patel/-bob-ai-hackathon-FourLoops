from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field

class CAPAStatusEnum(str, Enum):
    REVIEW_PENDING = "Review Pending"
    UNDER_INVESTIGATION = "Under Investigation"
    APPROVED = "Approved"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"

class CAPAPriorityEnum(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class CAPAComment(BaseModel):
    author: str
    role: str
    date: str
    text: str

class CAPA(BaseModel):
    id: str
    siteId: str
    siteName: str
    title: str
    category: str
    linkedDeviationIds: List[str] = Field(default_factory=list)
    linkedDeviationsCount: int = 0
    affectedPatients: List[str] = Field(default_factory=list)
    problemStatement: str
    evidence: str
    rootCauseHypothesis: str
    correctiveAction: str
    preventiveAction: str
    owner: str
    dueDate: str
    priority: str = "High"
    status: str = "Review Pending"
    humanReviewRequired: bool = True
    lastUpdated: str
    comments: List[CAPAComment] = Field(default_factory=list)

class CAPACreate(BaseModel):
    siteId: str
    siteName: str
    title: str
    category: str
    linkedDeviationIds: List[str] = Field(default_factory=list)
    affectedPatients: List[str] = Field(default_factory=list)
    problemStatement: str
    evidence: str
    rootCauseHypothesis: str
    correctiveAction: str
    preventiveAction: str
    owner: str
    dueDate: str
    priority: str = "High"

class CAPAUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    dueDate: Optional[str] = None
    correctiveAction: Optional[str] = None
    preventiveAction: Optional[str] = None
    newComment: Optional[str] = None
