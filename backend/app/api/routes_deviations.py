"""Protocol Deviations Query Routes."""
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.deviation import Deviation
from ..services.compliance_engine import evaluate_compliance
from ..services.rbac_service import get_current_user_context, check_site_access

router = APIRouter(prefix="/api/deviations", tags=["Deviations"])

def ensure_deviations_evaluated():
    """Ensure deviations exist in store by running evaluation on current patient state if empty."""
    if not store.deviations:
        all_patients = store.get_patients()
        detected = evaluate_compliance(all_patients, PROTOCOL_CONFIG)
        store.deviations = detected

@router.get("", response_model=List[Deviation])
def get_deviations(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter deviations by site ID (e.g. SITE-03)"),
    patient_id: Optional[str] = Query(None, description="Filter deviations by patient ID (e.g. PT-1042)"),
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, Major, Minor, Administrative"),
    category: Optional[str] = Query(None, description="Filter by deviation category"),
    status: Optional[str] = Query(None, description="Filter by status: Open, In Review, Escalated, Resolved"),
) -> List[Deviation]:
    ensure_deviations_evaluated()
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    return store.get_deviations(
        site_id=site_id,
        patient_id=patient_id,
        severity=severity,
        category=category,
        status=status,
    )

@router.get("/{deviation_id}", response_model=Deviation)
def get_deviation(deviation_id: str, request: Request) -> Deviation:
    ensure_deviations_evaluated()
    user_ctx = get_current_user_context(request)

    dev = store.get_deviation(deviation_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deviation with ID '{deviation_id}' not found."
        )

    check_site_access(user_ctx, dev.siteId)
    return dev
