"""
pipeline.py
-----------
The full Module 1 pipeline, chained together:

    Query -> Security Check -> Retrieval -> LLM -> Answer

This is the single entry point your teammates (and the demo) should call.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional

from security import process_query, RiskAssessment
from retrieval import retrieve_chunks
from llm import generate_answer


@dataclass
class PipelineResult:
    query: str
    status: str  # "SAFE", "SUSPICIOUS", "BLOCKED"
    risk_score: int
    reasons: List[str] = field(default_factory=list)
    retrieved_chunks: List[Dict] = field(default_factory=list)
    answer: Optional[str] = None


def run_pipeline(query: str, top_k: int = 3) -> PipelineResult:
    """
    Run the full Module 1 pipeline on a raw user query.
    """
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

    # Step 3: LLM answer generation
    answer = generate_answer(safe_query, chunks)

    return PipelineResult(
        query=query,
        status=risk_result.status,
        risk_score=risk_result.risk_score,
        reasons=risk_result.matched_reasons,
        retrieved_chunks=chunks,
        answer=answer,
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