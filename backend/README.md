# TrialGuard AI — Python FastAPI Backend

FastAPI deterministic compliance, risk scoring, CAPA generation, and role-based access control backend service for TrialGuard AI (CT-101 Cardio-X Phase III Trial).

## Architecture Overview

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint, middleware & routers
│   ├── models/                  # Pydantic v2 data models
│   │   ├── trial.py             # Trial, Site, Protocol schemas
│   │   ├── patient.py           # Patient, Visit, Lab, Medication schemas
│   │   ├── deviation.py         # Deviation & Severity schemas
│   │   ├── capa.py              # CAPA proposal & status schemas
│   │   ├── audit.py             # Clinical audit trail schemas
│   │   └── analysis.py          # Compliance run & response schemas
│   ├── data/
│   │   ├── protocol.py          # CT-101 protocol specification & rules
│   │   ├── synthetic_data.py    # 104 synthetic patients across 5 clinical sites
│   │   └── store.py             # In-memory thread-safe state store
│   ├── services/
│   │   ├── compliance_engine.py # Deterministic protocol verification engine
│   │   ├── risk_engine.py       # Patient, site, and trial risk scoring engine
│   │   ├── capa_engine.py       # Automated CAPA clustering and formulation
│   │   ├── explanation_service.py # Deterministic audit explanation generator
│   │   └── rbac_service.py      # Clinical role & site scoping enforcement
│   ├── api/
│   │   ├── routes_trial.py      # /api/health, /api/trial, /api/protocol, /api/sites
│   │   ├── routes_patients.py   # /api/patients, /api/patients/{id}
│   │   ├── routes_deviations.py # /api/deviations, /api/deviations/{id}
│   │   ├── routes_compliance.py # /api/compliance/analyze
│   │   ├── routes_risk.py       # /api/risk/trial, /api/risk/sites, /api/risk/patients
│   │   ├── routes_capa.py       # /api/capas, /api/capas/{id}
│   │   ├── routes_reports.py    # /api/reports
│   │   └── routes_audit.py      # /api/audit
│   └── utils/
│       └── __init__.py
├── requirements.txt
└── README.md
```

## Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Or from the project root:
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 3. Interactive API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## RBAC Demonstration Headers

The API supports role-based scoping via standard HTTP prototype headers:
- `X-Demo-Role`: `CRA` | `SITE_INVESTIGATOR` | `DATA_MANAGER` | `SPONSOR`
- `X-Demo-Site`: Site ID filter, e.g. `SITE-03`
- `X-Demo-User`: User identifier string for audit logging
