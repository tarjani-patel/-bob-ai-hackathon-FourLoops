"""Clinical Audit Trail Routes."""
from typing import List, Optional
from fastapi import APIRouter, Request, Query

from ..data.store import store
from ..models.audit import AuditEvent
from ..services.rbac_service import get_current_user_context, check_site_access

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditEvent])
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
