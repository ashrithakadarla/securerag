from fastapi import APIRouter

from app.schemas.security import DocumentAnalysisRequest, DocumentAnalysisResponse
from app.security.document_analyzer import DocumentSecurityAnalyzer

router = APIRouter()


@router.post(
    "/analyze-document",
    response_model=DocumentAnalysisResponse,
)
def analyze_document(request: DocumentAnalysisRequest) -> DocumentAnalysisResponse:
    analyzer = DocumentSecurityAnalyzer()
    return analyzer.analyze(request.text)
