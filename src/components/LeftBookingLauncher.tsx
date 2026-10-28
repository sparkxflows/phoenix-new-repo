import React, { useState } from 'react';
import { 
  Calendar, 
  Phone, 
  MessageCircle, 
  X, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ChevronUp,
  Flame
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';

interface LeftBookingLauncherProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: 'tattoo' | 'removal' | 'training' | 'piercing') => void;
}

export const LeftBookingLauncher: React.FC<LeftBookingLauncherProps> = ({ onOpenBooking }) => {
  // Minimized state: always starts compact so the launcher never covers page content.
  // A previous explicit user choice is still honoured via sessionStorage.
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const stored = sessionStorage.getItem('phoenix_left_popup_minimized');
      if (stored !== null) return stored === 'true';
      return true;
    } catch {
      return true;
    }
  });

  const handleMinimize = () => {
    setIsMinimized(true);
    try {
      sessionStorage.setItem('phoenix_left_popup_minimized', 'true');
    } catch {
      // ignore
    }
  };

  const handleExpand = () => {
    setIsMinimized(false);
    try {
      sessionStorage.removeItem('phoenix_left_popup_minimized');
    } catch {
      // ignore
    }
  };

  const whatsappUrl = `https://wa.me/919992969919?text=${encodeURIComponent(
    'Hello Phoenix Tattooz! I would like to book a consultation or tattoo appointment.'
  )}`;

  return (
    <>
    {/* Hidden below md: the mobile bottom bar already provides Book and Call CTAs,
        so this floating launcher would otherwise overlap it and duplicate booking controls. */}
    <aside 
      aria-label="Quick Booking and Contact"
      className="hidden md:block fixed bottom-6 left-6 z-40 select-none font-sans max-w-[calc(100vw-1.5rem)]"
    >
      {isMinimized ? (
        /* MINIMIZED FLOATING TRIGGER BADGE */
        <button
          onClick={handleExpand}
          className="group relative flex items-center gap-2.5 bg-[#0D0F12]/95 hover:bg-black text-white px-3.5 py-2.5 rounded-full border border-amber-500/40 hover:border-amber-400 shadow-xl shadow-black/80 backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Click to open booking & contact options"
        >
          {/* Subtle glowing pulse */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFD60A]" />
          </span>

          <div className="w-7 h-7 rounded-full bg-[#FFD60A] text-black flex items-center justify-center font-bold shadow-sm">
            <Calendar className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="text-left hidden sm:block pr-1">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#FFD60A]">
              Book / Call
            </div>
            <div className="text-[11px] font-semibold text-zinc-300 leading-tight">
              Phoenix Tattooz
            </div>
          </div>

          <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      ) : (
        /* EXPANDED COMPACT POP-UP CARD */
        <div className="w-[280px] sm:w-[320px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-zinc-200/90 hover:border-amber-500/50 shadow-2xl shadow-zinc-900/15 backdrop-blur-xl p-3.5 sm:p-4 text-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-300 transition-all">
          
          {/* Header Row with Studio Brand and Close/Minimize Button */}
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                <Flame className="w-4 h-4 fill-black text-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold text-zinc-950 tracking-wide uppercase">
                    Phoenix Tattooz
                  </h4>
                  <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Open
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Instant Studio Booking &amp; Direct Desk
                </p>
              </div>
            </div>

            {/* Cancel / Minimize Button */}
            <button
              onClick={handleMinimize}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Minimize pop-up"
              aria-label="Minimize booking pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Value Micro-bar */}
          <div className="flex items-center justify-between text-[10px] py-2 border-b border-zinc-100 mb-3">
            <span className="flex items-center gap-1 text-zinc-700 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>100% Hygiene &amp; Safety</span>
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>10 AM – 9 PM</span>
            </span>
          </div>

          {/* 3 Action Buttons */}
          <div className="space-y-2">
            {/* 1. Primary Online Booking Button */}
            <button
              onClick={() => {
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] active:scale-[0.98] text-black font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-yellow-500/25 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>Book Appointment Online</span>
            </button>

            {/* Quick Category Badges */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-zinc-700">
              <button
                type="button"
                onClick={() => onOpenBooking(undefined, undefined, 'tattoo')}
                className="bg-zinc-100 hover:bg-amber-100 hover:text-black py-1 px-1 rounded-lg text-center transition-colors cursor-pointer truncate"
              >
                Tattoo
              </button>
              <button
                type="button"
                onClick={() => onOpenBooking(undefined, undefined, 'removal')}
                className="bg-zinc-100 hover:bg-amber-100 hover:text-black py-1 px-1 rounded-lg text-center transition-colors cursor-pointer truncate"
              >
                Removal
              </button>
              <button
                type="button"
                onClick={() => onOpenBooking(undefined, undefined, 'training')}
                className="bg-zinc-100 hover:bg-amber-100 hover:text-black py-1 px-1 rounded-lg text-center transition-colors cursor-pointer truncate"
              >
                Training
              </button>
              <button
                type="button"
                onClick={() => onOpenBooking(undefined, undefined, 'piercing')}
                className="bg-zinc-100 hover:bg-amber-100 hover:text-black py-1 px-1 rounded-lg text-center transition-colors cursor-pointer truncate"
              >
                Piercing
              </button>
            </div>

            {/* 2. WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Book on WhatsApp</span>
            </a>

            {/* 3. Direct Phone Call Button */}
            <a
              href={`tel:${STUDIO_INFO.phone}`}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white font-semibold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFD60A]" />
              <span>Book on Call ({STUDIO_INFO.displayPhone})</span>
            </a>
          </div>

          {/* Bottom minimize hint */}
          <div className="pt-2.5 mt-1 text-center">
            <button
              onClick={handleMinimize}
              className="text-[10px] text-zinc-400 hover:text-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Tap X or click here to minimize</span>
            </button>
          </div>
        </div>
      )}
    </aside>
    </>
  );
};
