"""
embeddings.py
-------------
Converts text chunks into vector embeddings and stores them in ChromaDB.
"""

import chromadb
from sentence_transformers import SentenceTransformer
from typing import List

from app.core.config import settings

try:
    from .ingestion import DocumentChunk
except ImportError:
    from ingestion import DocumentChunk


# Load the embedding model once (this downloads a small model the first time)
_model = SentenceTransformer("all-MiniLM-L6-v2")

# Create a persistent ChromaDB client - stores data in a local folder
_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)

# Get or create a collection (like a table) to store our document chunks
_collection = _client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

def embed_text(text: str) -> List[float]:
    """Convert a single piece of text into a vector embedding."""
    embedding = _model.encode(text)
    return embedding.tolist()


def store_chunks(chunks: List[DocumentChunk]) -> None:
    """
    Embed a list of DocumentChunks and store them in ChromaDB.
    """
    if not chunks:
        return

    ids = [f"{c.document_id}_{c.chunk_id}" for c in chunks]
    documents = [c.content for c in chunks]
    embeddings = [embed_text(c.content) for c in chunks]
    metadatas = [{"document_id": c.document_id, "chunk_id": c.chunk_id} for c in chunks]

    _collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def collection_count() -> int:
    """Return how many chunks are currently stored."""
    return _collection.count()


# --- Test this file directly ---
if __name__ == "__main__":
    import sys
    from ingestion import ingest_document

    if len(sys.argv) < 2:
        print("Usage: python embeddings.py <path_to_file>")
        sys.exit(1)

    file_path = sys.argv[1]

    print("Ingesting document...")
    chunks = ingest_document(file_path, "doc_test_001")
    print(f"Got {len(chunks)} chunks")

    print("Embedding and storing chunks...")
    store_chunks(chunks)

    print(f"Done. Total chunks stored in ChromaDB: {collection_count()}")