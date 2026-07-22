import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isRegister) {
        const res = await signUpWithEmail(email, password, displayName || email.split('@')[0]);
        if (res.error) throw res.error;
        setMessage('Account registered successfully!');
      } else {
        const res = await signInWithEmail(email, password);
        if (res.error) throw res.error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError('');
    const res = await resetPassword(email);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
    } else {
      setMessage(t('auth.reset_sent'));
    }
  };

  return (
    <div className="min-h-screen sky-bg flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md sky-card p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#475A61] text-[#F1EEDC] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h1 className="text-3xl font-bold text-[#475A61] tracking-tight mb-2">
            {t('auth.welcome_title')}
          </h1>
          <p className="text-xs text-[#68828C] leading-relaxed max-w-xs mx-auto">
            {t('auth.welcome_subtitle')}
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="flex bg-black/5 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setIsRegister(false);
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-[#475A61] text-[#F1EEDC] shadow-xs' : 'text-[#68828C]'
            }`}
          >
            {t('auth.login_tab')}
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-[#475A61] text-[#F1EEDC] shadow-xs' : 'text-[#68828C]'
            }`}
          >
            {t('auth.register_tab')}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-100 text-rose-800 rounded-xl text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
                {t('auth.name_label')}
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3.5 top-3 text-[#68828C]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full sky-input pl-11 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-[#68828C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full sky-input pl-11 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#68828C] uppercase tracking-wider mb-1">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-[#68828C]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full sky-input pl-11 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {!isRegister && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#68828C] hover:text-[#475A61] underline font-medium"
              >
                {t('auth.forgot_password')}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sky-button-primary py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 mt-6"
          >
            <span>{isRegister ? t('auth.register_btn') : t('auth.login_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#475A61]/15" />
          <span className="text-xs text-[#68828C] font-semibold">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-[#475A61]/15" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full sky-button-secondary py-3 px-4 text-sm font-semibold flex items-center justify-center gap-3 border border-[#475A61]/10 hover:bg-black/5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12s.46 3.8 1.27 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{t('auth.google_btn')}</span>
        </button>
      </div>
    </div>
  );
};
