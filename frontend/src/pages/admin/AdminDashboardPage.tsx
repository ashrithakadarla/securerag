import { useNavigate } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  ClipboardList,
  Swords,
  FlaskConical,
} from 'lucide-react';

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

  return (
    <div className="page-container animate-fadeIn">
      <div className="mb-6">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Security monitoring and administration
        </p>
      </div>

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