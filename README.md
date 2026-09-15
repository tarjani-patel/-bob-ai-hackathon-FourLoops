# 🛡️ TrialGuard AI — Agentic Clinical-Trial Compliance Copilot

> Continuous, deterministic protocol compliance monitoring, objective site risk scoring, and automated CAPA generation for modern clinical research.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | TrialGuard Team |
| **Track** | AI (IBM Bob AI Hackathon) |
| **Team Lead** | Tarjani Patel — [tarjani.patel@ibm.com] |
| **Members** | Tarjani Patel |

---

## 🎯 Problem Statement

Clinical trial compliance failures represent one of the costliest bottlenecks in drug development, where over **70% of clinical trials experience protocol deviations** that delay life-saving drug approvals and inflate monitoring costs by millions of dollars. Clinical Research Associates (CRAs) and Medical Monitors are burdened with retrospective, manual reviews across fragmented electronic data capture (EDC), laboratory systems, and site logs—often discovering protocol breaches weeks or months after they compromise participant safety and trial endpoint validity.

---

## 💡 Solution

**TrialGuard AI** is an agentic clinical-trial compliance copilot that continuously checks patient activity against trial protocols in real-time. Built on a strict **deterministic-first architectural principle**, objective compliance checks (visit windows, dosing accuracy, prohibited medications, mandatory labs) are evaluated by deterministic code rather than an untrusted LLM, ensuring zero hallucinations and 100% auditability for FDA 21 CFR Part 11 and ICH GCP E6(R2). AI is leveraged for what it does best: contextual explanation, root-cause hypothesis generation, and automated Corrective and Preventive Action (CAPA) synthesis with mandatory human-in-the-loop sign-off.

---

## ✨ Key Features

- **Deterministic Compliance Engine:** Objectively verifies patient visit timing (Day ± Window), investigational product dosing (100 mg QD), prohibited concomitant medications (Drug-X), and mandatory laboratory panels (pre-Visit 3 CBC).
- **HERO Comparison Element:** High-visibility audit inspection displaying **Protocol Requirement (Expected)** vs. **Actual Patient Data (Observed)** with clinical and regulatory rationales (ICH GCP E6 Section 4.5).
- **Normalized Site Risk Index (0–100):** Mathematically rigorous site risk calculation integrating deviation density, severity weights (Critical: 15, Major: 10, Minor: 4, Admin: 1), and recurrence modifiers (+5 repeat, +5 multi-category). Naturally ranks problematic sites (e.g., Site 03) as highest risk.
- **Predictive Risk & Trajectory Engine:** 30-day velocity forecast transparently predicting site compliance degradation without black-box ML obscurity.
- **Automated CAPA Generator:** Analyzes systemic violation clusters to formulate problem statements, evidence logs, root-cause hypotheses, immediate corrective steps, and long-term preventive actions—with prominent **Human Review Required** enforcement.
- **Regulatory Reporting & Export Center:** Formatted clinical compliance reports and audit registers ready for sponsor and regulatory review.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & Design** | Tailwind CSS (Enterprise Clinical Blue palette) |
| **Routing & Navigation** | React Router v6 |
| **Data Visualization** | Recharts (Deviation velocity, Site risk index) |
| **Icons & Indicators** | Lucide React |
| **IBM & AI Integration** | IBM Bob AI Developer, watsonx.ai-ready architecture |
| **Regulatory Standards** | FDA 21 CFR 312 / ICH GCP E6(R2) Section 4.5.3 |

---

## 🚀 Core Product Story & Demo Flow

```
Patient Activity → Protocol Check → Deviation Flagged → Site Risk Calculated → Trend Prediction → CAPA Generated
```

Follow this 3–5 minute hackathon demo sequence (guided by the built-in top demo bar):

1. **Dashboard:** Review overall trial compliance (92.4%), risk gauge (73/100), and open deviations.
2. **Run Compliance Analysis:** Click the prominent button to trigger the deterministic compliance scan across 104 subjects.
3. **Inspect Deviations:** Navigate to Deviations to see 29 detected violations across severity tiers.
4. **Hero Comparison:** Click a late Visit 2 deviation (PT-1042) to view **Protocol Requirement** vs. **Actual Data**.
5. **Patient Drill-Down:** Inspect participant PT-1042's visual visit timeline showing compliant, early, late, and missed events.
6. **Site Risk Leaderboard:** Navigate to Site Risk to see Site 03 emerge naturally as the #1 highest risk site (73/100, High Band, Worsening trend).
7. **30-Day Forecast:** Review Site 03's predictive trajectory and primary risk drivers.
8. **CAPA Management:** Open CAPA to review CAPA-2026-001 with its **Human Review Required** badge, root causes, and approve button.
9. **Notifications:** Open the notification bell to verify automated alerts generated from threshold crossings.

---

## 📁 Repository Structure

```
├── src/
│   ├── components/       # Reusable UI components & drawers (Hero panel, Visit timeline)
│   ├── context/          # TrialContext state management & analysis engine runner
│   ├── data/             # Protocol specification & synthetic patient cohort (104 patients)
│   ├── logic/            # Deterministic compliance, risk, trend, explanation & CAPA engines
│   ├── pages/            # 8 core application routes (Dashboard, Protocol, Patients, etc.)
│   ├── App.jsx           # Main router & application layout
│   └── main.jsx          # Vite React entry point
├── docs/                 # Hackathon documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Screenshots & video demonstration artifacts
├── presentation/         # Hackathon pitch slide deck
├── bob_sessions/         # IBM Bob development session provenance artifacts
├── submission.yaml       # Structured submission metadata
└── package.json          # Project manifest & build scripts
```

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run production build & verify
npm run build
```

Application will run locally at: `http://localhost:5173`
