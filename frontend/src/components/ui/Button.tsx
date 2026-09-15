import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  const base = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    cyber: 'btn-cyber',
  }[variant];

  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm',
    md: '',
    lg: 'px-8 py-3 text-lg',
  }[size];

  return (
    <button
      className={cn(base, sizeClass, 'inline-flex items-center justify-center gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
