import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  savedUsername?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  savedUsername = 'admin',
}) => {
  const { signInWithGoogle } = useFirebase();
  const [username, setUsername] = useState(savedUsername || 'admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage('Please enter your admin username.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate against backend API
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save session locally if requested
        if (rememberMe) {
          localStorage.setItem(
            'agricare_admin_session',
            JSON.stringify({
              isLoggedIn: true,
              username: data.username,
              loginTime: new Date().toISOString(),
            })
          );
        }
        onLoginSuccess(data.username);
        onClose();
      } else {
        setErrorMessage(data.error || 'Invalid credentials. Please verify username and password.');
      }
    } catch (err: any) {
      // Fallback verification for offline or dev network interruptions
      console.warn('Backend login check failed, checking fallback credentials:', err);
      if (
        (trimmedUser.toLowerCase() === 'admin' && password === 'admin123') ||
        (trimmedUser === savedUsername && password === 'admin123')
      ) {
        if (rememberMe) {
          localStorage.setItem(
            'agricare_admin_session',
            JSON.stringify({
              isLoggedIn: true,
              username: trimmedUser,
              loginTime: new Date().toISOString(),
            })
          );
        }
        onLoginSuccess(trimmedUser);
        onClose();
      } else {
        setErrorMessage('Incorrect username or password. Default credentials are admin / admin123.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillDefault = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess('Admin (Google)');
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrorMessage(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="admin-login-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative badge */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 p-6 text-white">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-700/50 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md ring-4 ring-emerald-700/50">
              <Lock className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700/80 text-emerald-200 border border-emerald-500/30">
                  AgriCare Admin
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Access
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5 font-['Outfit',sans-serif]">
                Store Owner Login
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-200/90 mt-2.5 leading-relaxed">
            Please enter your administrator username and password to access inventory controls, restocking tools, and orders.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-medium flex items-start gap-2.5 animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-200">Authentication Failed</p>
                <p className="mt-0.5 text-red-700 dark:text-red-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Autofill Helper */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                <span className="font-bold">Default Credentials:</span>{' '}
                <code className="bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-200 font-mono">admin</code> /{' '}
                <code className="bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-200 font-mono">admin123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDefault}
              className="px-2.5 py-1 rounded-lg bg-amber-200/90 dark:bg-amber-500/20 hover:bg-amber-300 dark:hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              Auto-fill
            </button>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label htmlFor="admin-login-username" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <input
                id="admin-login-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#152317] border border-stone-200 dark:border-emerald-800 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#1a2d1d] focus:ring-3 focus:ring-emerald-500/15 text-sm font-medium text-emerald-950 dark:text-emerald-100 transition-all outline-hidden placeholder-stone-400 dark:placeholder-stone-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="admin-login-password" className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Password
              </label>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Case-sensitive</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-[#152317] border border-stone-200 dark:border-emerald-800 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#1a2d1d] focus:ring-3 focus:ring-emerald-500/15 text-sm font-medium text-emerald-950 dark:text-emerald-100 transition-all outline-hidden placeholder-stone-400 dark:placeholder-stone-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-emerald-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 dark:border-emerald-800 text-emerald-700 focus:ring-emerald-500"
              />
              <span>Remember login on this browser</span>
            </label>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Secure Session</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-800 hover:bg-stone-50 dark:hover:bg-[#152317] text-stone-700 dark:text-emerald-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-98 text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Google Sign-in Option */}
          <div className="pt-2 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-emerald-100 dark:border-emerald-900/60 w-full" />
              <span className="bg-white dark:bg-[#101912] px-2 text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-[#152317] hover:bg-emerald-100/70 dark:hover:bg-[#1d3320] text-emerald-950 dark:text-emerald-100 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
