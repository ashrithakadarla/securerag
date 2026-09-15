"""
ingestion.py
------------
Loads a document, extracts its text, and splits it into chunks.
"""

import os
from dataclasses import dataclass
from typing import List

from pypdf import PdfReader
from docx import Document as DocxDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter


@dataclass
class DocumentChunk:
    document_id: str
    chunk_id: str
    content: str


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_text_from_docx(file_path: str) -> str:
    doc = DocxDocument(file_path)
    return "\n".join(p.text for p in doc.paragraphs)


def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_text(text: str, document_id: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[DocumentChunk]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    raw_chunks = splitter.split_text(text)

    return [
        DocumentChunk(document_id=document_id, chunk_id=f"chunk_{i:03d}", content=chunk.strip())
        for i, chunk in enumerate(raw_chunks)
    ]


def ingest_document(file_path: str, document_id: str) -> List[DocumentChunk]:
    """Main function: file path in -> list of chunks out."""
    text = extract_text(file_path)
    if not text.strip():
        raise ValueError(f"No text found in: {file_path}")
    return chunk_text(text, document_id)


# --- Test this file directly ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ingestion.py <path_to_file>")
        sys.exit(1)

    chunks = ingest_document(sys.argv[1], "doc_test_001")

    print(f"\nGot {len(chunks)} chunks\n")
    for c in chunks:
        print(f"[{c.chunk_id}] {c.content[:100]}...")
        print()