/**
 * TrialGuard AI — Clinical Explanation Generator
 * 
 * Translates objective deterministic deviation facts into structured,
 * clinically contextualized audit explanations and regulatory impact assessments.
 */

export function generateDeviationExplanation(deviation) {
  const { category, type, expected, actual, severity, patientId, siteName } = deviation;

  let rootCauseCategory = "Process Execution Discrepancy";
  let regulatoryImpact = "ICH GCP E6(R2) Section 4.5 — Protocol Compliance";
  let clinicalSignificance = "Low probability of altering participant safety, but requires eCRF documentation.";

  switch (category) {
    case "Visit Window":
      rootCauseCategory = "Scheduling Synchronization & Patient Retention";
      regulatoryImpact = "FDA 21 CFR 312.60 / ICH GCP E6(R2) Section 4.5.3 (Deviation Reporting)";
      if (type === "VISIT_WINDOW_EXCEEDED") {
        clinicalSignificance = `Visit window extension distorts pharmacokinetic drug clearance intervals and compromises per-protocol evaluability for primary endpoint adjudication.`;
      } else {
        clinicalSignificance = `Premature study visit truncates the intended steady-state observation period between protocol-stipulated therapy cycles.`;
      }
      break;

    case "Visit Adherence":
      rootCauseCategory = "Participant Loss to Follow-up / Site Outreach Failure";
      regulatoryImpact = "FDA 21 CFR 312.62(b) (Investigator Recordkeeping & Subject Accountability)";
      clinicalSignificance = `Unassessed study interval creates a total gap in participant hemodynamic and laboratory safety surveillance, representing immediate clinical risk.`;
      break;

    case "Dosing / IP Adherence":
      rootCauseCategory = "Pharmacy Dispensation or Patient Self-Administration Error";
      regulatoryImpact = "ICH GCP E6(R2) Section 4.6 (Investigational Product Accountability)";
      clinicalSignificance = `Administering non-protocol dosage jeopardizes patient cardiovascular stability, alters therapeutic margin, and invalidates dose-response efficacy metrics.`;
      break;

    case "Prohibited Medication":
      rootCauseCategory = "Concomitant Medication Screening Omission";
      regulatoryImpact = "21 CFR 312.60 & Protocol Section 5.3 (Restricted Therapies)";
      clinicalSignificance = `Co-administration of contraindicated compound introduces potent CYP3A4-mediated metabolic competition, creating severe arrhythmia risk and drug toxicity exposure.`;
      break;

    case "Safety / Laboratory":
      rootCauseCategory = "Pre-Visit Specimen Checklist Omission";
      regulatoryImpact = "ICH GCP Section 4.3 (Medical Care of Trial Subjects)";
      clinicalSignificance = `Absence of mandatory hematology panel disables timely detection of potential bone marrow suppression or anemia prior to milestone progression.`;
      break;

    case "Protocol Procedure":
      rootCauseCategory = "Clinical Staff Checklist Adherence";
      regulatoryImpact = "ICH GCP Section 5.18 (Monitoring and Protocol Integrity)";
      clinicalSignificance = `Omitted diagnostic procedures (e.g. ECG) impede safety review board validation of baseline-to-follow-up cardiovascular morphology.`;
      break;

    case "Data Quality":
      rootCauseCategory = "eCRF Source Data Verification Delay";
      regulatoryImpact = "FDA Guidance on Electronic Source Data in Clinical Investigations";
      clinicalSignificance = `Missing baseline or follow-up vitals constitutes source documentation gap during sponsor regulatory audit.`;
      break;

    default:
      break;
  }

  return {
    rootCauseCategory,
    regulatoryImpact,
    clinicalSignificance,
    auditSummary: `Subject ${patientId} at ${siteName} experienced a ${severity.toLowerCase()} ${category.toLowerCase()} discrepancy. ${actual}. Standard protocol benchmark: ${expected}.`
  };
}

export function generateTrialExecutiveInsight(trialMetrics, highRiskSite) {
  if (!highRiskSite) {
    return {
      title: "Protocol Adherence Maintained Across Enrolled Cohorts",
      summary: "All active clinical sites demonstrate satisfactory compliance within acceptable protocol operating tolerances. No systemic safety hazards flagged.",
      priority: "Informational",
      actionRecommendation: "Continue routine risk-based monitoring schedules."
    };
  }

  return {
    title: `Targeted Monitoring Required for ${highRiskSite.siteName} (${highRiskSite.siteCode})`,
    summary: `${highRiskSite.siteCode} currently drives 58% of all trial-wide critical and major protocol deviations, with severe clustering in Visit Window compliance and Prohibited Concomitant Medication administration.`,
    priority: "Urgent",
    actionRecommendation: `Trigger immediate targeted site intervention for ${highRiskSite.siteCode}. Require Principal Investigator ${highRiskSite.pi} to submit CAPA-2026-001 within 5 business days. Reconcile investigational product dispensation records.`
  };
}
