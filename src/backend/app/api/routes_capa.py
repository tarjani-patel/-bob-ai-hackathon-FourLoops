"""Corrective and Preventive Action (CAPA) Routes."""
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.capa import (
    CAPA,
    CAPACreate,
    CAPAUpdate,
    CAPAApproveRequest,
    CAPARejectRequest,
    CAPACommentRequest,
)
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
        store.capas = generate_capas_from_deviations(store.deviations, site_risks, existing_capas=store.capas)

@router.get("", response_model=List[CAPA])
def get_capas(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter CAPAs by site ID (e.g. SITE-03)"),
    status: Optional[str] = Query(None, description="Filter by status (Draft, Pending Review, Approved, In Progress, Completed, Rejected)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
) -> List[CAPA]:
    ensure_capas()
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator: restricted to assigned site
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
    # Proposing a CAPA can be initiated by CRA, Data Manager, or Sponsor
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

    # Status transition permissions:
    if updates.status:
        target_status = updates.status.strip().title()
        # Approval or Rejection is strictly reserved for Sponsor / Study Manager
        if target_status in ["Approved", "Rejected"]:
            check_role_permission(user_ctx, ["SPONSOR"], f"Set CAPA status to {target_status}")

        # Site Investigator cannot unilaterally mark CAPA Completed or Approved
        if user_ctx["role"] == "SITE_INVESTIGATOR" and target_status in ["Approved", "Completed"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Site Investigator cannot set CAPA status to '{target_status}'. Submit a site action plan instead."
            )

    # Operational field edits:
    # If Site Investigator, check they only update permitted fields on their own site's CAPA
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        if updates.priority or updates.owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Reassigning owner or changing CAPA priority is restricted to Lead CRA or Sponsor."
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

@router.post("/{capa_id}/approve", response_model=CAPA)
def approve_capa(capa_id: str, request: Request, body: Optional[CAPAApproveRequest] = None) -> CAPA:
    """Formal CAPA approval. Strictly restricted to Sponsor / Study Manager role under 21 CFR 312."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["SPONSOR"], "Approve CAPA Proposal")

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    comment = body.comment if body else None
    approved = store.approve_capa(
        capa_id=capa_id,
        comment=comment,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )
    if not approved:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve CAPA."
        )

    return approved

@router.post("/{capa_id}/reject", response_model=CAPA)
def reject_capa(capa_id: str, request: Request, body: CAPARejectRequest) -> CAPA:
    """Formal CAPA rejection with mandatory clinical reason. Strictly restricted to Sponsor."""
    ensure_capas()
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["SPONSOR"], "Reject CAPA Proposal")

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    if not body.reason or not body.reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A substantive rejection reason is required for regulatory auditability."
        )

    rejected = store.reject_capa(
        capa_id=capa_id,
        reason=body.reason.strip(),
        comment=body.comment,
        user=user_ctx["user_name"],
        role=user_ctx["role"]
    )
    if not rejected:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject CAPA."
        )

    return rejected

@router.post("/{capa_id}/comments", response_model=CAPA)
def add_capa_comment(capa_id: str, request: Request, body: CAPACommentRequest) -> CAPA:
    """Adds a regulatory reviewer or investigator comment to a CAPA audit thread."""
    ensure_capas()
    user_ctx = get_current_user_context(request)

    capa = store.get_capa(capa_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAPA with ID '{capa_id}' not found."
        )

    check_site_access(user_ctx, capa.siteId)

    if not body.text or not body.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment text cannot be empty."
        )

    author = body.author or user_ctx["user_name"]
    role = body.role or user_ctx["role"]

    updated = store.add_capa_comment(
        capa_id=capa_id,
        text=body.text.strip(),
        user=author,
        role=role
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add comment to CAPA."
        )

    return updated
