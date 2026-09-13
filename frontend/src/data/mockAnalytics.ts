import { AnalyticsData } from '../types';

const generateTrendData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const attacks = Math.floor(Math.random() * 15) + 3;
    const blocked = Math.floor(attacks * (0.85 + Math.random() * 0.12));
    data.push({
      date: date.toISOString().split('T')[0],
      attacks,
      blocked,
      detected: Math.floor(attacks * (0.9 + Math.random() * 0.08)),
    });
  }
  return data;
};

export const mockAnalytics: AnalyticsData = {
  attackTrends: generateTrendData(30),
  detectionPerformance: {
    detectionRate: 94,
    blockingRate: 92,
    falsePositiveRate: 3.2,
    falseNegativeRate: 6.0,
  },
  ragPerformance: {
    retrievalAccuracy: 91,
    responseRelevance: 89,
    responseLatency: 1.8,
  },
  documentSecurity: {
    trusted: 42,
    moderate: 11,
    highRisk: 4,
  },
  attackDistribution: [
    { name: 'Prompt Injection', value: 38, color: '#ef4444' },
    { name: 'Jailbreak Attempts', value: 24, color: '#f97316' },
    { name: 'Malicious Documents', value: 18, color: '#eab308' },
    { name: 'Prompt Leakage', value: 12, color: '#8b5cf6' },
    { name: 'Unsafe Output', value: 8, color: '#06b6d4' },
  ],
};

export const generateAnalyticsTrend = (days: number) => generateTrendData(days);
