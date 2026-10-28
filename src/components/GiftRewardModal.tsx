import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Gift, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  Share2, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Lock,
  UserCheck,
  Clock,
  RefreshCw,
  Award
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { PhoenixLogo } from './PhoenixLogo';
import { useGiftsRewards } from '../lib/studioContent';
import { useMemberAuth, MemberUser } from '../lib/memberAuth';

interface GiftRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'birthday' | 'referral';
  onOpenBooking: () => void;
  onRequestAuth?: (mode: 'signin' | 'signup', title?: string, subtitle?: string) => void;
}

export const GiftRewardModal: React.FC<GiftRewardModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'birthday',
  onOpenBooking,
  onRequestAuth,
}) => {
  const rewardsSettings = useGiftsRewards();
  const { user, isAuthenticated, claimOffer } = useMemberAuth();
  const [activeTab, setActiveTab] = useState<'birthday' | 'referral'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCopied(false);
      setCopiedReferral(false);
      setClaimFeedback(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const DISCOUNT_PERCENT = rewardsSettings.discountPercentage || 15;
  const birthdayClaim = user?.claims?.birthday;
  const referralClaim = user?.claims?.referral;

  // Active code for birthday voucher
  const activeBirthdayCode = birthdayClaim?.code || rewardsSettings.couponCode || 'PHOENIX15';
  
  // Active referral code
  const activeReferralCode = referralClaim?.code || `REF-${(user?.name || 'PHX').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}-2026`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeBirthdayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const referralMessage = user?.name
    ? `Hey! My friend ${user.name} recommended Phoenix Tattooz in Hisar. Use my member referral code ${activeReferralCode} for ${DISCOUNT_PERCENT}% OFF your next custom tattoo or piercing! Book on WhatsApp: https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}?text=Hi%20Phoenix%20Tattooz%2C%20my%20friend%20${encodeURIComponent(user.name)}%20referred%20me%20with%20code%20${activeReferralCode}`
    : `Hey! Get ${DISCOUNT_PERCENT}% OFF your next custom tattoo or piercing at Phoenix Tattooz Hisar using referral code ${activeReferralCode}! Book here: https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}?text=Hi%20Phoenix%20Tattooz%2C%20I%20have%20referral%20code%20${activeReferralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralMessage);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Perform verified one-time server claim
  const handleClaim = async (type: 'birthday' | 'referral') => {
    if (!isAuthenticated) {
      if (onRequestAuth) {
        onRequestAuth(
          'signup',
          'Sign In to Claim Your Gift',
          'Please sign in or create a member account to claim your one-time 15% discount.'
        );
      }
      return;
    }

    setIsClaiming(true);
    setClaimFeedback(null);

    const res = await claimOffer(type);
    setIsClaiming(false);

    if (res.success) {
      if (res.alreadyClaimed) {
        setClaimFeedback(`You have already claimed this ${type} offer! Your code is displayed below.`);
      } else {
        setClaimFeedback(`Congratulations! Your unique 1-time ${type === 'birthday' ? '15% Birthday Voucher' : 'Referral Code'} is active!`);
      }
    } else {
      setClaimFeedback(res.error || 'Failed to claim offer. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#0F1115] border border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(255,214,10,0.2)] overflow-hidden z-10 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0F1115] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD60A] text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFD60A] block">
                Exclusive Studio Reward
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">
                Gifts &amp; Rewards Program
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Status Indicator Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Signed in as <strong className="text-white">{user.name}</strong></span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Member
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-zinc-400 font-medium">
                <Lock className="w-4 h-4 text-[#FFD60A]" />
                <span>Guest mode &bull; Sign in to claim your 15% code</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onRequestAuth) {
                    onRequestAuth('signin', 'Member Sign In', 'Sign in to access and claim your 1-time discount code.');
                  }
                }}
                className="text-xs font-bold text-[#FFD60A] hover:underline cursor-pointer"
              >
                Sign In &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 mx-4 sm:mx-6 mt-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('birthday')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'birthday'
                ? 'bg-[#FFD60A] text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Birthday Gift Card</span>
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'referral'
                ? 'bg-[#FFD60A] text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Refer &amp; Earn</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-zinc-300">
          
          {/* Feedback message banner if claim just occurred */}
          {claimFeedback && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-[#FFD60A]/40 text-amber-200 text-xs flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#FFD60A] shrink-0" />
              <span>{claimFeedback}</span>
            </div>
          )}

          {activeTab === 'birthday' ? (
            <>
              {/* Luxury Digital Card Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1D24] via-[#121418] to-[#0A0B0E] border border-amber-500/50 p-5 sm:p-6 shadow-xl text-white">
                {/* Gold ambient corner sheen */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#FFD60A]/20 via-transparent to-transparent rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <PhoenixLogo size={36} className="shadow-md" />
                    <div>
                      <span className="text-[10px] tracking-widest uppercase font-bold text-amber-300 block">
                        Phoenix Tattooz
                      </span>
                      <span className="text-xs text-zinc-400">Official Gift Voucher</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-[#FFD60A] border border-amber-500/40">
                    {DISCOUNT_PERCENT}% OFF
                  </span>
                </div>

                <div className="my-3 relative z-10">
                  <div className="text-[11px] text-zinc-400 uppercase tracking-widest">
                    Voucher Benefit
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                    {DISCOUNT_PERCENT}% Birthday Discount
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 max-w-sm">
                    Valid on any custom tattoo, portrait realism, cover-up, or body piercing at our Hisar studio.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/90 flex flex-wrap items-center justify-between gap-2 relative z-10 text-[11px] text-zinc-400">
                  <span>One-Time Personal Claim per Member</span>
                  <span className="text-amber-300 font-medium">Red Square Market &bull; Hisar</span>
                </div>
              </div>

              {/* AUTH GATE CHECK FOR BIRTHDAY CODE */}
              {!isAuthenticated ? (
                /* Unauthenticated Guest View: Secret code hidden until sign in */
                <div className="bg-zinc-900/90 border-2 border-dashed border-amber-500/40 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#FFD60A] mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sign In to Unlock Your 15% Code</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      To ensure fair studio gifting, each discount code is uniquely generated and strictly 1 per member. Sign up in 10 seconds to unlock yours!
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestAuth) onRequestAuth('signup', 'Join to Claim 15% Discount', 'Create a free member account to receive your personal 15% voucher code.');
                      }}
                      className="w-full sm:w-auto bg-[#FFD60A] hover:bg-[#ffe033] text-black font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Create Account &amp; Claim (Free)</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestAuth) onRequestAuth('signin', 'Member Sign In', 'Sign in to access your saved 15% voucher code.');
                      }}
                      className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-3 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Already a Member? Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated Member View: One-time claim status & code */
                <>
                  {birthdayClaim ? (
                    /* ALREADY CLAIMED: Display permanent saved code */
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Claimed by <strong>{user?.name}</strong> on {new Date(birthdayClaim.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-900/60 px-2 py-0.5 rounded">
                          Claimed (1/1)
                        </span>
                      </div>

                      {/* Code Box */}
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                            Your Personal One-Time Coupon Code
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-[#FFD60A] tracking-wider block mt-0.5">
                            {birthdayClaim.code}
                          </span>
                        </div>

                        <button
                          onClick={handleCopyCode}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Redemption Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <a
                          href={`https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}?text=Hi%20Phoenix%20Tattooz%2C%20I%20am%20member%20${encodeURIComponent(user?.name || '')}%20and%20I%20would%20like%20to%20redeem%20my%2015%25%20Birthday%20Gift%20Card%20code%3A%20${birthdayClaim.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Redeem on WhatsApp</span>
                        </a>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenBooking();
                          }}
                          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl border border-zinc-700 transition-all cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-[#FFD60A]" />
                          <span>Book Appointment</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* NOT YET CLAIMED: One-click verified claim button */
                    <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                        <Award className="w-4 h-4 text-[#FFD60A]" />
                        <span>Ready to Claim (1 Claim Available for {user?.name})</span>
                      </div>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Click below to lock in your personal 15% birthday voucher. A personalized code will be permanently saved to your account.
                      </p>
                      <button
                        onClick={() => handleClaim('birthday')}
                        disabled={isClaiming}
                        className="w-full bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-xl shadow-yellow-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isClaiming ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Assigning your unique code...</span>
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 text-black" />
                            <span>Claim My 15% Birthday Card (One-Time)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Strict 1-claim limit per member &bull; Verified on server disk database</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Refer & Earn Content */}
              <div className="bg-gradient-to-br from-[#191C22] to-[#101216] border border-amber-500/30 rounded-2xl p-5 text-white">
                <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD60A]" />
                  <span>Invite a Friend &amp; Both Get 15% Off</span>
                </h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Share the love of art! When your referred friend books their tattoo using your unique recommendation, both of you receive a 15% discount credit on your next tattoo session.
                </p>
              </div>

              {/* AUTH GATE CHECK FOR REFERRAL */}
              {!isAuthenticated ? (
                <div className="bg-zinc-900/90 border-2 border-dashed border-amber-500/40 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#FFD60A] mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sign In to Generate Referral Code</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      Referral rewards require a member account so referral credits can be credited directly to your studio profile when your friends book.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestAuth) onRequestAuth('signup', 'Join to Start Referring', 'Create a free member account to get your personal referral code.');
                      }}
                      className="w-full sm:w-auto bg-[#FFD60A] hover:bg-[#ffe033] text-black font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Join Member Club (Free)</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onRequestAuth) onRequestAuth('signin', 'Member Sign In', 'Sign in to access your referral code and share link.');
                      }}
                      className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-3 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated Member Referral */
                <div className="space-y-4">
                  {referralClaim ? (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Active Referral Code for <strong>{user?.name}</strong></span>
                      </span>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        {referralClaim.code}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                      <span>Ready to activate your member referral link:</span>
                      <button
                        onClick={() => handleClaim('referral')}
                        disabled={isClaiming}
                        className="bg-[#FFD60A] text-black font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#ffe033]"
                      >
                        {isClaiming ? 'Generating...' : 'Activate Code'}
                      </button>
                    </div>
                  )}

                  {/* Generated Referral Code Card */}
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        Your Unique Referral Code
                      </span>
                      <span className="text-xs font-mono font-bold text-[#FFD60A] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {activeReferralCode}
                      </span>
                    </div>

                    <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono select-all break-all leading-relaxed">
                      {referralMessage}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={handleCopyReferral}
                        className="flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        {copiedReferral ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                            <span>Invitation Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Referral Invitation</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(referralMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all text-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Step summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center text-zinc-400">
                <div className="p-2">
                  <div className="font-bold text-white text-xs">1. Share Code</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Send to friends</div>
                </div>
                <div className="p-2 border-x border-zinc-800">
                  <div className="font-bold text-white text-xs">2. Friend Inks</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Gets 15% off</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-white text-xs">3. You Get 15%</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Discount credit</div>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
