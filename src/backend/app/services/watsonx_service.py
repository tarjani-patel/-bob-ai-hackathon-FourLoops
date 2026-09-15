"""TrialGuard AI — IBM watsonx.ai Granite Foundation Model Integration Service.

Connects to IBM watsonx.ai using ModelInference from the ibm-watsonx-ai SDK.
Provides structured AI interpretation, site risk patterns, and CAPA recommendations.
Strictly redacts credentials and handles downtime gracefully without breaking deterministic operations.
"""
import os
import re
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from fastapi import HTTPException, status
from pydantic import ValidationError

from ..models.ai import (
    AIHealthResponse,
    ExplainDeviationRequest,
    DeviationExplanationAIResponse,
    SiteInsightRequest,
    SiteInsightAIResponse,
    CAPARecommendationRequest,
    CAPARecommendationAIResponse,
)
from .watsonx_prompts import (
    build_deviation_explanation_prompt,
    build_site_insight_prompt,
    build_capa_recommendation_prompt,
)

logger = logging.getLogger("trialguard.watsonx")

# Find src/backend/.env
_service_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_backend_env = os.path.join(_service_dir, ".env")
if os.path.exists(_backend_env):
    load_dotenv(_backend_env)
else:
    load_dotenv()

class WatsonxService:
    def __init__(self):
        self.refresh_credentials()

    def refresh_credentials(self):
        """Reloads credentials from environment variables if dynamically updated."""
        if os.path.exists(_backend_env):
            load_dotenv(_backend_env, override=False)
        self.api_key = os.environ.get("WATSONX_APIKEY", "").strip()
        self.project_id = os.environ.get("WATSONX_PROJECT_ID", "").strip()
        self.url = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com").strip()
        self.model_id = os.environ.get("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct").strip()
        self._model_client = None

    def is_configured(self) -> bool:
        """Returns True if minimum credentials for watsonx.ai are present."""
        self.refresh_credentials()
        return bool(self.api_key and self.project_id and self.url)

    def get_health(self) -> AIHealthResponse:
        """Returns configuration status without exposing sensitive credentials."""
        configured = self.is_configured()
        return AIHealthResponse(
            status="configured" if configured else "unconfigured",
            configured=configured,
            model=self.model_id,
            url=self.url,
            message=(
                f"IBM watsonx.ai foundation model ({self.model_id}) configured and ready."
                if configured
                else "IBM watsonx.ai credentials not configured. Deterministic compliance analysis remains available."
            )
        )

    def _get_model_client(self):
        """Instantiates or returns cached ModelInference client."""
        if not self.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Deterministic compliance analysis remains available."
            )

        if self._model_client is not None:
            return self._model_client

        try:
            from ibm_watsonx_ai.foundation_models import ModelInference
            from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

            parameters = {
                GenParams.DECODING_METHOD: "greedy",
                GenParams.MAX_NEW_TOKENS: 900,
                GenParams.MIN_NEW_TOKENS: 1,
                GenParams.TEMPERATURE: 0.1,
                GenParams.REPETITION_PENALTY: 1.05,
            }

            credentials = {
                "url": self.url,
                "apikey": self.api_key,
            }

            self._model_client = ModelInference(
                model_id=self.model_id,
                params=parameters,
                credentials=credentials,
                project_id=self.project_id,
            )
            return self._model_client
        except Exception as err:
            sanitized_err = str(err).replace(self.api_key, "***REDACTED***") if self.api_key else str(err)
            logger.error("[TrialGuard AI] Failed to initialize IBM watsonx client: %s", sanitized_err)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to connect to IBM watsonx.ai: {sanitized_err}"
            )

    def _generate_text(self, prompt: str) -> str:
        """Executes prompt inference through IBM Granite with robust exception handling."""
        client = self._get_model_client()
        try:
            raw_response = client.generate_text(prompt=prompt)
            if not raw_response or not isinstance(raw_response, str):
                raise ValueError("Received empty or non-string response from Granite.")
            return raw_response
        except HTTPException:
            raise
        except Exception as err:
            sanitized_err = str(err).replace(self.api_key, "***REDACTED***") if self.api_key else str(err)
            logger.error("[TrialGuard AI] Granite generation error: %s", sanitized_err)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="IBM watsonx.ai foundation model request failed or timed out."
            )

    def _extract_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        """Safely parses structured JSON from Granite output, stripping markdown wrappers."""
        cleaned = raw_text.strip()
        # Remove ```json ... ``` or ``` ... ```
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
            if match:
                cleaned = match.group(1).strip()

        # Locate outermost JSON object boundaries
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned = cleaned[start_idx : end_idx + 1]

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.warning("[TrialGuard AI] Failed to decode JSON from Granite output: %s | Text: %s", err, cleaned[:200])
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The IBM Granite foundation model returned a response that could not be parsed as structured JSON."
            )

    def explain_deviation(self, req: ExplainDeviationRequest) -> DeviationExplanationAIResponse:
        """Generates AI clinical interpretation for a verified protocol deviation."""
        prompt = build_deviation_explanation_prompt(req.model_dump())
        raw_text = self._generate_text(prompt)
        data = self._extract_and_parse_json(raw_text)

        try:
            data["modelUsed"] = self.model_id
            return DeviationExplanationAIResponse(**data)
        except ValidationError as val_err:
            logger.error("[TrialGuard AI] Schema validation failed for deviation explanation: %s", val_err)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="IBM Granite response did not conform to the required clinical explanation schema."
            )

    def generate_site_insight(self, req: SiteInsightRequest) -> SiteInsightAIResponse:
        """Generates AI pattern synthesis and emerging risk explanation for a clinical site."""
        prompt = build_site_insight_prompt(req.model_dump())
        raw_text = self._generate_text(prompt)
        data = self._extract_and_parse_json(raw_text)

        try:
            data["modelUsed"] = self.model_id
            return SiteInsightAIResponse(**data)
        except ValidationError as val_err:
            logger.error("[TrialGuard AI] Schema validation failed for site insight: %s", val_err)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="IBM Granite response did not conform to the required site insight schema."
            )

    def generate_capa_recommendation(self, req: CAPARecommendationRequest) -> CAPARecommendationAIResponse:
        """Generates AI root-cause hypothesis and corrective/preventive recommendations."""
        prompt = build_capa_recommendation_prompt(req.model_dump())
        raw_text = self._generate_text(prompt)
        data = self._extract_and_parse_json(raw_text)

        try:
            data["modelUsed"] = self.model_id
            return CAPARecommendationAIResponse(**data)
        except ValidationError as val_err:
            logger.error("[TrialGuard AI] Schema validation failed for CAPA recommendation: %s", val_err)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="IBM Granite response did not conform to the required CAPA recommendation schema."
            )

# Global singleton instance
watsonx_service = WatsonxService()
