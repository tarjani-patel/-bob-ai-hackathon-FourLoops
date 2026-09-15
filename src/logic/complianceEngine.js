/**
 * TrialGuard AI — Deterministic Compliance Engine
 * 
 * Objective protocol compliance is deterministically validated by this engine.
 * Evaluates patient, visit, lab, and medication data against protocol specifications.
 * No LLM hallucinations — 100% auditable rule validation.
 */

import { PROTOCOL_CONFIG } from "../data/protocolConfig.js";

export function evaluateCompliance(patients = [], protocol = PROTOCOL_CONFIG) {
  const deviations = [];
  let devCounter = 1;

  const generateId = () => {
    const idStr = String(devCounter++).padStart(3, "0");
    return `DEV-2026-${idStr}`;
  };

  patients.forEach((patient) => {
    // 1. Check Visits: window violations & missed visits
    patient.visits.forEach((visit) => {
      const protoVisit = protocol.visits.find((v) => v.visitNumber === visit.visitNumber);
      if (!protoVisit) return;

      // Missed visit check
      if (visit.status === "Missed" || visit.actualDay === null) {
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Visit Adherence",
          type: "MISSED_VISIT",
          severity: "Critical",
          severityWeight: protocol.severityWeights.Critical,
          expected: `${protoVisit.name} must be conducted during study window (${protoVisit.windowDescription})`,
          actual: `${protoVisit.name} was marked as Missed; no clinical evaluations conducted`,
          detectedAt: "2026-02-10T09:00:00Z",
          status: "Open",
          explanation: `Patient failed to present for scheduled ${protoVisit.name}. Vital signs, safety labs, and endpoint measurements were omitted, compromising safety oversight and trial data completeness.`,
          recommendedAction: "Execute patient re-contact protocol, document retention efforts, and assess patient for emergency safety evaluation."
        });
        return;
      }

      // Early / Late Window checks
      const minDay = protoVisit.targetDay - protoVisit.windowDaysMinus;
      const maxDay = protoVisit.targetDay + protoVisit.windowDaysPlus;

      if (visit.actualDay < minDay) {
        const daysEarly = minDay - visit.actualDay;
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Visit Window",
          type: "VISIT_TOO_EARLY",
          severity: "Minor",
          severityWeight: protocol.severityWeights.Minor,
          expected: `${protoVisit.name} must occur on Day ${protoVisit.targetDay} ± ${protoVisit.windowDaysMinus} days (Day ${minDay} – ${maxDay})`,
          actual: `Visit conducted on Day ${visit.actualDay} (${daysEarly} day${daysEarly > 1 ? "s" : ""} prior to protocol window)`,
          detectedAt: "2026-02-08T11:15:00Z",
          status: "In Review",
          explanation: `The visit took place earlier than the permitted window. This shortens the observational duration between scheduled doses and safety assessments.`,
          recommendedAction: "Align subsequent visit scheduling with the baseline calendar and record visit timing discrepancy in eCRF."
        });
      } else if (visit.actualDay > maxDay) {
        const daysLate = visit.actualDay - maxDay;
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Visit Window",
          type: "VISIT_WINDOW_EXCEEDED",
          severity: "Major",
          severityWeight: protocol.severityWeights.Major,
          expected: `${protoVisit.name} must occur on Day ${protoVisit.targetDay} ± ${protoVisit.windowDaysPlus} days (Day ${minDay} – ${maxDay})`,
          actual: `Visit conducted on Day ${visit.actualDay} (${daysLate} day${daysLate > 1 ? "s" : ""} outside protocol window)`,
          detectedAt: "2026-02-12T14:30:00Z",
          status: "Open",
          explanation: `${protoVisit.name} occurred on Day ${visit.actualDay}, exceeding the allowable ±${protoVisit.windowDaysPlus}-day protocol limit. Endpoint and PK assessments outside specified windows impact per-protocol efficacy analysis.`,
          recommendedAction: "Issue site alert, confirm investigative drug supply continuity, and schedule immediate coordinator retraining on window management."
        });
      }

      // Check required procedures for completed visits
      if (visit.status === "Completed") {
        protoVisit.requiredProcedures.forEach((proc) => {
          if (!visit.proceduresCompleted || !visit.proceduresCompleted.includes(proc)) {
            // Check if it is a major procedure (ECG) or administrative
            const isMajor = proc.toLowerCase().includes("ecg") || proc.toLowerCase().includes("biomarker");
            deviations.push({
              id: generateId(),
              patientId: patient.id,
              siteId: patient.siteId,
              siteName: patient.siteName,
              category: "Protocol Procedure",
              type: "PROCEDURE_OMITTED",
              severity: isMajor ? "Major" : "Administrative",
              severityWeight: isMajor ? protocol.severityWeights.Major : protocol.severityWeights.Administrative,
              expected: `Mandatory procedure '${proc}' must be performed and recorded at ${protoVisit.name}`,
              actual: `Procedure '${proc}' was not documented as completed`,
              detectedAt: "2026-02-06T16:00:00Z",
              status: "In Review",
              explanation: `Required protocol assessment (${proc}) was omitted at ${protoVisit.name}. Missing diagnostic or safety data creates an audit finding and impairs safety profile verification.`,
              recommendedAction: "Request site query for source document reconciliation; verify if test was performed but not yet entered into EDC."
            });
          }
        });

        // Check for missing vital signs data
        if (!visit.vitals || visit.vitals.bpSystolic == null) {
          deviations.push({
            id: generateId(),
            patientId: patient.id,
            siteId: patient.siteId,
            siteName: patient.siteName,
            category: "Data Quality",
            type: "INCOMPLETE_VITALS",
            severity: "Administrative",
            severityWeight: protocol.severityWeights.Administrative,
            expected: `Full vital signs (Blood Pressure, Heart Rate) must be recorded at ${protoVisit.name}`,
            actual: "Vital signs record empty or missing systolic/diastolic values",
            detectedAt: "2026-02-07T10:45:00Z",
            status: "Open",
            explanation: `Cardiovascular trial protocol mandates hemodynamic monitoring at every clinic contact. Incomplete vitals data violates GCP source data verification guidelines.`,
            recommendedAction: "Prompt site coordinator to query patient chart and complete EDC vital sign form."
          });
        }
      }
    });

    // 2. Check Investigational Product Dosing Adherence
    const ipMed = patient.medications.find((m) => m.isInvestigational);
    if (ipMed) {
      const target = protocol.investigationalProduct.targetDoseMg;
      if (ipMed.doseMg !== target) {
        const isSeverelyOff = Math.abs(ipMed.doseMg - target) >= 50;
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Dosing / IP Adherence",
          type: "INCORRECT_DOSE",
          severity: isSeverelyOff ? "Critical" : "Major",
          severityWeight: isSeverelyOff ? protocol.severityWeights.Critical : protocol.severityWeights.Major,
          expected: `Investigational Product ${protocol.investigationalProduct.name} dose must be ${target} mg ${protocol.investigationalProduct.frequency}`,
          actual: `Prescribed / dispensed dose was ${ipMed.doseMg} mg ${ipMed.frequency} (${ipMed.doseMg > target ? "+" : ""}${ipMed.doseMg - target} mg difference)`,
          detectedAt: "2026-02-11T13:20:00Z",
          status: "Escalated",
          explanation: `Patient received ${ipMed.doseMg} mg instead of the protocol-mandated ${target} mg dose. Dose deviation directly threatens patient safety, alters therapeutic exposure, and invalidates statistical drug tolerability cohorts.`,
          recommendedAction: "Immediate medical monitor escalation; recall erroneous IP dispenser; clinical safety check for adverse events."
        });
      }
    }

    // 3. Check Prohibited Concomitant Medications
    patient.medications.forEach((med) => {
      if (med.isInvestigational) return;
      const prohibitedMatch = protocol.prohibitedMedications.find(
        (p) => p.name.toLowerCase() === med.drugName.toLowerCase()
      );
      if (prohibitedMatch) {
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Prohibited Medication",
          type: "PROHIBITED_CONMED",
          severity: prohibitedMatch.severity,
          severityWeight: protocol.severityWeights[prohibitedMatch.severity] || 15,
          expected: `${prohibitedMatch.name} is strictly prohibited during trial participation`,
          actual: `Patient administered ${med.drugName} ${med.doseMg} mg (${med.frequency}) while on investigational therapy`,
          detectedAt: "2026-02-14T08:30:00Z",
          status: "Escalated",
          explanation: `${prohibitedMatch.name} is explicitly prohibited by Section 5.3 of Protocol ${protocol.protocolVersion}. ${prohibitedMatch.rationale}`,
          recommendedAction: "Immediately consult Principal Investigator and Medical Monitor; discontinue prohibited agent; perform expedited ECG/QTc evaluation."
        });
      }
    });

    // 4. Check Mandatory Safety Labs: CBC required before Visit 3
    const v3 = patient.visits.find((v) => v.visitNumber === 3);
    if (v3 && v3.status === "Completed") {
      const hasCBC = patient.labs.some(
        (lab) => lab.labName.toLowerCase().includes("complete blood count") || lab.labName.toLowerCase().includes("cbc")
      );
      if (!hasCBC) {
        deviations.push({
          id: generateId(),
          patientId: patient.id,
          siteId: patient.siteId,
          siteName: patient.siteName,
          category: "Safety / Laboratory",
          type: "MISSING_MANDATORY_LAB",
          severity: "Major",
          severityWeight: protocol.severityWeights.Major,
          expected: "Complete Blood Count (CBC) with differential must be completed and evaluated before or at Visit 3",
          actual: "Visit 3 completed without mandatory CBC safety panel collected",
          detectedAt: "2026-02-13T15:10:00Z",
          status: "Open",
          explanation: `Cardio-X clinical protocol mandates hematologic monitoring at primary safety interval to detect potential bone marrow or hemoglobin alterations. Missing CBC violates safety stopping rules.`,
          recommendedAction: "Issue urgent laboratory re-draw order for patient; flag site lab liaison for failure to enforce mandatory pre-visit kit checklist."
        });
      }
    }
  });

  return deviations;
}
