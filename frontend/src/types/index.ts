export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv';
  size: number;
  uploadDate: string;
  trustScore: number;
  riskLevel: 'trusted' | 'moderate' | 'high' | 'scanning' | 'blocked';
  status: 'analyzed' | 'scanning' | 'pending' | 'blocked';
  uploadedBy: string;
  findings: SecurityFinding[];
  threats: string[];
}

export interface SecurityFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  user: string;
  eventType: 'prompt_injection' | 'jailbreak' | 'malicious_document' | 'prompt_leakage' | 'unsafe_output' | 'safe_query';
  threatType: string;
  riskScore: number;
  action: 'blocked' | 'allowed' | 'flagged';
  status: 'resolved' | 'active' | 'investigating';
  description: string;
  details?: string;
  input?: string;
  detectionReason?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  event: string;
  eventType: string;
  threatType: string;
  riskScore: number;
  action: 'blocked' | 'allowed' | 'flagged';
  status: 'resolved' | 'active' | 'investigating';
  details?: string;
  input?: string;
  detectionReason?: string;
}

export interface Attack {
  id: string;
  name: string;
  type: 'prompt_injection' | 'jailbreak' | 'malicious_document' | 'prompt_leakage' | 'unsafe_output';
  description: string;
  payload: string;
  category: string;
}

export interface SimulationResult {
  status: 'blocked' | 'allowed' | 'flagged';
  riskScore: number;
  threatType: string;
  action: string;
  explanation: string;
  detectionTime: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'document' | 'system' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  securityStatus?: 'safe' | 'warning' | 'blocked';
  riskScore?: number;
  retrievedDocs?: number;
  responseValidated?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  attackTrends: { date: string; attacks: number; blocked: number; detected: number }[];
  detectionPerformance: {
    detectionRate: number;
    blockingRate: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
  ragPerformance: {
    retrievalAccuracy: number;
    responseRelevance: number;
    responseLatency: number;
  };
  documentSecurity: {
    trusted: number;
    moderate: number;
    highRisk: number;
  };
  attackDistribution: { name: string; value: number; color: string }[];
}

export interface SecuritySettings {
  promptInjectionProtection: boolean;
  jailbreakDetection: boolean;
  responseValidation: boolean;
  sensitiveDataDetection: boolean;
  promptLeakageProtection: boolean;
}

export interface NotificationSettings {
  securityAlerts: boolean;
  highRiskDocuments: boolean;
  systemNotifications: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface EvaluationResult {
  totalCases: number;
  detected: number;
  blocked: number;
  missed: number;
  detectionRate: number;
  blockingRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  retrievalAccuracy: number;
  responseRelevance: number;
  responseLatency: number;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ThreatStatus = 'trusted' | 'moderate' | 'high' | 'blocked';
