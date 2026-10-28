import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  PenTool, 
  GraduationCap, 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  Eye,
  MessageCircle,
  Plus,
  Star,
  X
} from 'lucide-react';
import { PhoenixLogo } from '../components/PhoenixLogo';
import { RoseOrnament, DragonOrnament, TattooMachineOrnament } from '../components/Ornaments';
import { STUDIO_INFO, STUDIO_PHOTOS } from '../data/studioData';
import { useArtists, useGallery, useHomeHero, useAboutContent } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';
import { ReviewsSection } from '../components/ReviewsSection';
import { saveContactToSupabase } from '../lib/supabase';
import { GiftsAndRewardsSection } from '../components/GiftsAndRewardsSection';
import { GiftRewardModal } from '../components/GiftRewardModal';
import { StudioLegacyStrip } from '../components/StudioLegacyStrip';
import { triggerAuthModal } from '../lib/memberAuth';

interface HomeProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenBooking }) => {
  const navigate = useNavigate();
  const artists = useArtists();
  const galleryItems = useGallery();
  const heroSettings = useHomeHero();
  const aboutSettings = useAboutContent();
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 7-second fading pop-up state for Section 1 (Hero section)
  const [sloganPopupActive, setSloganPopupActive] = useState(false);
  const [popupRemainingMs, setPopupRemainingMs] = useState(7000);

  const triggerSloganPopup = () => {
    setPopupRemainingMs(7000);
    setSloganPopupActive(true);
  };

  useEffect(() => {
    if (!sloganPopupActive) return;

    const interval = 50;
    const timer = setInterval(() => {
      setPopupRemainingMs((prev) => {
        const next = prev - interval;
        if (next <= 0) {
          clearInterval(timer);
          setSloganPopupActive(false);
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [sloganPopupActive]);

  const popupOpacity = Math.max(0, popupRemainingMs / 7000);

  const PRIMARY_VIDEO_URL = '/uploads/studio_bg_video.mp4';
  const LOCAL_VIDEO_URL = '/uploads/studio_bg_video.mp4';

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(() => {
    if (heroSettings.bgVideoUrl && !heroSettings.bgVideoUrl.includes('1793020241737')) {
      return heroSettings.bgVideoUrl;
    }
    return PRIMARY_VIDEO_URL;
  });

  useEffect(() => {
    if (heroSettings.bgVideoUrl) {
      if (heroSettings.bgVideoUrl.includes('1793020241737')) {
        setActiveVideoSrc(PRIMARY_VIDEO_URL);
      } else {
        setActiveVideoSrc(heroSettings.bgVideoUrl);
      }
    }
  }, [heroSettings.bgVideoUrl]);

  // Guarantee loop playback and video playing across all browsers and devices
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc || heroSettings.bgMediaType === 'image') return;
    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log('Background video play status:', err);
      });
    }

    // Explicit loop fallback on ended event
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeVideoSrc, heroSettings.bgMediaType]);

