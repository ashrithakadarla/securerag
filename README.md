# SecureRAG

SecureRAG is a multi-layer RAG security framework that protects retrieval-augmented generation pipelines through input analysis, document trust scoring, secure context reconstruction, and response validation.

## Backend

The `backend/` directory contains the FastAPI application responsible for authentication, authorization, security analysis modules, audit logging, and API endpoints used by the frontend and RAG pipeline.

## Setup

Create and activate a virtual environment from the project root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

Copy the example environment file and update values as needed:

```powershell
copy backend\.env.example backend\.env
```

## Run the API

Start the FastAPI server from the `backend/` directory:

```powershell
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Health Check

Verify the server is running:

```powershell
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status": "ok", "message": "SecureRAG API is running"}
```

Interactive API docs are available at `http://127.0.0.1:8000/docs`.
## Module 1 — Secure RAG Engine (Member 1)

This module handles document ingestion, semantic retrieval, prompt-level
security, and answer generation for SecureRAG.

### Pipeline

```
Document (PDF/DOCX/TXT)
        |
   ingestion.py      -> extract text, split into chunks
        |
   embeddings.py      -> embed chunks (Sentence Transformers), store in ChromaDB
        |
User Query
        |
   security.py        -> rule-based Prompt Risk Analyzer + sanitizer
        |               (BLOCKED / SUSPICIOUS / SAFE)
        |
   retrieval.py        -> semantic search over ChromaDB, top-K chunks
        |
   llm.py              -> Llama 3.2 (via Ollama) generates grounded answer
        |
   pipeline.py         -> orchestrates all of the above, single entry point
```

### Files

| File            | Responsibility                                             |
|-----------------|--------------------------------------------------------------|
| `ingestion.py`  | Load PDF/DOCX/TXT, extract text, chunk it                   |
| `embeddings.py` | Generate embeddings (Sentence Transformers), store in ChromaDB |
| `retrieval.py`  | Semantic top-K search over stored chunks                    |
| `security.py`   | Rule-based prompt injection / jailbreak detection + sanitization |
| `llm.py`        | Sends query + context to Llama 3.2 via Ollama, returns answer |
| `pipeline.py`   | Orchestrates the full flow; single function other modules call |

### Tech stack

- **LangChain** (text splitting, Ollama integration)
- **Sentence Transformers** (`all-MiniLM-L6-v2`) for embeddings
- **ChromaDB** for local vector storage
- **Ollama + Llama 3.2** for local, private answer generation
  *(Note: Llama 3.1 was the originally planned model; Llama 3.2 was used
  for local development due to bandwidth constraints. Swapping back to
  3.1 requires only a one-line change in `llm.py`.)*

### How to run

```bash
pip install -r requirements.txt
ollama pull llama3.2

python rag_engine/pipeline.py "your question here"
```

### Integration point for Member 2

`pipeline.py`'s `run_pipeline(query)` returns a `PipelineResult` with:

```python
{
  "query": "...",
  "status": "SAFE" | "SUSPICIOUS" | "BLOCKED",
  "risk_score": 0-100,
  "reasons": [...],
  "retrieved_chunks": [
      {"content": "...", "document_id": "...", "chunk_id": "...", "similarity_score": 0.91}
  ],
  "answer": "..." | None
}
```

Member 2's Document Security Analyzer / Trust Scoring should consume
`retrieved_chunks` before they are passed to the LLM, if deeper document-level
security is required beyond the prompt-level checks already applied here.