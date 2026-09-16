import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  Key, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  updateSupabaseCredentials 
} from '../lib/supabaseClient';
import { RaviAvatar } from '../components/RaviAvatar';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cloud Config Drawer state
  const isConfigured = isSupabaseConfigured();
  const currentConfig = getSupabaseConfig();
  const [showConfig, setShowConfig] = useState(!isConfigured);
  const [configUrl, setConfigUrl] = useState(currentConfig.url);
  const [configKey, setConfigKey] = useState(currentConfig.anonKey);
  const [configSaved, setConfigSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setErrorMessage('Please enter both Supabase URL and Anon Key.');
      return;
    }
    updateSupabaseCredentials(configUrl.trim(), configKey.trim());
    setConfigSaved(true);
    setErrorMessage(null);
    setSuccessMessage('Supabase credentials saved successfully! You can now log in.');
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfig(false);
    }, 1500);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMessage('Unable to connect. Please configure your Supabase Project URL & Anon Key below.');
      setShowConfig(true);
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6 && authMode !== 'forgot') {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('invalid grant')) {
            throw new Error('Invalid email or password.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Please verify your email address via the link sent by Supabase.');
          } else {
            throw new Error('Unable to connect. Please try again.');
          }
        }

        if (data.user) {
          setSuccessMessage('Welcome, IAS Ravi Ji! Launching your dashboard...');
          onLoginSuccess(data.user);
        }
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: 'IAS Ravi Ji',
              name: 'Ravi',
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          } else {
            throw new Error(error.message || 'Unable to create account. Please try again.');
          }
        }

        if (data.session) {
          setSuccessMessage('Account created! Welcome, IAS Ravi Ji.');
          onLoginSuccess(data.user);
        } else {
          setSuccessMessage('Account created successfully! Please check your email inbox to verify your account, or sign in.');
          setAuthMode('login');
        }
      } else {
        // Forgot Password
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) {
          throw new Error('Unable to send password reset email. Please verify the email address.');
        }

        setSuccessMessage('Password reset instructions sent to your email! Please check your inbox.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-['Plus_Jakarta_Sans'] selection:bg-indigo-500 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 relative z-10">
        {/* Identity Header */}
        <div className="text-center mb-6">
          <div className="inline-flex relative justify-center mb-3">
            <div className="p-1 rounded-full ring-4 ring-indigo-500/20 bg-slate-900 shadow-lg">
              <RaviAvatar size="lg" showBadge />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-white">
              2029
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Ravi Ki UPSC Diary
          </h1>
          <div className="text-sm font-bold text-indigo-700 tracking-wide mt-0.5 flex items-center justify-center gap-1.5">
            <span>IAS RAVI</span>
            <span className="inline-block w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold text-slate-500">LBSNAA Bound</span>
          </div>

          {/* Hindi Guiding Tagline */}
          <div className="mt-3 py-2 px-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-amber-900 text-xs font-medium font-hindi leading-relaxed shadow-2xs">
            “चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।”
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              authMode === 'forgot'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        {/* Supabase Missing Config Notice */}
        {!isConfigured && !showConfig && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Supabase Config Needed:</span> Enter your Supabase Project URL & Anon Key to authenticate.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="text-[11px] font-bold text-indigo-700 hover:underline shrink-0"
            >
              Configure →
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi7206751296@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium transition-all"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMessage(null); }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{authMode === 'login' ? 'Logging in...' : authMode === 'signup' ? 'Creating Account...' : 'Sending Link...'}</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'login' ? 'LOGIN' : authMode === 'signup' ? 'CREATE ACCOUNT' : 'SEND PASSWORD RESET LINK'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Supabase Configuration Drawer Toggle */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Supabase Cloud Settings</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-90' : ''}`} />
          </button>
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>RLS Protected</span>
          </div>
        </div>

        {/* Collapsible Supabase Settings Form */}
        {showConfig && (
          <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supabase Connection Config</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Values in <code className="text-indigo-600 font-mono">.env</code> are used automatically. You can also specify your credentials directly here:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  Supabase Anon Public Key
                </label>
                <textarea
                  rows={2}
                  required
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {configSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Key className="w-3.5 h-3.5" />}
                <span>{configSaved ? 'Saved!' : 'Save Supabase Credentials'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Security Guarantee */}
      <div className="mt-6 text-center text-xs text-slate-400 max-w-sm flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>Permanent Cloud Storage &amp; User RLS Isolation by Supabase</span>
      </div>
    </div>
  );
};
