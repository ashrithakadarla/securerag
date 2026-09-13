/**
 * Analytics Service
 * TODO: Replace with FastAPI backend calls
 */

import { AnalyticsData } from '../types';
import { mockAnalytics, generateAnalyticsTrend } from '../data/mockAnalytics';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsData> {
    await delay(600);
    return { ...mockAnalytics };
  },

  async getAttackTrends(days: number) {
    await delay(400);
    return generateAnalyticsTrend(days);
  },

  async getDetectionPerformance() {
    await delay(300);
    return { ...mockAnalytics.detectionPerformance };
  },

  async getRagPerformance() {
    await delay(300);
    return { ...mockAnalytics.ragPerformance };
  },

  async getDocumentSecurity() {
    await delay(300);
    return { ...mockAnalytics.documentSecurity };
  },
};
