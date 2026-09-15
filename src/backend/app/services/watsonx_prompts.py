"""Centralized Prompt Engineering for IBM watsonx.ai Granite Foundation Models.

Enforces:
1. Strict clinical compliance persona for trial CT-101 (Cardio-X Phase III).
2. Protocol decisions are established by the deterministic engine; Granite reasons, interprets, and recommends.
3. Zero hallucination: Never invent patient parameters or facts outside supplied payload.
4. Clear distinction between observed facts and hypotheses.
5. Recommendations require human clinical review under 21 CFR 312 / GCP E6(R2).
6. No medical treatment advice.
7. Strict JSON-only schema formatting.
"""
import json
from typing import Dict, Any

SYSTEM_INSTRUCTION = """You are an advanced clinical trial compliance intelligence agent integrated into TrialGuard AI for Protocol CT-101 (Cardio-X Phase III, Investigational Product BC-4089).

CRITICAL OPERATIONAL BOUNDARIES:
1. Source of Truth: Protocol non-compliance has ALREADY been deterministically verified by TrialGuard's rule engine. Do NOT question or decide whether a violation exists.
2. Zero Hallucination: Use ONLY the provided evidence, clinical values, and site context. Never invent unmentioned patient visits, lab values, or medical history.
3. Hypothesis Labeling: Root causes and contributing factors are operational hypotheses and must be framed as hypotheses subject to verification.
4. Regulatory Governance: All corrective and preventive recommendations require human review and sign-off by the Principal Investigator or Sponsor under FDA 21 CFR 312 and ICH GCP E6(R2).
5. No Medical Advice: Provide protocol compliance and trial operations guidance only; do not formulate medical diagnostic or treatment advice.
6. Structured Output: You MUST respond ONLY with a single valid, parseable JSON object adhering strictly to the specified schema. Do NOT include introductory text, explanations, or conversational markdown outside the JSON.
"""

def build_deviation_explanation_prompt(deviation: Dict[str, Any]) -> str:
    """Builds prompt to generate clinical/operational explanation for a specific verified deviation."""
    payload = {
        "deviationId": deviation.get("deviationId"),
        "patientId": deviation.get("patientId"),
        "siteId": deviation.get("siteId"),
        "siteName": deviation.get("siteName"),
        "category": deviation.get("category"),
        "deviationType": deviation.get("type"),
        "severity": deviation.get("severity"),
        "expectedProtocolBenchmark": deviation.get("expected"),
        "actualObservedPatientData": deviation.get("actual"),
        "evidence": deviation.get("evidence"),
    }

    schema_example = {
        "explanation": "Concise factual synthesis explaining what clinical or operational discrepancy occurred and why it violates the specific CT-101 benchmark.",
        "likelyContributingFactors": [
            "Specific operational or administrative factor likely contributing to the lapse",
            "Secondary workflow or scheduling factor"
        ],
        "clinicalImpact": "Assessment of potential participant safety risk, pharmacokinetic impact, or trial endpoint data integrity risk.",
        "limitations": "Explicit note on what external data cannot be verified from the current eCRF record alone."
    }

    return f"""{SYSTEM_INSTRUCTION}

TASK: Provide an AI-assisted clinical and operational interpretation for the following verified protocol deviation.

INPUT DATA:
{json.dumps(payload, indent=2)}

OUTPUT REQUIREMENT:
Respond with a single valid JSON object with EXACTLY these keys:
{json.dumps(schema_example, indent=2)}

JSON RESPONSE:"""

def build_site_insight_prompt(site_data: Dict[str, Any]) -> str:
    """Builds prompt to analyze multi-deviation patterns and emerging risk for an investigation site."""
    payload = {
        "siteId": site_data.get("siteId"),
        "siteName": site_data.get("siteName"),
        "deterministicRiskScore": site_data.get("score"),
        "riskBand": site_data.get("riskBand"),
        "trajectoryTrend": site_data.get("trend"),
        "projectedScore30Days": site_data.get("predictedScore"),
        "criticalDeviations": site_data.get("criticalCount"),
        "majorDeviations": site_data.get("majorCount"),
        "totalDeviations": site_data.get("deviationCount"),
        "topRiskDrivers": site_data.get("topDrivers") or [],
        "recentDeviations": site_data.get("recentDeviations") or [],
    }

    schema_example = {
        "riskAssessment": "Clear, executive-level summary explaining why this investigation site has reached its current risk profile based on actual deviations.",
        "importantPatterns": [
            "Pattern 1: Cross-subject deviation clustering or systemic process issue",
            "Pattern 2: Timing, category recurrence, or communication bottleneck"
        ],
        "contributingFactors": [
            "Hypothesized site operational or resource constraint",
            "EDC or pharmacy coordination bottleneck"
        ],
        "emergingRiskExplanation": "Forward-looking synthesis of how current deviation velocity could compromise trial data integrity or participant retention if unaddressed.",
        "recommendedInvestigationAreas": [
            "Immediate high-priority operational audit target for Lead CRA",
            "Secondary reconciliation or retraining focus"
        ]
    }

    return f"""{SYSTEM_INSTRUCTION}

TASK: Provide an objective site risk synthesis and pattern identification for the following clinical trial investigation center.

INPUT DATA:
{json.dumps(payload, indent=2)}

OUTPUT REQUIREMENT:
Respond with a single valid JSON object with EXACTLY these keys:
{json.dumps(schema_example, indent=2)}

JSON RESPONSE:"""

def build_capa_recommendation_prompt(capa_data: Dict[str, Any]) -> str:
    """Builds prompt to formulate a structured CAPA proposal based on deviation clusters."""
    payload = {
        "capaId": capa_data.get("capaId"),
        "siteId": capa_data.get("siteId"),
        "siteName": capa_data.get("siteName"),
        "category": capa_data.get("category"),
        "observedProblemStatement": capa_data.get("problemStatement"),
        "supportingEvidence": capa_data.get("evidence"),
        "existingHypothesis": capa_data.get("existingHypothesis"),
        "linkedDeviations": capa_data.get("linkedDeviations") or [],
    }

    schema_example = {
        "rootCauseHypothesis": "Structured 5-Whys root-cause hypothesis explaining the systemic breakdown that enabled the deviation to occur.",
        "correctiveAction": "Specific, verifiable immediate corrective actions to contain risk for affected participants and reconcile eCRF records.",
        "preventiveAction": "Systemic preventive measures (e.g. EHR clinical decision alert, mandatory dual-signoff, staff retraining) to ensure zero recurrence.",
        "suggestedOwner": "Recommended operational lead (e.g., Principal Investigator, Investigational Pharmacy Director, or Lead CRA).",
        "priorityRationale": "Clear justification for urgency rating based on participant safety and ICH GCP compliance risk."
    }

    return f"""{SYSTEM_INSTRUCTION}

TASK: Propose a structured Corrective and Preventive Action (CAPA) plan for the observed clinical protocol quality problem.

INPUT DATA:
{json.dumps(payload, indent=2)}

OUTPUT REQUIREMENT:
Respond with a single valid JSON object with EXACTLY these keys:
{json.dumps(schema_example, indent=2)}

JSON RESPONSE:"""
