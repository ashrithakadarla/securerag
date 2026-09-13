import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Mail, Lock, User } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/helpers';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else {
      const { valid, errors: pwErrors } = validatePassword(password);
      if (!valid) e.password = `Requires: ${pwErrors.join(', ')}`;
    }
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register({ fullName, email, password, confirmPassword });
      navigate('/dashboard');
    } catch { /* error set in context */ }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Join SecureRAG</h2>
          <p className="text-gray-400 leading-relaxed">Create your account to start securing your RAG applications with enterprise-grade protection against modern AI threats.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">SecureRAG</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 mb-8">Get started with SecureRAG in minutes</p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" placeholder="Alex Morgan" value={fullName}
              onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
              error={errors.fullName} icon={<User className="w-4 h-4" />} />
            <Input label="Email" type="email" placeholder="alex@securerag.io" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              error={errors.email} icon={<Mail className="w-4 h-4" />} />
            <Input label="Password" isPassword placeholder="Create a strong password" value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              error={errors.password} icon={<Lock className="w-4 h-4" />} />
            <Input label="Confirm Password" isPassword placeholder="Confirm your password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
              error={errors.confirmPassword} icon={<Lock className="w-4 h-4" />} />
            
            {/* Password requirements */}
            {password && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: '8+ characters', met: password.length >= 8 },
                  { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
                  { label: 'Lowercase letter', met: /[a-z]/.test(password) },
                  { label: 'Number', met: /[0-9]/.test(password) },
                ].map(r => (
                  <div key={r.label} className={`text-xs flex items-center gap-1 ${r.met ? 'text-success-600' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${r.met ? 'bg-success-500' : 'bg-gray-300'}`} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full">Create Account</Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
