import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastContainer } from './components/ui/Toast';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ChatPage from './pages/chat/ChatPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import SecurityPage from './pages/security/SecurityPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import AttackSimulationPage from './pages/simulation/AttackSimulationPage';
import EvaluationPage from './pages/evaluation/EvaluationPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/attack-simulation" element={<AttackSimulationPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
