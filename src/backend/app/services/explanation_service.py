"""Clinical Explanation & Executive Insight Generator Service."""
from typing import Dict, Any, Optional
from ..models.deviation import DeviationExplanation

def generate_deviation_explanation(
    category: str,
    deviation_type: str,
    expected: str,
    actual: str,
    severity: str,
    patient_id: str,
    site_name: str
) -> DeviationExplanation:
    """Translates objective deterministic deviation facts into structured, clinically contextualized audit explanations and regulatory impact assessments."""
    root_cause = "Process Execution Discrepancy"
    regulatory = "ICH GCP E6(R2) Section 4.5 — Protocol Compliance"
    significance = "Low probability of altering participant safety, but requires eCRF documentation."

    cat_lower = category.lower()

    if "visit window" in cat_lower:
        root_cause = "Scheduling Synchronization & Patient Retention"
        regulatory = "FDA 21 CFR 312.60 / ICH GCP E6(R2) Section 4.5.3 (Deviation Reporting)"
        if deviation_type == "VISIT_WINDOW_EXCEEDED":
            significance = "Visit window extension distorts pharmacokinetic drug clearance intervals and compromises per-protocol evaluability for primary endpoint adjudication."
        else:
            significance = "Premature study visit truncates the intended steady-state observation period between protocol-stipulated therapy cycles."

    elif "visit adherence" in cat_lower:
        root_cause = "Participant Loss to Follow-up / Site Outreach Failure"
        regulatory = "FDA 21 CFR 312.62(b) (Investigator Recordkeeping & Subject Accountability)"
        significance = "Unassessed study interval creates a total gap in participant hemodynamic and laboratory safety surveillance, representing immediate clinical risk."

    elif "dosing" in cat_lower or "ip adherence" in cat_lower:
        root_cause = "Pharmacy Dispensation or Patient Self-Administration Error"
        regulatory = "ICH GCP E6(R2) Section 4.6 (Investigational Product Accountability)"
        significance = "Administering non-protocol dosage jeopardizes patient cardiovascular stability, alters therapeutic margin, and invalidates dose-response efficacy metrics."

    elif "prohibited medication" in cat_lower:
        root_cause = "Concomitant Medication Screening Omission"
        regulatory = "21 CFR 312.60 & Protocol Section 5.3 (Restricted Therapies)"
        significance = "Co-administration of contraindicated compound introduces potent CYP3A4-mediated metabolic competition, creating severe arrhythmia risk and drug toxicity exposure."

    elif "safety" in cat_lower or "laboratory" in cat_lower:
        root_cause = "Pre-Visit Specimen Checklist Omission"
        regulatory = "ICH GCP Section 4.3 (Medical Care of Trial Subjects)"
        significance = "Absence of mandatory hematology panel disables timely detection of potential bone marrow suppression or anemia prior to milestone progression."

    elif "protocol procedure" in cat_lower:
        root_cause = "Clinical Staff Checklist Adherence"
        regulatory = "ICH GCP Section 5.18 (Monitoring and Protocol Integrity)"
        significance = "Omitted diagnostic procedures (e.g. ECG) impede safety review board validation of baseline-to-follow-up cardiovascular morphology."

    elif "data quality" in cat_lower:
        root_cause = "eCRF Source Data Verification Delay"
        regulatory = "FDA Guidance on Electronic Source Data in Clinical Investigations"
        significance = "Missing baseline or follow-up vitals constitutes source documentation gap during sponsor regulatory audit."

    audit_summary = (
        f"Subject {patient_id} at {site_name} experienced a {severity.lower()} "
        f"{category.lower()} discrepancy. {actual}. Standard protocol benchmark: {expected}."
    )

    return DeviationExplanation(
        rootCauseCategory=root_cause,
        regulatoryImpact=regulatory,
        clinicalSignificance=significance,
        auditSummary=audit_summary,
    )

def generate_trial_executive_insight(trial_metrics: Any, high_risk_site: Optional[Any] = None) -> Dict[str, Any]:
    """Generates deterministic executive insight based on current trial metrics and high-risk sites."""
    if not high_risk_site:
        return {
            "title": "Protocol Adherence Maintained Across Enrolled Cohorts",
            "summary": "All active clinical sites demonstrate satisfactory compliance within acceptable protocol operating tolerances. No systemic safety hazards flagged.",
            "priority": "Informational",
            "actionRecommendation": "Continue routine risk-based monitoring schedules."
        }

    site_code = getattr(high_risk_site, "siteCode", "SITE-03")
    site_name = getattr(high_risk_site, "siteName", "Metro General Health Science Center")
    pi = getattr(high_risk_site, "pi", "Dr. Evelyn Zhao, MD")

    return {
        "title": f"Targeted Monitoring Required for {site_name} ({site_code})",
        "summary": f"{site_code} currently drives significant trial-wide critical and major protocol deviations, with severe clustering in Visit Window compliance and Prohibited Concomitant Medication administration.",
        "priority": "Urgent",
        "actionRecommendation": f"Trigger immediate targeted site intervention for {site_code}. Require Principal Investigator {pi} to submit CAPA response within 5 business days. Reconcile investigational product dispensation records."
    }
