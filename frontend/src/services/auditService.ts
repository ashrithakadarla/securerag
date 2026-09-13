import { AuditLog } from '../types';

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
  page: number;
  page_size: number;
  total: number;
}

let currentPageLogs: AuditLog[] = [];

function getToken(): string | null {
  return localStorage.getItem('securerag_access_token') || sessionStorage.getItem('securerag_access_token');
}

async function getErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) return 'Authentication failed. Please sign in again.';
  if (response.status === 403) return 'Admin access is required to view audit logs.';
  return 'Unable to load audit logs. Please try again.';
}

function mapAction(eventType: string, message: string): AuditLog['action'] {
  const text = `${eventType} ${message}`.toLowerCase();
  if (text.includes('block')) return 'blocked';
  if (text.includes('allow')) return 'allowed';
  return 'flagged';
}

function mapBackendLog(log: BackendAuditLog): AuditLog {
  const action = mapAction(log.event_type, log.message);
  return {
    id: String(log.id),
    timestamp: log.created_at,
    user: log.user_id === null ? 'unknown' : String(log.user_id),
    event: log.message,
    eventType: log.event_type,
    threatType: log.event_type,
    riskScore: log.risk_score ?? 0,
    action,
    status: action === 'blocked' || action === 'allowed' ? 'resolved' : 'investigating',
    details: log.severity,
  };
}

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication failed. Please sign in again.');

  const response = await fetch(`${API_BASE_URL}/security/audit-logs?page=1&page_size=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));

  const data = await response.json() as AuditLogResponse;
  currentPageLogs = data.items.map(mapBackendLog);
  return currentPageLogs;
}

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchAuditLogs();
  },

  async searchAuditLogs(query: string): Promise<AuditLog[]> {
    const logs = currentPageLogs.length > 0 ? currentPageLogs : await fetchAuditLogs();
    const q = query.toLowerCase();
    return logs.filter(
      l => l.event.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.threatType.toLowerCase().includes(q)
    );
  },

  async filterAuditLogs(filters: {
    eventType?: string;
    action?: string;
    riskLevel?: string;
  }): Promise<AuditLog[]> {
    let logs = currentPageLogs.length > 0 ? [...currentPageLogs] : [...await fetchAuditLogs()];
    if (filters.eventType && filters.eventType !== 'all') {
      logs = logs.filter(l => l.eventType === filters.eventType);
    }
    if (filters.action && filters.action !== 'all') {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      if (filters.riskLevel === 'high') logs = logs.filter(l => l.riskScore >= 70);
      else if (filters.riskLevel === 'medium') logs = logs.filter(l => l.riskScore >= 30 && l.riskScore < 70);
      else logs = logs.filter(l => l.riskScore < 30);
    }
    return logs;
  },
};