  // Gifts & Rewards Modal State
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardModalTab, setRewardModalTab] = useState<'birthday' | 'referral'>('birthday');

  const handleOpenRewardModal = (tab: 'birthday' | 'referral' = 'birthday') => {
    setRewardModalTab(tab);
    setRewardModalOpen(true);
  };
  
  // Contact form state
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name';
    if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Please enter a valid phone number';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmittingContact(true);

    // Save to Supabase backend
    await saveContactToSupabase({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      service: 'Home Contact Form',
      message: formData.message.trim(),
    });

    setIsSubmittingContact(false);
    setFormSubmitted(true);
  };

  return (
    <div className="bg-white text-zinc-800 min-h-screen pb-16 md:pb-0">
      {/* 1. HERO SECTION - Redesigned to match reference image */}
      <section 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, select, textarea')) {
            return;
          }
          triggerSloganPopup();
        }}
        className="relative overflow-hidden bg-[#0A0C0E] border-b border-zinc-800/80 min-h-[560px] md:min-h-[720px] lg:min-h-[760px] flex items-center cursor-pointer"
      >
        {/* Layer 0: Full-Cover Looping Background Video (Constrained strictly to this section) */}
        {heroSettings.bgMediaType !== 'image' && activeVideoSrc && (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <video
              ref={videoRef}
              key={activeVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={heroSettings.bgVideoPoster || heroSettings.heroImage}
              onError={() => {
                if (activeVideoSrc !== LOCAL_VIDEO_URL) {
                  console.warn('Switching to the local hero video directly');
                  setActiveVideoSrc(LOCAL_VIDEO_URL);
                }
              }}
              className="absolute inset-0 w-full h-full object-cover scale-[1.01]"
              style={{ filter: 'brightness(1.08) saturate(1.05)' }}
              src={activeVideoSrc}
            >
              <source src={activeVideoSrc} type="video/mp4" />
              <source src="/uploads/studio_bg_video.mp4" type="video/mp4" />
              <source src="/uploads/studio_bg_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Adjustable Opacity Overlay from Admin Panel */}
            {/* Mobile gets a lighter cap so the video stays visible behind the hero card. */}
            <div
              className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 md:hidden"
              style={{ opacity: Math.min(heroSettings.bgOverlayOpacity ?? 0.55, 0.42) }}
            />
            <div
              className="hidden md:block absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
              style={{ opacity: heroSettings.bgOverlayOpacity ?? 0.55 }}
            />
          </div>
        )}

        {/* Layer 1: Dark Stone Textured Atmosphere & Volumetric Golden Smoke */}
        <div className={`absolute inset-0 bg-[#090B0D] pointer-events-none ${heroSettings.bgMediaType !== 'image' && activeVideoSrc ? 'opacity-10 md:opacity-20' : 'opacity-100'}`} />

        {/* Ambient Dark Stone Grain Texture Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Golden Volumetric Ambient Smoke Glows */}
        {/* Smoke Plume 1: Ambient golden glow concentrated at bottom-left */}
        <div className="absolute -bottom-24 -left-16 w-[450px] sm:w-[680px] h-[450px] sm:h-[680px] bg-gradient-to-tr from-amber-600/35 via-yellow-500/22 to-transparent rounded-full blur-[110px] pointer-events-none opacity-85" />
        
        {/* Smoke Plume 2: Volumetric golden glow behind the hero card */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/4 w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] bg-amber-500/18 rounded-full blur-[130px] pointer-events-none" />

        {/* Smoke Plume 3: Warm amber ground mist drifting to the right */}
        <div className="absolute -bottom-16 right-10 sm:right-1/4 w-[350px] sm:w-[550px] h-[280px] sm:h-[380px] bg-gradient-to-t from-yellow-500/15 via-amber-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Outer Vignette Darkening */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(5,7,9,0.85)_100%] pointer-events-none opacity-70 md:opacity-100" />

        {/* Faint oriental rose ornament watermark in top corner */}
        <RoseOrnament className="absolute -right-16 -top-16 w-80 h-80 sm:w-[420px] sm:h-[420px] text-amber-500/[0.04] pointer-events-none" />

        {/* Main Hero Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 lg:py-24 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6 lg:gap-10">
            {/* Floating Social Proof Badges (Google Reviews & Hygiene & Safety) - Below Hero on Mobile, Left Side on Desktop */}
            <div className="flex flex-row lg:flex-col gap-3 sm:gap-4 shrink-0 w-full sm:w-auto justify-center sm:justify-start order-2 lg:order-1">
              {/* Badge 1: Google Reviews */}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent('Phoenix Tattooz Studio & Academy Hisar')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#121417]/85 hover:bg-[#181b1f] backdrop-blur-xl border border-zinc-700/60 hover:border-amber-400/50 rounded-2xl p-3 sm:p-3.5 flex-1 sm:flex-initial sm:w-28 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/60 transition-all hover:scale-105 group"
                title="Google 4.9 Star Verified Client Reviews"
              >
                {/* Google G Emblem */}
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm mb-1.5 group-hover:shadow-[0_0_10px_rgba(255,214,10,0.4)] transition-all">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase leading-tight">
                  Google Reviews
                </span>
                <div className="flex items-center text-[#FFD60A] text-xs tracking-tighter my-0.5">
                  {'★'.repeat(5)}
                </div>
                <span className="text-sm font-highlight font-black text-white tracking-wide">
                  4.9
                </span>
              </a>

              {/* Badge 2: Hygiene & Safety */}
              <div 
                className="bg-[#121417]/85 backdrop-blur-xl border border-zinc-700/60 hover:border-amber-400/50 rounded-2xl p-3 sm:p-3.5 flex-1 sm:flex-initial sm:w-28 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/60 transition-all hover:scale-105 group"
                title="100% Medical-Grade Sterilization and Single-Use Needles"
              >
                {/* Golden Medical Cross in Dark Medallion */}
                <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#FFD60A] mb-1.5 shadow-sm group-hover:bg-amber-500/25 transition-all">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase leading-tight">
                  Hygiene & Safety
                </span>
                <div className="h-4 flex items-center justify-center my-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase font-highlight">
                    Sterilized
                  </span>
                </div>
                <span className="text-sm font-highlight font-black text-[#FFD60A] tracking-wide">
                  100%
                </span>
              </div>
            </div>

            {/* Centerpiece Glassmorphic Hero Card (Top on Mobile, Right on Desktop) */}
            <div className="relative flex-1 max-w-2xl lg:max-w-3xl w-full order-1 lg:order-2">
              {/* Signature Golden Perimeter Halo Glow */}
              <div 
                className="absolute -inset-1.5 sm:-inset-2.5 bg-gradient-to-r from-amber-500/40 via-yellow-400/35 to-amber-600/30 rounded-[28px] sm:rounded-[36px] blur-xl sm:blur-2xl opacity-80 sm:opacity-95 pointer-events-none"
                style={{
                  boxShadow: '0 0 65px 14px rgba(245, 158, 11, 0.35), 0 0 120px 28px rgba(234, 179, 8, 0.16)'
                }}
              />

              {/* The Frosted Glass Card Container */}
              <div className="relative bg-[#101215]/85 backdrop-blur-2xl border border-white/10 border-t-amber-400/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
                {/* Slogan Pill with Click Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerSloganPopup();
                  }}
                  className="inline-flex items-center gap-2 bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 active:scale-95 border border-[#FFD60A]/40 px-3 py-1.5 rounded-full mb-3 cursor-pointer transition-all shadow-sm group"
                  title="Click to view Hisar's Best Tattoos pop-up (7s)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FFD60A]">
                    Hisar's Best Tattoos &bull; Wear Your Story, Leave the Rest Behind.
                  </span>
                  <span className="text-[9px] bg-[#FFD60A] text-black font-extrabold px-1.5 py-0.2 rounded group-hover:scale-105 transition-transform">
                    Tap Creed
                  </span>
                </button>

                {/* Stately Headline */}
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[1.05] drop-shadow-md">
                  INK YOUR STORY
                </h1>

                {/* Subtitle */}
                <h2 className="font-serif text-base sm:text-xl lg:text-2xl font-bold text-amber-200/95 tracking-wide mt-2 sm:mt-4">
                  {heroSettings.studioSubheading || 'Phoenix Tattooz Studio & Academy'}
                </h2>

                {/* Body Narrative */}
                <p className="text-zinc-300 text-xs sm:text-sm lg:text-base leading-relaxed mt-2.5 sm:mt-4 max-w-xl">
                  {heroSettings.heroDescription || 'Custom tattoos. Professional artistry. A space where creativity meets expression. Located in Hisar, Haryana.'}
                </p>

                {/* Action Row: 3 Direct Booking Channels */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 mt-5 sm:mt-8 pt-4 sm:pt-5 border-t border-zinc-800/80">
                  {/* 1. Book Appointment */}
                  <button
                    onClick={() => onOpenBooking()}
                    className="flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-sm sm:text-base px-5 sm:px-6 py-3.5 rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer"
                  >
                    <span>Book Appointment</span>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B0B0B] stroke-[2.5]" />
                  </button>

                  {/* Vertical divider */}
                  <div className="hidden sm:block w-px h-8 bg-zinc-700/60" />

                  {/* 2. Book on WhatsApp */}
                  <a
                    href={`https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}?text=Hi%20Phoenix%20Tattooz%2C%20I%20would%20like%20to%20book%20a%20tattoo%20appointment`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-zinc-900/85 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700/80 hover:border-emerald-500/60 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Book on WhatsApp</span>
                  </a>

                  {/* Vertical divider */}
                  <div className="hidden sm:block w-px h-8 bg-zinc-700/60" />

                  {/* 3. Book on Call */}
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="flex items-center justify-center gap-2 bg-zinc-900/85 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-700/80 hover:border-amber-500/60 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Book on Call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* ============================================================== */}
        {/* 7-SECOND FADING POP-UP (CENTER OF THIS SECTION)                */}
        {/* ============================================================== */}
        {sloganPopupActive && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          >
            {/* Dark glass backdrop with matching decreasing opacity */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-75"
              style={{ opacity: Math.max(0.1, popupOpacity * 0.85) }}
              onClick={() => setSloganPopupActive(false)}
            />

            {/* Center Pop-up Card with Opacity Tied Directly to Countdown */}
            <div 
              style={{ 
                opacity: popupOpacity,
                transform: `scale(${0.96 + 0.04 * popupOpacity})`
              }}
              className="relative z-10 bg-[#0F0F0F]/95 backdrop-blur-2xl border-2 border-[#FFD60A] rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center shadow-[0_0_80px_rgba(255,214,10,0.35)] space-y-5 transition-all duration-75 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSloganPopupActive(false)}
                aria-label="Close pop-up"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#FFD60A] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Glowing Phoenix Logo */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-3 bg-[#FFD60A]/20 rounded-full blur-xl animate-pulse pointer-events-none" />
                <div className="relative p-1 rounded-full border border-[#FFD60A]/40 bg-black/80 shadow-2xl">
                  <PhoenixLogo size={68} />
                </div>
              </div>

              {/* Slogan Headlines */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-0.5 bg-[#FFD60A]" />
                  <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#FFD60A]">
                    Hisar's Best Tattoos
                  </span>
                  <span className="w-4 h-0.5 bg-[#FFD60A]" />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  “Wear Your Story,{' '}
                  <span className="text-[#FFD60A] drop-shadow-[0_2px_12px_rgba(255,214,10,0.4)]">
                    Leave the Rest Behind.
                  </span>”
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  Phoenix Tattooz Studio &amp; Academy &bull; Hisar, Haryana
                </p>
              </div>

              {/* Countdown & Decreasing Opacity Indicator */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2 max-w-xs mx-auto">
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-[#FFD60A] to-yellow-300 rounded-full transition-all duration-75 ease-linear shadow-[0_0_10px_#FFD60A]"
                    style={{ width: `${(popupRemainingMs / 7000) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-0.5">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-ping" />
                    <span>Closing in {Math.ceil(popupRemainingMs / 1000)}s</span>
                  </span>
                  <span className="text-[#FFD60A] font-bold">
                    {Math.round(popupOpacity * 100)}% Opacity
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 1.5. STUDIO BRAND LEGACY & TRUST STRIP (Estd 2019, 5000+ Tattoos, 4.9 Rating, 9 Recent Works) */}
      <StudioLegacyStrip onOpenBooking={onOpenBooking} />

      {/* 2. GIFTS & REWARDS SECTION (Replicating Reference Design) */}
      <GiftsAndRewardsSection 
        onOpenClaimModal={handleOpenRewardModal} 
        onRequestAuth={(mode, title, subtitle, afterTab) => {
          triggerAuthModal({
            mode,
            title,
            subtitle,
            afterTab: afterTab || 'birthday',
          });
        }}
      />

      {/* 3. ABOUT US SECTION */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        {/* Faint oriental dragon ornament */}
        <DragonOrnament className="absolute -right-16 top-1/2 -translate-y-1/2 w-96 h-96 text-zinc-200/50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Photo with Yellow Offset Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Yellow offset background plate */}
                <div className="absolute inset-0 bg-[#FFD60A] rounded-2xl transform translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4" />
                
                {/* Modern studio reception photo */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-zinc-900 bg-zinc-900 aspect-[4/3] sm:aspect-[1.1/1]">
                  <img
                    src={aboutSettings.homeAboutImage}
                    alt={aboutSettings.homeAboutHeading}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700">
                    <span className="text-[11px] font-bold text-[#FFD60A] tracking-wider uppercase">
                      {aboutSettings.homeAboutImageBadge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    ABOUT US
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                  {aboutSettings.homeAboutHeading}
                </h2>
              </div>

              <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
                <p>
                  {aboutSettings.homeAboutParagraph1}
                </p>
                <p>
                  {aboutSettings.homeAboutParagraph2}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-zinc-900 font-bold text-sm border-b-2 border-[#FFD60A] pb-1 hover:text-black transition-colors"
                >
                  <span>Learn More About Our Journey</span>
                  <ArrowRight className="w-4 h-4 text-[#FFD60A]" />
                </Link>
                <span className="font-script text-2xl text-zinc-800">
                  {aboutSettings.homeAboutTagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MORE THAN JUST TATTOOS (4 Icon Columns) */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                OUR EXPERIENCE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              More Than Just Tattoos
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              A trusted studio and academy, built on creativity, skill and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/40 flex items-center justify-center text-zinc-900 mb-5">
                <PenTool className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">
                Professional Tattoo Artistry
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Skilled artists creating meaningful, high-quality tattoos.
              </p>
            </div>

            {/* Column 2 */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/40 flex items-center justify-center text-zinc-900 mb-5">
                <ShieldCheck className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">
                Hygiene-Focused Studio
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Clean, safe and professional environment for every client.
              </p>
            </div>

            {/* Column 3 */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/40 flex items-center justify-center text-zinc-900 mb-5">
                <Sparkles className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">
                Custom Designs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Your ideas, our creativity — unique designs made just for you.
              </p>
            </div>

            {/* Column 4 */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#FFD60A]/15 border border-[#FFD60A]/40 flex items-center justify-center text-zinc-900 mb-5">
                <GraduationCap className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">
                Academy Training
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Learn from experienced artists with structured guidance and hands-on practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET OUR ARTISTS (2 Large Centered Profiles Divided Equally) */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-1 bg-[#FFD60A] rounded-full" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
                RESIDENT ARTISTS
              </span>
              <span className="w-8 h-1 bg-[#FFD60A] rounded-full" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              Meet Our Artists
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mt-2 max-w-xl mx-auto">
              Passionate master artists with dedicated styles, decades of combined experience, and an obsession with detail.
            </p>
          </div>

          {/* 2 Equal Sized, Prominent Center-Divided Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch justify-center max-w-5xl mx-auto">
            {artists.slice(0, 2).map((artist) => (
              <div
                key={artist.id}
                className="group bg-white rounded-3xl border-2 border-zinc-200 hover:border-black overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Large Profile Image Showcase */}
                <div className="relative aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:h-[460px] w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="bg-black/75 backdrop-blur-md text-[#FFD60A] text-xs font-extrabold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                      <span>{artist.experienceYears}+ Years Exp</span>
                    </span>

                    <span className="bg-black/75 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{artist.rating}</span>
                      <span className="text-zinc-400 font-normal">({artist.reviewCount})</span>
                    </span>
                  </div>

                  {/* Bottom Text Identity */}
                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFD60A] block drop-shadow-sm">
                      {artist.role}
                    </span>
                    <h3 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight drop-shadow-md">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium line-clamp-1">
                      {artist.subtitle}
                    </p>
                  </div>
                </div>

                {/* Rich Card Content (Equal 50/50 Area) */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 bg-zinc-50/70">
                  {/* Bio Narrative */}
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3">
                    {artist.bio}
                  </p>

                  {/* Specialties Chips */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Core Specialties
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold px-3 py-1 rounded-full shadow-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Stats Metric Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-white rounded-2xl border border-zinc-200 text-center">
                    <div>
                      <span className="block font-serif font-black text-sm sm:text-base text-zinc-900">
                        {artist.tattoosCompleted}+
                      </span>
                      <span className="block text-[10px] text-zinc-500 uppercase font-medium">
                        Tattoos Inked
                      </span>
                    </div>
                    <div className="border-x border-zinc-100">
                      <span className="block font-serif font-black text-sm sm:text-base text-zinc-900">
                        {artist.clientsCount}+
                      </span>
                      <span className="block text-[10px] text-zinc-500 uppercase font-medium">
                        Clients
                      </span>
                    </div>
                    <div>
                      <span className="block font-serif font-black text-sm sm:text-base text-zinc-900">
                        {artist.portfolio?.length || 6}+
                      </span>
                      <span className="block text-[10px] text-zinc-500 uppercase font-medium">
                        Artworks
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      to={artist.id === 'rohit-sharma' ? '/artists/rohit-sharma' : '/artists'}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                    >
                      <span>View Bio &amp; Works</span>
                      <ArrowRight className="w-4 h-4 text-zinc-700" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(artist.id)}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
                    >
                      <Calendar className="w-4 h-4 text-black" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACADEMY BANNER: "Learn. Practice. Grow." */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden border-t border-zinc-200">
        <RoseOrnament className="absolute left-6 bottom-4 w-72 h-72 text-zinc-300/30" />
        <TattooMachineOrnament className="absolute right-6 top-8 w-64 h-64 text-zinc-300/30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photo of Student / Artist Sketching */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-100 bg-black aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80"
                  alt="Student sketching tattoo stencil in academy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-800 text-white">
                  <span className="text-xs font-bold text-[#FFD60A] block">
                    Phoenix Academy
                  </span>
                  <span className="text-[11px] text-zinc-300">
                    Hands-on Apprenticeship &bull; Hisar
                  </span>
                </div>
              </div>
            </div>

            {/* Right Academy Details */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    ACADEMY
                  </span>
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
                  Learn. Practice. Grow.
                </h2>
              </div>

              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                Our academy is designed for aspiring tattoo artists who want to build real skills, with hands-on training and expert guidance in a professional studio environment.
              </p>

              <div className="space-y-3 pt-2 text-sm text-zinc-700 font-medium">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FFD60A] shrink-0" />
                  <span>Sanitation, Autoclave &amp; Bloodborne Pathogen Mastery</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FFD60A] shrink-0" />
                  <span>Machine tuning, needle mechanics, and voltage calibration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#FFD60A] shrink-0" />
                  <span>Real synthetic skin and supervised live model sessions</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onOpenBooking(undefined, 'tattoo-training')}
                  className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <span>Join Our Academy</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5. CLIENT REVIEWS & STUDIO VIEWS SECTION */}
      <ReviewsSection onOpenBooking={onOpenBooking} />

      {/* 7. GET IN TOUCH / CONTACT SECTION */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                GET IN TOUCH
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              Contact Us
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Col 1: Studio Details */}
            <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFD60A]/20 flex items-center justify-center text-zinc-900 shrink-0">
                  <MapPin className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">Address</h4>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    {STUDIO_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFD60A]/20 flex items-center justify-center text-zinc-900 shrink-0">
                  <Phone className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">Phone</h4>
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="text-xs text-zinc-800 hover:text-black font-semibold mt-1 block tracking-wider"
                  >
                    {STUDIO_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#FFD60A]/20 flex items-center justify-center text-zinc-900 shrink-0">
                  <Clock className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">Opening Hours</h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    10 am–9 pm, every day
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-script text-xl text-zinc-800">
                  “Same Skin Different Story”
                </div>
              </div>
            </div>

            {/* Col 2: Stylized Map Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
              <div className="p-3 bg-zinc-100 border-b border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>Hisar Red Square Market</span>
                <span className="text-[#FFD60A] font-extrabold text-[11px] bg-zinc-900 px-2 py-0.5 rounded">CUE-1</span>
              </div>
              {/* Map embed / simulated interactive map */}
              <div className="relative flex-1 bg-zinc-100 overflow-hidden min-h-[260px] flex items-center justify-center">
                <iframe
                  title="Phoenix Tattooz Hisar Location Map"
                  src="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[260px] border-0"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Col 3: Contact Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              {formSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-zinc-900">
                    Message Received!
                  </h4>
                  <p className="text-xs text-zinc-600">
                    Thank you {formData.name}. Our studio team in Hisar will connect with you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', phone: '', message: '' });
                    }}
                    className="text-xs text-[#0B0B0B] underline font-bold"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full bg-zinc-50 border rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A] ${
                        formErrors.name ? 'border-rose-400' : 'border-zinc-300'
                      }`}
                      required
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Your Contact Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full bg-zinc-50 border rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A] ${
                        formErrors.phone ? 'border-rose-400' : 'border-zinc-300'
                      }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="How can we help you? (Tattoo style, cover-up, academy query)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-[#0B0B0B] font-bold text-sm py-3 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0B0B]" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        item={selectedLightboxItem}
        isOpen={Boolean(selectedLightboxItem)}
        onClose={() => setSelectedLightboxItem(null)}
        onBookAppointment={() => {
          setSelectedLightboxItem(null);
          onOpenBooking();
        }}
      />

      {/* Gifts & Rewards 15% Discount Modal */}
      <GiftRewardModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        initialTab={rewardModalTab}
        onOpenBooking={() => onOpenBooking()}
        onRequestAuth={(mode, title, subtitle) => {
          setRewardModalOpen(false);
          triggerAuthModal({
            mode,
            title,
            subtitle,
            afterTab: rewardModalTab,
          });
        }}
      />
    </div>
  );
};
