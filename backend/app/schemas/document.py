from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SecurityFindingResponse(BaseModel):
    id: str
    type: str
    severity: str
    description: str
    timestamp: datetime


class DocumentResponse(BaseModel):
    id: int
    name: str
    filename: str
    file_type: str
    type: str
    size: int
    file_size: int
    trust_score: int | None
    trustScore: int | None
    risk_level: str
    riskLevel: str
    status: str
    processing_status: str
    chunk_count: int
    uploader_id: int | None
    uploadedBy: str
    uploadDate: datetime
    created_at: datetime
    findings: list[SecurityFindingResponse] = []
    threats: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int


class DocumentDeleteResponse(BaseModel):
    message: str
    id: int
