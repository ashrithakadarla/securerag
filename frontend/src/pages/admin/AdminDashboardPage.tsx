import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  ClipboardList,
  Swords,
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  Activity,
} from 'lucide-react';

import { securityService } from '../../services/securityService';
import { SecurityEvent } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingStates';
import {
  formatDateTime,
  getActionBadgeClass,
  getSeverityBadgeClass,
} from '../../utils/helpers';

const adminFeatures = [
  {
    title: 'Security',
    description: 'Monitor security events, threats, and risk levels.',
    icon: Shield,
    path: '/security',
  },
  {
    title: 'Analytics',
    description: 'View security trends and system analytics.',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    title: 'Audit Logs',
    description: 'Review security events and audit activity.',
    icon: ClipboardList,
    path: '/audit-logs',
  },
  {
    title: 'Attack Simulation',
    description: 'Run controlled security attack simulations.',
    icon: Swords,
    path: '/attack-simulation',
  },
  {
    title: 'Evaluation',
    description: 'Evaluate SecureRAG security performance.',
    icon: FlaskConical,
    path: '/evaluation',
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [summary, setSummary] = useState({
    totalThreats: 0,
    detectedThreats: 0,
    blockedThreats: 0,
    criticalThreats: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [threatOverview, securityEvents] = await Promise.all([
          securityService.getThreatOverview(),
          securityService.getSecurityEvents(),
        ]);

        setSummary(threatOverview);
        setEvents(securityEvents.slice(0, 5));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load admin dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading admin dashboard..." />;
  }

  const statCards = [
    {
      label: 'Total Security Events',
      value: summary.totalThreats,
      icon: Activity,
    },
    {
      label: 'Detected Threats',
      value: summary.detectedThreats,
      icon: ShieldAlert,
    },
    {
      label: 'Blocked Threats',
      value: summary.blockedThreats,
      icon: Shield,
    },
    {
      label: 'Critical Threats',
      value: summary.criticalThreats,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="page-container animate-fadeIn">
      <div className="mb-6">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Security monitoring and administration
        </p>
      </div>

      {error && (
        <div className="card p-4 mb-6 border-danger-200 bg-danger-50">
          <p className="text-sm text-danger-700">{error}</p>
        </div>
      )}

      {/* Real security summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
              </div>

              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent real audit/security events */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="section-title">Recent Security Events</h3>
        </div>

        {events.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No security events recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map((event) => (
              <div
                key={event.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={getSeverityBadgeClass(
                    event.severity || 'low'
                  )}
                >
                  {(event.severity || 'low').toUpperCase()}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.user} · {formatDateTime(event.timestamp)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {event.riskScore}
                  </span>

                  <span className={getActionBadgeClass(event.action)}>
                    {event.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin feature navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <button
              key={feature.path}
              type="button"
              onClick={() => navigate(feature.path)}
              className="card p-6 text-left hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                {feature.description}
              </p>

              <div className="mt-4 text-sm font-medium text-primary-600">
                Open →
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}