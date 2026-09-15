"""TrialGuard AI — Role-Based Access Control (RBAC) & Scoping Service."""
from typing import Optional, Dict, Any, List
from fastapi import Request, HTTPException, status

NORMALIZED_ROLES = {
    "cra": "CRA",
    "clinical research associate": "CRA",
    "lead ccra": "CRA",
    "investigator": "SITE_INVESTIGATOR",
    "site_investigator": "SITE_INVESTIGATOR",
    "site investigator": "SITE_INVESTIGATOR",
    "pi": "SITE_INVESTIGATOR",
    "data_manager": "DATA_MANAGER",
    "data manager": "DATA_MANAGER",
    "clinical data manager": "DATA_MANAGER",
    "sponsor": "SPONSOR",
    "study manager": "SPONSOR",
    "study_manager": "SPONSOR",
    "sponsor / study manager": "SPONSOR",
}

def normalize_role(raw_role: Optional[str]) -> str:
    if not raw_role:
        return "CRA"  # Default prototype role
    clean = raw_role.strip().lower()
    return NORMALIZED_ROLES.get(clean, "CRA")

def normalize_site_code(site_str: Optional[str]) -> str:
    if not site_str:
        return ""
    clean = site_str.strip().upper()
    digits = "".join([c for c in clean if c.isdigit()])
    if digits:
        return f"SITE-{int(digits):02d}"
    return clean

def get_current_user_context(request: Request) -> Dict[str, Any]:
    raw_role = (
        request.headers.get("X-Demo-Role")
        or request.headers.get("x-demo-role")
        or request.headers.get("X-User-Role")
        or request.headers.get("x-user-role")
    )
    site_id = (
        request.headers.get("X-Demo-Site")
        or request.headers.get("x-demo-site")
        or request.headers.get("X-User-Site")
        or request.headers.get("x-user-site")
        or request.headers.get("X-Site-Id")
        or request.headers.get("x-site-id")
    )
    user_name = (
        request.headers.get("X-Demo-User")
        or request.headers.get("x-demo-user")
        or request.headers.get("X-User-Name")
        or request.headers.get("x-user-name")
    )

    normalized_role = normalize_role(raw_role)

    # If role is Site Investigator and no site is explicitly passed, default to SITE-03 for realistic testing
    effective_site = site_id.strip() if site_id else None
    if normalized_role == "SITE_INVESTIGATOR" and not effective_site:
        effective_site = "SITE-03"

    effective_user = user_name.strip() if user_name else f"User ({normalized_role})"

    return {
        "raw_role": raw_role,
        "role": normalized_role,
        "site_id": effective_site,
        "user_name": effective_user,
    }

def check_site_access(user_ctx: Dict[str, Any], requested_site_id: str) -> None:
    """Enforces site isolation for Site Investigators."""
    if user_ctx["role"] == "SITE_INVESTIGATOR":
        assigned_site = user_ctx.get("site_id")
        if assigned_site and requested_site_id:
            if normalize_site_code(assigned_site) != normalize_site_code(requested_site_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"Access Denied: Site Investigator is strictly scoped to assigned facility {assigned_site}. "
                        f"Cross-site access to {requested_site_id} is prohibited under 21 CFR 312 / GCP isolation."
                    )
                )

def check_role_permission(user_ctx: Dict[str, Any], allowed_roles: List[str], action_desc: str) -> None:
    """Verifies if the current user context holds one of the required clinical roles."""
    if user_ctx["role"] not in allowed_roles:
        roles_str = ", ".join(allowed_roles)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Access Denied: Action '{action_desc}' requires one of the following roles: [{roles_str}]. "
                f"Current active role is '{user_ctx['role']}'."
            )
        )
