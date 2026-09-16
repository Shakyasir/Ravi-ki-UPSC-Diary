import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Lock, 
  Mail, 
  Key, 
  Check, 
  Copy, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  updateSupabaseCredentials, 
  isSupabaseConfigured, 
  getSupabase,
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabaseClient';
import { store } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'config' | 'schema'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Config fields
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);

  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage({
        type: 'error',
        text: 'Supabase credentials not configured. Please enter your Supabase URL & Anon Key in the "Cloud Settings" tab below!'
      });
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Account created! Check your email for verification link.' });
      } else if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Successfully logged in to Supabase Cloud!' });
        setTimeout(() => onClose(), 1500);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
    setMessage({ type: 'success', text: 'Supabase credentials saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Supabase Cloud Sync & Auth</h2>
              <p className="text-xs text-indigo-200">Secure cloud database for Ravi Ki UPSC Diary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => { setActiveTab('auth'); setMessage(null); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'auth'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Authentication
          </button>
          <button
            onClick={() => { setActiveTab('config'); setMessage(null); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Cloud Config {isConfigured ? '✓' : ''}
          </button>
          <button
            onClick={() => { setActiveTab('schema'); setMessage(null); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            SQL Migrations (RLS)
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab 1: Auth */}
        {activeTab === 'auth' && (
          <div className="p-6">
            {!isConfigured && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Offline & Local Persistence Active.</span> All your data is saved safely in browser storage. To enable multi-device Supabase sync, configure your credentials in the "Cloud Config" tab.
                </div>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-5">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'signup' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'forgot' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Forgot Password
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ravi7206751296@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {authMode === 'login' ? 'Sign In to Supabase' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Config */}
        {activeTab === 'config' && (
          <div className="p-6">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Project URL</label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supabase Anon Public Key</label>
                <textarea
                  rows={3}
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Save Supabase Credentials
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Schema */}
        {activeTab === 'schema' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">PostgreSQL Tables & RLS Policies</span>
              <button
                onClick={copySchemaToClipboard}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
              </button>
            </div>
            <pre className="max-h-60 overflow-y-auto p-3 bg-slate-900 text-slate-300 text-[11px] rounded-xl font-mono leading-relaxed border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
