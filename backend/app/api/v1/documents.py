import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.database import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentResponse,
    SecurityFindingResponse,
)
from app.security.audit_logger import AuditLogger
from app.security.document_analyzer import DocumentSecurityAnalyzer
from app.security.trust_scorer import DocumentTrustScorer
from rag_engine.embeddings import delete_chunks, store_chunks
from rag_engine.ingestion import chunk_text, extract_text

router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def build_document_response(
    doc: Document,
    scan_threats: list[dict] | None = None,
) -> DocumentResponse:
    status_val = "analyzed" if doc.processing_status == "completed" else doc.processing_status
    uploader_name = (
        doc.uploader.email.split("@")[0].replace(".", " ").replace("_", " ").title()
        if doc.uploader
        else "Unknown"
    )
    findings: list[SecurityFindingResponse] = []
    threat_names: list[str] = []

    if scan_threats is not None:
        for i, t in enumerate(scan_threats, start=1):
            threat_type = t.get("type", "unknown")
            threat_names.append(threat_type)
            findings.append(
                SecurityFindingResponse(
                    id=f"f_{doc.id}_{i}",
                    type=threat_type.replace("_", " ").title(),
                    severity=t.get("severity", "medium"),
                    description=f"Pattern detected: {t.get('pattern', 'suspicious content')}",
                    timestamp=doc.created_at,
                )
            )
    elif doc.trust_score is not None and doc.trust_score < 90:
        sev = "high" if doc.trust_score < 60 else "medium"
        threat_names = ["security_risk"] if doc.trust_score < 60 else ["moderate_risk"]
        findings.append(
            SecurityFindingResponse(
                id=f"f_{doc.id}_1",
                type="Security Scan",
                severity=sev,
                description=f"Document flagged with trust score {doc.trust_score}/100",
                timestamp=doc.created_at,
            )
        )

    return DocumentResponse(
        id=doc.id,
        name=doc.filename,
        filename=doc.filename,
        file_type=doc.file_type,
        type=doc.file_type,
        size=doc.file_size,
        file_size=doc.file_size,
        trust_score=doc.trust_score,
        trustScore=doc.trust_score,
        risk_level=doc.risk_level,
        riskLevel=doc.risk_level,
        status=status_val,
        processing_status=doc.processing_status,
        chunk_count=doc.chunk_count,
        uploader_id=doc.uploader_id,
        uploadedBy=uploader_name,
        uploadDate=doc.created_at,
        created_at=doc.created_at,
        findings=findings,
        threats=threat_names,
    )


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Supported types are: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 50MB limit.",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
        tmp_file.write(contents)
        tmp_path = tmp_file.name

    doc = None
    try:
        try:
            extracted_text = extract_text(tmp_path)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract text from document: {exc}",
            ) from exc

        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document contains no readable text content.",
            )

        analyzer = DocumentSecurityAnalyzer()
        analysis = analyzer.analyze(extracted_text)
        scorer = DocumentTrustScorer()
        trust = scorer.score(analysis)
        trust_score = trust["trust_score"]

        if trust_score >= 90:
            risk_level = "trusted"
        elif trust_score >= 60:
            risk_level = "moderate"
        else:
            risk_level = "high"

        doc = Document(
            filename=filename,
            file_type=ext.lstrip("."),
            file_size=len(contents),
            trust_score=trust_score,
            risk_level=risk_level,
            processing_status="processing",
            chunk_count=0,
            uploader_id=current_user.id,
        )
        db.add(doc)
        db.flush()  # Populate doc.id without committing
        # doc.id is now available; no refresh needed
        chunks = chunk_text(extracted_text, document_id=f"doc_{doc.id}")

        try:
            store_chunks(
                chunks,
                extra_metadata={
                    "uploader_id": current_user.id,
                    "filename": doc.filename,
                },
            )
        except Exception as exc:
            doc.processing_status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store document embeddings in vector database: {exc}",
            ) from exc

        doc.processing_status = "completed"
        doc.chunk_count = len(chunks)
        db.commit()
        # Refresh not needed after final commit

        if not analysis["is_safe"]:
            threat_types = ", ".join(t.get("type", "unknown") for t in analysis["threats"])
            severities = [t.get("severity", "medium") for t in analysis["threats"]]
            highest_sev = "critical" if "critical" in severities else ("high" if "high" in severities else "medium")
            AuditLogger().log(
                db=db,
                event_type="DOCUMENT_THREAT_DETECTED",
                severity=highest_sev,
                message=f"Document threat detected in '{doc.filename}': {threat_types}",
                user_id=current_user.id,
                risk_score=analysis["risk_score"],
            )
        else:
            AuditLogger().log(
                db=db,
                event_type="DOCUMENT_UPLOADED",
                severity="low",
                message=f"Document '{doc.filename}' uploaded and indexed successfully.",
                user_id=current_user.id,
                risk_score=0,
            )

        return build_document_response(doc, scan_threats=analysis["threats"])

    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    if current_user.role == "admin":
        stmt = select(Document).order_by(Document.created_at.desc())
    else:
        stmt = select(Document).where(Document.uploader_id == current_user.id).order_by(Document.created_at.desc())

    docs = db.scalars(stmt).all()
    return [build_document_response(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if current_user.role != "admin" and doc.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this document",
        )

    return build_document_response(doc)


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentDeleteResponse:
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if current_user.role != "admin" and doc.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this document",
        )

    delete_chunks(f"doc_{doc.id}")

    AuditLogger().log(
        db=db,
        event_type="DOCUMENT_DELETED",
        severity="low",
        message=f"Document '{doc.filename}' (id: {doc.id}) deleted.",
        user_id=current_user.id,
        risk_score=0,
    )

    db.delete(doc)
    db.commit()

    return DocumentDeleteResponse(
        message="Document deleted successfully",
        id=document_id,
    )
