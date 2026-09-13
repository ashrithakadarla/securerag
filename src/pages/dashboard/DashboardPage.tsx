import { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, AlertTriangle, FileText, Activity, TrendingUp, TrendingDown,
  Eye, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { mockSecurityEvents } from '../../data/mockSecurityEvents';
import { mockDocuments } from '../../data/mockDocuments';
import { mockAnalytics } from '../../data/mockAnalytics';
import { formatDateTime, getRiskBadgeClass, getRiskLabel, getActionBadgeClass, getSeverityBadgeClass } from '../../utils/helpers';
import { LoadingSpinner } from '../../components/ui/LoadingStates';

const statCards = [
  { label: 'Total Security Events', value: '128', change: '+12%', up: true, icon: Shield, color: 'from-primary-500 to-primary-600' },
  { label: 'Blocked Attacks', value: '113', change: '+8%', up: true, icon: ShieldAlert, color: 'from-danger-500 to-danger-600' },
  { label: 'High Risk Events', value: '24', change: '-5%', up: false, icon: AlertTriangle, color: 'from-warning-500 to-warning-600' },
  { label: 'Medium Risk Events', value: '31', change: '+3%', up: true, icon: Eye, color: 'from-cyber-500 to-cyber-600' },
  { label: 'Documents Analyzed', value: '57', change: '+15%', up: true, icon: FileText, color: 'from-success-500 to-success-600' },
  { label: 'Detection Rate', value: '94%', change: '+2%', up: true, icon: Activity, color: 'from-purple-500 to-purple-600' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<7 | 30 | 90>(7);
  const trendData = mockAnalytics.attackTrends.slice(-trendPeriod);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const recentAlerts = mockSecurityEvents.filter(e => e.riskScore > 30).slice(0, 5);
  const recentDocs = mockDocuments.filter(d => d.status !== 'scanning').slice(0, 5);
  const recentAudit = mockSecurityEvents.slice(0, 5);

  return (
    <div className="page-container animate-fadeIn">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="card p-5 group hover:border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.up ? 'text-success-600' : 'text-danger-600'}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attack Trend */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">Attack Trends</h3>
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              {([7, 30, 90] as const).map(d => (
                <button key={d} onClick={() => setTrendPeriod(d)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${trendPeriod === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="attacks" stroke="#ef4444" fill="url(#colorAttacks)" strokeWidth={2} name="Attacks" />
              <Area type="monotone" dataKey="blocked" stroke="#3b82f6" fill="url(#colorBlocked)" strokeWidth={2} name="Blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Distribution */}
        <div className="card p-6">
          <h3 className="section-title mb-6">Attack Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={mockAnalytics.attackDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {mockAnalytics.attackDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document Trust & Recent Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Document Trust */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="section-title">Document Trust Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Document</th>
                  <th className="table-header">Trust Score</th>
                  <th className="table-header">Risk Level</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900 max-w-[200px] truncate">{doc.name}</td>
                    <td className="table-cell">
                      <span className={`font-semibold ${doc.trustScore >= 80 ? 'text-success-600' : doc.trustScore >= 60 ? 'text-warning-600' : 'text-danger-600'}`}>
                        {doc.trustScore}
                      </span>
                    </td>
                    <td className="table-cell"><span className={getRiskBadgeClass(doc.riskLevel)}>{getRiskLabel(doc.riskLevel)}</span></td>
                    <td className="table-cell"><span className="badge-neutral capitalize">{doc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="section-title">Recent Security Alerts</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <span className={getSeverityBadgeClass(alert.riskScore >= 80 ? 'high' : alert.riskScore >= 50 ? 'medium' : 'low')}>
                  {alert.riskScore >= 80 ? 'HIGH' : alert.riskScore >= 50 ? 'MED' : 'LOW'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.description}</p>
                  <p className="text-xs text-gray-500">{alert.user} · {formatDateTime(alert.timestamp)}</p>
                </div>
                <span className={getActionBadgeClass(alert.action)}>{alert.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="section-title">Recent Audit Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Time</th>
                <th className="table-header">User</th>
                <th className="table-header">Event</th>
                <th className="table-header">Risk Score</th>
                <th className="table-header">Action</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAudit.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(event.timestamp)}
                    </div>
                  </td>
                  <td className="table-cell font-medium">{event.user}</td>
                  <td className="table-cell max-w-[250px] truncate">{event.description}</td>
                  <td className="table-cell">
                    <span className={`font-semibold ${event.riskScore >= 70 ? 'text-danger-600' : event.riskScore >= 30 ? 'text-warning-600' : 'text-success-600'}`}>
                      {event.riskScore}
                    </span>
                  </td>
                  <td className="table-cell"><span className={getActionBadgeClass(event.action)}>{event.action}</span></td>
                  <td className="table-cell"><span className="badge-neutral capitalize">{event.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
