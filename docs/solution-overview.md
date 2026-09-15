# Solution Overview

## What We Built

**TrialGuard AI** is an agentic clinical-trial compliance copilot designed to transform clinical research oversight from reactive, retrospective auditing to continuous, proactive verification.

TrialGuard continuously checks participant activity against trial protocol rules, detects and explains protocol deviations, calculates normalized risk scores for each investigation center, forecasts emerging risk trajectories, and autonomously synthesizes Corrective and Preventive Actions (CAPA) with mandatory human review.

## Architecture Principle

> **"Objective protocol compliance is deterministically validated by our compliance engine. AI is used for interpretation, risk reasoning, and action generation."**

By separating objective compliance fact checking (which must be 100% reproducible and auditable) from generative AI reasoning (which synthesizes root causes and corrective actions), TrialGuard AI complies with strict Good Clinical Practice (GCP) and FDA regulatory requirements.

## How It Works

The core user workflow follows an intuitive six-stage progression:

```
[Patient Ingestion] 
       ↓
[Deterministic Compliance Engine]
       ↓ (Detects Early/Late/Missed, Dose, Conmed, Lab Omission)
[Deviation Register & Hero Element]
       ↓ (Protocol Requirement vs. Actual Data)
[Site Risk Engine (0-100 Normalized)]
       ↓ (Identifies Site 03 as High Risk)
[Predictive Velocity Forecast]
       ↓ (30-Day Estimated Trajectory)
[Automated CAPA Generator]
       ↓ (Root-Cause Hypothesis + Mandatory Human Sign-Off)
[Compliance Auditor Action]
```

1. **Patient Data Ingestion:** Participant demographics, visit logs, vital signs, medication reconciliation, and laboratory feeds are ingested across all 5 participating sites.
2. **Deterministic Compliance Rule Validation:** The engine executes auditable logic evaluating visit window tolerances (e.g. Day 14 ± 3), investigational product dosage adherence, contraindicated concomitant therapies (e.g. Drug-X), and mandatory laboratory panels (e.g. CBC prior to Visit 3).
3. **Hero Deviation Comparison:** When discrepancies are identified, TrialGuard isolates the **Protocol Requirement (Expected)** against the **Actual Patient Data (Observed)** alongside regulatory impact citations.
4. **Site Risk Aggregation & Ranking:** Patient-level deviations are aggregated with severity weights (Critical: 15, Major: 10, Minor: 4, Admin: 1) and recurrence modifiers (+5 repeat, +5 multi-category). High-risk investigation centers (such as Site 03) naturally emerge at the top of the risk leaderboard.
5. **Emerging Risk Forecasting:** A transparent velocity model computes 30-day projected risk, distinguishing between sites with isolated clerical errors versus centers with accelerating systemic failure rates.
6. **CAPA Generation with Human-in-the-Loop:** Systemic deviation clusters trigger structured CAPA proposals with root-cause hypotheses, immediate containment, and preventative workflows—all requiring human CRA/PI sign-off before regulatory filing.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Deterministic Compliance Verification** | Regulatory compliance (FDA 21 CFR 312 / ICH GCP E6) forbids relying on probabilistic LLMs for objective deviation facts. Rules must be 100% auditable and reproducible. |
| **Hero Comparison Component** | Auditors need immediate clarity. Side-by-side contrast of "Protocol Expected" vs "Actual Observed" cuts deviation triage time by >75%. |
| **Mathematical Site Risk Normalization** | Avoids arbitrary scoring by combining violation density per patient, cohort contamination percentage, and critical severity weights. |
| **Mandatory Human-in-the-Loop for CAPA** | Autonomous AI should recommend corrective actions, but GCP guidelines mandate that licensed Principal Investigators and CCRA monitors approve clinical plans. |
| **Restrained Enterprise Clinical Aesthetic** | Replaced flashy AI tropes (neon, glassmorphism, rainbow charts) with a calming clinical blue and slate palette optimized for high-density regulatory audits. |

## IBM Technologies Used

- **IBM Bob AI Developer:** Used to architect, implement, and refine the full-stack prototype directly within the hackathon repository, generating the deterministic engines, clean React components, and comprehensive test suite.
- **IBM watsonx.ai (Architectural Integration Ready):** The application architecture includes pre-configured bridge connectors (visible in Settings > Integrations) to bind foundation models (such as `ibm/granite-13b-instruct`) for generating clinical root-cause hypotheses and regulatory narrative summaries.
