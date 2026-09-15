"""TrialGuard AI — Deterministic Compliance Engine.

Objective protocol compliance is deterministically validated by this engine.
Evaluates patient, visit, lab, and medication data against protocol specifications.
No LLM hallucinations — 100% auditable rule validation.
"""
from typing import List, Optional
from ..models.patient import Patient
from ..models.deviation import Deviation
from ..models.trial import ProtocolConfig
from ..data.protocol import PROTOCOL_CONFIG
from .explanation_service import generate_deviation_explanation

def evaluate_compliance(
    patients: List[Patient],
    protocol: ProtocolConfig = PROTOCOL_CONFIG
) -> List[Deviation]:
    deviations: List[Deviation] = []
    dev_counter = 1

    def generate_id() -> str:
        nonlocal dev_counter
        id_str = f"{dev_counter:03d}"
        dev_counter += 1
        return f"DEV-2026-{id_str}"

    for patient in patients:
        # 1. Check Visits: window violations & missed visits
        for visit in patient.visits:
            proto_visit = next((v for v in protocol.visits if v.visitNumber == visit.visitNumber), None)
            if not proto_visit:
                continue

            # Missed visit check
            if visit.status == "Missed" or visit.actualDay is None:
                did = generate_id()
                cat = "Visit Adherence"
                dtype = "MISSED_VISIT"
                sev = "Critical"
                expected = f"{proto_visit.name} must be conducted during study window ({proto_visit.windowDescription})"
                actual = f"{proto_visit.name} was marked as Missed; no clinical evaluations conducted"
                expl = (
                    f"Patient failed to present for scheduled {proto_visit.name}. "
                    f"Vital signs, safety labs, and endpoint measurements were omitted, "
                    f"compromising safety oversight and trial data completeness."
                )
                recom = "Execute patient re-contact protocol, document retention efforts, and assess patient for emergency safety evaluation."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 15),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-10T09:00:00Z",
                        status="Open",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )
                continue

            # Early / Late Window checks
            min_day = proto_visit.targetDay - proto_visit.windowDaysMinus
            max_day = proto_visit.targetDay + proto_visit.windowDaysPlus

            if visit.actualDay < min_day:
                days_early = min_day - visit.actualDay
                did = generate_id()
                cat = "Visit Window"
                dtype = "VISIT_TOO_EARLY"
                sev = "Minor"
                expected = f"{proto_visit.name} must occur on Day {proto_visit.targetDay} ± {proto_visit.windowDaysMinus} days (Day {min_day} – {max_day})"
                actual = f"Visit conducted on Day {visit.actualDay} ({days_early} day{'s' if days_early > 1 else ''} prior to protocol window)"
                expl = "The visit took place earlier than the permitted window. This shortens the observational duration between scheduled doses and safety assessments."
                recom = "Align subsequent visit scheduling with the baseline calendar and record visit timing discrepancy in eCRF."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 4),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-08T11:15:00Z",
                        status="In Review",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )
            elif visit.actualDay > max_day:
                days_late = visit.actualDay - max_day
                did = generate_id()
                cat = "Visit Window"
                dtype = "VISIT_WINDOW_EXCEEDED"
                sev = "Major"
                expected = f"{proto_visit.name} must occur on Day {proto_visit.targetDay} ± {proto_visit.windowDaysPlus} days (Day {min_day} – {max_day})"
                actual = f"Visit conducted on Day {visit.actualDay} ({days_late} day{'s' if days_late > 1 else ''} outside protocol window)"
                expl = f"{proto_visit.name} occurred on Day {visit.actualDay}, exceeding the allowable ±{proto_visit.windowDaysPlus}-day protocol limit. Endpoint and PK assessments outside specified windows impact per-protocol efficacy analysis."
                recom = "Issue site alert, confirm investigative drug supply continuity, and schedule immediate coordinator retraining on window management."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 10),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-12T14:30:00Z",
                        status="Open",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )

            # Check required procedures for completed visits
            if visit.status == "Completed":
                completed_procs = visit.proceduresCompleted or []
                for proc in proto_visit.requiredProcedures:
                    if proc not in completed_procs:
                        is_major = ("ecg" in proc.lower()) or ("biomarker" in proc.lower())
                        sev = "Major" if is_major else "Administrative"
                        weight = protocol.severityWeights.get(sev, 10 if is_major else 1)
                        did = generate_id()
                        cat = "Protocol Procedure"
                        dtype = "PROCEDURE_OMITTED"
                        expected = f"Mandatory procedure '{proc}' must be performed and recorded at {proto_visit.name}"
                        actual = f"Procedure '{proc}' was not documented as completed"
                        expl = f"Required protocol assessment ({proc}) was omitted at {proto_visit.name}. Missing diagnostic or safety data creates an audit finding and impairs safety profile verification."
                        recom = "Request site query for source document reconciliation; verify if test was performed but not yet entered into EDC."
                        clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                        deviations.append(
                            Deviation(
                                id=did,
                                patientId=patient.id,
                                siteId=patient.siteId,
                                siteName=patient.siteName,
                                category=cat,
                                type=dtype,
                                severity=sev,
                                severityWeight=weight,
                                expected=expected,
                                actual=actual,
                                detectedAt="2026-02-06T16:00:00Z",
                                status="In Review",
                                explanation=expl,
                                recommendedAction=recom,
                                clinicalExplanation=clinical_expl,
                            )
                        )

                # Check vital signs
                if visit.vitals is None or visit.vitals.bpSystolic is None:
                    did = generate_id()
                    cat = "Data Quality"
                    dtype = "INCOMPLETE_VITALS"
                    sev = "Administrative"
                    expected = f"Full vital signs (Blood Pressure, Heart Rate) must be recorded at {proto_visit.name}"
                    actual = "Vital signs record empty or missing systolic/diastolic values"
                    expl = "Cardiovascular trial protocol mandates hemodynamic monitoring at every clinic contact. Incomplete vitals data violates GCP source data verification guidelines."
                    recom = "Prompt site coordinator to query patient chart and complete EDC vital sign form."
                    clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                    deviations.append(
                        Deviation(
                            id=did,
                            patientId=patient.id,
                            siteId=patient.siteId,
                            siteName=patient.siteName,
                            category=cat,
                            type=dtype,
                            severity=sev,
                            severityWeight=protocol.severityWeights.get(sev, 1),
                            expected=expected,
                            actual=actual,
                            detectedAt="2026-02-07T10:45:00Z",
                            status="Open",
                            explanation=expl,
                            recommendedAction=recom,
                            clinicalExplanation=clinical_expl,
                        )
                    )

        # 2. Check Investigational Product Dosing Adherence
        ip_med = next((m for m in patient.medications if m.isInvestigational), None)
        if ip_med:
            target = protocol.investigationalProduct.targetDoseMg
            if ip_med.doseMg != target:
                is_severely_off = abs(ip_med.doseMg - target) >= 50
                sev = "Critical" if is_severely_off else "Major"
                diff = ip_med.doseMg - target
                diff_str = f"+{diff}" if diff > 0 else f"{diff}"
                did = generate_id()
                cat = "Dosing / IP Adherence"
                dtype = "INCORRECT_DOSE"
                expected = f"Investigational Product {protocol.investigationalProduct.name} dose must be {target} mg {protocol.investigationalProduct.frequency}"
                actual = f"Prescribed / dispensed dose was {ip_med.doseMg} mg {ip_med.frequency} ({diff_str} mg difference)"
                expl = f"Patient received {ip_med.doseMg} mg instead of the protocol-mandated {target} mg dose. Dose deviation directly threatens patient safety, alters therapeutic exposure, and invalidates statistical drug tolerability cohorts."
                recom = "Immediate medical monitor escalation; recall erroneous IP dispenser; clinical safety check for adverse events."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 15 if is_severely_off else 10),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-11T13:20:00Z",
                        status="Escalated",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )

        # 3. Check Prohibited Concomitant Medications
        for med in patient.medications:
            if med.isInvestigational:
                continue
            prohibited_match = next(
                (p for p in protocol.prohibitedMedications if p.name.lower() == med.drugName.lower()),
                None
            )
            if prohibited_match:
                did = generate_id()
                cat = "Prohibited Medication"
                dtype = "PROHIBITED_CONMED"
                sev = prohibited_match.severity
                expected = f"{prohibited_match.name} is strictly prohibited during trial participation"
                actual = f"Patient administered {med.drugName} {med.doseMg} mg ({med.frequency}) while on investigational therapy"
                expl = f"{prohibited_match.name} is explicitly prohibited by Section 5.3 of Protocol {protocol.protocolVersion}. {prohibited_match.rationale}"
                recom = "Immediately consult Principal Investigator and Medical Monitor; discontinue prohibited agent; perform expedited ECG/QTc evaluation."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 15),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-14T08:30:00Z",
                        status="Escalated",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )

        # 4. Check Mandatory Safety Labs: CBC required before Visit 3
        v3 = next((v for v in patient.visits if v.visitNumber == 3), None)
        if v3 and v3.status == "Completed":
            has_cbc = any(
                ("complete blood count" in lab.labName.lower() or "cbc" in lab.labName.lower())
                for lab in patient.labs
            )
            if not has_cbc:
                did = generate_id()
                cat = "Safety / Laboratory"
                dtype = "MISSING_MANDATORY_LAB"
                sev = "Major"
                expected = "Complete Blood Count (CBC) with differential must be completed and evaluated before or at Visit 3"
                actual = "Visit 3 completed without mandatory CBC safety panel collected"
                expl = "Cardio-X clinical protocol mandates hematologic monitoring at primary safety interval to detect potential bone marrow or hemoglobin alterations. Missing CBC violates safety stopping rules."
                recom = "Issue urgent laboratory re-draw order for patient; flag site lab liaison for failure to enforce mandatory pre-visit kit checklist."
                clinical_expl = generate_deviation_explanation(cat, dtype, expected, actual, sev, patient.id, patient.siteName)

                deviations.append(
                    Deviation(
                        id=did,
                        patientId=patient.id,
                        siteId=patient.siteId,
                        siteName=patient.siteName,
                        category=cat,
                        type=dtype,
                        severity=sev,
                        severityWeight=protocol.severityWeights.get(sev, 10),
                        expected=expected,
                        actual=actual,
                        detectedAt="2026-02-13T15:10:00Z",
                        status="Open",
                        explanation=expl,
                        recommendedAction=recom,
                        clinicalExplanation=clinical_expl,
                    )
                )

    return deviations
