import { useState, useEffect } from 'react';
import { Crosshair, Play, Shield, ShieldAlert, AlertTriangle, Clock, Zap, RotateCcw } from 'lucide-react';
import { simulationService } from '../../services/simulationService';
import { Attack, SimulationResult } from '../../types';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingStates';
import { cn } from '../../utils/helpers';

export default function AttackSimulationPage() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);
  const [payload, setPayload] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulationService.getAttackTemplates().then(a => {
      setAttacks(a);
      if (a.length > 0) { setSelectedAttack(a[0]); setPayload(a[0].payload); }
      setLoading(false);
    });
  }, []);

  const handleSelectAttack = (attack: Attack) => {
    setSelectedAttack(attack);
    setPayload(attack.payload);
    setResult(null);
  };

  const handleRun = async () => {
    if (!selectedAttack) return;
    setRunning(true);
    setResult(null);
    const res = await simulationService.runSimulation(selectedAttack.type, payload);
    setResult(res);
    setRunning(false);
  };

  const handleReset = () => {
    setResult(null);
    if (selectedAttack) setPayload(selectedAttack.payload);
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading attack templates..." />;

  const typeColors: Record<string, string> = {
    prompt_injection: 'from-danger-500 to-danger-600',
    jailbreak: 'from-warning-500 to-warning-600',
    malicious_document: 'from-yellow-500 to-yellow-600',
    prompt_leakage: 'from-purple-500 to-purple-600',
    unsafe_output: 'from-cyan-500 to-cyan-600',
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attack Templates */}
        <div className="space-y-3">
          <h3 className="section-title mb-4">Attack Templates</h3>
          {attacks.map(attack => (
            <button
              key={attack.id}
              onClick={() => handleSelectAttack(attack)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                selectedAttack?.id === attack.id
                  ? 'border-primary-300 bg-primary-50 shadow-md'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeColors[attack.type] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                  <Crosshair className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{attack.name}</p>
                  <p className="text-xs text-gray-500">{attack.category}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{attack.description}</p>
            </button>
          ))}
        </div>

        {/* Simulation Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAttack && (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">{selectedAttack.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedAttack.description}</p>
                  </div>
                  <span className={`badge-danger`}>{selectedAttack.type.replace(/_/g, ' ')}</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Attack Payload</label>
                  <textarea
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    rows={5}
                    className="input-field font-mono text-sm resize-none"
                    placeholder="Enter or modify the attack payload..."
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button onClick={handleRun} loading={running} disabled={!payload.trim()} icon={<Play className="w-4 h-4" />}>
                    Run Simulation
                  </Button>
                  <Button variant="secondary" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* Running state */}
              {running && (
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Shield className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Running Security Simulation...</p>
                  <p className="text-sm text-gray-500 mt-1">Analyzing payload through SecureRAG security pipeline</p>
                </div>
              )}

              {/* Result */}
              {result && !running && (
                <div className="card overflow-hidden animate-fadeIn">
                  {/* Status banner */}
                  <div className={cn(
                    'px-6 py-4 flex items-center gap-4',
                    result.status === 'blocked' ? 'bg-danger-50' : result.status === 'flagged' ? 'bg-warning-50' : 'bg-success-50'
                  )}>
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      result.status === 'blocked' ? 'bg-danger-100' : result.status === 'flagged' ? 'bg-warning-100' : 'bg-success-100'
                    )}>
                      {result.status === 'blocked' ? <ShieldAlert className="w-6 h-6 text-danger-600" /> :
                       result.status === 'flagged' ? <AlertTriangle className="w-6 h-6 text-warning-600" /> :
                       <Shield className="w-6 h-6 text-success-600" />}
                    </div>
                    <div>
                      <p className={cn(
                        'text-lg font-bold uppercase',
                        result.status === 'blocked' ? 'text-danger-700' : result.status === 'flagged' ? 'text-warning-700' : 'text-success-700'
                      )}>
                        {result.status}
                      </p>
                      <p className="text-sm text-gray-600">{result.action}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold" style={{ color: result.riskScore >= 70 ? '#dc2626' : result.riskScore >= 30 ? '#d97706' : '#16a34a' }}>
                          {result.riskScore}
                        </p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{result.threatType}</p>
                        <p className="text-xs text-gray-500">Threat Type</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                          <Clock className="w-5 h-5" />
                          {result.detectionTime}ms
                        </div>
                        <p className="text-xs text-gray-500">Detection Time</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Explanation</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">{result.explanation}</p>
                    </div>

                    {/* Risk bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Risk Level</span>
                        <span className="text-sm font-bold" style={{ color: result.riskScore >= 70 ? '#dc2626' : result.riskScore >= 30 ? '#d97706' : '#16a34a' }}>
                          {result.riskScore}/100
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{
                          width: `${result.riskScore}%`,
                          backgroundColor: result.riskScore >= 70 ? '#dc2626' : result.riskScore >= 30 ? '#d97706' : '#16a34a'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
