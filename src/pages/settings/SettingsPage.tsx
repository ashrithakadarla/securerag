import { useState, useEffect } from 'react';
import { User, Shield, Bell, Palette, Lock, Save, Camera, ToggleLeft, ToggleRight, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { securityService } from '../../services/securityService';
import { SecuritySettings, NotificationSettings, AppearanceSettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { cn } from '../../utils/helpers';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const [security, setSecurity] = useState<SecuritySettings>({
    promptInjectionProtection: true, jailbreakDetection: true,
    responseValidation: true, sensitiveDataDetection: true, promptLeakageProtection: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    securityAlerts: true, highRiskDocuments: true, systemNotifications: true,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({ theme: 'light' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    securityService.getSecuritySettings().then(setSecurity);
    const storedNotif = localStorage.getItem('securerag_notifications');
    if (storedNotif) setNotifications(JSON.parse(storedNotif));
    const storedTheme = localStorage.getItem('securerag_theme');
    if (storedTheme) setAppearance(JSON.parse(storedTheme));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    showToast({ type: 'success', title: 'Profile updated' });
    setSaving(false);
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    await securityService.updateSecuritySettings(security);
    showToast({ type: 'success', title: 'Security settings saved' });
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem('securerag_notifications', JSON.stringify(notifications));
    showToast({ type: 'success', title: 'Notification preferences saved' });
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { showToast({ type: 'error', title: 'Fill in all password fields' }); return; }
    if (newPassword !== confirmNewPassword) { showToast({ type: 'error', title: 'Passwords do not match' }); return; }
    if (newPassword.length < 8) { showToast({ type: 'error', title: 'Password must be at least 8 characters' }); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    showToast({ type: 'success', title: 'Password changed successfully' });
    setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    setSaving(false);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const a = { theme };
    setAppearance(a);
    localStorage.setItem('securerag_theme', JSON.stringify(a));
    showToast({ type: 'info', title: `Theme set to ${theme}` });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: Lock },
  ];

  const toggleSecurity = (key: keyof SecuritySettings) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <h3 className="section-title">Profile Settings</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-cyber-400 flex items-center justify-center text-white text-2xl font-bold relative group">
                  {name.charAt(0)}
                  <button className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                  <p className="text-xs text-primary-600 capitalize mt-1">{user?.role || 'admin'}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button onClick={handleSaveProfile} loading={saving} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="section-title">Security Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Configure security protection policies</p>
              </div>
              <div className="divide-y divide-gray-50">
                {([
                  { key: 'promptInjectionProtection' as const, label: 'Prompt Injection Protection', desc: 'Detect and block prompt injection attacks' },
                  { key: 'jailbreakDetection' as const, label: 'Jailbreak Detection', desc: 'Identify and block jailbreak attempts' },
                  { key: 'responseValidation' as const, label: 'Response Validation', desc: 'Validate all responses before delivery' },
                  { key: 'sensitiveDataDetection' as const, label: 'Sensitive Information Detection', desc: 'Detect PII and sensitive data in responses' },
                  { key: 'promptLeakageProtection' as const, label: 'Prompt Leakage Protection', desc: 'Prevent system prompt extraction' },
                ]).map(rule => (
                  <div key={rule.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rule.label}</p>
                      <p className="text-xs text-gray-500">{rule.desc}</p>
                    </div>
                    <button onClick={() => toggleSecurity(rule.key)}>
                      {security[rule.key] ? <ToggleRight className="w-10 h-10 text-primary-500" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <Button onClick={handleSaveSecurity} loading={saving} icon={<Save className="w-4 h-4" />}>Save Security Settings</Button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="section-title">Notification Preferences</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {([
                  { key: 'securityAlerts' as const, label: 'Security Alerts', desc: 'Receive notifications for security events' },
                  { key: 'highRiskDocuments' as const, label: 'High-Risk Document Alerts', desc: 'Get notified when high-risk documents are detected' },
                  { key: 'systemNotifications' as const, label: 'System Notifications', desc: 'Receive general system updates and announcements' },
                ]).map(item => (
                  <div key={item.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button onClick={() => toggleNotification(item.key)}>
                      {notifications[item.key] ? <ToggleRight className="w-10 h-10 text-primary-500" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <Button onClick={handleSaveNotifications} loading={saving} icon={<Save className="w-4 h-4" />}>Save Preferences</Button>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-6 animate-fadeIn">
              <h3 className="section-title">Appearance</h3>
              <div className="grid grid-cols-3 gap-4">
                {([
                  { value: 'light' as const, label: 'Light', icon: Sun },
                  { value: 'dark' as const, label: 'Dark', icon: Moon },
                  { value: 'system' as const, label: 'System', icon: Monitor },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all',
                      appearance.theme === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <opt.icon className={cn('w-6 h-6 mx-auto mb-2', appearance.theme === opt.value ? 'text-primary-600' : 'text-gray-400')} />
                    <p className={cn('text-sm font-medium', appearance.theme === opt.value ? 'text-primary-700' : 'text-gray-600')}>{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="card p-6 space-y-4">
                <h3 className="section-title">Change Password</h3>
                <Input label="Current Password" isPassword value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <Input label="New Password" isPassword value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Input label="Confirm New Password" isPassword value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                <Button onClick={handleChangePassword} loading={saving} icon={<Lock className="w-4 h-4" />}>Change Password</Button>
              </div>

              <div className="card p-6">
                <h3 className="section-title text-danger-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">Logging out will end your current session.</p>
                <Button variant="danger" onClick={logout}>Logout</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
