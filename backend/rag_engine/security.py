"""
security.py
------------
Prompt Risk Analyzer + Sanitizer.

Checks a user query for prompt injection / jailbreak patterns BEFORE it
reaches retrieval or the LLM. This is rule-based detection (Layer 1).
"""

import re
from dataclasses import dataclass, field
from typing import List


# ---------------------------------------------------------------------------
# Attack pattern definitions
# ---------------------------------------------------------------------------

# Each pattern has a phrase (as regex) and a risk weight.
# Higher weight = more dangerous if matched.
RISK_PATTERNS = [
    (r"ignore (all )?previous instructions", 40),
    (r"ignore (all )?prior instructions", 40),
    (r"forget your instructions", 40),
    (r"forget (all )?your rules", 35),
    (r"reveal (the |your )?system prompt", 45),
    (r"show (me )?(the |your )?system (prompt|message)", 45),
    (r"you are now", 25),
    (r"act as (dan|root|admin|developer)", 40),
    (r"developer mode", 35),
    (r"jailbreak", 40),
    (r"do anything now", 40),
    (r"pretend you are", 20),
    (r"disregard (the |your )?(guidelines|rules|policy)", 35),
    (r"bypass (your |the )?(restrictions|filters|safety)", 45),
    (r"print (your |the )?(password|api key|secret)", 45),
]

# Risk score thresholds
BLOCK_THRESHOLD = 50   # score >= this -> BLOCKED
FLAG_THRESHOLD = 20    # score >= this (but < BLOCK) -> SUSPICIOUS (allowed but flagged)


@dataclass
class RiskAssessment:
    query: str
    risk_score: int
    status: str  # "SAFE", "SUSPICIOUS", "BLOCKED"
    matched_reasons: List[str] = field(default_factory=list)
    sanitized_query: str = ""


# ---------------------------------------------------------------------------
# Risk analysis
# ---------------------------------------------------------------------------

def analyze_risk(query: str) -> RiskAssessment:
    """
    Scan the query against known attack patterns and compute a risk score.
    """
    lowered = query.lower()
    score = 0
    reasons: List[str] = []

    for pattern, weight in RISK_PATTERNS:
        if re.search(pattern, lowered):
            score += weight
            reasons.append(f"Matched pattern: '{pattern}'")

    score = min(score, 100)  # cap at 100

    if score >= BLOCK_THRESHOLD:
        status = "BLOCKED"
    elif score >= FLAG_THRESHOLD:
        status = "SUSPICIOUS"
    else:
        status = "SAFE"

    return RiskAssessment(
        query=query,
        risk_score=score,
        status=status,
        matched_reasons=reasons,
    )


# ---------------------------------------------------------------------------
# Sanitization
# ---------------------------------------------------------------------------

def sanitize_query(query: str) -> str:
    """
    Strip out matched risky phrases from a query that is SUSPICIOUS
    (not fully blocked) so it can still be processed safely.
    """
    cleaned = query
    for pattern, _weight in RISK_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    # Collapse extra whitespace left behind after removal
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


# ---------------------------------------------------------------------------
# High-level entry point
# ---------------------------------------------------------------------------

def process_query(query: str) -> RiskAssessment:
    """
    Full pipeline: analyze risk, and sanitize if needed.
    Sets `.sanitized_query` on the returned assessment.
    """
    assessment = analyze_risk(query)

    if assessment.status == "BLOCKED":
        assessment.sanitized_query = ""  # nothing passes through
    elif assessment.status == "SUSPICIOUS":
        assessment.sanitized_query = sanitize_query(query)
    else:
        assessment.sanitized_query = query  # safe, unchanged

    return assessment


# --- Test this file directly ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print('Usage: python security.py "your query here"')
        sys.exit(1)

    test_query = sys.argv[1]
    result = process_query(test_query)

    print(f"Query: {result.query}")
    print(f"Risk Score: {result.risk_score}")
    print(f"Status: {result.status}")
    if result.matched_reasons:
        print("Reasons:")
        for r in result.matched_reasons:
            print(f"  - {r}")
    print(f"Sanitized Query: '{result.sanitized_query}'")