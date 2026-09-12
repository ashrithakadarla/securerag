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
