"""TrialGuard AI Core Computational Services."""
from .compliance_engine import evaluate_compliance
from .risk_engine import calculate_patient_risk, calculate_site_risk, calculate_trial_metrics, compute_site_trend
from .capa_engine import generate_capas_from_deviations
from .explanation_service import generate_deviation_explanation, generate_trial_executive_insight
from .rbac_service import get_current_user_context, check_site_access, check_role_permission

__all__ = [
    "evaluate_compliance",
    "calculate_patient_risk",
    "calculate_site_risk",
    "calculate_trial_metrics",
    "compute_site_trend",
    "generate_capas_from_deviations",
    "generate_deviation_explanation",
    "generate_trial_executive_insight",
    "get_current_user_context",
    "check_site_access",
    "check_role_permission",
]
