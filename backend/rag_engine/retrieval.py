"""
retrieval.py
------------
Given a user query, finds the most relevant chunks stored in ChromaDB.
"""

from typing import List, Dict

if __package__:
    from .embeddings import embed_text, _collection
else:
    from embeddings import embed_text, _collection


def retrieve_chunks(query: str, top_k: int = 3) -> List[Dict]:
    """
    Embed the query and search ChromaDB for the top_k most similar chunks.

    Returns a list of dicts shaped like:
    {
        "content": "...",
        "document_id": "doc_001",
        "chunk_id": "chunk_05",
        "similarity_score": 0.91
    }
    """
    query_embedding = embed_text(query)

    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    retrieved = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, distance in zip(documents, metadatas, distances):
        # ChromaDB returns "distance" (lower = more similar).
        # Convert to a similarity score (higher = more similar) for readability.
        similarity_score = 1 - distance

        retrieved.append({
            "content": doc,
            "document_id": meta.get("document_id"),
            "chunk_id": meta.get("chunk_id"),
            "similarity_score": round(similarity_score, 4),
        })

    return retrieved


# --- Test this file directly ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print('Usage: python retrieval.py "your question here"')
        sys.exit(1)

    query = sys.argv[1]

    print(f"Query: {query}\n")
    results = retrieve_chunks(query, top_k=3)

    for r in results:
        print(f"[{r['chunk_id']}] score={r['similarity_score']}")
        print(r['content'][:200])
        print()