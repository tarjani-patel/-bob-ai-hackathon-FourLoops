"""Compliance Analysis Execution Route."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Request, status

from ..data.store import store
from ..data.protocol import PROTOCOL_CONFIG
from ..models.analysis import ComplianceAnalyzeRequest, ComplianceAnalyzeResponse
from ..services.compliance_engine import evaluate_compliance
from ..services.risk_engine import calculate_site_risk, calculate_trial_metrics
from ..services.capa_engine import generate_capas_from_deviations
from ..services.rbac_service import get_current_user_context

router = APIRouter(prefix="/api/compliance", tags=["Compliance Engine"])

@router.post("/analyze", response_model=ComplianceAnalyzeResponse, status_code=status.HTTP_200_OK)
def run_compliance_analysis(
    request: Request,
    body: Optional[ComplianceAnalyzeRequest] = None
) -> ComplianceAnalyzeResponse:
    """Executes the deterministic compliance analysis across the patient cohort.

    Evaluates visit window breaches, dosing discrepancies, prohibited conmeds,
    and missing safety laboratory evaluations. Recalculates risk rankings and
    formulates auditable CAPA proposals.
    """
    user_ctx = get_current_user_context(request)
    all_patients = store.get_patients()

    # 1. Deterministically evaluate compliance
    deviations = evaluate_compliance(all_patients, PROTOCOL_CONFIG)
    store.deviations = deviations

    # 2. Compute site risks
    site_risks = [
        calculate_site_risk(s, all_patients, deviations, PROTOCOL_CONFIG)
        for s in PROTOCOL_CONFIG.sites
    ]

    # 3. Generate CAPAs (preserving existing approved/active CAPAs)
    new_capas = generate_capas_from_deviations(deviations, site_risks, existing_capas=store.capas)
    store.capas = new_capas

    # 4. Compute overall trial metrics
    trial_metrics = calculate_trial_metrics(PROTOCOL_CONFIG.sites, all_patients, deviations, PROTOCOL_CONFIG)

    now_iso = datetime.now(timezone.utc).isoformat()
    crit_count = len([d for d in deviations if d.severity == "Critical"])
    major_count = len([d for d in deviations if d.severity == "Major"])
    minor_count = len([d for d in deviations if d.severity == "Minor"])
    admin_count = len([d for d in deviations if d.severity == "Administrative"])

    # 5. Record audit trail event
    audit_event = store.record_audit(
        action="COMPLIANCE_ANALYSIS_EXECUTED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=body.siteId if body else None,
        target_id="CT-101",
        details={
            "analyzedPatients": len(all_patients),
            "deviationsDetected": len(deviations),
            "criticalCount": crit_count,
            "majorCount": major_count,
            "trialRiskScore": trial_metrics.trialRiskScore,
            "capasGenerated": len(new_capas),
        }
    )

    response = ComplianceAnalyzeResponse(
        analysisTimestamp=now_iso,
        analyzedPatientsCount=len(all_patients),
        deviationsDetectedCount=len(deviations),
        criticalDeviationsCount=crit_count,
        majorDeviationsCount=major_count,
        minorDeviationsCount=minor_count,
        adminDeviationsCount=admin_count,
        capasGeneratedCount=len(new_capas),
        trialRiskScore=trial_metrics.trialRiskScore,
        trialRiskBand=trial_metrics.trialRiskBand,
        compliancePercentage=trial_metrics.compliancePercentage,
        highRiskSitesCount=trial_metrics.highRiskSitesCount,
        auditEventId=audit_event.id,
        message="Protocol compliance scan completed successfully. Real risk scores and CAPA recommendations updated."
    )

    store.last_analysis = response
    return response
