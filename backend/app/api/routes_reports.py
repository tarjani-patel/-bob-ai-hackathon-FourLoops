"""Compliance & Executive Reporting Routes."""
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Request

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..services.compliance_engine import evaluate_compliance
from ..services.risk_engine import calculate_site_risk, calculate_trial_metrics
from ..services.rbac_service import get_current_user_context

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=Dict[str, Any])
def get_compliance_report(request: Request) -> Dict[str, Any]:
    """Generates a structured executive compliance and inspection readiness summary."""
    user_ctx = get_current_user_context(request)
    patients = store.get_patients()

    if not store.deviations:
        store.deviations = evaluate_compliance(patients, PROTOCOL_CONFIG)

    deviations = store.deviations
    trial_metrics = calculate_trial_metrics(PROTOCOL_CONFIG.sites, patients, deviations, PROTOCOL_CONFIG)
    site_risks = [calculate_site_risk(s, patients, deviations, PROTOCOL_CONFIG, include_details=False) for s in PROTOCOL_CONFIG.sites]
    site_risks.sort(key=lambda s: s.score, reverse=True)

    # Scoping for Site Investigator
    if user_ctx["role"] == "SITE_INVESTIGATOR" and user_ctx.get("site_id"):
        site_risks = [s for s in site_risks if s.siteId.upper() == user_ctx["site_id"].upper()]

    capas = store.get_capas()
    if user_ctx["role"] == "SITE_INVESTIGATOR" and user_ctx.get("site_id"):
        capas = [c for c in capas if c.siteId.upper() == user_ctx["site_id"].upper()]

    capa_status_counts = {}
    for c in capas:
        capa_status_counts[c.status] = capa_status_counts.get(c.status, 0) + 1

    return {
        "reportId": f"REP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "generatedBy": user_ctx["user_name"],
        "userRole": user_ctx["role"],
        "trial": {
            "id": PROTOCOL_CONFIG.trialId,
            "name": PROTOCOL_CONFIG.trialName,
            "phase": PROTOCOL_CONFIG.phase,
            "sponsor": PROTOCOL_CONFIG.sponsor,
            "protocolVersion": PROTOCOL_CONFIG.protocolVersion,
        },
        "metrics": trial_metrics.model_dump(),
        "siteRankings": [s.model_dump() for s in site_risks],
        "capaSummary": {
            "totalCapas": len(capas),
            "byStatus": capa_status_counts,
        },
        "regulatoryAuditReadiness": {
            "status": "Targeted Monitoring Recommended",
            "primaryConcern": "Site 03 Visit Window Adherence & Concomitant Drug Dispensation",
            "gcpStandard": "ICH GCP E6(R2) Section 5.18 & FDA 21 CFR 312",
        },
    }
