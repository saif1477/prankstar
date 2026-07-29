'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertTriangle } from 'lucide-react';
import { loginWithEmail, registerWithEmail, User as AuthUser } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginWithEmail(email, password);
        if (result.success && result.user) {
          onAuth(result.user);
          resetAndClose();
        } else {
          setError(result.error || 'Login failed.');
        }
      } else {
        const result = await registerWithEmail(email, password, displayName);
        if (result.success && result.user) {
          onAuth(result.user);
          resetAndClose();
        } else {
          setError(result.error || 'Registration failed.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setMode('login');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-card border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Header Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Close Button */}
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-cyan p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-dark-900 rounded-[12px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Sign in to track XP, save favorites, and unlock badges'
                : 'Join PrankStar to start pranking and earning achievements'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Form */}
          <div className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
              />
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl btn-neon-purple font-heading font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In with Email' : 'Create Account'}</span>
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} className="text-neon-cyan font-semibold hover:underline">
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(null); }} className="text-neon-cyan font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            )}
          </div>
          <p className="text-center text-[11px] text-slate-500">
            Use the same email on your phone to access your account there.
          </p>
        </div>
      </div>
    </div>
  );
}
