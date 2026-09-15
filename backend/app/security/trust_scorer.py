from collections.abc import Mapping
from typing import Any


class DocumentTrustScorer:
    """Convert a document analyzer result into a deterministic trust score."""

    def score(self, analysis_result: Mapping[str, Any]) -> dict[str, Any]:
        if not isinstance(analysis_result, Mapping):
            raise TypeError("Analysis result must be a mapping.")

        risk_score = analysis_result.get("risk_score")
        if isinstance(risk_score, bool) or not isinstance(risk_score, int):
            raise ValueError("Analysis result risk_score must be an integer.")
        if not 0 <= risk_score <= 100:
            raise ValueError("Analysis result risk_score must be between 0 and 100.")

        is_safe = analysis_result.get("is_safe")
        if not isinstance(is_safe, bool):
            raise ValueError("Analysis result is_safe must be a boolean.")

        threats = analysis_result.get("threats")
        if not isinstance(threats, list):
            raise ValueError("Analysis result threats must be a list.")

        trust_score = max(0, 100 - risk_score)

        if trust_score >= 90:
            trust_level = "trusted"
        elif trust_score >= 60:
            trust_level = "moderate"
        else:
            trust_level = "high_risk"

        return {
            "trust_score": trust_score,
            "trust_level": trust_level,
            "risk_score": risk_score,
            "is_safe": is_safe,
            "threat_count": len(threats),
        }
