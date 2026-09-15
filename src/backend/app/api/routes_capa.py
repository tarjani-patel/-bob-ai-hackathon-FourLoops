"""Corrective and Preventive Action (CAPA) Routes."""
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.capa import CAPA, CAPACreate, CAPAUpdate
from ..services.compliance_engine import evaluate_compliance
from ..services.risk_engine import calculate_site_risk
from ..services.capa_engine import generate_capas_from_deviations
from ..services.rbac_service import get_current_user_context, check_site_access, check_role_permission

router = APIRouter(prefix="/api/capas", tags=["CAPA Engine"])

def ensure_capas():
    if not store.capas:
        if not store.deviations:
            all_patients = store.get_patients()
            store.deviations = evaluate_compliance(all_patients, PROTOCOL_CONFIG)
        patients = store.get_patients()
        site_risks = [calculate_site_risk(s, patients, store.deviations, PROTOCOL_CONFIG) for s in PROTOCOL_CONFIG.sites]
        store.capas = generate_capas_from_deviations(store.deviations, site_risks)

@router.get("", response_model=List[CAPA])
def get_capas(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter CAPAs by site ID (e.g. SITE-03)"),
    status: Optional[str] = Query(None, description="Filter by status (Review Pending, Under Investigation, Approved, Closed)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
) -> List[CAPA]:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    return store.get_capas(site_id=site_id, status=status, priority=priority)

@router.get("/{capa_id}", response_model=CAPA)
def get_capa(capa_id: str, request: Request) -> CAPA:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA proposal with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)
    return capa

@router.post("", response_model=CAPA, status_code=status.HTTP_201_CREATED)
def create_capa(capa_in: CAPACreate, request: Request) -> CAPA:
    user_ctx = get_current_user_context(request)
    # Proposing a CAPA can be done by CRA, Data Manager, or Sponsor
    check_role_permission(user_ctx, ["CRA", "DATA_MANAGER", "SPONSOR"], "Create CAPA Proposal")

    return store.create_capa(
        capa_input=capa_in,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )

@router.patch("/{capa_id}", response_model=CAPA)
def update_capa(capa_id: str, updates: CAPAUpdate, request: Request) -> CAPA:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA proposal with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)

    # Formal approval rule: Only Sponsor / Study Manager can sign off as "Approved"
    if updates.status and updates.status.lower() == "approved":
        if user_ctx["role"] != "SPONSOR":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Formal CAPA sign-off and regulatory approval is restricted to Sponsor / Study Manager role."
            )

    updated = store.update_capa(
        capa_id=capa_id,
        updates=updates,
        user=user_ctx["user_name"],
        role=user_ctx["role"],
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update CAPA."
        )

    return updated
