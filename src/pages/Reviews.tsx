import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  Phone, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { ReviewsSection } from '../components/ReviewsSection';
import { STUDIO_INFO } from '../data/studioData';

interface ReviewsPageProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Reviews: React.FC<ReviewsPageProps> = ({ onOpenBooking }) => {
  return (
    <div className="bg-[#0B0B0B] text-zinc-100 min-h-screen pb-16 md:pb-0">
      {/* 1. Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141414] via-[#0E0E0E] to-[#0B0B0B] border-b border-[#222222] py-16 sm:py-24">
        {/* Subtle gold glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD60A]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-xs font-bold text-[#FFD60A]">
            <Star className="w-3.5 h-3.5 fill-[#FFD60A]" />
            <span>5.0 ★ TOP RATED TATTOO STUDIO IN HISAR</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Reviews &amp; <span className="text-[#FFD60A]">Studio Views</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Discover unfiltered client experiences, read our core thoughts and views on custom tattoo artistry, and share your personal journey with Phoenix Tattooz Studio &amp; Academy.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FFD60A]" />
              1000+ Happy Clients
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Sterile &amp; Safe
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFD60A]" />
              Same Skin Different Story
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Reviews & Philosophy Section */}
      <ReviewsSection onOpenBooking={onOpenBooking} showAllInitially={true} />

      {/* 3. Studio Visit & Booking Callout */}
      <section className="py-16 bg-[#111111] border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Ready to Ink Your Story?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Book a complimentary initial design and placement consultation with master artist Rohit Sharma or our resident specialists at our Red Square Market studio in Hisar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>Book Appointment Now</span>
            </button>
            <a
              href={`tel:${STUDIO_INFO.phone}`}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-sm font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4 text-[#FFD60A]" />
              <span>Call: {STUDIO_INFO.displayPhone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
