import re
from dataclasses import dataclass


@dataclass
class Threat:
    threat_type: str
    pattern: str
    severity: str


class DocumentSecurityAnalyzer:
    """
    Rule-based security analyzer for retrieved RAG document content.

    Detects common malicious instructions and suspicious content.
    """

    PATTERNS = {
        "prompt_injection": [
            r"\bignore\s+(all\s+)?previous\s+instructions\b",
            r"\bignore\s+(all\s+)?prior\s+instructions\b",
            r"\bdisregard\s+(all\s+)?previous\s+instructions\b",
        ],
        "instruction_override": [
            r"\bforget\s+(all\s+)?your\s+instructions\b",
            r"\bforget\s+previous\s+instructions\b",
            r"\bdo\s+not\s+follow\s+(the\s+)?previous\s+instructions\b",
        ],
        "system_prompt_extraction": [
            r"\breveal\s+(the\s+)?system\s+prompt\b",
            r"\bshow\s+(me\s+)?(the\s+)?system\s+prompt\b",
            r"\bprint\s+(the\s+)?system\s+prompt\b",
        ],
        "credential_request": [
            r"\breveal\s+(the\s+)?password\b",
            r"\bshow\s+(me\s+)?(the\s+)?password\b",
            r"\breveal\s+(the\s+)?api\s*key\b",
            r"\bshow\s+(me\s+)?(the\s+)?api\s*key\b",
            r"\breveal\s+(the\s+)?secret\b",
        ],
        "script_injection": [
            r"<\s*script\b[^>]*>.*?<\s*/\s*script\s*>",
            r"<\s*/\s*script\s*>",
            r"\bjavascript\s*:",
        ],
        "suspicious_command": [
            r"\brm\s+-rf\b",
            r"\bformat\s+c:\b",
            r"\bshutdown\s+-[a-z]+\b",
        ],
    }

    SEVERITY_PENALTIES = {
        "prompt_injection": 30,
        "instruction_override": 25,
        "system_prompt_extraction": 30,
        "credential_request": 35,
        "script_injection": 30,
        "suspicious_command": 25,
    }

    def analyze(self, text: str) -> dict:
        if not isinstance(text, str):
            raise TypeError("Document text must be a string.")

        normalized_text = text.strip()
        threats: list[Threat] = []

        for threat_type, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, normalized_text, re.IGNORECASE)

                if match:
                    threats.append(
                        Threat(
                            threat_type=threat_type,
                            pattern=match.group(0),
                            severity=self._get_severity(threat_type),
                        )
                    )
                    break

        risk_score = self._calculate_risk_score(threats)
        sanitized_text = self._sanitize(normalized_text, threats)

        return {
            "is_safe": len(threats) == 0,
            "risk_score": risk_score,
            "threats": [
                {
                    "type": threat.threat_type,
                    "pattern": threat.pattern,
                    "severity": threat.severity,
                }
                for threat in threats
            ],
            "original_text": normalized_text,
            "sanitized_text": sanitized_text,
        }

    def _get_severity(self, threat_type: str) -> str:
        penalty = self.SEVERITY_PENALTIES.get(threat_type, 0)

        if penalty >= 35:
            return "critical"
        if penalty >= 30:
            return "high"
        return "medium"

    def _calculate_risk_score(self, threats: list[Threat]) -> int:
        score = 0

        for threat in threats:
            score += self.SEVERITY_PENALTIES.get(threat.threat_type, 0)

        return min(score, 100)

    def _sanitize(self, text: str, threats: list[Threat]) -> str:
        sanitized_text = text

        for threat in threats:
            pattern_list = self.PATTERNS.get(threat.threat_type, [])

            for pattern in pattern_list:
                sanitized_text = re.sub(
                    pattern,
                    "[REMOVED_UNSAFE_CONTENT]",
                    sanitized_text,
                    flags=re.IGNORECASE,
                )

        return sanitized_text