"""Comprehensive Verification Test Suite for TrialGuard AI Backend."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.data.store import store

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING TRIALGUARD AI BACKEND VERIFICATION SUITE")
    print("=" * 60)
    passed = 0
    total = 0

    def assert_test(condition, name):
        nonlocal passed, total
        total += 1
        if condition:
            print(f"[PASS] {name}")
            passed += 1
        else:
            print(f"[FAIL] {name}")
            sys.exit(1)

    # 1. Health Endpoint
    r = client.get("/api/health")
    assert_test(r.status_code == 200 and r.json().get("status") == "ok", "GET /api/health returns 200 OK")

    # 2. Trial Info
    r = client.get("/api/trial")
    assert_test(r.status_code == 200 and r.json().get("trialId") == "CT-101" and r.json().get("enrolledPatients") == 104, "GET /api/trial returns CT-101 with 104 patients")

    # 3. Protocol Config
    r = client.get("/api/protocol")
    assert_test(r.status_code == 200 and len(r.json().get("visits")) == 3 and len(r.json().get("prohibitedMedications")) == 4, "GET /api/protocol returns protocol rules")

    # 4. Sites List
    r = client.get("/api/sites")
    assert_test(r.status_code == 200 and len(r.json()) == 5, "GET /api/sites returns 5 sites")

    # 5. Site Detail
    r = client.get("/api/sites/SITE-03")
    assert_test(r.status_code == 200 and r.json().get("code") == "SITE-03" and r.json().get("patientCount") == 22, "GET /api/sites/SITE-03 returns Metro General with 22 patients")

    # 6. Patients List
    r = client.get("/api/patients")
    assert_test(r.status_code == 200 and len(r.json()) == 104, "GET /api/patients returns all 104 patients")

    # 7. Patients Scoped by Site
    r = client.get("/api/patients?site_id=SITE-03")
    assert_test(r.status_code == 200 and len(r.json()) == 22, "GET /api/patients?site_id=SITE-03 returns 22 patients")

    # 8. Single Patient Detail
    r = client.get("/api/patients/PT-1042")
    assert_test(r.status_code == 200 and r.json().get("id") == "PT-1042" and len(r.json().get("visits")) == 3, "GET /api/patients/PT-1042 returns patient details")

    # 9. Compliance Analysis POST
    r = client.post("/api/compliance/analyze", json={})
    assert_test(r.status_code == 200 and r.json().get("analyzedPatientsCount") == 104 and r.json().get("deviationsDetectedCount") > 0, "POST /api/compliance/analyze runs full scan")

    # 10. Deviations List
    r = client.get("/api/deviations")
    deviations = r.json()
    assert_test(r.status_code == 200 and len(deviations) > 0, f"GET /api/deviations returns {len(deviations)} deviations")

    # Check that deviations have clinical explanation
    assert_test(deviations[0].get("clinicalExplanation") is not None, "Deviations contain deterministic clinical explanations")

    # 11. Trial Risk
    r = client.get("/api/risk/trial")
    assert_test(r.status_code == 200 and "trialRiskScore" in r.json() and "compliancePercentage" in r.json(), "GET /api/risk/trial returns trial metrics")

    # 12. Site Risk Rankings - Site 03 must be Rank #1 Highest Risk
    r = client.get("/api/risk/sites")
    site_rankings = r.json()
    assert_test(len(site_rankings) == 5, "GET /api/risk/sites returns 5 ranked sites")
    assert_test(site_rankings[0].get("siteId") == "SITE-03", f"SITE-03 is Rank #1 highest risk site (score: {site_rankings[0].get('score')})")
    assert_test(site_rankings[0].get("riskBand") == "High", f"SITE-03 risk band is High (score: {site_rankings[0].get('score')})")

    # 13. Site Detail Risk with Trend Prediction
    r = client.get("/api/risk/sites/SITE-03")
    site_03_detail = r.json()
    assert_test(site_03_detail.get("trend") is not None and "predictedScore" in site_03_detail.get("trend"), "GET /api/risk/sites/SITE-03 returns 30-day forecast")

    # 14. Patient Risk Calculation
    r = client.get("/api/risk/patients/PT-1042")
    pt_risk = r.json()
    assert_test(pt_risk.get("totalRiskScore") > 0 and pt_risk.get("riskBand") in ["Medium", "High"], f"GET /api/risk/patients/PT-1042 returns risk profile (score: {pt_risk.get('totalRiskScore')})")

    # 15. CAPAs List & humanReviewRequired Flag
    r = client.get("/api/capas")
    capas = r.json()
    assert_test(len(capas) > 0 and all(c.get("humanReviewRequired") is True for c in capas), f"GET /api/capas returns {len(capas)} proposals with humanReviewRequired=True")

    # 16. RBAC Test: Site Investigator cross-site scoping restriction
    headers_inv = {"X-Demo-Role": "SITE_INVESTIGATOR", "X-Demo-Site": "SITE-03"}
    r = client.get("/api/sites/SITE-01", headers=headers_inv)
    assert_test(r.status_code == 403, "RBAC: Site Investigator accessing another site directly returns 403 Forbidden")

    # Site investigator accessing their own site succeeds
    r = client.get("/api/sites/SITE-03", headers=headers_inv)
    assert_test(r.status_code == 200, "RBAC: Site Investigator accessing assigned site succeeds")

    # 17. RBAC Test: eCRF Data Modification restricted to Data Manager
    headers_cra = {"X-Demo-Role": "CRA"}
    r = client.patch("/api/patients/PT-1001", json={"age": 65}, headers=headers_cra)
    assert_test(r.status_code == 403, "RBAC: CRA attempting eCRF modification returns 403 Forbidden")

    headers_dm = {"X-Demo-Role": "DATA_MANAGER", "X-Demo-User": "Elena Rostova (Lead CDM)"}
    r = client.patch("/api/patients/PT-1001", json={"age": 65, "reasonForChange": "Source document reconciliation"}, headers=headers_dm)
    assert_test(r.status_code == 200 and r.json().get("age") == 65, "RBAC: Data Manager updating eCRF succeeds and updates state")

    # 18. RBAC Test: CAPA Approval restricted to Sponsor
    first_capa_id = capas[0]["id"]
    r = client.patch(f"/api/capas/{first_capa_id}", json={"status": "Approved"}, headers=headers_inv)
    assert_test(r.status_code == 403, "RBAC: Site Investigator attempting to approve CAPA returns 403 Forbidden")

    headers_sponsor = {"X-Demo-Role": "SPONSOR", "X-Demo-User": "Dr. Marcus Vance (VP Clinical Ops)"}
    r = client.patch(f"/api/capas/{first_capa_id}", json={"status": "Approved", "newComment": "Formal sponsor sign-off granted."}, headers=headers_sponsor)
    assert_test(r.status_code == 200 and r.json().get("status") == "Approved", "RBAC: Sponsor approving CAPA succeeds")

    # 19. Reports Endpoint
    r = client.get("/api/reports")
    assert_test(r.status_code == 200 and "regulatoryAuditReadiness" in r.json(), "GET /api/reports returns executive report")

    # 20. Audit Trail Endpoint
    r = client.get("/api/audit")
    audit_logs = r.json()
    assert_test(r.status_code == 200 and len(audit_logs) >= 3, f"GET /api/audit returns chronological audit trail ({len(audit_logs)} events)")

    print("=" * 60)
    print(f"ALL TESTS PASSED: {passed}/{total}")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
