import React, { useState } from 'react';
import { cn } from '../../utils/helpers';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, icon, isPassword, className, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            'input-field',
            icon ? 'pl-10' : '',
            isPassword ? 'pr-10' : '',
            error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : '',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
