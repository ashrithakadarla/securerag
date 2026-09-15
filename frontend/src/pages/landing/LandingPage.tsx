import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Zap, FileSearch, Lock, BarChart3, CheckCircle, AlertTriangle, ArrowRight,
  Menu, X, Scan, ShieldCheck, FileWarning, Eye, ScrollText, ChevronDown,
  ShieldAlert, Bug, FileX, KeyRound, UserX, MessageSquareWarning
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const features = [
  { icon: Scan, title: 'Prompt Risk Analyzer', desc: 'Analyze incoming prompts for injection attacks, jailbreak attempts, and malicious patterns in real-time.' },
  { icon: ShieldCheck, title: 'Prompt Sanitization', desc: 'Automatically sanitize and neutralize dangerous prompt patterns before they reach your RAG pipeline.' },
  { icon: FileSearch, title: 'Secure Retrieval', desc: 'Ensure retrieved documents are safe and trustworthy with multi-layer security scanning.' },
  { icon: FileWarning, title: 'Document Security Analyzer', desc: 'Deep scan uploaded documents for hidden payloads, malware signatures, and injection attempts.' },
  { icon: Lock, title: 'Document Trust Scoring', desc: 'Assign dynamic trust scores to every document based on source, content analysis, and threat signals.' },
  { icon: Zap, title: 'Secure Context Reconstruction', desc: 'Rebuild safe context windows using only trusted documents with verified content integrity.' },
  { icon: Eye, title: 'Response Validator', desc: 'Validate LLM responses for sensitive data leakage, unsafe content, and prompt leakage before delivery.' },
  { icon: ScrollText, title: 'Audit Logging', desc: 'Comprehensive security audit trail for every query, document, and response with full traceability.' },
];

const flowSteps = [
  'User Query', 'Prompt Risk Analysis', 'Prompt Sanitization', 'Secure Retrieval',
  'Document Security Analysis', 'Trust Scoring', 'Context Reconstruction', 'LLM',
  'Response Validation', 'Secure Response',
];

const threats = [
  { icon: ShieldAlert, name: 'Prompt Injection', desc: 'Detects and blocks direct and indirect prompt injection attacks.', stat: '94% blocked' },
  { icon: Bug, name: 'Jailbreak Attempts', desc: 'Identifies persona manipulation and safety bypass attempts.', stat: '92% blocked' },
  { icon: FileX, name: 'Malicious Documents', desc: 'Scans for hidden payloads, malware, and embedded injections.', stat: '97% detected' },
  { icon: KeyRound, name: 'Prompt Leakage', desc: 'Prevents extraction of system prompts and internal instructions.', stat: '96% blocked' },
  { icon: UserX, name: 'Sensitive Data Exposure', desc: 'Filters PII, credentials, and confidential data from responses.', stat: '98% filtered' },
  { icon: MessageSquareWarning, name: 'Unsafe Responses', desc: 'Validates all responses before delivery to end users.', stat: '95% validated' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SecureRAG</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#security" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Security</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#threats" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Threats</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
              <div className="flex flex-col gap-2">
                <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Features</a>
                <a href="#security" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Security</a>
                <a href="#how-it-works" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">How It Works</a>
                <a href="#threats" className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Threats</a>
                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                  <Link to="/login" className="flex-1"><Button variant="secondary" className="w-full" size="sm">Login</Button></Link>
                  <Link to="/register" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cyber-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyber-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enterprise-Grade RAG Security
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Secure Your RAG Applications Against{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-cyber-500">Modern AI Threats</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              SecureRAG combines advanced RAG capabilities with prompt security, document trust scoring,
              secure context reconstruction, and response validation to protect your AI applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>Get Started</Button>
              </Link>
              <a href="#security">
                <Button variant="secondary" size="lg" icon={<Shield className="w-5 h-5" />}>Explore Security</Button>
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-6 h-6 text-gray-300 animate-bounce" />
        </div>
      </section>

      {/* Security Metrics */}
      <section id="security" className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '94%', label: 'Detection Rate', icon: CheckCircle, color: 'text-cyber-400' },
              { value: '92%', label: 'Attack Blocking Rate', icon: Shield, color: 'text-primary-400' },
              { value: '1.8s', label: 'Response Latency', icon: Zap, color: 'text-warning-400' },
              { value: '96%', label: 'Trusted Documents', icon: FileSearch, color: 'text-success-400' },
            ].map((m, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                <m.icon className={`w-8 h-8 mx-auto mb-3 ${m.color}`} />
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1">{m.value}</div>
                <div className="text-sm text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">Comprehensive Security Pipeline</h2>
            <p className="text-gray-600 text-lg">Every layer of your RAG pipeline is protected with enterprise-grade security.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group card p-6 hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyber-100 flex items-center justify-center mb-4 group-hover:from-primary-200 group-hover:to-cyber-200 transition-colors">
                  <f.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">How SecureRAG Works</h2>
            <p className="text-gray-600 text-lg">A multi-layered security pipeline protects every query from input to output.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-cyber-500 to-success-500" />
              {flowSteps.map((step, i) => (
                <div key={i} className="relative flex items-center gap-4 mb-6 last:mb-0">
                  <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 ${
                    i === 0 ? 'bg-primary-500' : i === flowSteps.length - 1 ? 'bg-success-500' : 'bg-gradient-to-br from-primary-500 to-cyber-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="bg-white rounded-xl px-6 py-4 border border-gray-100 shadow-sm flex-1 hover:shadow-md transition-shadow">
                    <span className="font-semibold text-gray-900">{step}</span>
                    {i === 0 && <span className="text-sm text-gray-500 ml-2">→ Input received</span>}
                    {i === flowSteps.length - 1 && <span className="text-sm text-success-600 ml-2">✓ Verified & delivered</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Threat Protection */}
      <section id="threats" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">Threat Protection</h2>
            <p className="text-gray-600 text-lg">SecureRAG detects and blocks the most common AI security threats.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {threats.map((t, i) => (
              <div key={i} className="card p-6 group hover:border-danger-200 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center flex-shrink-0 group-hover:bg-danger-200 transition-colors">
                    <t.icon className="w-5 h-5 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t.desc}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-100 text-success-700 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">Build Safer RAG Applications</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Start protecting your RAG applications today with enterprise-grade security that doesn't compromise performance.
          </p>
          <Link to="/register">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SecureRAG</span>
              </div>
              <p className="text-sm text-gray-500">Enterprise-grade security for RAG applications.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-300 transition-colors">Features</a></li>
                <li><a href="#security" className="hover:text-gray-300 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-300 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-300 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} SecureRAG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
