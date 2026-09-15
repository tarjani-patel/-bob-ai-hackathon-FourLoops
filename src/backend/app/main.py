"""TrialGuard AI — FastAPI Application Entrypoint."""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load local environment configuration from src/backend/.env, falling back to root .env
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_env = os.path.join(backend_dir, ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)
else:
    load_dotenv()

from .data.store import store
from .data.protocol import PROTOCOL_CONFIG
from .services.compliance_engine import evaluate_compliance
from .services.risk_engine import calculate_site_risk
from .services.capa_engine import generate_capas_from_deviations

from .api.routes_trial import router as trial_router
from .api.routes_patients import router as patients_router
from .api.routes_deviations import router as deviations_router
from .api.routes_compliance import router as compliance_router
from .api.routes_risk import router as risk_router
from .api.routes_capa import router as capa_router
from .api.routes_reports import router as reports_router
from .api.routes_audit import router as audit_router
from .api.routes_ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Prime in-memory store with initial compliance and risk state
    patients = store.get_patients()
    deviations = evaluate_compliance(patients, PROTOCOL_CONFIG)
    store.deviations = deviations
    site_risks = [calculate_site_risk(s, patients, deviations, PROTOCOL_CONFIG) for s in PROTOCOL_CONFIG.sites]
    store.capas = generate_capas_from_deviations(deviations, site_risks)
    print(f"[TrialGuard AI] Primed store: {len(patients)} patients, {len(deviations)} deviations, {len(store.capas)} CAPAs.")
    yield

app = FastAPI(
    title="TrialGuard AI API",
    description="Agentic Clinical-Trial Compliance Copilot & Risk Engine API for CT-101 (Cardio-X Phase III)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration supporting frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(trial_router)
app.include_router(patients_router)
app.include_router(deviations_router)
app.include_router(compliance_router)
app.include_router(risk_router)
app.include_router(capa_router)
app.include_router(reports_router)
app.include_router(audit_router)
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    import os
    target = "src.backend.app.main:app" if os.path.exists("src/backend") else "app.main:app"
    uvicorn.run(target, host="0.0.0.0", port=8000, reload=True)
