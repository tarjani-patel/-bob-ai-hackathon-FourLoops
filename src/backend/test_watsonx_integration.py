"""TrialGuard AI — End-to-End watsonx.ai Workflow Integration Test.

Tests all three AI workflows against IBM Granite using synthetic CT-101 data.
Does NOT expose API keys.
Does NOT modify any persistent data.
"""
import os
import sys
import json

# Add project root to path so we can import backend modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)

# ── Import service and request models ─────────────────────────────────────────
from app.services.watsonx_service import watsonx_service
from app.models.ai import (
    ExplainDeviationRequest,
    SiteInsightRequest,
    CAPARecommendationRequest,
)

PASS = "[PASS]"
FAIL = "[FAIL]"

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ── Health check ──────────────────────────────────────────────────────────────
section("Health Check")
health = watsonx_service.get_health()
print(f"  Status    : {health.status}")
print(f"  Configured: {health.configured}")
print(f"  Model     : {health.model}")
print(f"  URL       : {health.url}")
if not health.configured:
    print(f"{FAIL} watsonx.ai not configured. Aborting.")
    sys.exit(1)
print(f"{PASS} Health check passed.")

# ── Test A: Deviation Explanation ─────────────────────────────────────────────
section("Test A: Deviation Explanation — CT-101 Visit Window")
deviation_req = ExplainDeviationRequest(
    deviationId="DEV-CT101-001",
    patientId="PT-1042",
    siteId="SITE-03",
    siteName="Northwestern Medical Center",
    category="Visit Window",
    type="Visit Outside Protocol Window",
    severity="Major",
    expected="Visit 3 within ±3 days of Day 42 (Day 39–45)",
    actual="Visit 3 conducted on Day 52 (7 days outside window)",
    evidence="eCRF Visit 3 date: 2024-02-14; Randomisation date: 2023-12-24; Window: Day 39-45"
)

try:
    result_a = watsonx_service.explain_deviation(deviation_req)
    print(f"  Model used           : {result_a.modelUsed}")
    print(f"  Explanation          : {result_a.explanation[:120]}...")
    print(f"  Contributing factors : {result_a.likelyContributingFactors}")
    print(f"  Clinical impact      : {result_a.clinicalImpact[:100]}...")
    print(f"  Limitations          : {result_a.limitations[:80]}...")
    print(f"{PASS} Deviation explanation returned live Granite response.")
except Exception as e:
    safe_e = str(e)
    api_key = os.environ.get("WATSONX_APIKEY", "")
    if api_key:
        safe_e = safe_e.replace(api_key, "***REDACTED***")
    print(f"{FAIL} Deviation explanation failed: {safe_e}")
    sys.exit(1)

# ── Test B: Site Insight ──────────────────────────────────────────────────────
section("Test B: Site Insight — SITE-03 Northwestern Medical Center")
site_req = SiteInsightRequest(
    siteId="SITE-03",
    siteName="Northwestern Medical Center",
    score=78,
    riskBand="HIGH",
    trend="INCREASING",
    predictedScore=85,
    criticalCount=2,
    majorCount=5,
    deviationCount=12,
    topDrivers=["Visit Window Violations", "Lab Protocol Deviations", "Consent Documentation"],
    recentDeviations=[
        {"id": "DEV-CT101-001", "category": "Visit Window", "severity": "Major"},
        {"id": "DEV-CT101-008", "category": "Lab Protocol", "severity": "Critical"},
    ]
)

try:
    result_b = watsonx_service.generate_site_insight(site_req)
    print(f"  Model used                    : {result_b.modelUsed}")
    print(f"  Risk assessment               : {result_b.riskAssessment[:120]}...")
    print(f"  Important patterns            : {result_b.importantPatterns}")
    print(f"  Contributing factors          : {result_b.contributingFactors}")
    print(f"  Emerging risk explanation     : {result_b.emergingRiskExplanation[:100]}...")
    print(f"  Investigation areas           : {result_b.recommendedInvestigationAreas}")
    print(f"{PASS} Site insight returned live Granite response.")
except Exception as e:
    safe_e = str(e)
    api_key = os.environ.get("WATSONX_APIKEY", "")
    if api_key:
        safe_e = safe_e.replace(api_key, "***REDACTED***")
    print(f"{FAIL} Site insight failed: {safe_e}")
    sys.exit(1)

# ── Test C: CAPA Recommendation ───────────────────────────────────────────────
section("Test C: CAPA Recommendation — Visit Window Cluster SITE-03")
capa_req = CAPARecommendationRequest(
    capaId="CAPA-CT101-007",
    siteId="SITE-03",
    siteName="Northwestern Medical Center",
    category="Visit Window",
    problemStatement="Recurrent visit window deviations across 4 subjects at SITE-03 indicating systemic scheduling process failure.",
    evidence="DEV-CT101-001, DEV-CT101-003, DEV-CT101-009, DEV-CT101-011 all show visits conducted 5-9 days outside the protocol-defined window.",
    existingHypothesis="Site coordinator turnover in Q4 2023 may have disrupted established visit scheduling procedures.",
    linkedDeviations=[
        {"id": "DEV-CT101-001", "category": "Visit Window", "severity": "Major"},
        {"id": "DEV-CT101-003", "category": "Visit Window", "severity": "Major"},
        {"id": "DEV-CT101-009", "category": "Visit Window", "severity": "Major"},
        {"id": "DEV-CT101-011", "category": "Visit Window", "severity": "Major"},
    ]
)

try:
    result_c = watsonx_service.generate_capa_recommendation(capa_req)
    print(f"  Model used            : {result_c.modelUsed}")
    print(f"  Root cause hypothesis : {result_c.rootCauseHypothesis[:120]}...")
    print(f"  Corrective action     : {result_c.correctiveAction[:100]}...")
    print(f"  Preventive action     : {result_c.preventiveAction[:100]}...")
    print(f"  Suggested owner       : {result_c.suggestedOwner}")
    print(f"  Priority rationale    : {result_c.priorityRationale[:80]}...")
    print(f"{PASS} CAPA recommendation returned live Granite response.")
except Exception as e:
    safe_e = str(e)
    api_key = os.environ.get("WATSONX_APIKEY", "")
    if api_key:
        safe_e = safe_e.replace(api_key, "***REDACTED***")
    print(f"{FAIL} CAPA recommendation failed: {safe_e}")
    sys.exit(1)

# ── Summary ───────────────────────────────────────────────────────────────────
section("FINAL SUMMARY")
print(f"  {PASS} IBM Authentication        : OK")
print(f"  {PASS} Model                     : {health.model}")
print(f"  {PASS} Deviation Explanation     : Live Granite response received")
print(f"  {PASS} Site Insight              : Live Granite response received")
print(f"  {PASS} CAPA Recommendation       : Live Granite response received")
print(f"\n  All 3 TrialGuard AI workflows successfully returned live IBM Granite responses.")
print(f"  Integration fix is CONFIRMED.\n")
