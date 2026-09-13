import re
from collections.abc import Mapping
from typing import Any


class ResponseSanitizer:
    """Apply redaction or blocking to a validated LLM response."""

    BLOCKED_RESPONSE = "[BLOCKED: Response rejected by SecureRAG security policy.]"

    def sanitize(
        self,
        validation_result: Mapping[str, Any],
        action: str = "redact",
    ) -> dict[str, Any]:
        if not isinstance(validation_result, Mapping):
            raise TypeError("Validation result must be a mapping.")
        if action not in {"redact", "block"}:
            raise ValueError("Action must be exactly 'redact' or 'block'.")

        original_response = validation_result.get("original_response")
        if not isinstance(original_response, str):
            raise TypeError("Validation result original_response must be a string.")

        violations = validation_result.get("violations")
        if not isinstance(violations, list):
            raise TypeError("Validation result violations must be a list.")

        is_safe = validation_result.get("is_safe")
        if not isinstance(is_safe, bool):
            raise ValueError("Validation result is_safe must be a boolean.")

        risk_score = validation_result.get("risk_score")

        if is_safe:
            result_action = "allowed"
            sanitized_response = original_response
        elif action == "block":
            result_action = "blocked"
            sanitized_response = self.BLOCKED_RESPONSE
        else:
            result_action = "redacted"
            sanitized_response = self._redact_violations(
                original_response,
                violations,
            )

        return {
            "action": result_action,
            "is_safe": is_safe,
            "risk_score": risk_score,
            "violations": violations,
            "original_response": original_response,
            "sanitized_response": sanitized_response,
        }

    def _redact_violations(
        self,
        response: str,
        violations: list[Any],
    ) -> str:
        sanitized_response = response

        for index, violation in enumerate(violations):
            if not isinstance(violation, Mapping):
                raise ValueError(f"Violation at index {index} must be a mapping.")

            pattern = violation.get("pattern")
            if not isinstance(pattern, str):
                raise ValueError(
                    f"Violation pattern at index {index} must be a string."
                )

            sanitized_response = re.sub(
                re.escape(pattern),
                "[REDACTED]",
                sanitized_response,
                flags=re.IGNORECASE,
            )

        return sanitized_response
