import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, MessageSquare, FileText, Shield, BarChart3, ScrollText,
  Crosshair, ClipboardCheck, Settings, LogOut, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/security', label: 'Security', icon: Shield },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/attack-simulation', label: 'Attack Simulation', icon: Crosshair },
  { to: '/evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">SecureRAG</span>}
        </div>
        {/* Desktop toggle */}
        <button onClick={onToggle} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close */}
        <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-gray-100">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-cyber-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-danger-600 hover:bg-danger-50 hover:text-danger-700"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl lg:hidden transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
