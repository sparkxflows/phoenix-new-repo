import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { PhoenixLogo } from './PhoenixLogo';
import { signInMember, signUpMember, MemberUser } from '../lib/memberAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  customTitle?: string;
  customSubtitle?: string;
  onSuccess?: (user: MemberUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  customTitle,
  customSubtitle,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUpMember(name.trim(), email.trim(), password, birthdate.trim());
        if (res.success && res.user) {
          if (res.user.claims?.birthday) {
            setSuccessMessage(`Welcome! Instant 15% birthday code generated: ${res.user.claims.birthday.code}`);
          } else {
            setSuccessMessage('Welcome to Phoenix Rewards Club!');
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(res.user!);
            onClose();
          }, 900);
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } else {
        const res = await signInMember(email.trim(), password);
        if (res.success && res.user) {
          setSuccessMessage('Signed in successfully!');
          setTimeout(() => {
            if (onSuccess) onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0F1115] border border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(255,214,10,0.25)] overflow-hidden z-10 flex flex-col">
        
        {/* Top Header with Phoenix Emblem */}
        <div className="relative p-6 pb-4 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0F1115] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-1 rounded-full border border-amber-500/50 bg-black shadow-md">
              <PhoenixLogo size={42} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FFD60A] block">
                PHOENIX REWARDS CLUB
              </span>
              <h3 className="text-xl font-serif font-black text-white leading-tight">
                {customTitle || (mode === 'signup' ? 'Create Member Account' : 'Member Sign In')}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Value Prompt Bar */}
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200/95 font-medium">
          <Gift className="w-4 h-4 text-[#FFD60A] shrink-0" />
          <span>
            {customSubtitle || 'Sign in to unlock your 15% birthday coupon & exclusive studio gifts.'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-zinc-900/90 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#FFD60A] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Join / Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#FFD60A] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Balmukund Rao"
                  className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Sign Up: Date of Birth Option with Accent Line for Instant 15% Discount */}
          {mode === 'signup' && (
            <div className="space-y-2 pt-1">
              {/* Decorative accent divider line */}
              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-500/30" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#0F1115] px-2.5 text-[#FFD60A] flex items-center gap-1.5 border border-amber-500/40 rounded-full py-0.5 shadow-xs">
                    <Gift className="w-3 h-3 text-[#FFD60A]" />
                    Instant Birthday Discount
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>Your Date of Birth</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    ★ Instant 15% OFF
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
                <p className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 leading-tight">
                  <span>🎂 Add your birth date to get an instant 15% discount voucher code automatically linked to your account!</span>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Continue' : 'Sign In & Access Rewards'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* Privacy & One-Time Rule Note */}
          <div className="pt-2 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Strict 1-claim limit per member • Confidential studio records</span>
          </div>
        </form>

        {/* Footer switch prompt */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <span>
              Already a member?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                className="text-[#FFD60A] font-bold hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </span>
          ) : (
            <span>
              New to Phoenix Tattooz?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className="text-[#FFD60A] font-bold hover:underline cursor-pointer"
              >
                Join free for 15% discount
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
