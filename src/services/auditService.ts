/**
 * Audit Service
 * TODO: Replace with FastAPI backend calls
 */

import { AuditLog } from '../types';
import { mockAuditLogs } from '../data/mockAuditLogs';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(500);
    return [...mockAuditLogs];
  },

  async searchAuditLogs(query: string): Promise<AuditLog[]> {
    await delay(300);
    const q = query.toLowerCase();
    return mockAuditLogs.filter(
      l => l.event.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.threatType.toLowerCase().includes(q)
    );
  },

  async filterAuditLogs(filters: {
    eventType?: string;
    action?: string;
    riskLevel?: string;
  }): Promise<AuditLog[]> {
    await delay(300);
    let logs = [...mockAuditLogs];
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
