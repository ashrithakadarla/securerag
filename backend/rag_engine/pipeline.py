"""
pipeline.py
-----------
The full Module 1 pipeline, chained together:

    Query -> Security Check -> Retrieval -> Document Security -> LLM -> Answer

This is the single entry point your teammates (and the demo) should call.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional

if __package__:
    from .security import process_query, RiskAssessment
else:
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from security import process_query, RiskAssessment

from app.security.context_reconstructor import SecureContextReconstructor
from app.security.document_analyzer import DocumentSecurityAnalyzer
from app.security.audit_logger import AuditLogger
from app.security.response_sanitizer import ResponseSanitizer
from app.security.response_validator import ResponseValidator
from app.security.trust_scorer import DocumentTrustScorer
from app.core.database import SessionLocal


@dataclass
class PipelineResult:
    query: str
    status: str  # "SAFE", "SUSPICIOUS", "BLOCKED"
    risk_score: int
    reasons: List[str] = field(default_factory=list)
    retrieved_chunks: List[Dict] = field(default_factory=list)
    answer: Optional[str] = None
    document_security: List[Dict] = field(default_factory=list)
    response_security: Dict = field(default_factory=dict)


def log_security_event(
    event_type: str,
    severity: str,
    message: str,
    risk_score: int,
) -> None:
    """Persist a security event without affecting the RAG response path."""
    db = None
    try:
        db = SessionLocal()
        AuditLogger().log(
            db=db,
            event_type=event_type,
            severity=severity,
            message=message,
            user_id=None,
            risk_score=risk_score,
        )
    except Exception as exc:
        print(f"SecureRAG audit logging failed: {exc}")
    finally:
        if db is not None:
            db.close()


def highest_severity(items: List[Dict]) -> str:
    severity_rank = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    return max(
        (item.get("severity", "low") for item in items),
        key=lambda severity: severity_rank.get(severity, 1),
        default="low",
    )


def analyze_and_secure_chunks(chunks: List[Dict]) -> tuple[List[Dict], List[Dict]]:
    """Analyze retrieved chunks and return security metadata and safe LLM context."""
    analyzer = DocumentSecurityAnalyzer()
    scorer = DocumentTrustScorer()
    reconstructor = SecureContextReconstructor()
    analysis_results = []
    document_security = []

    for chunk in chunks:
        analysis = analyzer.analyze(chunk.get("content", ""))
        trust = scorer.score(analysis)

        analysis_results.append({
            **analysis,
            "document_id": chunk.get("document_id"),
            "chunk_id": chunk.get("chunk_id"),
            "similarity_score": chunk.get("similarity_score"),
        })
        document_security.append({
            "document_id": chunk.get("document_id"),
            "chunk_id": chunk.get("chunk_id"),
            "similarity_score": chunk.get("similarity_score"),
            "is_safe": analysis["is_safe"],
            "risk_score": analysis["risk_score"],
            "trust_score": trust["trust_score"],
            "trust_level": trust["trust_level"],
            "threats": analysis["threats"],
        })

    reconstructed = reconstructor.reconstruct(analysis_results)
    secure_context_chunks = []

    for analysis_result in analysis_results:
        sanitized_text = analysis_result["sanitized_text"]
        if not sanitized_text.strip() or (
            sanitized_text.strip()
            == SecureContextReconstructor.REMOVED_CONTENT_PLACEHOLDER
        ):
            continue

        secure_context_chunks.append({
            "content": sanitized_text,
            "document_id": analysis_result.get("document_id"),
            "chunk_id": analysis_result.get("chunk_id"),
            "similarity_score": analysis_result.get("similarity_score"),
        })

    if not reconstructed["secure_context"]:
        secure_context_chunks = []

    return document_security, secure_context_chunks


def run_pipeline(query: str, top_k: int = 3) -> PipelineResult:
    """
    Run the full Module 1 pipeline on a raw user query.
    """
    if __package__:
        from .retrieval import retrieve_chunks
        from .llm import generate_answer
    else:
        from retrieval import retrieve_chunks
        from llm import generate_answer

    # Step 1: Security check
    risk_result: RiskAssessment = process_query(query)

    if risk_result.status == "BLOCKED":
        return PipelineResult(
            query=query,
            status="BLOCKED",
            risk_score=risk_result.risk_score,
            reasons=risk_result.matched_reasons,
            retrieved_chunks=[],
            answer=None,
        )

    # Use the sanitized version of the query from here on
    safe_query = risk_result.sanitized_query

    # Step 2: Retrieval
    chunks = retrieve_chunks(safe_query, top_k=top_k)

    # Step 3: Document security and secure context reconstruction
    document_security, secure_context_chunks = analyze_and_secure_chunks(chunks)
    for security_result in document_security:
        if not security_result["is_safe"]:
            threat_types = ", ".join(
                threat.get("type", "unknown")
                for threat in security_result["threats"]
            )
            log_security_event(
                event_type="DOCUMENT_THREAT_DETECTED",
                severity=highest_severity(security_result["threats"]),
                message=(
                    f"Document threat detected in "
                    f"{security_result.get('document_id', 'unknown')}"
                    f"/{security_result.get('chunk_id', 'unknown')}: "
                    f"{threat_types}"
                ),
                risk_score=security_result["risk_score"],
            )

    # Step 4: LLM answer generation using only sanitized context
    secure_context_chunks = [
        chunk
        for chunk in secure_context_chunks
        if chunk.get("similarity_score", 0) >= 0.5
    ]
    print("[SecureRAG DEBUG] Query:", query)
    print("[SecureRAG DEBUG] Secure context:", secure_context_chunks)
    print("[SecureRAG DEBUG] Context count:", len(secure_context_chunks))
    answer = generate_answer(safe_query, secure_context_chunks)
    print("[SecureRAG DEBUG] Raw LLM answer:", answer)
    validation_result = ResponseValidator().validate(answer)
    action = "allowed" if validation_result["is_safe"] else "redact"
    sanitized_result = ResponseSanitizer().sanitize(
        validation_result,
        action="redact" if action == "allowed" else action,
    )
    if not sanitized_result["is_safe"]:
        log_security_event(
            event_type=(
                "RESPONSE_BLOCKED"
                if sanitized_result["action"] == "blocked"
                else "RESPONSE_REDACTED"
            ),
            severity=highest_severity(sanitized_result["violations"]),
            message="Unsafe LLM response handled by response security policy.",
            risk_score=sanitized_result["risk_score"],
        )

    return PipelineResult(
        query=query,
        status=risk_result.status,
        risk_score=risk_result.risk_score,
        reasons=risk_result.matched_reasons,
        retrieved_chunks=chunks,
        answer=sanitized_result["sanitized_response"],
        document_security=document_security,
        response_security={
            "is_safe": sanitized_result["is_safe"],
            "risk_score": sanitized_result["risk_score"],
            "violations": sanitized_result["violations"],
            "action": sanitized_result["action"],
        },
    )


# --- Test this file directly ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print('Usage: python pipeline.py "your question here"')
        sys.exit(1)

    query = sys.argv[1]
    result = run_pipeline(query)

    print(f"Query: {result.query}")
    print(f"Status: {result.status}")
    print(f"Risk Score: {result.risk_score}")

    if result.reasons:
        print("Reasons:")
        for r in result.reasons:
            print(f"  - {r}")

    if result.status == "BLOCKED":
        print("\nRequest blocked. No answer generated.")
    else:
        print(f"\nRetrieved {len(result.retrieved_chunks)} chunks:")
        for c in result.retrieved_chunks:
            print(f"  [{c['chunk_id']}] score={c['similarity_score']}")

        print(f"\nAnswer:\n{result.answer}")