"""Trial & Protocol Metadata Routes."""
from typing import List, Dict, Any
from fastapi import APIRouter, Request, HTTPException, status

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.trial import SiteInfo, ProtocolConfig
from ..services.rbac_service import get_current_user_context, check_site_access

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
