import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeClass} animate-spin text-primary-500`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
