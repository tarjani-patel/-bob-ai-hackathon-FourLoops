"""Risk Calculation & Scoring Routes."""
from typing import List
from fastapi import APIRouter, Request, HTTPException, status

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.trial import TrialMetrics, SiteRiskSummary, PatientProfile
from ..services.compliance_engine import evaluate_compliance
from ..services.risk_engine import (
    calculate_patient_risk,
    calculate_site_risk,
    calculate_trial_metrics,
)
from ..services.rbac_service import get_current_user_context, check_site_access

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

def ensure_deviations():
    if not store.deviations:
        all_patients = store.get_patients()
        store.deviations = evaluate_compliance(all_patients, PROTOCOL_CONFIG)

@router.get("/trial", response_model=TrialMetrics)
def get_trial_risk() -> TrialMetrics:
    ensure_deviations()
    patients = store.get_patients()
    return calculate_trial_metrics(PROTOCOL_CONFIG.sites, patients, store.deviations, PROTOCOL_CONFIG)

@router.get("/sites", response_model=List[SiteRiskSummary])
def get_sites_risk(request: Request) -> List[SiteRiskSummary]:
    ensure_deviations()
    user_ctx = get_current_user_context(request)
    patients = store.get_patients()

    site_risks = [
        calculate_site_risk(s, patients, store.deviations, PROTOCOL_CONFIG, include_details=True)
        for s in PROTOCOL_CONFIG.sites
    ]
    site_risks.sort(key=lambda s: s.score, reverse=True)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR" and user_ctx.get("site_id"):
        site_risks = [s for s in site_risks if s.siteId.upper() == user_ctx["site_id"].upper()]

    return site_risks

@router.get("/sites/{site_id}", response_model=SiteRiskSummary)
def get_site_risk_detail(site_id: str, request: Request) -> SiteRiskSummary:
    ensure_deviations()
    user_ctx = get_current_user_context(request)
    check_site_access(user_ctx, site_id)

    site = next((s for s in PROTOCOL_CONFIG.sites if s.id.upper() == site_id.upper()), None)
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site '{site_id}' not found."
        )

    patients = store.get_patients()
    return calculate_site_risk(site, patients, store.deviations, PROTOCOL_CONFIG, include_details=True)

@router.get("/patients/{patient_id}", response_model=PatientProfile)
def get_patient_risk_detail(patient_id: str, request: Request) -> PatientProfile:
    ensure_deviations()
    user_ctx = get_current_user_context(request)

    patient = store.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{patient_id}' not found."
        )

    check_site_access(user_ctx, patient.siteId)
    return calculate_patient_risk(patient, store.deviations, PROTOCOL_CONFIG)
