# 🛡️ SecureRAG Frontend

SecureRAG is an enterprise-grade security dashboard and platform for Retrieval-Augmented Generation (RAG) applications. It provides advanced security mechanisms to protect AI pipelines from prompt injections, malicious documents, prompt leakage, and unsafe outputs.

This repository contains the complete **frontend application** built with React, Vite, and Tailwind CSS v4.

---

## ✨ Key Features

- **🔐 Robust Authentication:** Full login, registration, and session management flows.
- **📊 Security Dashboard:** Real-time visualization of attack trends, blocked threats, and document trust scores.
- **💬 Secure Chat Interface:** AI interaction layer featuring real-time risk scoring, retrieved document indicators, and validation badges.
- **📄 Document Security Management:** Drag-and-drop document upload with deep-scan risk analysis and dynamic trust scoring.
- **📈 Advanced Analytics:** Detailed metrics on RAG performance (latency, accuracy, relevance) and detection performance.
- **📝 Audit Logging:** Comprehensive security audit trails with advanced filtering for all interactions and blocked payloads.
- **🎯 Attack Simulation:** Built-in simulation engine to test prompt injections, jailbreaks, and payload behaviors.
- **⚙️ Policy Configuration:** Granular control over security rules (Jailbreak Detection, Sensitive Data Filtering, etc.) and application settings.

## 🛠️ Technology Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Charts & Visualization:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashrithakadarla/securerag.git
   cd securerag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production
To create a production-ready build, run:
```bash
npm run build
```
The optimized files will be generated in the `dist/` directory.

---

## 🏗️ Architecture Note

Currently, the application is utilizing a **Mock Service Architecture**. All backend interactions, data fetching, and API calls are abstracted into the `src/services/` directory. 

This abstraction ensures that the UI is 100% functional and interactive. Once the actual backend (FastAPI / Firebase) is ready, you can seamlessly integrate it by swapping out the implementations inside the `src/services/` files without needing to rewrite any UI components.

## 🎨 Theme Configuration

The application uses a custom high-contrast professional theme defined in `src/index.css`:
- **Primary (Indigo):** Used for primary buttons, active states, and core branding.
- **Cyber (Cyan):** Used for data visualization and accent highlights to provide a high-tech AI aesthetic.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ashrithakadarla/securerag/issues).
