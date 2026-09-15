"""Dedicated Test Suite for Real Dynamic Site Risk Engine.

Verifies:
1. Low-risk site calculation (0–30 band)
2. Medium-risk site calculation (31–60 band)
3. High-risk site calculation (61–100 band)
4. Severity weighting: Critical=15, Major=10, Minor=4, Administrative=1
5. Repeated deviation bonus (+5 pts)
6. Multiple-category bonus (+5 pts)
7. Deterministic trend calculation (Improving, Stable, Worsening)
8. Lightweight transparent predicted risk (current, predicted, direction, explanation)
9. Site risk increasing after a deviation is dynamically introduced
10. Site risk decreasing after a deviation is corrected
11. Endpoints GET /api/risk/sites and GET /api/risk/sites/{site_id}
"""
import sys
import os

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
from src.backend.app.models.deviation import Deviation
from src.backend.app.models.trial import SiteInfo
from src.backend.app.services.compliance_engine import evaluate_compliance
from src.backend.app.services.risk_engine import (
    calculate_site_risk,
    compute_site_trend_and_prediction,
    MAX_SITE_RISK_SCALE,
)

client = TestClient(app)

def make_test_site(site_id="TEST-SITE-01", code="SITE-01", name="Test Center", patient_count=20):
    return SiteInfo(
        id=site_id,
        code=code,
        name=name,
        location="Test City",
        pi="Dr. Test PI, MD",
        cra="Test CRA",
        patientCount=patient_count,
    )

def make_test_deviation(
    dev_id="DEV-TEST-01",
    site_id="TEST-SITE-01",
    patient_id="PT-TEST-01",
    category="Visit Window",
    dtype="VISIT_WINDOW_EXCEEDED",
    severity="Major",
    weight=10,
    detected_at="2026-02-12T10:00:00Z"
):
    return Deviation(
        id=dev_id,
        siteId=site_id,
        patientId=patient_id,
        siteName="Test Center",
        category=category,
        type=dtype,
        severity=severity,
        severityWeight=weight,
        expected="Expected standard protocol condition",
        actual="Actual non-compliant condition",
        detectedAt=detected_at,
        explanation="Clinical explanation of protocol deviation",
        recommendedAction="Corrective oversight required",
    )

