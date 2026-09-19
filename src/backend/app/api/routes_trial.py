"""Trial & Protocol Metadata Routes."""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException, status

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.trial import SiteInfo, ProtocolConfig
from ..services.rbac_service import get_current_user_context, check_site_access, check_role_permission

class ProtocolUpdateRequest(BaseModel):
    v1Window: Optional[int] = None
    v2Window: Optional[int] = None
    v3Window: Optional[int] = None
    targetDose: Optional[int] = None
    autoFlagProhibited: Optional[bool] = None
    requireCbcBeforeV3: Optional[bool] = None

router = APIRouter(tags=["Trial & Protocol"])

@router.get("/api/health")
def health_check() -> Dict[str, str]:
    return {
        "status": "ok",
        "app": "TrialGuard AI",
        "version": "1.0.0",
        "trial": "CT-101 (Cardio-X Phase III)",
    }

@router.get("/api/trial")
def get_trial_info() -> Dict[str, Any]:
    patients = store.get_patients()
    return {
        "trialId": PROTOCOL_CONFIG.trialId,
        "trialName": PROTOCOL_CONFIG.trialName,
        "indication": PROTOCOL_CONFIG.indication,
        "phase": PROTOCOL_CONFIG.phase,
        "sponsor": PROTOCOL_CONFIG.sponsor,
        "protocolVersion": PROTOCOL_CONFIG.protocolVersion,
        "lastAmendmentDate": PROTOCOL_CONFIG.lastAmendmentDate,
        "irbApprovalNumber": PROTOCOL_CONFIG.irbApprovalNumber,
        "targetEnrollment": PROTOCOL_CONFIG.targetEnrollment,
        "enrolledPatients": len(patients),
        "totalSites": len(PROTOCOL_CONFIG.sites),
        "investigationalProduct": PROTOCOL_CONFIG.investigationalProduct.model_dump(),
    }

@router.get("/api/protocol", response_model=ProtocolConfig)
def get_protocol() -> ProtocolConfig:
    return PROTOCOL_CONFIG

@router.patch("/api/protocol", response_model=ProtocolConfig)
def update_protocol_tolerances(req: ProtocolUpdateRequest, request: Request) -> ProtocolConfig:
    """Updates visit window tolerances and protocol rules. Restricted to SPONSOR role."""
    user_ctx = get_current_user_context(request)
    check_role_permission(user_ctx, ["SPONSOR"], "Update Protocol Tolerances")

    # Update Visit Windows
    if req.v1Window is not None:
        v1 = next((v for v in PROTOCOL_CONFIG.visits if v.visitNumber == 1), None)
        if v1:
            v1.windowDaysMinus = req.v1Window
            v1.windowDaysPlus = req.v1Window
            v1.windowDescription = f"Day 1 ± {req.v1Window} days (Day {1 - req.v1Window} to Day {1 + req.v1Window})"

    if req.v2Window is not None:
        v2 = next((v for v in PROTOCOL_CONFIG.visits if v.visitNumber == 2), None)
        if v2:
            v2.windowDaysMinus = req.v2Window
            v2.windowDaysPlus = req.v2Window
            v2.windowDescription = f"Day 14 ± {req.v2Window} days (Day {14 - req.v2Window} to Day {14 + req.v2Window})"

    if req.v3Window is not None:
        v3 = next((v for v in PROTOCOL_CONFIG.visits if v.visitNumber == 3), None)
        if v3:
            v3.windowDaysMinus = req.v3Window
            v3.windowDaysPlus = req.v3Window
            v3.windowDescription = f"Day 28 ± {req.v3Window} days (Day {28 - req.v3Window} to Day {28 + req.v3Window})"

    # Update Target Dose
    if req.targetDose is not None:
        PROTOCOL_CONFIG.investigationalProduct.targetDoseMg = req.targetDose

    PROTOCOL_CONFIG.lastAmendmentDate = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Synchronize store.protocol
    store.protocol = PROTOCOL_CONFIG

    # Authoritative 21 CFR Part 11 Audit Trail record
    store.record_audit(
        action="PROTOCOL_TOLERANCES_UPDATED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        target_id="CT-101",
        details={
            "v1Window": req.v1Window,
            "v2Window": req.v2Window,
            "v3Window": req.v3Window,
            "targetDose": req.targetDose,
            "autoFlagProhibited": req.autoFlagProhibited,
            "requireCbcBeforeV3": req.requireCbcBeforeV3,
            "message": f"Study Manager updated window tolerances (V1: ±{req.v1Window or 3}d, V2: ±{req.v2Window or 3}d, V3: ±{req.v3Window or 5}d) and dosing rules."
        }
    )

    return PROTOCOL_CONFIG


@router.get("/api/sites", response_model=List[SiteInfo])
def get_sites(request: Request) -> List[SiteInfo]:
    user_ctx = get_current_user_context(request)
    sites = list(PROTOCOL_CONFIG.sites)

    # Compute actual dynamic patient counts per site
    patients = store.get_patients()
    for site in sites:
        site.patientCount = len([p for p in patients if p.siteId == site.id])

    # Scope for site investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR" and user_ctx.get("site_id"):
        sites = [s for s in sites if s.id.upper() == user_ctx["site_id"].upper()]

    return sites

@router.get("/api/sites/{site_id}", response_model=SiteInfo)
def get_site(site_id: str, request: Request) -> SiteInfo:
    user_ctx = get_current_user_context(request)
    check_site_access(user_ctx, site_id)

    site = next((s for s in PROTOCOL_CONFIG.sites if s.id.upper() == site_id.upper()), None)
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinical site {site_id} not registered in protocol CT-101."
        )

    site_copy = SiteInfo(**site.model_dump())
    site_copy.patientCount = len(store.get_patients(site_id=site.id))
    return site_copy
