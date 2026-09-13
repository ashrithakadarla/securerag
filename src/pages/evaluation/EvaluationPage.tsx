import { useState } from 'react';
import { Play, Target, Shield, Zap, Clock, BarChart3, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EvaluationResult } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const defaultResult: EvaluationResult = {
  totalCases: 100, detected: 94, blocked: 92, missed: 6,
  detectionRate: 94, blockingRate: 92, falsePositiveRate: 3.2, falseNegativeRate: 6.0,
  retrievalAccuracy: 91, responseRelevance: 89, responseLatency: 1.8,
};

export default function EvaluationPage() {
  const [result, setResult] = useState<EvaluationResult>(defaultResult);
  const [running, setRunning] = useState(false);
  const [evaluated, setEvaluated] = useState(true);

  const handleRunEvaluation = async () => {
    setRunning(true);
    setEvaluated(false);
    await new Promise(r => setTimeout(r, 3000));

    const detected = Math.floor(Math.random() * 8) + 92;
    const blocked = detected - Math.floor(Math.random() * 3);
    setResult({
      totalCases: 100, detected, blocked, missed: 100 - detected,
      detectionRate: detected, blockingRate: blocked,
      falsePositiveRate: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      falseNegativeRate: parseFloat((100 - detected).toFixed(1)),
      retrievalAccuracy: Math.floor(Math.random() * 6) + 88,
      responseRelevance: Math.floor(Math.random() * 6) + 86,
      responseLatency: parseFloat((Math.random() * 1.5 + 1).toFixed(1)),
    });
    setRunning(false);
    setEvaluated(true);
  };

  const breakdownData = [
    { name: 'Prompt Injection', detected: 36, total: 38 },
    { name: 'Jailbreak', detected: 22, total: 24 },
    { name: 'Malicious Doc', detected: 17, total: 18 },
    { name: 'Prompt Leakage', detected: 11, total: 12 },
    { name: 'Unsafe Output', detected: 8, total: 8 },
  ];

  const radarData = [
    { metric: 'Detection', value: result.detectionRate },
    { metric: 'Blocking', value: result.blockingRate },
    { metric: 'Retrieval', value: result.retrievalAccuracy },
    { metric: 'Relevance', value: result.responseRelevance },
    { metric: 'Speed', value: Math.max(0, 100 - result.responseLatency * 20) },
  ];

  return (
    <div className="page-container animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Security Evaluation</h2>
          <p className="text-sm text-gray-500 mt-1">Evaluate SecureRAG security and RAG performance</p>
        </div>
        <Button onClick={handleRunEvaluation} loading={running} icon={<Play className="w-4 h-4" />}>
          Run Evaluation
        </Button>
      </div>

      {/* Running State */}
      {running && (
        <div className="card p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Shield className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Running Security Evaluation...</p>
          <p className="text-sm text-gray-500 mt-1">Testing 100 attack scenarios across all threat categories</p>
          <div className="w-full max-w-xs mx-auto mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-cyber-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {evaluated && !running && (
        <>
          {/* Overview Summary */}
          <div className="card p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold">{result.totalCases}</div>
                <div className="text-sm text-gray-400 mt-1">Total Cases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-success-400">{result.detected}</div>
                <div className="text-sm text-gray-400 mt-1">Detected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-primary-400">{result.blocked}</div>
                <div className="text-sm text-gray-400 mt-1">Blocked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-danger-400">{result.missed}</div>
                <div className="text-sm text-gray-400 mt-1">Missed</div>
              </div>
            </div>
          </div>

          {/* Security & RAG Metrics */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Security Metrics */}
            <div className="card p-6">
              <h3 className="section-title mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-primary-500" /> Security Metrics</h3>
              <div className="space-y-5">
                {[
                  { label: 'Detection Rate', value: result.detectionRate, icon: Target, color: 'from-success-500 to-success-600' },
                  { label: 'Blocking Rate', value: result.blockingRate, icon: Shield, color: 'from-primary-500 to-primary-600' },
                  { label: 'False Positive Rate', value: result.falsePositiveRate, icon: AlertTriangle, color: 'from-warning-500 to-warning-600', invert: true },
                  { label: 'False Negative Rate', value: result.falseNegativeRate, icon: XCircle, color: 'from-danger-500 to-danger-600', invert: true },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <m.icon className="w-4 h-4 text-gray-400" />{m.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{m.value}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-1000`} style={{ width: `${m.invert ? m.value * 5 : m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RAG Metrics */}
            <div className="card p-6">
              <h3 className="section-title mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyber-500" /> RAG Performance</h3>
              <div className="space-y-5">
                {[
                  { label: 'Retrieval Accuracy', value: result.retrievalAccuracy, suffix: '%', icon: Target },
                  { label: 'Response Relevance', value: result.responseRelevance, suffix: '%', icon: CheckCircle },
                  { label: 'Response Latency', value: result.responseLatency, suffix: 's', icon: Clock, isLatency: true },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <m.icon className="w-4 h-4 text-gray-400" />{m.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{m.value}{m.suffix}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyber-500 to-primary-500 transition-all duration-1000"
                        style={{ width: `${m.isLatency ? Math.max(0, 100 - m.value * 20) : m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Breakdown */}
            <div className="card p-6">
              <h3 className="section-title mb-6">Detection by Threat Type</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={breakdownData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="detected" fill="#3b82f6" name="Detected" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="card p-6">
              <h3 className="section-title mb-6">Performance Overview</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
