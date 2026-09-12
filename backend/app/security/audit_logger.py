from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogger:
    """Persist security and application audit events."""

    VALID_SEVERITIES = {"low", "medium", "high", "critical"}

    def log(
        self,
        db: Session,
        event_type: str,
        severity: str,
        message: str,
        user_id: int | None = None,
        risk_score: int | None = None,
    ) -> AuditLog:
        if not isinstance(severity, str) or severity not in self.VALID_SEVERITIES:
            raise ValueError(
                "Severity must be one of: low, medium, high, critical."
            )

        if risk_score is not None:
            if isinstance(risk_score, bool) or not isinstance(risk_score, int):
                raise ValueError("Risk score must be an integer.")
            if not 0 <= risk_score <= 100:
                raise ValueError("Risk score must be between 0 and 100.")

        audit_log = AuditLog(
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            risk_score=risk_score,
            message=message,
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        return audit_log
