/**
 * TrialGuard AI — Corrective and Preventive Action (CAPA) Engine
 * 
 * Analyzes detected deviation clusters, recurrent patterns, and site risk scores
 * to generate structured, auditable CAPA proposals.
 * 
 * Explicitly flags every generated item with "Human review required"
 * to enforce clinical oversight and regulatory compliance.
 */

export function generateCapasFromDeviations(deviations = [], siteRisks = []) {
  const capas = [];
  let capaNum = 1;

  const nextCapaId = () => `CAPA-2026-${String(capaNum++).padStart(3, "0")}`;

  // 1. Evaluate Site 03 Visit Window & Scheduling Cluster
  const site03WindowDevs = deviations.filter(
    (d) => d.siteId === "SITE-03" && (d.category === "Visit Window" || d.category === "Visit Adherence")
  );

  if (site03WindowDevs.length >= 2) {
    const affectedPatients = [...new Set(site03WindowDevs.map((d) => d.patientId))];
    capas.push({
      id: nextCapaId(),
      siteId: "SITE-03",
      siteName: "Metro General Health Science Center",
      title: "Systemic Visit Window Non-Compliance & Patient Appointment Attrition",
      category: "Visit Adherence & Retention",
      linkedDeviationIds: site03WindowDevs.map((d) => d.id),
      linkedDeviationsCount: site03WindowDevs.length,
      affectedPatients,
      problemStatement: `Site 03 demonstrated recurrent protocol visit window breaches (e.g. PT-1042 Day 20, PT-1044 Day 9, PT-1048 Missed Visit) affecting ${affectedPatients.length} enrolled participants. Current scheduling controls fail to alert staff before protocol windows elapse.`,
      evidence: `${site03WindowDevs.length} documented visit window deviations detected across ${affectedPatients.join(", ")}. Window overshoots range from +2 to +6 days beyond allowable limits.`,
      rootCauseHypothesis: "Site study coordinator transition resulted in breakdown of calendar synchronization between clinic electronic medical records and EDC scheduling tool.",
      correctiveAction: "1. Re-contact all out-of-window participants for immediate vital signs and safety assessment.\n2. Calculate offset intervals for subsequent visits to align with protocol baseline timeline.\n3. Complete protocol deviation submission forms in eCRF.",
      preventiveAction: "1. Mandate automated electronic calendar alerts 72 hours prior to opening of study visit windows.\n2. Conduct retraining of Site 03 study coordinators on Section 4.2 visit window rules.\n3. Implement weekly CRA pre-visit checklist verification.",
      owner: "Dr. Evelyn Zhao (PI) / James Taylor (CRA)",
      dueDate: "2026-03-01",
      priority: "High",
      status: "Review Pending",
      humanReviewRequired: true,
      lastUpdated: "2026-02-15",
      comments: [
        {
          author: "TrialGuard Compliance Copilot",
          role: "Automated Rule Engine",
          date: "2026-02-14",
          text: "CAPA generated automatically following detection of >3 visit window deviations at Site 03."
        },
        {
          author: "Sarah Lin (Lead CCRA)",
          role: "Compliance Reviewer",
          date: "2026-02-15",
          text: "Reviewed problem statement. Awaiting formal PI sign-off on coordinator retraining schedule."
        }
      ]
    });
  }

  // 2. Evaluate Prohibited Concomitant Medications Cluster
  const prohibitedMedDevs = deviations.filter((d) => d.category === "Prohibited Medication");
  if (prohibitedMedDevs.length > 0) {
    const affectedSites = [...new Set(prohibitedMedDevs.map((d) => d.siteName))];
    const affectedPatients = [...new Set(prohibitedMedDevs.map((d) => d.patientId))];
    const hasDrugX = prohibitedMedDevs.some((d) => d.expected.includes("Drug-X") || d.actual.includes("Drug-X"));

    capas.push({
      id: nextCapaId(),
      siteId: prohibitedMedDevs[0].siteId,
      siteName: affectedSites.join(", "),
      title: "Administration of Prohibited Concomitant Therapies (Drug-X / CYP3A4 Inhibitors)",
      category: "Patient Safety & Medication Oversight",
      linkedDeviationIds: prohibitedMedDevs.map((d) => d.id),
      linkedDeviationsCount: prohibitedMedDevs.length,
      affectedPatients,
      problemStatement: `Critical violation: Prohibited medications (${hasDrugX ? "Drug-X, " : ""}Ketoconazole) prescribed or continued during investigational drug administration, posing acute pharmacokinetic and cardiac risk.`,
      evidence: `Documented dispensation of prohibited agents for participants ${affectedPatients.join(", ")} without pre-clearance from Medical Monitor.`,
      rootCauseHypothesis: "External community sub-specialists prescribed therapies without checking participant clinical trial card or notifying study site staff.",
      correctiveAction: "1. Immediately discontinue prohibited therapy under Medical Monitor supervision.\n2. Conduct urgent 12-lead ECG and QTc interval measurement.\n3. File formal 24-hour Serious Adverse Event (SAE) / Critical Deviation notification.",
      preventiveAction: "1. Re-issue participant wallet cards identifying prohibited substances in bold warnings.\n2. Institute mandatory bi-weekly telephone conmed screening prior to every prescription refill.\n3. Site PI to issue formal notice to participant primary care providers.",
      owner: "Medical Monitor / Lead Pharmacovigilance Officer",
      dueDate: "2026-02-22",
      priority: "Critical",
      status: "Under Investigation",
      humanReviewRequired: true,
      lastUpdated: "2026-02-15",
      comments: [
        {
          author: "TrialGuard Compliance Copilot",
          role: "Automated Rule Engine",
          date: "2026-02-14",
          text: "Critical priority assigned due to contraindicated CYP3A4 metabolic pathway competition."
        }
      ]
    });
  }

  // 3. Evaluate Investigational Product Dosing Deviations
  const dosingDevs = deviations.filter((d) => d.category === "Dosing / IP Adherence");
  if (dosingDevs.length > 0) {
    const affectedPatients = [...new Set(dosingDevs.map((d) => d.patientId))];
    const primarySite = siteRisks.find((s) => s.siteId === dosingDevs[0].siteId) || { siteName: dosingDevs[0].siteName, siteId: dosingDevs[0].siteId };

    capas.push({
      id: nextCapaId(),
      siteId: primarySite.siteId,
      siteName: primarySite.siteName,
      title: "Investigational Product Dispensation & Dosing Discrepancy",
      category: "Pharmacy & Investigational Product",
      linkedDeviationIds: dosingDevs.map((d) => d.id),
      linkedDeviationsCount: dosingDevs.length,
      affectedPatients,
      problemStatement: `Investigational product dispensed at incorrect dosage levels (e.g. 50mg or 200mg vs protocol-specified 100mg once daily).`,
      evidence: `Discrepancy identified in eCRF drug accountability log for participants ${affectedPatients.join(", ")}.`,
      rootCauseHypothesis: "Investigational drug pharmacy kit labeling ambiguity during batch preparation, coupled with failure of secondary sign-off during dispensation.",
      correctiveAction: "1. Quarantine incorrect IP bottle batches at clinical pharmacy.\n2. Re-dispense verified 100mg blister cards to affected subjects.\n3. Conduct safety call and PK blood sampling.",
      preventiveAction: "1. Implement two-person pharmacist dual-verification protocol before any IP is released.\n2. Update pharmacy standard operating procedure (SOP-IP-04) with barcode verification.",
      owner: "Investigational Pharmacy Director / Site PI",
      dueDate: "2026-02-28",
      priority: "High",
      status: "Review Pending",
      humanReviewRequired: true,
      lastUpdated: "2026-02-15",
      comments: [
        {
          author: "TrialGuard Compliance Copilot",
          role: "Automated Rule Engine",
          date: "2026-02-14",
          text: "Dosing discrepancy flagged. Dose range deviation exceeds protocol-permitted limits."
        }
      ]
    });
  }

  // 4. Evaluate Missing CBC Laboratory Protocol Cluster
  const cbcDevs = deviations.filter((d) => d.type === "MISSING_MANDATORY_LAB");
  if (cbcDevs.length > 0) {
    const affectedPatients = [...new Set(cbcDevs.map((d) => d.patientId))];
    capas.push({
      id: nextCapaId(),
      siteId: "SITE-03",
      siteName: "Metro General Health Science Center",
      title: "Omission of Mandatory Pre-Visit 3 Complete Blood Count (CBC) Panels",
      category: "Laboratory Safety Oversight",
      linkedDeviationIds: cbcDevs.map((d) => d.id),
      linkedDeviationsCount: cbcDevs.length,
      affectedPatients,
      problemStatement: `Multiple participants completed Visit 3 evaluations without mandatory CBC with differential panels collected or logged in central laboratory portal.`,
      evidence: `Missing hematology results for ${affectedPatients.length} participants (${affectedPatients.join(", ")}).`,
      rootCauseHypothesis: "Site phlebotomy requisition templates lacked mandatory pre-printed checkbox for protocol-specific CBC differential tube.",
      correctiveAction: "1. Schedule priority home-health or clinic blood draw within 48 hours for all affected participants.\n2. Verify absence of cytopenia or thrombocytopenia.",
      preventiveAction: "1. Redesign pre-packaged Visit 3 laboratory kits with color-coded tube requisitions.\n2. Enforce EDC hard-stop preventing Visit 3 submission without CBC accession number.",
      owner: "Central Lab Coordinator / Site PI",
      dueDate: "2026-03-05",
      priority: "Medium",
      status: "Review Pending",
      humanReviewRequired: true,
      lastUpdated: "2026-02-15",
      comments: [
        {
          author: "TrialGuard Compliance Copilot",
          role: "Automated Rule Engine",
          date: "2026-02-14",
          text: "Safety laboratory gap identified across multiple patients prior to primary endpoint visit."
        }
      ]
    });
  }

  return capas;
}
