import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Star, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Search,
  Maximize2,
  Eye,
  Flame
} from 'lucide-react';
import { STUDIO_INFO, GALLERY_ITEMS } from '../data/studioData';
import { useGallery } from '../lib/studioContent';
import { LightboxModal } from './LightboxModal';

interface StudioLegacyStripProps {
  onOpenBooking?: (artistId?: string, serviceId?: string) => void;
}

export const StudioLegacyStrip: React.FC<StudioLegacyStripProps> = ({ onOpenBooking }) => {
  const dynamicGallery = useGallery();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Ensure we always have exactly 9 diverse curated pieces
  const recentWorks = dynamicGallery && dynamicGallery.length >= 9
    ? dynamicGallery.slice(0, 9)
    : [
        ...dynamicGallery,
        ...GALLERY_ITEMS.filter(g => !dynamicGallery.some(d => d.id === g.id))
      ].slice(0, 9);

  return (
    <section className="relative bg-[#080A0C] text-white py-14 sm:py-20 overflow-hidden border-b border-zinc-800/80">
      {/* Background Texture & Ambient Golden Lighting */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Atmospheric Golden Plumes */}
      <div className="absolute -top-24 left-1/4 w-[460px] h-[340px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/6 w-[400px] h-[300px] bg-yellow-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-[380px] h-[280px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-20">
        
        {/* ======================================================== */}
        {/* PART 1: TOP HEADER ROW & 4 PILLARS OF TRUST              */}
        {/* ======================================================== */}
        <div>
          {/* Header Row: Kicker & Signature Motto */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-zinc-800/80 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-[#FFD60A] text-xs font-extrabold tracking-[0.22em] uppercase">
                  Studio Heritage &amp; Trust
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Crafted With Precision.{' '}
                <span className="text-[#FFD60A] underline decoration-amber-500/40 underline-offset-4">
                  Since 2019.
                </span>
              </h3>
            </div>

            {/* Signature Philosophy Lockup */}
            <div className="flex items-center gap-4 bg-zinc-900/70 border border-zinc-800 px-5 py-3 rounded-2xl backdrop-blur-md">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Studio Philosophy
                </span>
                <span className="font-script text-xl sm:text-2xl text-[#FFD60A] block leading-tight">
                  “Same Skin, Different Story”
                </span>
              </div>
              <Link
                to="/about"
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-[#FFD60A] hover:text-black text-white transition-all group shrink-0"
                title="Learn our backstory"
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 4 Pillars of Verified Trust Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8 sm:pt-10">
            {/* Pillar 1: Years Established */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0F12]/80 border border-zinc-800/90 hover:border-amber-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                  Estd. 2019
                </span>
              </div>
              <div className="font-highlight text-3xl sm:text-4xl font-black text-white tracking-tight">
                8+ <span className="text-sm font-sans font-medium text-amber-200/90">Years</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
                Of continuous tattoo mastery, mentoring &amp; creative growth in Hisar.
              </p>
            </div>

            {/* Pillar 2: Custom Tattoos Completed */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0F12]/80 border border-zinc-800/90 hover:border-amber-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ORIGINAL ART
                </span>
              </div>
              <div className="font-highlight text-3xl sm:text-4xl font-black text-white tracking-tight">
                5,000+
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
                Custom tattoos inked, from micro-fineline to full backpieces &amp; sleeves.
              </p>
            </div>

            {/* Pillar 3: Google Rating */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0F12]/80 border border-zinc-800/90 hover:border-amber-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="flex text-[#FFD60A] text-xs">
                  {'★'.repeat(5)}
                </div>
              </div>
              <div className="font-highlight text-3xl sm:text-4xl font-black text-white tracking-tight">
                4.9★
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
                Over 1,200+ verified client testimonials across Google &amp; Social.
              </p>
            </div>

            {/* Pillar 4: Medical Grade Sterilization */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0F12]/80 border border-zinc-800/90 hover:border-amber-400/40 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  100% Sterile
                </span>
              </div>
              <div className="font-highlight text-3xl sm:text-4xl font-black text-white tracking-tight">
                100%
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
                Medical autoclave sterilization, single-use cartridges &amp; sealed grips.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PART 2: 9-TATTOO RECENT WORKS 3x3 RESPONSIVE GALLERY     */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-zinc-800/80">
          
          {/* Gallery Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-[#FFD60A]" />
                <span className="text-[#FFD60A] text-xs font-extrabold tracking-[0.22em] uppercase">
                  Recent Masterpieces &amp; Works
                </span>
              </div>
              <h4 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Recent Masterpieces Inked In Hisar
              </h4>
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl font-light">
                Explore authentic client works freshly crafted by Phoenix Tattooz artists across Black &amp; Grey Realism, Sacred Geometry, Fine Line, and Neo-Traditional.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-[#FFD60A] border border-zinc-700/80 hover:border-amber-400/50 bg-zinc-900/80 px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <span>View Full 10+ Gallery</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFD60A]" />
              </Link>
            </div>
          </div>

          {/* Clean 3x3 Responsive Grid with Hover Zoom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {recentWorks.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#0D0F12] border border-zinc-800/80 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-black/80 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* 4:5 Portrait Ratio Image Container with Zoom */}
                <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title} loading="eager"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter contrast-[1.05] brightness-[0.95] group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                  />

                  {/* Dark Vignette & Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

                  {/* Number Tag & Category Kicker at Top */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className="font-mono tabular-nums text-[10px] font-bold text-zinc-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-800">
                      0{index + 1}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFD60A] bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded border border-amber-500/30">
                      {item.category}
                    </span>
                  </div>

                  {/* Hover Floating Zoom Pill */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none z-10">
                    <div className="flex items-center gap-2 bg-[#FFD60A] text-black font-extrabold text-xs px-3.5 py-2 rounded-full shadow-xl shadow-yellow-500/30">
                      <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Zoom &amp; Book</span>
                    </div>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                      <span>{item.category}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-amber-200/90">{item.artist || 'Phoenix Artist'}</span>
                    </div>
                    
                    <h5 className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight leading-snug group-hover:text-[#FFD60A] transition-colors">
                      {item.title}
                    </h5>

                    {item.description && (
                      <p className="text-xs text-zinc-300/80 mt-1.5 line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
                      <span className="inline-flex items-center gap-1 text-[#FFD60A] group-hover:underline">
                        <Eye className="w-3 h-3" />
                        <span>Inspect Details</span>
                      </span>
                      <span className="text-zinc-500">Tap to view</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Strip below 3x3 grid */}
          <div className="mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-[#FFD60A] shrink-0" />
              <span>Looking for Custom Artwork? Bring your references or let our artists draft a unique sketch.</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {onOpenBooking && (
                <button
                  onClick={() => onOpenBooking()}
                  className="bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-[#0B0B0B] font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 stroke-[2.5]" />
                    <span>Book Consultation</span>
                  </span>
                </button>
              )}
              <Link
                to="/gallery"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                Full Gallery &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* PART 3: MICRO BOTTOM HYGIENE & LOCATION FOOTER           */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FFD60A]" />
            <span>Strict hygiene standards compliant with international tattoo guidelines</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">Location:</span>
            <span className="text-zinc-300 font-semibold">{STUDIO_INFO.address.split(',')[0]}</span>
            <span className="text-zinc-600">•</span>
            <Link 
              to="/about"
              className="text-[#FFD60A] hover:underline font-semibold"
            >
              Meet Founder Rohit Sharma &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* Interactive Lightbox Modal for 9 Tattoos */}
      <LightboxModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onBookAppointment={(artistId) => {
          setSelectedItem(null);
          if (onOpenBooking) {
            onOpenBooking(artistId);
          }
        }}
      />
    </section>
  );
};
