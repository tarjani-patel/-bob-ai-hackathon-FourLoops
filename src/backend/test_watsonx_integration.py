"""TrialGuard AI — IBM watsonx.ai Granite Integration Test Suite.

Tests:
1. AI Health check (configured vs unconfigured state)
2. Deviation Explanation generation with IBM Granite mocking
3. Site Risk Pattern synthesis with IBM Granite mocking
4. CAPA Recommendation generation with IBM Granite mocking
5. Audit trail compliance logging for all AI interactions
6. RBAC site scoping (Site Investigator isolation to assigned site)
7. Error handling & resilience (Granite downtime, malformed JSON, 502/503 responses)
8. Credential protection (ensures API keys never appear in responses or logs)
"""
import os
import json
import unittest
from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient
from src.backend.app.main import app
from src.backend.app.data.store import store
from src.backend.app.services.watsonx_service import watsonx_service

client = TestClient(app)

class TestWatsonxAIIntegration(unittest.TestCase):
    def setUp(self):
        # Reset environment
        os.environ["WATSONX_APIKEY"] = "mock-ibm-apikey-secret-12345"
        os.environ["WATSONX_PROJECT_ID"] = "mock-project-id-67890"
        os.environ["WATSONX_URL"] = "https://us-south.ml.cloud.ibm.com"
        os.environ["WATSONX_MODEL_ID"] = "ibm/granite-3-8b-instruct"
        watsonx_service.refresh_credentials()

    def test_01_ai_health_configured(self):
        """Verify AI health returns configured status when environment variables are set."""
        resp = client.get("/api/ai/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "configured")
        self.assertTrue(data["configured"])
        self.assertEqual(data["model"], "ibm/granite-3-8b-instruct")
        self.assertIn("us-south.ml.cloud.ibm.com", data["url"])
        # Verify secret is never exposed
        self.assertNotIn("mock-ibm-apikey-secret-12345", json.dumps(data))

    def test_02_ai_health_unconfigured(self):
        """Verify AI health returns unconfigured when credentials are absent."""
        os.environ["WATSONX_APIKEY"] = ""
        watsonx_service.refresh_credentials()

        resp = client.get("/api/ai/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "unconfigured")
        self.assertFalse(data["configured"])

    @patch("src.backend.app.services.watsonx_service.WatsonxService._generate_text")
    def test_03_explain_deviation_success_and_audit(self, mock_gen):
        """Verify deviation explanation generation and audit trail record."""
        mock_output = json.dumps({
            "explanation": "Subject PX-103 Visit 3 was conducted on study Day 38 instead of Day 28 (±3 days).",
            "likelyContributingFactors": [
                "Patient scheduling conflict during protocol holiday period",
                "Site coordinator delayed notification to patient"
            ],
            "clinicalImpact": "Delayed pharmacokinetic assessment may obscure therapeutic trough concentrations.",
            "limitations": "Single isolated out-of-window visit; safety labs remained within baseline limits.",
            "confidence": "High",
            "humanReviewNotice": "AI-assisted clinical interpretation powered by IBM Granite."
        })
        mock_gen.return_value = f"```json\n{mock_output}\n```"

        payload = {
            "deviationId": "DEV-2026-001",
            "patientId": "PX-103",
            "siteId": "SITE-01",
            "siteName": "MetroHealth Clinical Research",
            "category": "Visit Window",
            "type": "VISIT_OUT_OF_WINDOW",
            "severity": "Major",
            "expected": "Visit 3 must occur within Day 28 ± 3 days (Day 25 - Day 31)",
            "actual": "Visit 3 conducted on Day 38 (7 days late)"
        }

        # Sponsor role header
        headers = {
            "X-User-Role": "SPONSOR",
            "X-User-Name": "Dr. Sarah Jenkins",
            "X-User-Email": "sjenkins@cardiox.com"
        }

        initial_audits = len(store.audit_logs)
        resp = client.post("/api/ai/explain-deviation", json=payload, headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertIn("Subject PX-103", data["explanation"])
        self.assertEqual(len(data["likelyContributingFactors"]), 2)
        self.assertEqual(data["modelUsed"], "ibm/granite-3-8b-instruct")

        # Verify Audit Log entry created
        self.assertGreater(len(store.audit_logs), initial_audits)
        latest_audit = store.audit_logs[0]
        self.assertEqual(latest_audit.action, "AI_DEVIATION_EXPLANATION_REQUESTED")
        self.assertEqual(latest_audit.performedBy, "Dr. Sarah Jenkins")
        self.assertEqual(latest_audit.targetId, "DEV-2026-001")
        self.assertEqual(latest_audit.details["model"], "ibm/granite-3-8b-instruct")

    @patch("src.backend.app.services.watsonx_service.WatsonxService._generate_text")
    def test_04_site_insight_success_and_audit(self, mock_gen):
        """Verify site insight synthesis and audit logging."""
        mock_output = json.dumps({
            "riskAssessment": "SITE-03 exhibits elevated operational risk driven by recurring lab and visit delays.",
            "importantPatterns": [
                "Clustering of dosing delays around holiday weekends",
                "Repeated missed visit windows for Cohort B"
            ],
            "contributingFactors": [
                "Staff turnover in site clinical pharmacology unit"
            ],
            "emergingRiskExplanation": "Trajectory indicates potential escalation to critical non-compliance if unaddressed.",
            "recommendedInvestigationAreas": [
                "Audit study medication refrigeration logs",
                "Retrain research coordinator on visit scheduling window alerts"
            ],
            "humanReviewNotice": "AI-assisted site pattern synthesis powered by IBM Granite."
        })
        mock_gen.return_value = mock_output

        payload = {
            "siteId": "SITE-03",
            "siteName": "Pacific Clinical Trials Center",
            "score": 78,
            "riskBand": "High",
            "trend": "Worsening",
            "predictedScore": 85,
            "criticalCount": 2,
            "majorCount": 3,
            "deviationCount": 8,
            "topDrivers": ["Visit Window Violations", "Unreported Concomitant Medications"]
        }

        headers = {
            "X-User-Role": "CRA",
            "X-User-Name": "Marcus Vance",
            "X-User-Email": "mvance@cardiox.com"
        }

        resp = client.post("/api/ai/site-insight", json=payload, headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data["modelUsed"], "ibm/granite-3-8b-instruct")
        self.assertIn("SITE-03", data["riskAssessment"])
        self.assertEqual(len(data["recommendedInvestigationAreas"]), 2)

        latest_audit = store.audit_logs[0]
        self.assertEqual(latest_audit.action, "AI_SITE_INSIGHT_REQUESTED")
        self.assertEqual(latest_audit.siteId, "SITE-03")

    @patch("src.backend.app.services.watsonx_service.WatsonxService._generate_text")
    def test_05_capa_recommendation_success(self, mock_gen):
        """Verify CAPA recommendation generation from Granite."""
        mock_output = json.dumps({
            "rootCauseHypothesis": "Inadequate redundancy in laboratory specimen shipment logging during weekend handoffs.",
            "correctiveAction": "Execute retrospective reconciliation of all ambient lab kits shipped in the last 60 days.",
            "preventiveAction": "Deploy dual-signoff protocol checklist for sample courier packaging.",
            "suggestedOwner": "Lead Laboratory Coordinator",
            "priorityRationale": "Critical specimen integrity directly impacts primary efficacy endpoint.",
            "humanReviewNotice": "Recommendations proposed by IBM Granite. Requires human Sponsor approval."
        })
        mock_gen.return_value = mock_output

        payload = {
            "capaId": "CAPA-2026-001",
            "siteId": "SITE-03",
            "siteName": "Pacific Clinical Trials Center",
            "category": "Laboratory Compliance",
            "problemStatement": "Centrifuge temperature excursions logged across 4 consecutive specimen collections.",
            "evidence": "Log sheet EX-492 shows 12C reading (limit 2-8C)."
        }

        headers = {
            "X-User-Role": "SPONSOR",
            "X-User-Name": "Dr. Sarah Jenkins",
            "X-User-Email": "sjenkins@cardiox.com"
        }

        resp = client.post("/api/ai/capa-recommendation", json=payload, headers=headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertEqual(data["modelUsed"], "ibm/granite-3-8b-instruct")
        self.assertIn("laboratory specimen shipment", data["rootCauseHypothesis"].lower())
        self.assertEqual(data["suggestedOwner"], "Lead Laboratory Coordinator")

    def test_06_rbac_site_investigator_isolation(self):
        """Verify that a Site Investigator cannot request AI insights for another site (HTTP 403)."""
        # User assigned to SITE-01
        investigator_headers = {
            "X-User-Role": "SITE_INVESTIGATOR",
            "X-User-Name": "Dr. Alice Wong",
            "X-User-Email": "awong@metrohealth.org",
            "X-Site-Id": "SITE-01"
        }

        # Attempt to access SITE-03
        payload = {
            "siteId": "SITE-03",
            "siteName": "Pacific Clinical Trials Center",
            "score": 78,
            "riskBand": "High"
        }

        resp = client.post("/api/ai/site-insight", json=payload, headers=investigator_headers)
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Cross-site access", resp.json()["detail"])

        # Attempt deviation explanation for SITE-03
        dev_payload = {
            "deviationId": "DEV-2026-005",
            "patientId": "PX-301",
            "siteId": "SITE-03",
            "category": "Informed Consent",
            "type": "CONSENT_POST_PROCEDURE",
            "severity": "Critical",
            "expected": "Consent prior to first procedure",
            "actual": "Consent dated 2 days post-procedure"
        }
        resp = client.post("/api/ai/explain-deviation", json=dev_payload, headers=investigator_headers)
        self.assertEqual(resp.status_code, 403)

    @patch("src.backend.app.services.watsonx_service.WatsonxService._generate_text")
    def test_07_malformed_json_graceful_handling(self, mock_gen):
        """Verify that malformed model outputs return HTTP 502 Bad Gateway without crashing backend."""
        mock_gen.return_value = "I am an AI assistant. Unfortunately I cannot output JSON right now."

        payload = {
            "deviationId": "DEV-2026-001",
            "patientId": "PX-101",
            "siteId": "SITE-01",
            "category": "Visit Window",
            "type": "VISIT_OUT_OF_WINDOW",
            "severity": "Minor",
            "expected": "Day 14 ± 3 days",
            "actual": "Day 18"
        }

        resp = client.post("/api/ai/explain-deviation", json=payload)
        self.assertEqual(resp.status_code, 502)
        self.assertIn("could not be parsed as structured JSON", resp.json()["detail"])

    def test_08_unconfigured_inference_returns_503(self):
        """Verify that trying to run inference when unconfigured returns 503 Service Unavailable."""
        os.environ["WATSONX_APIKEY"] = ""
        watsonx_service.refresh_credentials()

        payload = {
            "deviationId": "DEV-2026-001",
            "patientId": "PX-101",
            "siteId": "SITE-01",
            "category": "Visit Window",
            "type": "VISIT_OUT_OF_WINDOW",
            "severity": "Minor",
            "expected": "Day 14 ± 3 days",
            "actual": "Day 18"
        }

        resp = client.post("/api/ai/explain-deviation", json=payload)
        self.assertEqual(resp.status_code, 503)
        self.assertIn("AI service temporarily unavailable", resp.json()["detail"])

    def test_09_credential_redaction(self):
        """Verify that even in error situations, API keys are completely redacted."""
        secret_key = "my-super-secret-ibm-apikey"
        os.environ["WATSONX_APIKEY"] = secret_key
        watsonx_service.refresh_credentials()

        with patch("ibm_watsonx_ai.foundation_models.ModelInference", side_effect=Exception(f"Connection failed for {secret_key}")):
            try:
                watsonx_service._get_model_client()
            except Exception as exc:
                exc_str = str(exc)
                self.assertNotIn(secret_key, exc_str)
                self.assertIn("***REDACTED***", exc_str)

if __name__ == "__main__":
    unittest.main()
