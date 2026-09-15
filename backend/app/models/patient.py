from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Vitals(BaseModel):
    bpSystolic: Optional[int] = None
    bpDiastolic: Optional[int] = None
    heartRate: Optional[int] = None

class PatientVisit(BaseModel):
    visitNumber: int
    scheduledDay: int
    actualDay: Optional[int] = None
    date: Optional[str] = None
    status: str = "Completed"  # "Completed" | "Missed" | "Scheduled"
    proceduresCompleted: List[str] = Field(default_factory=list)
    vitals: Optional[Vitals] = None

class PatientLab(BaseModel):
    labName: str
    date: str
    status: str = "Completed"
    value: str = "Normal"
    unit: str = "cells/mcL"

class PatientMedication(BaseModel):
    drugName: str
    doseMg: int
    frequency: str
    isInvestigational: bool = False
    startDate: str
    prescriber: Optional[str] = None

class Patient(BaseModel):
    id: str
    siteId: str
    siteName: str
    age: int
    gender: str
    status: str = "Active"
    enrollmentDate: str
    visits: List[PatientVisit] = Field(default_factory=list)
    labs: List[PatientLab] = Field(default_factory=list)
    medications: List[PatientMedication] = Field(default_factory=list)

class PatientUpdate(BaseModel):
    """Fields allowed to be modified in an eCRF data management correction."""
    status: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    visits: Optional[List[PatientVisit]] = None
    labs: Optional[List[PatientLab]] = None
    medications: Optional[List[PatientMedication]] = None
    reasonForChange: Optional[str] = "Routine Data Management eCRF discrepancy resolution"
