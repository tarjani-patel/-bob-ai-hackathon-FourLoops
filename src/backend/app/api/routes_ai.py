"""TrialGuard AI — IBM watsonx.ai Granite API Routes.

Exposes endpoints for:
- AI Service Health & Model Status
- Deviation Clinical Interpretation
- Site Pattern & Risk Insights
- CAPA Root-Cause & Action Recommendations

Enforces RBAC site-scoping (SITE_INVESTIGATOR restricted to assigned site)
and logs compliance audit records for all AI queries.
"""
from fastapi import APIRouter, Request, HTTPException, status

from ..data.store import store
from ..models.ai import (
    AIHealthResponse,
    ExplainDeviationRequest,
    DeviationExplanationAIResponse,
    SiteInsightRequest,
    SiteInsightAIResponse,
    CAPARecommendationRequest,
    CAPARecommendationAIResponse,
)
from ..services.watsonx_service import watsonx_service
from ..services.rbac_service import get_current_user_context, check_site_access

router = APIRouter(prefix="/api/ai", tags=["IBM watsonx.ai Engine"])

@router.get("/health", response_model=AIHealthResponse)
def get_ai_health() -> AIHealthResponse:
    """Returns the current IBM watsonx.ai configuration status and active model."""
    return watsonx_service.get_health()

@router.post("/explain-deviation", response_model=DeviationExplanationAIResponse)
def explain_deviation(
    req: ExplainDeviationRequest,
    request: Request,
) -> DeviationExplanationAIResponse:
    """Generates an AI clinical explanation for a verified protocol deviation using IBM Granite.
    
    Adheres strictly to deterministic deviation facts and provides GCP-aligned interpretations.
    """
    user_ctx = get_current_user_context(request)
    # RBAC: Verify user has authorization to access this site's deviation data
    check_site_access(user_ctx, req.siteId)

    result = watsonx_service.explain_deviation(req)

    # 21 CFR Part 11 compliant audit logging
    store.record_audit(
        action="AI_DEVIATION_EXPLANATION_REQUESTED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=req.siteId,
        target_id=req.deviationId,
        details={
            "patientId": req.patientId,
            "category": req.category,
            "type": req.type,
            "severity": req.severity,
            "model": result.modelUsed,
        }
    )

    return result

@router.post("/site-insight", response_model=SiteInsightAIResponse)
def get_site_insight(
    req: SiteInsightRequest,
    request: Request,
) -> SiteInsightAIResponse:
    """Synthesizes deterministic site risk metrics into emerging risk explanations using IBM Granite."""
    user_ctx = get_current_user_context(request)
    # RBAC: Verify site access
    check_site_access(user_ctx, req.siteId)

    result = watsonx_service.generate_site_insight(req)

    store.record_audit(
        action="AI_SITE_INSIGHT_REQUESTED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=req.siteId,
        target_id=req.siteId,
        details={
            "score": req.score,
            "riskBand": req.riskBand,
            "model": result.modelUsed,
        }
    )

    return result

@router.post("/capa-recommendation", response_model=CAPARecommendationAIResponse)
def get_capa_recommendation(
    req: CAPARecommendationRequest,
    request: Request,
) -> CAPARecommendationAIResponse:
    """Generates actionable root-cause hypothesis and corrective/preventive proposals for CAPAs."""
    user_ctx = get_current_user_context(request)
    # RBAC: Verify site access
    check_site_access(user_ctx, req.siteId)

    result = watsonx_service.generate_capa_recommendation(req)

    store.record_audit(
        action="AI_CAPA_RECOMMENDATION_GENERATED",
        performed_by=user_ctx["user_name"],
        role=user_ctx["role"],
        site_id=req.siteId,
        target_id=req.capaId or "NEW_CAPA",
        details={
            "category": req.category,
            "siteId": req.siteId,
            "model": result.modelUsed,
        }
    )

    return result
