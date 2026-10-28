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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card - Fixed viewport bounds so it NEVER cuts off top or bottom */}
      <div className="relative w-full max-w-md bg-[#0F1115] border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(255,214,10,0.2)] overflow-hidden z-10 flex flex-col max-h-[min(90vh,680px)] my-auto">
        
        {/* Pinned Top Header with Phoenix Emblem */}
        <div className="shrink-0 relative p-4 sm:p-5 pb-3 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0F1115] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-1 rounded-full border border-amber-500/50 bg-black shadow-md shrink-0">
              <PhoenixLogo size={36} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FFD60A] block">
                PHOENIX REWARDS CLUB
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white leading-tight">
                {customTitle || (mode === 'signup' ? 'Create Member Account' : 'Member Login')}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pinned Value Prompt Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-200/95 font-medium">
          <Gift className="w-4 h-4 text-[#FFD60A] shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {customSubtitle || 'Sign in or join to claim your exclusive 15% discount voucher.'}
          </span>
        </div>

        {/* Pinned Tab Switcher */}
        <div className="shrink-0 grid grid-cols-2 p-1.5 mx-4 sm:mx-6 mt-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
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
            Join / Sign Up (15% Off)
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

        {/* Scrollable Form Body - Stays 100% inside container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 space-y-3.5 scrollbar-thin">
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
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Full Name *
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
                  placeholder="Placeholder for Full Name"
                  className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              Email Address *
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
                placeholder="Placeholder for Email Address"
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
              Password *
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
                placeholder="Placeholder for Password (minimum 6 characters)"
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                Confirm Password *
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
                  placeholder="Placeholder for Re-entering Password"
                  className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors min-h-[42px]"
                />
              </div>
            </div>
          )}

          {/* Sign Up: Date of Birth Option for Instant 15% Discount */}
          {mode === 'signup' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFD60A]" />
                  <span>Date of Birth (Optional)</span>
                </label>
                <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ★ Instant 15% OFF
                </span>
              </div>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-[#FFD60A] rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition-colors min-h-[42px] [color-scheme:dark]"
              />
              <p className="text-[10.5px] text-amber-300/90 font-medium leading-tight">
                🎂 Enter your birthdate to unlock an instant 15% discount voucher code!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Get 15% Off' : 'Sign In & Access Rewards'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* Privacy & One-Time Rule Note */}
          <div className="pt-1 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Strict 1-claim limit per member &bull; Confidential studio records</span>
          </div>
        </form>

        {/* Pinned Footer Switch Prompt */}
        <div className="shrink-0 p-3 sm:p-3.5 bg-zinc-900/80 border-t border-zinc-800 text-center text-xs text-zinc-400">
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
