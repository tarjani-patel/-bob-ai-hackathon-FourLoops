"""Comprehensive Unit and Integration Test Suite for TrialGuard AI Deterministic Compliance Engine.

Validates:
1. Valid visits pass without deviation
2. Late visit triggers VISIT_WINDOW_EXCEEDED (Major, 10 pts)
3. Early visit triggers VISIT_TOO_EARLY (Minor, 4 pts)
4. Missed visit triggers MISSED_VISIT (Critical, 15 pts)
5. Incorrect dose triggers INCORRECT_DOSE (Critical 15 pts or Major 10 pts)
6. Prohibited concomitant medication triggers PROHIBITED_CONMED (Drug-X, Ketoconazole, Erythromycin, St. John's Wort)
7. Missing CBC before Visit 3 triggers MISSING_MANDATORY_LAB (Major, 10 pts)
8. Missing procedures trigger PROCEDURE_OMITTED (Major for ECG/biomarker, Administrative for others)
9. Risk scoring modifiers: Repeated deviation (+5) and Multiple category (+5)
10. Site 03 naturally emerges as Rank #1 highest risk without hardcoding
11. CAPA candidates generated for high-severity deviations with humanReviewRequired=True
12. Dynamic Re-Analysis: Edit patient dose (100mg -> 50mg) -> analyze -> deviation appears -> revert (50mg -> 100mg) -> analyze -> deviation resolves
"""
import sys
import os

