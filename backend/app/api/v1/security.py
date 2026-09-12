from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.security import (
    AuditLogListResponse,
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    SecuritySummaryResponse,
)
from app.security.document_analyzer import DocumentSecurityAnalyzer

router = APIRouter()


@router.post(
    "/analyze-document",
    response_model=DocumentAnalysisResponse,
)
def analyze_document(request: DocumentAnalysisRequest) -> DocumentAnalysisResponse:
    analyzer = DocumentSecurityAnalyzer()
    return analyzer.analyze(request.text)


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
)
def get_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin_user=Depends(require_role("admin")),
) -> AuditLogListResponse:
    total = db.scalar(select(func.count()).select_from(AuditLog)) or 0
    offset = (page - 1) * page_size
    logs = db.scalars(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(page_size)
    ).all()

    return AuditLogListResponse(
        items=logs,
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get(
    "/security-summary",
    response_model=SecuritySummaryResponse,
)
def get_security_summary(
    db: Session = Depends(get_db),
    _admin_user=Depends(require_role("admin")),
) -> SecuritySummaryResponse:
    severity_counts = db.execute(
        select(AuditLog.severity, func.count(AuditLog.id)).group_by(AuditLog.severity)
    ).all()
    event_counts = db.execute(
        select(AuditLog.event_type, func.count(AuditLog.id)).group_by(AuditLog.event_type)
    ).all()
    severity_totals = dict(severity_counts)
    event_totals = dict(event_counts)

    return SecuritySummaryResponse(
        total_events=sum(severity_totals.values()),
        low_events=severity_totals.get("low", 0),
        medium_events=severity_totals.get("medium", 0),
        high_events=severity_totals.get("high", 0),
        critical_events=severity_totals.get("critical", 0),
        blocked_events=event_totals.get("RESPONSE_BLOCKED", 0),
        redacted_events=event_totals.get("RESPONSE_REDACTED", 0),
    )
