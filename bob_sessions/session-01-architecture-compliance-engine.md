# IBM Bob Session 01 — Architecture, Deterministic Compliance Engine & Enterprise Dashboard

- **Date:** 2026-02-15
- **Developer / Lead:** Tarjani Patel
- **Session Tool:** IBM Bob AI Assistant
- **Track:** AI Track — IBM Bob AI Hackathon

## Objectives Addressed

1. Ingest official IBM Bob AI Hackathon submission template repository while strictly preserving existing root structure (`docs/`, `demo/`, `presentation/`, `.github/`, `submission.yaml`, `CONTRIBUTING.md`).
2. Implement **TrialGuard AI** directly in `src/` as an agentic clinical-trial compliance copilot.
3. Design and implement a **deterministic compliance engine** that verifies patient visit windows, investigational drug dosing, prohibited concomitant medications (Drug-X), and mandatory safety laboratory panels (pre-Visit 3 CBC) without LLM hallucinations.
4. Build a **normalized site risk engine (0–100)** incorporating severity weights (Critical: 15, Major: 10, Minor: 4, Admin: 1) and recurrence modifiers (+5 repeat, +5 multi-category).
5. Seed realistic violations into ~104 patients across 5 sites so that **Site 03 naturally calculates as highest risk** without hardcoding.
6. Build the **Hero Element**: Protocol Requirement vs. Actual Patient Data.
7. Construct automated **CAPA Generation** with mandatory **Human Review Required** enforcement.
8. Deliver 8 core responsive routes:
   - Dashboard (`/`)
   - Trial & Protocol (`/protocol`)
   - Patients (`/patients`)
   - Deviations (`/deviations`)
   - Site Risk (`/sites`)
   - CAPA (`/capa`)
   - Reports (`/reports`)
   - Settings (`/settings`)
9. Provide centered notification modal with unread counts and interactive demo flow toolbar.
10. Update all hackathon documentation files (`submission.yaml`, `README.md`, `docs/*`).

## Verification Output

- Production build (`npm run build`) succeeded with 0 errors and optimized code-split chunks.
- Deterministic compliance engine verified across all 104 synthetic subject records:
  - 32 total deviations detected
  - Site 03 naturally scored 73/100 (High Risk Band)
  - 4 structured CAPA action plans autonomously generated with mandatory human review indicators.
