import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, LogOut, Settings, User, X, ChevronDown } from 'lucide-react';
import { mockNotifications } from '../../data/mockNotifications';
import { timeAgo } from '../../utils/helpers';
import { Notification } from '../../types';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat': 'Chat',
  '/documents': 'Documents',
  '/security': 'Security',
  '/analytics': 'Analytics',
  '/audit-logs': 'Audit Logs',
  '/attack-simulation': 'Attack Simulation',
  '/evaluation': 'Evaluation',
  '/settings': 'Settings',
};

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pageTitle = pageNames[location.pathname] || 'SecureRAG';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setShowSearch(false); setSearchQuery(''); }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const searchResults = searchQuery.trim() ? [
    { type: 'Page', label: 'Dashboard', path: '/dashboard' },
    { type: 'Page', label: 'Documents', path: '/documents' },
    { type: 'Page', label: 'Security', path: '/security' },
    { type: 'Page', label: 'Analytics', path: '/analytics' },
    { type: 'Page', label: 'Audit Logs', path: '/audit-logs' },
    { type: 'Page', label: 'Attack Simulation', path: '/attack-simulation' },
    { type: 'Page', label: 'Settings', path: '/settings' },
  ].filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const severityIcons: Record<string, string> = {
    critical: 'bg-danger-100 text-danger-600',
    high: 'bg-danger-100 text-danger-600',
    medium: 'bg-warning-100 text-warning-600',
    low: 'bg-primary-100 text-primary-600',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          {showSearch && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 animate-slideDown z-50">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search pages, documents..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {searchResults.length > 0 && (
                <div className="border-t border-gray-100 py-2">
                  {searchResults.map(r => (
                    <button
                      key={r.path}
                      onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery(''); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400 w-12">{r.type}</span>
                      <span className="text-gray-700">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-100 animate-slideDown z-50 max-h-[480px] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex gap-3 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severityIcons[n.severity]}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-cyber-400 flex items-center justify-center text-white text-sm font-semibold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName}</p>
              <p className="text-xs text-gray-500 leading-tight capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slideDown z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </button>
              <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button onClick={handleLogout} className="w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
