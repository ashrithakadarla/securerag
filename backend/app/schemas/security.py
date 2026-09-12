from pydantic import BaseModel


class DocumentAnalysisRequest(BaseModel):
    text: str


class ThreatResponse(BaseModel):
    type: str
    pattern: str
    severity: str


class DocumentAnalysisResponse(BaseModel):
    is_safe: bool
    risk_score: int
    threats: list[ThreatResponse]
    original_text: str
    sanitized_text: str
