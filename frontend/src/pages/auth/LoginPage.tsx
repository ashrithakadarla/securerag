import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, Mail, Lock } from 'lucide-react';
import { validateEmail } from '../../utils/helpers';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithGithub, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { resetPassword } = useAuth();

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login({ email, password, rememberMe });
      navigate('/dashboard');
    } catch { /* error is set in context */ }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(forgotEmail);
      setForgotSent(true);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyber-500/10 rounded-full blur-3xl" />
        <div className="relative text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Welcome Back to SecureRAG</h2>
          <p className="text-gray-400 leading-relaxed">Protect your RAG applications with enterprise-grade security. Monitor threats, analyze documents, and secure AI responses.</p>
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

          {!showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
              <p className="text-gray-500 mb-8">Enter your credentials to access the dashboard</p>

              {error && (
                <div className="mb-6 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="alex@securerag.io"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Password"
                  isPassword
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  error={errors.password}
                  icon={<Lock className="w-4 h-4" />}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" loading={isLoading} className="w-full">Sign In</Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400 uppercase">or continue with</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={signInWithGoogle} size="sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
                <Button variant="secondary" onClick={signInWithGithub} size="sm">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.16-1.1-1.46-1.1-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
                  GitHub
                </Button>
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Create one</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
              <p className="text-gray-500 mb-8">Enter your email to receive a password reset link</p>

              {forgotSent ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-success-600" />
                  </div>
                  <p className="text-gray-700 mb-2 font-medium">Reset link sent!</p>
                  <p className="text-sm text-gray-500 mb-6">Check your email for instructions to reset your password.</p>
                  <Button variant="secondary" onClick={() => { setShowForgot(false); setForgotSent(false); }}>Back to Login</Button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-5">
                  <Input label="Email" type="email" placeholder="alex@securerag.io" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
                  <Button type="submit" loading={isLoading} className="w-full">Send Reset Link</Button>
                  <button type="button" onClick={() => setShowForgot(false)} className="w-full text-sm text-gray-500 hover:text-gray-700">Back to Login</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
