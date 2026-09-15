from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag_engine.pipeline import run_pipeline

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str
    status: str
    risk_score: int


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        result = run_pipeline(request.query)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to process chat request",
        ) from exc

    return ChatResponse(
        answer=result.answer or "",
        status=result.status,
        risk_score=result.risk_score,
    )
