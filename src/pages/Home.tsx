import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  Star,
  GraduationCap,
  MessageCircle,
  PenTool,
  Heart,
  Flame
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { useArtists, useHomeHero, useAboutContent } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';
import { ReviewsSection } from '../components/ReviewsSection';
import { GiftsAndRewardsSection } from '../components/GiftsAndRewardsSection';
import { GiftRewardModal } from '../components/GiftRewardModal';
import { StudioLegacyStrip } from '../components/StudioLegacyStrip';
import { triggerAuthModal } from '../lib/memberAuth';

interface HomeProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenBooking }) => {
  const artists = useArtists();
  const heroSettings = useHomeHero();
  const aboutSettings = useAboutContent();
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideoSrc || heroSettings.bgMediaType === 'image') return;
    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, [activeVideoSrc, heroSettings.bgMediaType]);

  // Gifts & Rewards Modal State
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardModalTab, setRewardModalTab] = useState<'birthday' | 'referral'>('birthday');

  const handleOpenRewardModal = (tab: 'birthday' | 'referral' = 'birthday') => {
    setRewardModalTab(tab);
    setRewardModalOpen(true);
  };

  return (
    <div className="bg-[#090A0D] text-zinc-100 min-h-screen">
      {/* 1. HERO SECTION */}
      <section 
        id="hero"
        className="relative overflow-hidden bg-[#090A0D] border-b border-white/[0.08] min-h-[640px] md:min-h-[760px] flex items-center justify-center"
      >
        {/* Layer 0: Full-Cover Looping Background Video */}
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
                  setActiveVideoSrc(LOCAL_VIDEO_URL);
                }
              }}
              className="absolute inset-0 w-full h-full object-cover"
              src={activeVideoSrc}
            >
              <source src={activeVideoSrc} type="video/mp4" />
            </video>
            {/* Dark contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/75 to-[#090A0D]/60 pointer-events-none" />
          </div>
        )}

        {/* Ambient subtle warm glow */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_40%,rgba(229,184,66,0.06),transparent_65%] pointer-events-none z-0" />

        {/* Main Hero Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 w-full text-center">
          {/* Stately Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[1.08] drop-shadow-md max-w-4xl mx-auto">
            INK YOUR STORY
          </h1>

          {/* Subtitle */}
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-amber-200/90 tracking-wide mt-3 sm:mt-4">
            {heroSettings.studioSubheading || 'Wear Your Story, Leave the Rest Behind.'}
          </h2>

          {/* Body Narrative */}
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl mx-auto">
            {heroSettings.heroDescription || 'Premier custom tattoos, certified sterilization, and professional artistry in Hisar, Haryana. Where imagination transforms into timeless body art.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 max-w-md mx-auto">
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>Book Appointment</span>
            </button>

            <a
              href="https://wa.me/919992969919"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#121418]/90 hover:bg-[#1A1D24] border border-white/10 hover:border-amber-400/40 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Actual Google Reviews & 5000+ Trust Metrics */}
          <div className="mt-12 max-w-4xl mx-auto space-y-4">
            {/* Top Verification & 5000+ Metrics Strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent('Phoenix Tattooz Studio & Academy Hisar')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121418] border border-white/10 hover:border-amber-400/40 transition-colors text-zinc-300 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <span className="font-bold text-white">4.9 ★</span>
                <span className="text-zinc-400">Google Rating (500+ Reviews)</span>
              </a>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121418] border border-white/10 text-zinc-300">
                <Flame className="w-4 h-4 text-[#FFD60A]" />
                <span className="font-bold text-white">5000+</span>
                <span className="text-zinc-400">Tattoos Inked</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121418] border border-white/10 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">100% Sterile</span>
                <span className="text-zinc-400">Single-Use Needles</span>
              </div>
            </div>

            {/* Actual Google Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
              {/* Google Review 1 */}
              <div className="p-4 rounded-xl bg-[#121418]/90 border border-white/10 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-[#FFD60A] font-bold text-xs flex items-center justify-center">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">Amit Verma</div>
                        <div className="text-[10px] text-zinc-500">Verified Google Review</div>
                      </div>
                    </div>
                    <div className="flex text-[#FFD60A] text-xs">★★★★★</div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    “Got a custom cover-up tattoo by Rohit Sharma. He completely transformed an old faded design into an absolute masterpiece. 100% sterile setup.”
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2.5 font-mono">2 weeks ago • Hisar</div>
              </div>

              {/* Google Review 2 */}
              <div className="p-4 rounded-xl bg-[#121418]/90 border border-white/10 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        N
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">Neha Saini</div>
                        <div className="text-[10px] text-zinc-500">Verified Google Review</div>
                      </div>
                    </div>
                    <div className="flex text-[#FFD60A] text-xs">★★★★★</div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    “Best tattoo and piercing experience in Hisar! The needle was unsealed right in front of me. Minimal pain and the aftercare guidance was top notch.”
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2.5 font-mono">1 month ago • Hisar</div>
              </div>

              {/* Google Review 3 */}
              <div className="p-4 rounded-xl bg-[#121418]/90 border border-white/10 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                        R
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">Rahul Jangra</div>
                        <div className="text-[10px] text-zinc-500">Verified Google Review</div>
                      </div>
                    </div>
                    <div className="flex text-[#FFD60A] text-xs">★★★★★</div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    “Completed the Professional Tattoo Academy training under Rohit bhaiya. Hands-on machine practice, skin ethics, and client mentoring. Best academy!”
                  </p>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2.5 font-mono">2 months ago • Haryana</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDIO BRAND LEGACY & RECENT WORKS */}
      <div id="experience">
        <StudioLegacyStrip onOpenBooking={onOpenBooking} />
      </div>

      {/* 3. GIFTS & REWARDS SECTION */}
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

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-20 sm:py-24 bg-[#0D0E12] border-y border-white/[0.06] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Photo Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 aspect-[4/3] sm:aspect-[1.1/1]">
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
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ABOUT PHOENIX TATTOOZ
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {aboutSettings.homeAboutHeading}
                </h2>
              </div>

              <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
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
                  className="inline-flex items-center gap-2 text-white font-semibold text-sm border-b border-[#FFD60A] pb-1 hover:text-[#FFD60A] transition-colors"
                >
                  <span>Explore Our Philosophy &amp; Story</span>
                  <ArrowRight className="w-4 h-4 text-[#FFD60A]" />
                </Link>
                <span className="font-script text-2xl text-amber-200/80">
                  {aboutSettings.homeAboutTagline}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Pillars of Studio Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/[0.06]">
            <div className="bg-[#13151A] p-6 rounded-2xl border border-white/[0.08] transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Certified Hygiene</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                100% disposable single-use needles, hospital-grade autoclave sterilization, and sealed equipment.
              </p>
            </div>

            <div className="bg-[#13151A] p-6 rounded-2xl border border-white/[0.08] transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] mb-4">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Custom Artistry</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tailored original artwork designed specifically for your anatomy and personal narrative.
              </p>
            </div>

            <div className="bg-[#13151A] p-6 rounded-2xl border border-white/[0.08] transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Aftercare Guidance</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Detailed healing protocols, premium aftercare supplies, and complete post-session support.
              </p>
            </div>

            <div className="bg-[#13151A] p-6 rounded-2xl border border-white/[0.08] transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">Academy Training</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hands-on mentorship for aspiring tattoo artists under experienced master tattooists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RESIDENT ARTISTS SECTION */}
      <section id="artists" className="py-20 sm:py-24 bg-[#090A0D] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                MASTER ARTISTS
              </span>
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Meet Our Artists
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
              Dedicated master artists with unique styles, decades of combined experience, and an obsession with detail.
            </p>
          </div>

          {/* Artist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {artists.slice(0, 2).map((artist) => (
              <div
                key={artist.id}
                className="bg-[#121418] rounded-3xl border border-white/[0.08] hover:border-amber-400/30 overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Profile Image */}
                <div className="relative aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:h-[420px] w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="bg-black/75 backdrop-blur-md text-[#FFD60A] text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                      <span>{artist.experienceYears}+ Yrs Exp</span>
                    </span>

                    <span className="bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{artist.rating}</span>
                      <span className="text-zinc-400 font-normal">({artist.reviewCount})</span>
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFD60A] block">
                      {artist.role}
                    </span>
                    <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
                      {artist.name}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                    {artist.bio}
                  </p>

                  {/* Specialties */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Core Specialties
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {artist.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 text-xs font-medium px-2.5 py-1 rounded-lg"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                    <div>
                      <span className="block font-bold text-sm text-white">
                        {artist.tattoosCompleted}+
                      </span>
                      <span className="block text-[10px] text-zinc-400 uppercase">
                        Tattoos Inked
                      </span>
                    </div>
                    <div className="border-x border-zinc-800">
                      <span className="block font-bold text-sm text-white">
                        {artist.clientsCount}+
                      </span>
                      <span className="block text-[10px] text-zinc-400 uppercase">
                        Clients
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-sm text-white">
                        {artist.portfolio?.length || 6}+
                      </span>
                      <span className="block text-[10px] text-zinc-400 uppercase">
                        Artworks
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      to={artist.id === 'rohit-sharma' ? '/artists/rohit-sharma' : '/artists'}
                      className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs text-center transition-colors"
                    >
                      View Portfolio
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(artist.id)}
                      className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs text-center transition-colors cursor-pointer"
                    >
                      Book with {artist.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ACADEMY HIGHLIGHT */}
      <section className="py-20 bg-[#0D0E12] border-y border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80"
                  alt="Student sketching tattoo stencil in academy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-[#FFD60A] block">
                    Phoenix Academy
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Hands-on Apprenticeship &bull; Hisar
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  ACADEMY APPRENTICESHIP
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                  Learn. Practice. Master.
                </h2>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Step into the tattoo industry with real fundamentals. From machine tuning and skin ergonomics to sterilization mastery and live model portfolio building.
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#FFD60A] shrink-0" />
                  <span>Sanitation, Autoclave &amp; Bloodborne Pathogen Certification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#FFD60A] shrink-0" />
                  <span>Machine mechanics, needle groupings &amp; voltage calibration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#FFD60A] shrink-0" />
                  <span>Synthetic skin practice followed by supervised live models</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking(undefined, 'tattoo-training')}
                  className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Apply for Academy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLIENT REVIEWS SECTION */}
      <div id="reviews">
        <ReviewsSection onOpenBooking={onOpenBooking} />
      </div>

      {/* 8. STUDIO LOCATION & MAP (No Form, No Box Wrappers) */}
      <section id="contact" className="py-16 sm:py-24 bg-[#090A0D] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Direct Studio Location & Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                    STUDIO LOCATION
                  </span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Visit Phoenix Tattooz
                </h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Located at Red Square Market, Hisar. Welcoming clients for custom tattoos, sterile piercings, laser removal, and professional academy admissions.
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Address</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                    {STUDIO_INFO.address}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Studio Hours</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    {STUDIO_INFO.hours} <span className="text-[#FFD60A] font-semibold">(Open All 7 Days)</span>
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Phone Support</h4>
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="text-xs sm:text-sm text-zinc-300 hover:text-[#FFD60A] transition-colors mt-1 block font-mono"
                  >
                    {STUDIO_INFO.displayPhone || STUDIO_INFO.phone}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/15"
                >
                  <MapPin className="w-4 h-4 text-black" />
                  <span>Get Directions on Google Maps</span>
                </a>

                <a
                  href={`https://wa.me/${STUDIO_INFO.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#14161C] hover:bg-[#1A1D24] border border-white/10 hover:border-emerald-500/40 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Studio</span>
                </a>
              </div>
            </div>

            {/* Seamless Interactive Google Map (No container box) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 aspect-[16/10] sm:aspect-[16/9] min-h-[360px]">
                <iframe
                  title="Phoenix Tattooz Hisar Location Map"
                  src="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full min-h-[360px] border-0"
                  loading="lazy"
                />
              </div>
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
