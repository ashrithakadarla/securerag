import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, ShieldOff, Bug, KeyRound, MessageSquareWarning, FileX, ToggleLeft, ToggleRight } from 'lucide-react';
import { securityService } from '../../services/securityService';
import { SecuritySettings } from '../../types';
import { mockSecurityEvents } from '../../data/mockSecurityEvents';
import { LoadingSpinner } from '../../components/ui/LoadingStates';
import { showToast } from '../../components/ui/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const threatTypeData = [
  { name: 'Prompt Injection', count: 38, blocked: 36, color: '#ef4444' },
  { name: 'Jailbreak', count: 24, blocked: 22, color: '#f97316' },
  { name: 'Malicious Doc', count: 18, blocked: 17, color: '#eab308' },
  { name: 'Prompt Leakage', count: 12, blocked: 11, color: '#8b5cf6' },
  { name: 'Unsafe Output', count: 8, blocked: 7, color: '#06b6d4' },
];

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalThreats: 0, detectedThreats: 0, blockedThreats: 0, criticalThreats: 0 });
  const [settings, setSettings] = useState<SecuritySettings>({
    promptInjectionProtection: true,
    jailbreakDetection: true,
    responseValidation: true,
    sensitiveDataDetection: true,
    promptLeakageProtection: true,
  });

  useEffect(() => {
    Promise.all([
      securityService.getThreatOverview(),
      securityService.getSecuritySettings(),
    ]).then(([ov, s]) => {
      setOverview(ov);
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (key: keyof SecuritySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await securityService.updateSecuritySettings(newSettings);
    showToast({
      type: newSettings[key] ? 'success' : 'warning',
      title: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} ${newSettings[key] ? 'enabled' : 'disabled'}`,
    });
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading security data..." />;

  const overviewCards = [
    { label: 'Total Threats', value: overview.totalThreats, icon: Shield, color: 'from-primary-500 to-primary-600' },
    { label: 'Detected', value: overview.detectedThreats, icon: ShieldAlert, color: 'from-warning-500 to-warning-600' },
    { label: 'Blocked', value: overview.blockedThreats, icon: ShieldCheck, color: 'from-success-500 to-success-600' },
    { label: 'Critical', value: overview.criticalThreats, icon: AlertTriangle, color: 'from-danger-500 to-danger-600' },
  ];

  const securityRules = [
    { key: 'promptInjectionProtection' as const, label: 'Prompt Injection Protection', desc: 'Detect and block prompt injection attacks', icon: ShieldAlert },
    { key: 'jailbreakDetection' as const, label: 'Jailbreak Detection', desc: 'Identify and block jailbreak attempts', icon: Bug },
    { key: 'sensitiveDataDetection' as const, label: 'Sensitive Data Detection', desc: 'Detect PII and sensitive data in responses', icon: KeyRound },
    { key: 'promptLeakageProtection' as const, label: 'Prompt Leakage Protection', desc: 'Prevent system prompt extraction', icon: FileX },
    { key: 'responseValidation' as const, label: 'Response Validation', desc: 'Validate all responses before delivery', icon: MessageSquareWarning },
  ];

  return (
    <div className="page-container animate-fadeIn">
      {/* Threat Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((c, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Threat Types Chart */}
      <div className="card p-6">
        <h3 className="section-title mb-6">Threat Types</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={threatTypeData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Bar dataKey="count" fill="#ef4444" name="Detected" radius={[6, 6, 0, 0]} />
            <Bar dataKey="blocked" fill="#3b82f6" name="Blocked" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Security Rules */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="section-title">Security Rules</h3>
          <p className="text-sm text-gray-500 mt-1">Configure security protection policies</p>
        </div>
        <div className="divide-y divide-gray-50">
          {securityRules.map(rule => (
            <div key={rule.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings[rule.key] ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                  <rule.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{rule.label}</p>
                  <p className="text-xs text-gray-500">{rule.desc}</p>
                </div>
              </div>
              <button onClick={() => handleToggle(rule.key)} className="transition-colors">
                {settings[rule.key] ? (
                  <ToggleRight className="w-10 h-10 text-primary-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-300" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
