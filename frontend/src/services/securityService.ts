import { SecurityEvent, SecuritySettings } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1').replace(/\/$/, '');

interface BackendAuditLog {
  id: number;
  user_id: number | null;
  event_type: string;
  severity: string;
  risk_score: number | null;
  message: string;
  created_at: string;
}

interface AuditLogResponse {
  items: BackendAuditLog[];
}

interface SecuritySummary {
  total_events: number;
  low_events: number;
  medium_events: number;
  high_events: number;
  critical_events: number;
  blocked_events: number;
  redacted_events: number;
}

function getToken(): string | null {
  return localStorage.getItem('securerag_access_token') || sessionStorage.getItem('securerag_access_token');
}

async function getErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) return 'Authentication failed. Please sign in again.';
  if (response.status === 403) return 'Admin access is required to view security data.';
  return 'Unable to load security data. Please try again.';
}

async function request<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Authentication failed. Please sign in again.');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json() as Promise<T>;
}

function mapAuditLogToSecurityEvent(log: BackendAuditLog): SecurityEvent {
  const text = `${log.event_type} ${log.message}`.toLowerCase();
  const action = text.includes('block') ? 'blocked' : text.includes('allow') ? 'allowed' : 'flagged';
  return {
    id: String(log.id),
    timestamp: log.created_at,
    user: log.user_id === null ? 'unknown' : String(log.user_id),
    eventType: log.event_type as SecurityEvent['eventType'],
    threatType: log.event_type,
    riskScore: log.risk_score ?? 0,
    action,
    status: action === 'blocked' || action === 'allowed' ? 'resolved' : 'investigating',
    description: log.message,
  };
}

export const securityService = {
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    const response = await request<AuditLogResponse>('/security/audit-logs?page=1&page_size=100');
    return response.items.map(mapAuditLogToSecurityEvent);
  },

  async getThreatOverview(): Promise<{ totalThreats: number; detectedThreats: number; blockedThreats: number; criticalThreats: number }> {
    const summary = await request<SecuritySummary>('/security/security-summary');
    return {
      totalThreats: summary.total_events,
      detectedThreats: summary.high_events + summary.critical_events,
      blockedThreats: summary.blocked_events,
      criticalThreats: summary.critical_events,
    };
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    await delay(200);
    const stored = localStorage.getItem('securerag_security_settings');
    if (stored) return JSON.parse(stored);
    return {
      promptInjectionProtection: true,
      jailbreakDetection: true,
      responseValidation: true,
      sensitiveDataDetection: true,
      promptLeakageProtection: true,
    };
  },

  async updateSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    await delay(300);
    localStorage.setItem('securerag_security_settings', JSON.stringify(settings));
    return settings;
  },
};
