/**
 * Security Service
 * TODO: Replace with FastAPI backend calls
 */

import { SecurityEvent, SecuritySettings } from '../types';
import { mockSecurityEvents } from '../data/mockSecurityEvents';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const securityService = {
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    await delay(400);
    return [...mockSecurityEvents];
  },

  async getThreatOverview() {
    await delay(300);
    const events = mockSecurityEvents;
    return {
      totalThreats: events.filter(e => e.eventType !== 'safe_query').length,
      detectedThreats: events.filter(e => e.riskScore > 50).length,
      blockedThreats: events.filter(e => e.action === 'blocked').length,
      criticalThreats: events.filter(e => e.riskScore >= 90).length,
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
