export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-danger-600';
  if (score >= 50) return 'text-warning-600';
  return 'text-success-600';
}

export function getRiskBg(score: number): string {
  if (score >= 80) return 'bg-danger-100 text-danger-700';
  if (score >= 50) return 'bg-warning-100 text-warning-700';
  return 'bg-success-100 text-success-700';
}

export function getRiskLabel(level: string): string {
  switch (level) {
    case 'trusted': return 'Trusted';
    case 'moderate': return 'Moderate Risk';
    case 'high': return 'High Risk';
    case 'blocked': return 'Blocked';
    case 'scanning': return 'Scanning';
    default: return level;
  }
}

export function getRiskBadgeClass(level: string): string {
  switch (level) {
    case 'trusted': return 'badge-safe';
    case 'moderate': return 'badge-warning';
    case 'high': case 'blocked': return 'badge-danger';
    case 'scanning': return 'badge-info';
    default: return 'badge-neutral';
  }
}

export function getActionBadgeClass(action: string): string {
  switch (action) {
    case 'blocked': return 'badge-danger';
    case 'allowed': return 'badge-safe';
    case 'flagged': return 'badge-warning';
    default: return 'badge-neutral';
  }
}

export function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'critical': return 'badge-danger';
    case 'high': return 'badge-danger';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-safe';
    default: return 'badge-neutral';
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
