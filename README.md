# 🛡️ SecureRAG

SecureRAG is a multi-layer RAG security framework that protects retrieval-augmented generation pipelines through input analysis, document trust scoring, secure context reconstruction, and response validation.

This repository contains both the **backend API** and the **frontend dashboard**.

---

## 🎨 Frontend

SecureRAG provides an enterprise-grade security dashboard and platform for RAG applications. It features advanced security mechanisms to protect AI pipelines from prompt injections, malicious documents, prompt leakage, and unsafe outputs.

### ✨ Key Features
- **🔐 Robust Authentication:** Full login, registration, and session management flows.
- **📊 Security Dashboard:** Real-time visualization of attack trends, blocked threats, and document trust scores.
- **💬 Secure Chat Interface:** AI interaction layer featuring real-time risk scoring, retrieved document indicators, and validation badges.
- **📄 Document Security Management:** Drag-and-drop document upload with deep-scan risk analysis and dynamic trust scoring.
- **📈 Advanced Analytics:** Detailed metrics on RAG performance (latency, accuracy, relevance) and detection performance.
- **📝 Audit Logging:** Comprehensive security audit trails with advanced filtering for all interactions and blocked payloads.
- **🎯 Attack Simulation:** Built-in simulation engine to test prompt injections, jailbreaks, and payload behaviors.
- **⚙️ Policy Configuration:** Granular control over security rules (Jailbreak Detection, Sensitive Data Filtering, etc.) and application settings.

### 🚀 Getting Started (Frontend)

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`

---

## ⚙️ Backend

The `backend/` directory contains the FastAPI application responsible for authentication, authorization, security analysis modules, audit logging, and API endpoints used by the frontend and RAG pipeline.

### 🚀 Getting Started (Backend)

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

Start the FastAPI server from the `backend/` directory:
```powershell
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Health Check
Verify the server is running:
```powershell
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "ok", "message": "SecureRAG API is running"}
```

Interactive API docs are available at `http://127.0.0.1:8000/docs`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ashrithakadarla/securerag/issues).
