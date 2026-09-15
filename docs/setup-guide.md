# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [x] Node.js 18+ (tested on Node v24.13.0)
- [x] npm 9+ (tested on npm 11.6.2)
- [x] Modern web browser (Chrome, Edge, Firefox, Safari)

## Environment Variables

Copy `.env.example` to `.env` (optional for local mock prototype; required when connecting external watsonx services):

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `VITE_APP_TITLE` | Application title display | No (Defaults to TrialGuard AI) |
| `WATSONX_API_KEY` | IBM watsonx.ai API key (for live cloud LLM bridge) | No (Client-side mock active) |
| `WATSONX_PROJECT_ID` | IBM watsonx.ai Project ID | No (Client-side mock active) |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/tarjani-patel/trialguard-ai.git
cd trialguard-ai

# 2. Install application dependencies
npm install
```

## Running the Application

```bash
# Start the local Vite development server
npm run dev
```

The application will be available at: `http://localhost:5173`

To build the production-ready bundle and preview it:

```bash
# Compile optimized production build
npm run build

# Preview production build locally
npm run preview
```

## Running Verification Tests

To verify the deterministic compliance engine and risk scoring calculations independently via Node.js:

```bash
node -e "import('./src/data/syntheticPatients.js').then(p => import('./src/data/protocolConfig.js').then(proto => import('./src/logic/complianceEngine.js').then(c => import('./src/logic/riskEngine.js').then(r => { const devs = c.evaluateCompliance(p.SYNTHETIC_PATIENTS, proto.PROTOCOL_CONFIG); console.log('Total Deviations:', devs.length); const metrics = r.calculateTrialMetrics(proto.PROTOCOL_CONFIG.sites, p.SYNTHETIC_PATIENTS, devs, proto.PROTOCOL_CONFIG); console.log('Site Risks:'); metrics.siteRiskList.forEach(s => console.log(s.siteCode, s.siteName, 'Score:', s.score, 'Band:', s.riskBand)); }))));"
```

Expected Output:
```
Total Deviations: 32
Site Risks:
SITE-03 Metro General Health Science Center Score: 73 Band: High
SITE-05 Boston Cardiovascular & Research Hospital Score: 33 Band: Medium
SITE-02 Johns Hopkins Clinical Trials Unit Score: 15 Band: Low
SITE-01 Mayo Clinic Research Center Score: 5 Band: Low
SITE-04 Stanford Cardiovascular Institute Score: 1 Band: Low
```

## Key Navigation Routes

- `/` — Clinical Trial Executive Dashboard
- `/protocol` — Protocol Rules & Assessment Specifications
- `/patients` — Participant Cohort Adherence Table & Visit Timeline
- `/deviations` — Protocol Deviations Register & Hero Element
- `/sites` — Ranked Site Risk Leaderboard & Predictive Forecasts
- `/capa` — Corrective and Preventive Actions with Human Review
- `/reports` — Regulatory Reports & Audit Sign-Off
- `/settings` — Protocol Tolerances & AI Integration Settings
