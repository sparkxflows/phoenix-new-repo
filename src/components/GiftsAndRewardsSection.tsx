import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gift, 
  Star, 
  Heart, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';
import { useGiftsRewards } from '../lib/studioContent';
import { useMemberAuth, triggerAuthModal } from '../lib/memberAuth';

interface GiftsAndRewardsSectionProps {
  onOpenClaimModal: (tab?: 'birthday' | 'referral') => void;
  onRequestAuth?: (mode: 'signin' | 'signup', title?: string, subtitle?: string, afterTab?: 'birthday' | 'referral') => void;
}

export const GiftsAndRewardsSection: React.FC<GiftsAndRewardsSectionProps> = ({
  onOpenClaimModal,
  onRequestAuth
}) => {
  const rewardsSettings = useGiftsRewards();
  const { user, isAuthenticated } = useMemberAuth();

  const handleRewardAction = (tab: 'birthday' | 'referral') => {
    if (!isAuthenticated) {
      const title = tab === 'birthday' ? 'Sign In to Unlock 15% Rewards' : 'Sign In to Access Referral Codes';
      const subtitle = tab === 'birthday' 
        ? 'Sign up or sign in to claim your exclusive one-time 15% birthday discount voucher.'
        : 'Sign up or sign in to get your personal referral link and start earning rewards.';
      if (onRequestAuth) {
        onRequestAuth('signup', title, subtitle, tab);
      } else {
        triggerAuthModal({ mode: 'signup', title, subtitle, afterTab: tab });
      }
    } else {
      onOpenClaimModal(tab);
    }
  };


  return (
    <section id="rewards" className="relative w-full overflow-hidden">
      
      {/* ======================================================== */}
      {/* TIER 1: "Our way of saying Thank you for your trust in us" */}
      {/* ======================================================== */}
      <div className="relative bg-[#090A0D] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-zinc-800/80">
        {/* Subtle Dark Stone Grain & Amber Ambient Lighting */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Ambient Golden Backlights */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-amber-600/20 via-yellow-500/10 to-transparent rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              {/* Gold Kicker */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#FFD60A]" />
                <span className="text-[#FFD60A] text-xs sm:text-sm font-extrabold tracking-[0.25em] uppercase">
                  PHOENIX TATTOOZ
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08]">
                Our way of saying{' '}
                <span className="text-[#FFD60A] font-serif font-black underline decoration-amber-500/40 decoration-4 underline-offset-8">
                  Thank you
                </span>{' '}
                for your trust in us
              </h2>

              {/* Narrative Paragraph */}
              <p className="text-zinc-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-light">
                Every tattoo, every story, every client means the world to us. Your trust inspires us to keep creating, keep growing and to bring your ideas to life. Thank you for being a part of the Phoenix Tattooz family.
              </p>

              {/* CTA Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
                >
                  <span>Explore Our Work</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </Link>

                <button
                  onClick={() => handleRewardAction('birthday')}
                  className="inline-flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-amber-200 border border-amber-500/30 hover:border-amber-400 px-5 py-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md"
                >
                  <Gift className="w-4 h-4 text-[#FFD60A]" />
                  <span>View 15% Rewards</span>
                </button>
              </div>
            </div>

            {/* Right Artwork Column (Statue of David with Tattoo Sleeve & Golden Medallion) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              
              {/* Hand-Drawn Graffiti Doodle (Top-Right) */}
              <div className="absolute -top-10 sm:-top-12 right-2 sm:right-6 z-20 pointer-events-none select-none text-right">
                {/* Crown Doodle SVG */}
                <div className="inline-block mb-1 text-[#FFD60A]">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD60A]" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 30 L4 12 L16 22 L24 6 L32 22 L44 12 L44 30 Z" />
                    <line x1="4" y1="32" x2="44" y2="32" strokeWidth="3" />
                  </svg>
                </div>
                <div className="font-serif italic font-extrabold text-xs sm:text-sm text-[#FFD60A] uppercase tracking-wider leading-tight drop-shadow-md">
                  TATTOOS<br />
                  BUILD<br />
                  BETTER<br />
                  STORIES
                </div>
                {/* Scratch underline */}
                <svg className="w-24 sm:w-28 h-4 text-[#FFD60A] ml-auto mt-1" viewBox="0 0 100 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 8 Q 50 14 95 6" />
                  <path d="M15 12 Q 55 16 85 10" />
                </svg>
              </div>

              {/* Artwork Composition */}
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-amber-500/30 group">
                {/* Classical Statue with Tattoo Sleeve & Golden Toga */}
                <div className="relative aspect-[3/4] bg-[#0E1014] overflow-hidden">
                  <img
                    src={rewardsSettings.tier1Image}
                    alt={rewardsSettings.tier1ImageAlt || "Classical sculpted artwork with custom tattoo sleeve"}
                    className="w-full h-full object-cover object-top filter contrast-[1.1] brightness-[0.9] group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Dark Golden Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-black/30 pointer-events-none" />

                  {/* Glowing Golden Phoenix Medallion Coin held by sculpted hand */}
                  <div className="absolute top-[38%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-10 animate-pulse">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-[#FFD60A] to-amber-200 p-1 shadow-[0_0_40px_14px_rgba(255,214,10,0.65)] flex items-center justify-center border-2 border-[#FFD60A]">
                      <div className="w-full h-full rounded-full bg-[#111317]/90 border border-amber-400/80 p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[7px] font-bold text-amber-300 uppercase tracking-widest leading-none">
                          ★ PHOENIX TATTOOZ ★
                        </span>
                        <div className="my-0.5 text-base sm:text-lg">🦅</div>
                        <span className="text-[8px] font-extrabold text-[#FFD60A] uppercase tracking-wider leading-none">
                          STUDIO
                        </span>
                        <span className="text-[6px] text-zinc-400 tracking-tighter mt-0.5">
                          SINCE 2019
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Golden Silk Ribbon Accent at bottom */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                        Client Loyalty Crest
                      </span>
                      <span className="text-xs font-serif font-bold text-white">
                        Crafted for our community
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#FFD60A] bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/30">
                      ★ 5.0 Rated
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TIER 2: "This is your Birthday Gift Card" (Canary Yellow) */}
      {/* ======================================================== */}
      <div className="relative bg-[#FFD60A] text-black py-16 sm:py-24 overflow-hidden border-b-4 border-black">
        
        {/* Subtle decorative background watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Distressed Grungy Frame with Tattooed Guy Holding Gift Card */}
            <div className="lg:col-span-6 relative">
              
              {/* Hand-drawn doodle: GOOD INK BETTER VIBES (Left of photo) */}
              <div className="absolute -top-8 -left-3 sm:-left-6 z-20 pointer-events-none select-none text-left">
                {/* Crown doodle */}
                <div className="text-black mb-0.5">
                  <svg className="w-7 h-7 text-black" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 30 L4 12 L16 22 L24 6 L32 22 L44 12 L44 30 Z" />
                    <line x1="4" y1="32" x2="44" y2="32" strokeWidth="3.5" />
                  </svg>
                </div>
                <div className="font-serif italic font-extrabold text-xs sm:text-sm text-black uppercase tracking-wider leading-tight drop-shadow-sm">
                  GOOD<br />
                  INK<br />
                  BETTER<br />
                  VIBES
                </div>
              </div>

              {/* Distressed Grungy Frame Container */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Black jagged background offset */}
                <div className="absolute inset-0 bg-black rounded-3xl transform -rotate-1 translate-x-2 translate-y-2 shadow-2xl" />

                {/* Inner Photo Frame */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-black bg-black aspect-[4/3] sm:aspect-[1.1/1] shadow-2xl">
                  {/* Image of tattooed man with sunglasses */}
                  <img
                    src={rewardsSettings.tier2Image}
                    alt={rewardsSettings.tier2ImageAlt || "Tattooed client holding Phoenix Birthday Gift Card"}
                    className="w-full h-full object-cover object-center filter contrast-[1.15]"
                  />

                  {/* Overlaid Gold & Black Birthday Gift Card held in hand */}
                  <div className="absolute top-[42%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 bg-gradient-to-br from-[#1A1C20] via-black to-[#131518] border-2 border-[#FFD60A] rounded-xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,214,10,0.5)] transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center justify-between border-b border-amber-500/40 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#FFD60A] text-black text-[9px] font-black flex items-center justify-center">
                          P
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-amber-200">
                          Phoenix Tattooz
                        </span>
                      </div>
                      <span className="text-[8px] font-extrabold text-black bg-[#FFD60A] px-1.5 py-0.5 rounded">
                        {rewardsSettings.discountPercentage || 15}% OFF
                      </span>
                    </div>

                    <div className="text-center py-1">
                      <div className="text-[11px] sm:text-xs font-serif font-black uppercase tracking-wider text-[#FFD60A]">
                        BIRTHDAY GIFT CARD
                      </div>
                      <div className="text-[8px] text-zinc-300 font-mono mt-0.5 tracking-widest flex items-center justify-center gap-1">
                        {isAuthenticated ? (
                          <span>CODE: {user?.claims?.birthday?.code || rewardsSettings.couponCode}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 font-bold">
                            <Lock className="w-2.5 h-2.5" />
                            <span>CODE: SIGN IN TO UNLOCK</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grungy torn edge vignette */}
                  <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.7)_100%] pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Right: Birthday Gift Card Content */}
            <div className="lg:col-span-6 space-y-6 relative">
              
              {/* Hand-drawn doodle: ANOTHER YEAR BOLDER (Top-Right) */}
              <div className="absolute -top-10 sm:-top-14 right-2 sm:right-6 pointer-events-none select-none text-right">
                <div className="text-black mb-0.5">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-black ml-auto" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 30 L4 12 L16 22 L24 6 L32 22 L44 12 L44 30 Z" />
                    <line x1="4" y1="32" x2="44" y2="32" strokeWidth="3.5" />
                  </svg>
                </div>
                <div className="font-serif italic font-extrabold text-xs sm:text-sm text-black uppercase tracking-wider leading-tight">
                  ANOTHER<br />
                  YEAR<br />
                  BOLDER
                </div>
                {/* Scratch underline */}
                <svg className="w-20 sm:w-24 h-4 text-black ml-auto mt-0.5" viewBox="0 0 100 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 8 Q 50 14 95 6" />
                  <path d="M15 12 Q 55 16 85 10" />
                </svg>
              </div>

              {/* Kicker */}
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-black/85 block">
                BIRTHDAY SPECIAL
              </span>

              {/* Headline */}
              <h3 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.06]">
                This is your Birthday Gift Card
              </h3>

              {/* Fine horizontal separator */}
              <div className="w-16 h-1 bg-black rounded-full" />

              {/* Subtext */}
              <p className="text-black/90 font-medium text-base sm:text-lg leading-relaxed max-w-lg">
                Celebrate your special day with love, ink and good vibes. Claim your {rewardsSettings.discountPercentage || 15}% discount voucher to use anytime during your birthday month!
              </p>

              {/* 3 Feature Columns with vertical dividing rules */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 border-y border-black/20 text-center">
                {/* Item 1 */}
                <div className="flex flex-col items-center justify-center p-2">
                  <Gift className="w-6 h-6 text-black mb-1.5 stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-extrabold text-black leading-tight">
                    Exclusive Birthday Offer
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col items-center justify-center p-2 border-x border-black/20">
                  <Star className="w-6 h-6 text-black mb-1.5 stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-extrabold text-black leading-tight">
                    Special {rewardsSettings.discountPercentage || 15}% Discounts
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col items-center justify-center p-2">
                  <Heart className="w-6 h-6 text-black mb-1.5 stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-extrabold text-black leading-tight">
                    Because You Matter
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleRewardAction('birthday')}
                  className="group inline-flex items-center gap-3 bg-[#0B0B0B] hover:bg-zinc-900 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-xl shadow-2xl transition-all cursor-pointer"
                >
                  <span>Claim Your Gift</span>
                  <ArrowRight className="w-4 h-4 text-[#FFD60A] group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TIER 3: "Share the Ink, Spread the Love" (Warm Studio)   */}
      {/* ======================================================== */}
      <div className="relative bg-[#0A0C0F] text-white py-16 sm:py-24 lg:py-28 overflow-hidden">
        
        {/* Ambient Warm Studio Lighting & Bokeh Effect */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Referral Content */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Kicker */}
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#FFD60A] block">
                REFER & EARN
              </span>

              {/* Headline */}
              <h3 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Share the Ink,<br />
                <span className="text-[#FFD60A] font-serif font-black underline decoration-amber-500/40 decoration-4 underline-offset-8">
                  Spread the Love
                </span>
              </h3>

              {/* Paragraph */}
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-lg font-light">
                Refer your friends and get rewarded. Because great tattoos are even better when shared with the people you care about.
              </p>

              {/* 3 Step Circular Workflow */}
              <div className="flex items-center justify-between max-w-md pt-2 pb-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                  <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-zinc-900/90 flex items-center justify-center text-[#FFD60A] shadow-md">
                    <Users className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    1. Refer
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Share with friends
                  </span>
                </div>

                <div className="w-8 sm:w-12 h-px bg-zinc-700/80 mb-6" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                  <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-zinc-900/90 flex items-center justify-center text-[#FFD60A] shadow-md">
                    <Gift className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    2. They Book
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Get inked
                  </span>
                </div>

                <div className="w-8 sm:w-12 h-px bg-zinc-700/80 mb-6" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                  <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-zinc-900/90 flex items-center justify-center text-[#FFD60A] shadow-md">
                    <Star className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    3. You Earn
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Get rewards
                  </span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="pt-2">
                <button
                  onClick={() => handleRewardAction('referral')}
                  className="group inline-flex items-center gap-3 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-sm sm:text-base px-8 py-4 rounded-lg shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
                >
                  <span>Start Referring</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
                </button>
              </div>

            </div>

            {/* Right: Studio Lounge Image with Graffiti Doodle */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              
              {/* Hand-drawn doodle: GOOD PEOPLE GET GOOD TATTOOS (Bottom Left of photo) */}
              <div className="absolute -bottom-6 -left-3 sm:-left-6 z-20 pointer-events-none select-none text-left">
                <div className="font-serif italic font-extrabold text-xs sm:text-sm text-[#FFD60A] uppercase tracking-wider leading-tight drop-shadow-md">
                  GOOD<br />
                  PEOPLE<br />
                  GET GOOD<br />
                  TATTOOS
                </div>
                {/* Scratch underline */}
                <svg className="w-24 sm:w-28 h-4 text-[#FFD60A] mt-1" viewBox="0 0 100 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 8 Q 50 14 95 6" />
                  <path d="M15 12 Q 55 16 85 10" />
                </svg>
              </div>

              {/* Studio Lounge Photo */}
              <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-amber-500/30">
                <div className="relative aspect-[4/3] sm:aspect-[1.15/1] bg-zinc-900">
                  <img
                    src={rewardsSettings.tier3Image}
                    alt={rewardsSettings.tier3ImageAlt || "Happy clients in Phoenix Tattooz studio lounge"}
                    className="w-full h-full object-cover filter contrast-[1.1] brightness-[0.92]"
                  />

                  {/* Dark warm overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Neon Phoenix Crest Badge in background */}
                  <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md border border-amber-500/50 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD60A] animate-ping" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD60A]">
                      Phoenix Lounge • Hisar
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-zinc-700 px-3 py-1.5 rounded-lg text-right">
                    <span className="text-[11px] font-bold text-white block">
                      {rewardsSettings.discountPercentage || 15}% Bonus For Both
                    </span>
                    <span className="text-[9px] text-zinc-400">
                      {isAuthenticated ? `Code: ${user?.claims?.referral?.code || rewardsSettings.couponCode}` : 'Code: 🔒 Sign In to Reveal'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

    </section>
  );
};
