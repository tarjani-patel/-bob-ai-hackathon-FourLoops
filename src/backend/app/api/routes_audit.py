"""Clinical Audit Trail Routes."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Request, Query

from ..data.store import store
from ..models.audit import AuditEvent
from ..services.rbac_service import get_current_user_context, check_site_access

class SessionEventRequest(BaseModel):
    action: str
    details: Optional[Dict[str, Any]] = None

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditEvent])
@router.get("-logs", response_model=List[AuditEvent])
def get_audit_trail(
    request: Request,
    site_id: Optional[str] = Query(None, description="Filter audit logs by site ID"),
    role: Optional[str] = Query(None, description="Filter audit logs by actor role"),
    action: Optional[str] = Query(None, description="Filter by action type (e.g. COMPLIANCE_ANALYSIS_EXECUTED, PATIENT_ECRF_UPDATE)"),
    limit: int = Query(50, ge=1, le=200, description="Max audit entries to return"),
) -> List[AuditEvent]:
    user_ctx = get_current_user_context(request)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if site_id and assigned_site and site_id.upper() != assigned_site.upper():
            check_site_access(user_ctx, site_id)
        site_id = assigned_site

    return store.get_audit_logs(site_id=site_id, role=role, action=action, limit=limit)


@router.post("/session-event", response_model=AuditEvent)
def record_session_event(req: SessionEventRequest, request: Request) -> AuditEvent:
    """Records frontend session lifecycle events (login, logout, role switch) in the audit trail."""
    user_ctx = get_current_user_context(request)
    details = dict(req.details or {})
    details.setdefault("userEmail", user_ctx.get("user_id"))
    return store.record_audit(
        action=req.action,
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=user_ctx.get("site_id"),
        target_id=user_ctx.get("user_id") or "SESSION",
        details=details
    )

