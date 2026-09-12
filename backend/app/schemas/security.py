from datetime import datetime

from pydantic import BaseModel, ConfigDict


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


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    event_type: str
    severity: str
    risk_score: int | None
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    page: int
    page_size: int
    total: int


class SecuritySummaryResponse(BaseModel):
    total_events: int
    low_events: int
    medium_events: int
    high_events: int
    critical_events: int
    blocked_events: int
    redacted_events: int