# Add paths
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for d in [root_dir, src_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

from fastapi.testclient import TestClient
from src.backend.app.main import app
from src.backend.app.data.store import store
from src.backend.app.data.protocol import PROTOCOL_CONFIG
from src.backend.app.models.patient import Patient, PatientVisit, PatientLab, PatientMedication, Vitals
from src.backend.app.services.compliance_engine import evaluate_compliance
from src.backend.app.services.risk_engine import calculate_patient_risk, calculate_site_risk
from src.backend.app.services.capa_engine import generate_capas_from_deviations

client = TestClient(app)

def create_compliant_patient(patient_id="TEST-001", site_id="SITE-01") -> Patient:
    """Creates a 100% compliant patient with all required visits, labs, vitals, procedures, and meds."""
    return Patient(
        id=patient_id,
        siteId=site_id,
        siteName="Mayo Clinic Research Center",
        age=58,
        gender="Male",
        status="Active",
        enrollmentDate="2026-01-05",
        visits=[
            PatientVisit(
                visitNumber=1,
                scheduledDay=1,
                actualDay=1,
                date="2026-01-05",
                status="Completed",
                proceduresCompleted=[
                    "Informed Consent Form (ICF)",
                    "Vital Signs (BP, HR, Resp, Temp)",
                    "12-Lead Baseline ECG",
                    "Physical Examination",
                    "Baseline Safety Chemistry & Hematology",
                    "Investigational Product Dispensation",
                ],
                vitals=Vitals(bpSystolic=120, bpDiastolic=80, heartRate=70),
            ),
            PatientVisit(
                visitNumber=2,
                scheduledDay=14,
                actualDay=14,
                date="2026-01-19",
                status="Completed",
                proceduresCompleted=[
                    "Vital Signs",
                    "Concomitant Medication Review",
                    "Adverse Event (AE) Assessment",
                    "Drug Accountability & Adherence Check",
                    "Serum Electrolytes & Renal Function",
                ],
                vitals=Vitals(bpSystolic=122, bpDiastolic=78, heartRate=72),
            ),
            PatientVisit(
                visitNumber=3,
                scheduledDay=28,
                actualDay=28,
                date="2026-02-02",
                status="Completed",
                proceduresCompleted=[
                    "Vital Signs",
                    "12-Lead Follow-up ECG",
                    "Complete Blood Count (CBC) with Differential",
                    "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
                    "Primary Efficacy Endpoint Evaluation",
                    "Drug Accountability & Reconciliation",
                ],
                vitals=Vitals(bpSystolic=118, bpDiastolic=76, heartRate=68),
            ),
        ],
        labs=[
            PatientLab(
                labName="Complete Blood Count (CBC) with Differential",
                date="2026-02-01",
                status="Completed",
                value="Normal (WBC 6.5, Hgb 14.2, Plt 250)",
            ),
            PatientLab(
                labName="Serum Electrolytes & Renal Function",
                date="2026-01-19",
                status="Completed",
                value="Normal",
            ),
        ],
        medications=[
            PatientMedication(
                drugName="Cardio-X",
                doseMg=100,
                frequency="Once daily (QD)",
                isInvestigational=True,
                startDate="2026-01-05",
            ),
            PatientMedication(
                drugName="Aspirin",
                doseMg=81,
                frequency="QD",
                isInvestigational=False,
                startDate="2025-06-01",
            ),
        ],
    )

def test_suite():
    print("=" * 70)
    print("STARTING DETERMINISTIC COMPLIANCE ENGINE TEST SUITE")
    print("=" * 70)
    passed = 0
    total = 0

    def check(condition: bool, test_name: str):
        nonlocal passed, total
        total += 1
        if condition:
            print(f"  [PASS] {test_name}")
            passed += 1
        else:
            print(f"  [FAIL] {test_name}")
            assert False, f"Test failed: {test_name}"

    # -------------------------------------------------------------
    # 1. Baseline Compliant Patient Test
    # -------------------------------------------------------------
    print("\n--- 1. Testing Compliant Patient Baseline ---")
    pt_clean = create_compliant_patient()
    devs = evaluate_compliance([pt_clean], PROTOCOL_CONFIG)
    check(len(devs) == 0, "Compliant patient generates exactly 0 deviations")

    profile = calculate_patient_risk(pt_clean, devs, PROTOCOL_CONFIG)
    check(profile.totalRiskScore == 0, "Compliant patient risk score is 0")
    check(profile.compliancePercentage == 100.0, "Compliant patient compliance is 100.0%")
    check(profile.riskBand == "Low", "Compliant patient risk band is 'Low'")

    # -------------------------------------------------------------
    # 2. Visit Timing Tests (Early, Late, Missed)
    # -------------------------------------------------------------
    print("\n--- 2. Testing Visit Timing & Adherence Rules ---")
    # 2a. Visit 2 Late: Target Day 14 ± 3 (Window is Day 11 to Day 17). Actual Day 19 (+2 days late).
    pt_late = create_compliant_patient("PT-LATE")
    pt_late.visits[1].actualDay = 19
    devs_late = evaluate_compliance([pt_late], PROTOCOL_CONFIG)
    check(len(devs_late) == 1, "Late visit generates 1 deviation")
    check(devs_late[0].type == "VISIT_WINDOW_EXCEEDED", "Deviation type is VISIT_WINDOW_EXCEEDED")
    check(devs_late[0].severity == "Major", "Late visit severity is Major")
    check(devs_late[0].severityWeight == 10, "Major severity weight is 10")
    check("Day 19" in devs_late[0].actual, "Actual description reflects Day 19")

    # 2b. Visit 2 Early: Actual Day 9 (Window is Day 11 to Day 17). 2 days early.
    pt_early = create_compliant_patient("PT-EARLY")
    pt_early.visits[1].actualDay = 9
    devs_early = evaluate_compliance([pt_early], PROTOCOL_CONFIG)
    check(len(devs_early) == 1, "Early visit generates 1 deviation")
    check(devs_early[0].type == "VISIT_TOO_EARLY", "Deviation type is VISIT_TOO_EARLY")
    check(devs_early[0].severity == "Minor", "Early visit severity is Minor")
    check(devs_early[0].severityWeight == 4, "Minor severity weight is 4")

    # 2c. Visit 2 Missed: status="Missed", actualDay=None
    pt_missed = create_compliant_patient("PT-MISSED")
    pt_missed.visits[1].status = "Missed"
    pt_missed.visits[1].actualDay = None
    devs_missed = evaluate_compliance([pt_missed], PROTOCOL_CONFIG)
    check(len(devs_missed) == 1, "Missed visit generates 1 deviation")
    check(devs_missed[0].type == "MISSED_VISIT", "Deviation type is MISSED_VISIT")
    check(devs_missed[0].severity == "Critical", "Missed visit severity is Critical")
    check(devs_missed[0].severityWeight == 15, "Critical severity weight is 15")

    # -------------------------------------------------------------
    # 3. Investigational Product Dosing Tests
    # -------------------------------------------------------------
    print("\n--- 3. Testing Investigational Product Dosing Rules ---")
    # 3a. Severe Dose Discrepancy (50mg vs 100mg target, diff >= 50mg) -> Critical
    pt_dose_50 = create_compliant_patient("PT-DOSE-50")
    pt_dose_50.medications[0].doseMg = 50
    devs_dose_50 = evaluate_compliance([pt_dose_50], PROTOCOL_CONFIG)
    check(len(devs_dose_50) == 1, "50mg dose generates 1 deviation")
    check(devs_dose_50[0].type == "INCORRECT_DOSE", "Deviation type is INCORRECT_DOSE")
    check(devs_dose_50[0].severity == "Critical", "50mg deviation severity is Critical (diff >= 50mg)")
    check(devs_dose_50[0].severityWeight == 15, "50mg dose severity weight is 15")

    # 3b. Overdose (200mg vs 100mg target, diff >= 50mg) -> Critical
    pt_dose_200 = create_compliant_patient("PT-DOSE-200")
    pt_dose_200.medications[0].doseMg = 200
    devs_dose_200 = evaluate_compliance([pt_dose_200], PROTOCOL_CONFIG)
    check(len(devs_dose_200) == 1, "200mg dose generates 1 deviation")
    check(devs_dose_200[0].severity == "Critical", "200mg dose severity is Critical")

    # 3c. Moderate Dose Discrepancy (120mg vs 100mg target, diff < 50mg) -> Major
    pt_dose_120 = create_compliant_patient("PT-DOSE-120")
    pt_dose_120.medications[0].doseMg = 120
    devs_dose_120 = evaluate_compliance([pt_dose_120], PROTOCOL_CONFIG)
    check(len(devs_dose_120) == 1, "120mg dose generates 1 deviation")
    check(devs_dose_120[0].severity == "Major", "120mg deviation severity is Major (diff < 50mg)")
    check(devs_dose_120[0].severityWeight == 10, "120mg dose severity weight is 10")

    # -------------------------------------------------------------
    # 4. Prohibited Concomitant Medication Tests
    # -------------------------------------------------------------
    print("\n--- 4. Testing Prohibited Concomitant Medication Rules ---")
    for drug_name, expected_sev, expected_wt in [
        ("Drug-X", "Critical", 15),
        ("Ketoconazole", "Critical", 15),
        ("Erythromycin", "Major", 10),
        ("St. John's Wort", "Major", 10),
    ]:
        pt_drug = create_compliant_patient(f"PT-{drug_name.upper().replace(' ', '-')}")
        pt_drug.medications.append(
            PatientMedication(
                drugName=drug_name,
                doseMg=50,
                frequency="QD",
                isInvestigational=False,
                startDate="2026-01-10",
            )
        )
        d_drug = evaluate_compliance([pt_drug], PROTOCOL_CONFIG)
        check(len(d_drug) == 1, f"Prohibited med '{drug_name}' triggers exactly 1 deviation")
        check(d_drug[0].type == "PROHIBITED_CONMED", f"Deviation type for '{drug_name}' is PROHIBITED_CONMED")
        check(d_drug[0].severity == expected_sev, f"Severity for '{drug_name}' is {expected_sev}")
        check(d_drug[0].severityWeight == expected_wt, f"Weight for '{drug_name}' is {expected_wt}")

    # -------------------------------------------------------------
    # 5. Mandatory Safety Lab Tests: CBC before Visit 3
    # -------------------------------------------------------------
    print("\n--- 5. Testing Mandatory Safety Laboratory Rules ---")
    pt_no_cbc = create_compliant_patient("PT-NO-CBC")
    pt_no_cbc.labs = [l for l in pt_no_cbc.labs if "cbc" not in l.labName.lower() and "blood count" not in l.labName.lower()]
    devs_no_cbc = evaluate_compliance([pt_no_cbc], PROTOCOL_CONFIG)
    check(len(devs_no_cbc) == 1, "Completed Visit 3 with missing CBC triggers 1 deviation")
    check(devs_no_cbc[0].type == "MISSING_MANDATORY_LAB", "Deviation type is MISSING_MANDATORY_LAB")
    check(devs_no_cbc[0].severity == "Major", "Missing CBC severity is Major")
    check(devs_no_cbc[0].severityWeight == 10, "Missing CBC weight is 10")

    # -------------------------------------------------------------
    # 6. Required Procedures & Vitals Tests
    # -------------------------------------------------------------
    print("\n--- 6. Testing Protocol Procedure & Vital Sign Rules ---")
    # 6a. Omitted ECG (Major)
    pt_no_ecg = create_compliant_patient("PT-NO-ECG")
    pt_no_ecg.visits[0].proceduresCompleted = [
        p for p in pt_no_ecg.visits[0].proceduresCompleted if "ECG" not in p
    ]
    devs_no_ecg = evaluate_compliance([pt_no_ecg], PROTOCOL_CONFIG)
    check(any(d.type == "PROCEDURE_OMITTED" and d.severity == "Major" for d in devs_no_ecg), "Omitted ECG triggers Major PROCEDURE_OMITTED deviation")

    # 6b. Missing Vitals (Administrative, 1 pt)
    pt_no_vitals = create_compliant_patient("PT-NO-VITALS")
    pt_no_vitals.visits[1].vitals = None
    devs_no_vitals = evaluate_compliance([pt_no_vitals], PROTOCOL_CONFIG)
    check(any(d.type == "INCOMPLETE_VITALS" and d.severity == "Administrative" for d in devs_no_vitals), "Missing vitals triggers Administrative INCOMPLETE_VITALS deviation")

    # -------------------------------------------------------------
    # 7. Risk Scoring Modifiers (Repeated +5, Multiple Categories +5)
    # -------------------------------------------------------------
    print("\n--- 7. Testing Patient Risk Modifiers ---")
    # Patient with 2 deviations in 2 different categories: Late visit (Visit Window, Major 10) + Missing CBC (Safety / Laboratory, Major 10)
    # Base points = 10 + 10 = 20
    # Repeated modifier (>1 deviation) = +5
    # Multiple categories modifier (>1 category) = +5
    # Total risk score = 20 + 5 + 5 = 30
    pt_multi = create_compliant_patient("PT-MULTI")
    pt_multi.visits[1].actualDay = 20  # Late visit (Major, 10)
    pt_multi.labs = []                 # Missing CBC (Major, 10)
    devs_multi = evaluate_compliance([pt_multi], PROTOCOL_CONFIG)
    prof_multi = calculate_patient_risk(pt_multi, devs_multi, PROTOCOL_CONFIG)

    check(prof_multi.basePoints == 20, "Base points equal sum of weights (10 + 10 = 20)")
    check(prof_multi.repeatedModifier == 5, "Repeated deviation modifier is +5")
    check(prof_multi.multipleCategoryModifier == 5, "Multiple category modifier is +5")
    check(prof_multi.totalRiskScore == 30, "Total risk score = 20 + 5 + 5 = 30")
    check(prof_multi.riskBand == "Medium", "Risk band is Medium (13-35 points)")

    # -------------------------------------------------------------
    # 8. Site Risk & Site 03 Rank #1 Emergence
    # -------------------------------------------------------------
    print("\n--- 8. Testing Deterministic Site Risk & Natural Emergence ---")
    store.reset()
    all_pts = store.get_patients()
    all_devs = evaluate_compliance(all_pts, PROTOCOL_CONFIG)
    site_risks = [calculate_site_risk(s, all_pts, all_devs, PROTOCOL_CONFIG) for s in PROTOCOL_CONFIG.sites]
    site_risks.sort(key=lambda s: s.score, reverse=True)

    check(site_risks[0].siteId == "SITE-03", f"Rank #1 highest risk site is naturally SITE-03 (score={site_risks[0].score})")
    check(site_risks[0].riskBand == "High", f"SITE-03 risk band is 'High' (score={site_risks[0].score} >= 61)")
    check(site_risks[-1].riskBand == "Low", f"Lowest risk site is 'Low' (score={site_risks[-1].score} <= 30)")

    # -------------------------------------------------------------
    # 9. CAPA Candidate Generation
    # -------------------------------------------------------------
    print("\n--- 9. Testing CAPA Candidate Formulation ---")
    capas = generate_capas_from_deviations(all_devs, site_risks)
    check(len(capas) >= 3, f"CAPA engine generated {len(capas)} proposals")
    check(all(c.humanReviewRequired is True for c in capas), "All CAPAs have humanReviewRequired=True")
    check(all(len(c.linkedDeviationIds) > 0 for c in capas), "All CAPAs link to specific deviation IDs")
    check(all(len(c.affectedPatients) > 0 for c in capas), "All CAPAs list affected patient IDs")
    check(all(c.problemStatement and c.rootCauseHypothesis for c in capas), "All CAPAs include problem statement and root cause")
    check(all(c.correctiveAction and c.preventiveAction for c in capas), "All CAPAs provide structured corrective & preventive actions")

    # -------------------------------------------------------------
    # 10. Dynamic Re-Analysis Demo Workflow (End-to-End via API)
    # -------------------------------------------------------------
    print("\n--- 10. Testing Dynamic Re-Analysis Demo Workflow via API ---")
    # Initial scan
    r = client.post("/api/compliance/analyze", json={})
    check(r.status_code == 200, "Initial POST /api/compliance/analyze returns 200 OK")
    initial_dev_count = r.json()["deviationsDetectedCount"]

    # Pick PT-1001 (Site 01) - verify currently has 100mg dose
    r = client.get("/api/patients/PT-1001")
    pt1001 = r.json()
    orig_meds = pt1001["medications"]
    ip_med = next(m for m in orig_meds if m["isInvestigational"])
    check(ip_med["doseMg"] == 100, "PT-1001 initially on 100mg QD Cardio-X")

    # Data Manager modifies dose to 50mg QD (dose discrepancy)
    headers_dm = {"X-Demo-Role": "DATA_MANAGER", "X-Demo-User": "Elena Rostova (Lead CDM)"}
    modified_meds = [
        {**m, "doseMg": 50} if m["isInvestigational"] else m
        for m in orig_meds
    ]
    r_patch = client.patch(
        "/api/patients/PT-1001",
        json={"medications": modified_meds, "reasonForChange": "Demo Dose Discrepancy Injection"},
        headers=headers_dm,
    )
    check(r_patch.status_code == 200, "PATCH /api/patients/PT-1001 to 50mg succeeds (200 OK)")

    # Trigger Compliance Re-Analysis
    r_reanalyze = client.post("/api/compliance/analyze", json={})
    check(r_reanalyze.status_code == 200, "Re-analysis POST /api/compliance/analyze succeeds")
    new_dev_count = r_reanalyze.json()["deviationsDetectedCount"]
    check(new_dev_count == initial_dev_count + 1, f"Deviations increased by 1 ({initial_dev_count} -> {new_dev_count})")

    # Verify that the new deviation belongs to PT-1001 for INCORRECT_DOSE
    r_devs = client.get("/api/deviations?patient_id=PT-1001")
    pt1001_devs = r_devs.json()
    check(any(d["type"] == "INCORRECT_DOSE" and "50" in d["actual"] for d in pt1001_devs), "PT-1001 now has INCORRECT_DOSE deviation")

    # Check that Site 01 risk points increased
    r_s1 = client.get("/api/risk/sites/SITE-01")
    site1_elevated_risk = r_s1.json()
    check(site1_elevated_risk["deviationCount"] >= 1, "SITE-01 shows newly flagged deviation")

    # Correct dose back to 100mg QD as Data Manager
    restored_meds = [
        {**m, "doseMg": 100} if m["isInvestigational"] else m
        for m in orig_meds
    ]
    r_restore = client.patch(
        "/api/patients/PT-1001",
        json={"medications": restored_meds, "reasonForChange": "Correcting dose back to protocol 100mg QD"},
        headers=headers_dm,
    )
    check(r_restore.status_code == 200, "PATCH /api/patients/PT-1001 back to 100mg succeeds")

    # Re-run Compliance Analysis
    r_reanalyze_restored = client.post("/api/compliance/analyze", json={})
    check(r_reanalyze_restored.status_code == 200, "Re-analysis after correction succeeds")
    final_dev_count = r_reanalyze_restored.json()["deviationsDetectedCount"]
    check(final_dev_count == initial_dev_count, f"Deviation count returned to baseline ({final_dev_count} == {initial_dev_count})")

    # Verify that PT-1001 has zero dosing deviations now
    r_devs_cleaned = client.get("/api/deviations?patient_id=PT-1001")
    check(len(r_devs_cleaned.json()) == 0, "PT-1001 has 0 deviations after dose correction")

    print("\n" + "=" * 70)
    print(f"ALL TESTS COMPLETED SUCCESSFULLY: {passed}/{total} PASSED")
    print("=" * 70)

if __name__ == "__main__":
    test_suite()
