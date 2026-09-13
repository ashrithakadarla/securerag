import { useState, useEffect } from 'react';
import { Download, Filter, TrendingUp, Zap, Target, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsData } from '../../types';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingStates';
import { showToast } from '../../components/ui/Toast';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [trendData, setTrendData] = useState<AnalyticsData['attackTrends']>([]);

  useEffect(() => {
    analyticsService.getAnalytics().then(d => { setAnalytics(d); setTrendData(d.attackTrends.slice(-trendDays)); setLoading(false); });
  }, []);

  useEffect(() => {
    if (analytics) { analyticsService.getAttackTrends(trendDays).then(setTrendData); }
  }, [trendDays]);

  if (loading || !analytics) return <LoadingSpinner size="lg" text="Loading analytics..." />;

  const performanceCards = [
    { label: 'Detection Rate', value: `${analytics.detectionPerformance.detectionRate}%`, icon: Target, color: 'from-primary-500 to-primary-600' },
    { label: 'Blocking Rate', value: `${analytics.detectionPerformance.blockingRate}%`, icon: TrendingUp, color: 'from-success-500 to-success-600' },
    { label: 'False Positive Rate', value: `${analytics.detectionPerformance.falsePositiveRate}%`, icon: Zap, color: 'from-warning-500 to-warning-600' },
    { label: 'False Negative Rate', value: `${analytics.detectionPerformance.falseNegativeRate}%`, icon: Clock, color: 'from-danger-500 to-danger-600' },
  ];

  const ragCards = [
    { label: 'Retrieval Accuracy', value: `${analytics.ragPerformance.retrievalAccuracy}%`, progress: analytics.ragPerformance.retrievalAccuracy },
    { label: 'Response Relevance', value: `${analytics.ragPerformance.responseRelevance}%`, progress: analytics.ragPerformance.responseRelevance },
    { label: 'Response Latency', value: `${analytics.ragPerformance.responseLatency}s`, progress: Math.max(0, 100 - analytics.ragPerformance.responseLatency * 20) },
  ];

  const docSecurityData = [
    { name: 'Trusted', value: analytics.documentSecurity.trusted, color: '#22c55e' },
    { name: 'Moderate Risk', value: analytics.documentSecurity.moderate, color: '#f59e0b' },
    { name: 'High Risk', value: analytics.documentSecurity.highRisk, color: '#ef4444' },
  ];

  return (
    <div className="page-container animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Security and RAG performance metrics</p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}
          onClick={() => showToast({ type: 'info', title: 'Export started', message: 'Analytics report is being generated' })}>
          Export Report
        </Button>
      </div>

      {/* Detection Performance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceCards.map((c, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Attack Trends */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title">Attack Trends</h3>
          <div className="flex rounded-lg bg-gray-100 p-0.5">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setTrendDays(d)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${trendDays === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                {d === 7 ? 'Week' : d === 30 ? 'Month' : 'Quarter'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="aColorAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aColorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aColorDetected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Area type="monotone" dataKey="attacks" stroke="#ef4444" fill="url(#aColorAttacks)" strokeWidth={2} name="Attacks" />
            <Area type="monotone" dataKey="blocked" stroke="#3b82f6" fill="url(#aColorBlocked)" strokeWidth={2} name="Blocked" />
            <Area type="monotone" dataKey="detected" stroke="#22c55e" fill="url(#aColorDetected)" strokeWidth={2} name="Detected" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RAG Performance & Document Security */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* RAG Performance */}
        <div className="card p-6">
          <h3 className="section-title mb-6">RAG Performance</h3>
          <div className="space-y-6">
            {ragCards.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{c.label}</span>
                  <span className="text-sm font-bold text-gray-900">{c.value}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyber-500 transition-all duration-1000"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Security */}
        <div className="card p-6">
          <h3 className="section-title mb-6">Document Security</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={docSecurityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {docSecurityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {docSecurityData.map(d => (
              <div key={d.name} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-xl font-bold text-gray-900">{d.value}</div>
                <div className="text-xs text-gray-500">{d.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
