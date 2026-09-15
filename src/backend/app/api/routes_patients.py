"""Patient Records & eCRF Data Routes."""
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from ..data.store import store
from ..models.patient import Patient, PatientUpdate
from ..services.rbac_service import get_current_user_context, check_site_access, check_role_permission

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[Patient])
def get_patients(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter by clinical site ID (e.g. SITE-03)"),
    search: Optional[str] = Query(None, description="Search across patient ID or site name"),
    status: Optional[str] = Query(None, description="Filter by patient status (Active, Completed, Lost to Follow-up)")
) -> List[Patient]:
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    return store.get_patients(site_id=site_id, search=search, status=status)

@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: str, request: Request) -> Patient:
    user_ctx = get_current_user_context(request)
    patient = store.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found in trial cohort."
        )

    check_site_access(user_ctx, patient.siteId)
    return patient

@router.patch("/{patient_id}", response_model=Patient)
def update_patient_ecrf(patient_id: str, updates: PatientUpdate, request: Request) -> Patient:
    """Updates patient eCRF data. Restricted to Data Manager role in accordance with GCP electronic records guidance."""
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["DATA_MANAGER"], "eCRF Data Modification")

    existing_patient = store.get_patient(patient_id)
    if not existing_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{patient_id}' not found in trial cohort."
        )

    updated = store.update_patient(
        patient_id=patient_id,
        updates=updates,
        user=user_ctx["user_name"],
        role=user_ctx["role"],
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient eCRF record."
        )

    return updated