def run_site_risk_tests():
    print("=" * 70)
    print("RUNNING DEDICATED SITE RISK ENGINE TEST SUITE")
    print("=" * 70)
    passed = 0
    total = 0

    def check(condition: bool, name: str):
        nonlocal passed, total
        total += 1
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name}")
            assert False, f"Test failed: {name}"

    site = make_test_site()
    patients = [
        Patient(
            id=f"PT-TEST-{i:02d}",
            siteId=site.id,
            siteName=site.name,
            age=60,
            gender="Male",
            enrollmentDate="2026-01-01",
            visits=[],
            labs=[],
            medications=[],
        )
        for i in range(1, 21)
    ]

    # 1. Severity Weighting Verification
    print("\n--- 1. Testing Severity Weighting (15, 10, 4, 1) ---")
    crit_dev = make_test_deviation("D-CRIT", site.id, "PT-TEST-01", "Dosing", "INCORRECT_DOSE", "Critical", 15)
    maj_dev = make_test_deviation("D-MAJ", site.id, "PT-TEST-02", "Visit Window", "VISIT_WINDOW_EXCEEDED", "Major", 10)
    min_dev = make_test_deviation("D-MIN", site.id, "PT-TEST-03", "Visit Window", "VISIT_TOO_EARLY", "Minor", 4)
    adm_dev = make_test_deviation("D-ADM", site.id, "PT-TEST-04", "Data Quality", "INCOMPLETE_VITALS", "Administrative", 1)

    r_crit = calculate_site_risk(site, patients, [crit_dev], PROTOCOL_CONFIG)
    check(r_crit.rawRiskPoints == 15, "Single Critical deviation produces rawRiskPoints = 15")

    r_maj = calculate_site_risk(site, patients, [maj_dev], PROTOCOL_CONFIG)
    check(r_maj.rawRiskPoints == 10, "Single Major deviation produces rawRiskPoints = 10")

    r_min = calculate_site_risk(site, patients, [min_dev], PROTOCOL_CONFIG)
    check(r_min.rawRiskPoints == 4, "Single Minor deviation produces rawRiskPoints = 4")

    r_adm = calculate_site_risk(site, patients, [adm_dev], PROTOCOL_CONFIG)
    check(r_adm.rawRiskPoints == 1, "Single Administrative deviation produces rawRiskPoints = 1")

    # 2. Repeated Deviation Bonus (+5)
    print("\n--- 2. Testing Repeated Deviation Modifier (+5) ---")
    # Two deviations of the same type and category
    maj_dev2 = make_test_deviation("D-MAJ-2", site.id, "PT-TEST-05", "Visit Window", "VISIT_WINDOW_EXCEEDED", "Major", 10)
    r_rep = calculate_site_risk(site, patients, [maj_dev, maj_dev2], PROTOCOL_CONFIG)
    check(r_rep.repeatedDeviationCount == 1, "Repeated deviation count correctly identifies 1 repeat")
    check(r_rep.numberOfCategories == 1, "Category count is 1 (no multi-category bonus)")
    # Raw points = 10 + 10 + 5 (repeated) = 25
    check(r_rep.rawRiskPoints == 25, "Repeated deviation adds +5 bonus: 10 + 10 + 5 = 25 raw points")

    # 3. Multiple Categories Bonus (+5)
    print("\n--- 3. Testing Multiple Categories Modifier (+5) ---")
    # Two deviations in different categories, different types (no repeat)
    d_cat1 = make_test_deviation("D-C1", site.id, "PT-TEST-01", "Visit Window", "VISIT_WINDOW_EXCEEDED", "Major", 10)
    d_cat2 = make_test_deviation("D-C2", site.id, "PT-TEST-02", "Laboratory", "MISSING_MANDATORY_LAB", "Major", 10)
    r_multi_cat = calculate_site_risk(site, patients, [d_cat1, d_cat2], PROTOCOL_CONFIG)
    check(r_multi_cat.repeatedDeviationCount == 0, "Zero repeats when types are distinct")
    check(r_multi_cat.numberOfCategories == 2, "Distinct category count is 2")
    # Raw points = 10 + 10 + 5 (multiple categories) = 25
    check(r_multi_cat.rawRiskPoints == 25, "Multiple categories adds +5 bonus: 10 + 10 + 5 = 25 raw points")

    # 4. Both Modifiers (+5 repeated AND +5 multi-category)
    print("\n--- 4. Testing Combined Modifiers (+5 repeated AND +5 multi-category) ---")
    # 3 deviations: 2 Visit Window (VISIT_WINDOW_EXCEEDED) + 1 Laboratory
    d_cat1_b = make_test_deviation("D-C1-B", site.id, "PT-TEST-03", "Visit Window", "VISIT_WINDOW_EXCEEDED", "Major", 10)
    r_both = calculate_site_risk(site, patients, [d_cat1, d_cat1_b, d_cat2], PROTOCOL_CONFIG)
    check(r_both.repeatedDeviationCount == 1, "Repeated count is 1")
    check(r_both.numberOfCategories == 2, "Category count is 2")
    # Raw points = 10 + 10 + 10 + 5 (repeated) + 5 (multi-category) = 40
    check(r_both.rawRiskPoints == 40, "Combined bonuses add +10 total: 30 + 5 + 5 = 40 raw points")

    # 5. Risk Bands: Low (0-30), Medium (31-60), High (61-100)
    print("\n--- 5. Testing Risk Band Classifications ---")
    # 5a. Clean / Low Risk Site
    r_clean = calculate_site_risk(site, patients, [], PROTOCOL_CONFIG)
    check(r_clean.score == 0, "Zero deviations produces score = 0")
    check(r_clean.riskBand == "Low", "Score 0 is classified as 'Low'")

    # Single major deviation (score ~ 4)
    check(r_maj.score <= 30, f"Single major deviation score ({r_maj.score}) is in Low band (0–30)")
    check(r_maj.riskBand == "Low", "r_maj risk band is 'Low'")

    # 5b. Medium Risk Site (31–60)
    # E.g. 5 Major deviations (50 pts) + repeated (+5) + multi-category (+5) + 2 Critical (30 pts) = 90 raw points
    # 90 / 225 * 100 = 40 (Medium)
    med_devs = [
        make_test_deviation(f"D-MED-{i}", site.id, f"PT-TEST-{i:02d}", "Visit Window", "VISIT_WINDOW_EXCEEDED", "Major", 10)
        for i in range(1, 4)
    ] + [
        make_test_deviation(f"D-MED-{i}", site.id, f"PT-TEST-{i:02d}", "Laboratory", "MISSING_MANDATORY_LAB", "Major", 10)
        for i in range(4, 6)
    ] + [
        make_test_deviation("D-MED-CRIT", site.id, "PT-TEST-06", "Dosing", "INCORRECT_DOSE", "Critical", 15),
        make_test_deviation("D-MED-CRIT2", site.id, "PT-TEST-07", "Dosing", "INCORRECT_DOSE", "Critical", 15),
    ]
    r_med = calculate_site_risk(site, patients, med_devs, PROTOCOL_CONFIG)
    check(31 <= r_med.score <= 60, f"Medium risk score ({r_med.score}) falls in 31–60 band")
    check(r_med.riskBand == "Medium", f"Medium risk band is 'Medium' (actual: {r_med.riskBand})")

    # 5c. High Risk Site (61–100)
    # E.g. 15 mixed deviations (Critical + Major) -> ~160 raw points -> ~71 score
    high_devs = med_devs + [
        make_test_deviation(f"D-HIGH-{i}", site.id, f"PT-TEST-{i:02d}", "Prohibited Medication", "PROHIBITED_CONMED", "Critical", 15)
        for i in range(8, 12)
    ]
    r_high = calculate_site_risk(site, patients, high_devs, PROTOCOL_CONFIG)
    check(r_high.score >= 61, f"High risk score ({r_high.score}) falls in 61–100 band")
    check(r_high.riskBand == "High", f"High risk band is 'High' (actual: {r_high.riskBand})")

    # 6. Trend & Transparent Predicted Risk Calculation
    print("\n--- 6. Testing Deterministic Trend & Predicted Risk ---")
    # Low risk site -> Improving or Stable
    trend_low = compute_site_trend_and_prediction(
        score=5,
        risk_band="Low",
        critical_count=0,
        major_count=1,
        repeated_count=0,
        affected_count=1,
        patient_count=20,
    )
    check(trend_low.trend == "Improving", f"Low risk site trend is 'Improving' (actual: {trend_low.trend})")
    check(trend_low.predictionDirection == "Decreasing", "Prediction direction is 'Decreasing'")
    check(trend_low.predictedScore <= trend_low.currentRisk, "Predicted score <= current risk for improving site")
    check(bool(trend_low.explanation), "Prediction includes transparent explanation")

    # High risk site -> Worsening
    trend_high = compute_site_trend_and_prediction(
        score=73,
        risk_band="High",
        critical_count=5,
        major_count=7,
        repeated_count=6,
        affected_count=10,
        patient_count=22,
    )
    check(trend_high.trend == "Worsening", f"High risk site trend is 'Worsening' (actual: {trend_high.trend})")
    check(trend_high.predictionDirection == "Increasing", "Prediction direction is 'Increasing'")
    check(trend_high.predictedScore > trend_high.currentRisk, "Predicted score > current risk for worsening site")
    check("critical" in trend_high.predictionRationale.lower(), "Rationale explicitly details critical deviation drivers")

    # 7. Dynamic Risk Drivers Extraction
    print("\n--- 7. Testing Dynamic Risk Drivers Extraction ---")
    check(len(r_high.riskDrivers) >= 3, f"High risk site extracts multiple risk drivers ({len(r_high.riskDrivers)})")
    check(any("prohibited medication" in d.lower() for d in r_high.riskDrivers), "Prohibited medication identified as risk driver")
    check(any("dose deviations" in d.lower() for d in r_high.riskDrivers), "Dose deviations identified as risk driver")
    check(any("late / missed visits" in d.lower() for d in r_high.riskDrivers), "Late visits identified as risk driver")

    # 8. API Endpoints Verification: GET /api/risk/sites and /api/risk/sites/{id}
    print("\n--- 8. Testing API Endpoints GET /api/risk/sites & /api/risk/sites/{id} ---")
    r_sites = client.get("/api/risk/sites")
    check(r_sites.status_code == 200, "GET /api/risk/sites returns 200 OK")
    all_site_risks = r_sites.json()
    check(len(all_site_risks) == 5, f"GET /api/risk/sites returns 5 sites ({len(all_site_risks)})")

    # Verify sorting: scores descending
    scores = [s["score"] for s in all_site_risks]
    check(scores == sorted(scores, reverse=True), "GET /api/risk/sites is sorted in descending order of risk score")

    # Site 03 is naturally highest
    top_site = all_site_risks[0]
    check(top_site["siteId"] == "SITE-03", f"Top site is naturally SITE-03 (score={top_site['score']})")
    check(top_site["riskBand"] == "High", "Top site riskBand is 'High'")

    # Detail endpoint
    r_s3_detail = client.get("/api/risk/sites/SITE-03")
    check(r_s3_detail.status_code == 200, "GET /api/risk/sites/SITE-03 returns 200 OK")
    s3_data = r_s3_detail.json()
    check(s3_data["siteId"] == "SITE-03", "Detail endpoint matches SITE-03")
    check(s3_data["repeatedDeviationCount"] > 0, f"SITE-03 has repeated deviation count = {s3_data['repeatedDeviationCount']}")
    check(s3_data["numberOfCategories"] >= 4, f"SITE-03 spans {s3_data['numberOfCategories']} categories")
    check(len(s3_data["riskDrivers"]) >= 3, "SITE-03 returns comprehensive risk drivers")
    check(len(s3_data["deviations"]) == s3_data["deviationCount"], "SITE-03 returns full list of deviations")

    # 9. Dynamic Re-Calculation Test: Add deviation -> Risk increases -> Revert -> Risk decreases
    print("\n--- 9. Testing Dynamic Risk Shift (Add Deviation -> Risk Up -> Correct -> Risk Down) ---")
    # SITE-01 baseline risk
    r_s1_init = client.get("/api/risk/sites/SITE-01")
    s1_score_init = r_s1_init.json()["score"]
    s1_devs_init = r_s1_init.json()["deviationCount"]

    # Inject 50mg dose discrepancy for patient PT-1001 (at SITE-01)
    headers_dm = {"X-Demo-Role": "DATA_MANAGER", "X-Demo-User": "Elena Rostova (Lead CDM)"}
    pt1001 = client.get("/api/patients/PT-1001").json()
    meds_modified = [
        {**m, "doseMg": 50} if m["isInvestigational"] else m
        for m in pt1001["medications"]
    ]
    client.patch("/api/patients/PT-1001", json={"medications": meds_modified}, headers=headers_dm)

    # Trigger Compliance Re-Analysis
    client.post("/api/compliance/analyze", json={})

    # Fetch updated SITE-01 risk
    r_s1_elevated = client.get("/api/risk/sites/SITE-01")
    s1_score_elevated = r_s1_elevated.json()["score"]
    s1_devs_elevated = r_s1_elevated.json()["deviationCount"]

    check(s1_devs_elevated == s1_devs_init + 1, f"SITE-01 deviations increased by 1 ({s1_devs_init} -> {s1_devs_elevated})")
    check(s1_score_elevated > s1_score_init, f"SITE-01 risk score increased ({s1_score_init} -> {s1_score_elevated})")

    # Restore dose back to 100mg
    meds_restored = [
        {**m, "doseMg": 100} if m["isInvestigational"] else m
        for m in pt1001["medications"]
    ]
    client.patch("/api/patients/PT-1001", json={"medications": meds_restored}, headers=headers_dm)

    # Re-run Compliance Analysis
    client.post("/api/compliance/analyze", json={})

    # Fetch recovered SITE-01 risk
    r_s1_recovered = client.get("/api/risk/sites/SITE-01")
    s1_score_recovered = r_s1_recovered.json()["score"]
    s1_devs_recovered = r_s1_recovered.json()["deviationCount"]

    check(s1_devs_recovered == s1_devs_init, f"SITE-01 deviations returned to baseline ({s1_devs_recovered} == {s1_devs_init})")
    check(s1_score_recovered == s1_score_init, f"SITE-01 risk score returned to baseline ({s1_score_recovered} == {s1_score_init})")

    print("\n" + "=" * 70)
    print(f"ALL SITE RISK TESTS PASSED: {passed}/{total}")
    print("=" * 70)

if __name__ == "__main__":
    run_site_risk_tests()
