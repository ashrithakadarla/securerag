import re
from typing import Any


class ResponseValidator:
    """Rule-based validator for potentially unsafe LLM responses."""

    PATTERNS = {
        "credential_leak": [
            r"\bpassword\b",
            r"\bapi\s+key\b",
            r"\bsecret\s+key\b",
            r"\baccess\s+token\b",
        ],
        "system_prompt_leak": [
            r"\bsystem\s+prompt\b",
            r"\bhidden\s+instructions\b",
            r"\breveal\s+your\s+instructions\b",
        ],
        "sensitive_data": [
            r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            r"\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b",
            r"\b(?:sk|pk)-[A-Za-z0-9_-]{8,}\b",
            r"\bbearer\s+[A-Za-z0-9._-]{20,}\b",
        ],
        "unsafe_instruction": [
            r"\bdisable\s+security\b",
            r"\bbypass\s+authentication\b",
            r"\bexecute\s+malicious\s+commands?\b",
        ],
    }

    PENALTIES = {
        "credential_leak": 40,
        "system_prompt_leak": 35,
        "sensitive_data": 25,
        "unsafe_instruction": 30,
    }

    def validate(self, response: str) -> dict[str, Any]:
        if not isinstance(response, str):
            raise TypeError("Response must be a string.")

        violations: list[dict[str, str]] = []
        risk_score = 0

        for violation_type, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    penalty = self.PENALTIES[violation_type]
                    violations.append(
                        {
                            "type": violation_type,
                            "pattern": match.group(0),
                            "severity": self._get_severity(penalty),
                        }
                    )
                    risk_score += penalty
                    break

        return {
            "is_safe": len(violations) == 0,
            "risk_score": min(risk_score, 100),
            "violations": violations,
            "original_response": response,
        }

    def _get_severity(self, penalty: int) -> str:
        if penalty >= 40:
            return "critical"
        if penalty >= 30:
            return "high"
        return "medium"
