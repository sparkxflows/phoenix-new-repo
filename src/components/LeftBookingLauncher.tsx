import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Phone, X, Sparkles, Clock } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface LeftBookingLauncherProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: 'tattoo' | 'removal' | 'training' | 'piercing') => void;
}

export const LeftBookingLauncher: React.FC<LeftBookingLauncherProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const userDismissedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Uneven periodic popup interval (e.g. 3.5s -> 5s -> 4s -> 6s)
  useEffect(() => {
    const intervals = [3500, 5200, 4100, 6300, 4800];
    let step = 0;

    const scheduleNext = () => {
      const delay = intervals[step % intervals.length];
      step++;

      timerRef.current = setTimeout(() => {
        if (!userDismissedRef.current && !isHovered) {
          // Open popup
          setIsOpen(true);

          // Auto close after 3 seconds if not hovered
          setTimeout(() => {
            if (!isHovered && !userDismissedRef.current) {
              setIsOpen(false);
              scheduleNext();
            }
          }, 3200);
        } else if (!userDismissedRef.current) {
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered]);

  return (
    <aside 
      aria-label="Quick Booking Pop-up"
      className="hidden md:block fixed bottom-6 left-6 z-30 select-none font-sans"
      onMouseEnter={() => {
        setIsHovered(true);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {isOpen ? (
        <div className="bg-[#121418]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,214,10,0.15)] w-72 space-y-2.5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Studio Connect
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                userDismissedRef.current = true;
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-tight">
            Consult our master tattoo artists or schedule instant priority slot in Hisar.
          </p>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] hover:scale-[1.02] active:scale-95 text-black font-extrabold text-xs py-2.5 px-3.5 rounded-xl transition-all duration-200 shadow-md cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Book Appointment</span>
          </button>

          <a
            href="https://wa.me/919992969919"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400/50 hover:scale-[1.02] active:scale-95 text-emerald-300 text-xs py-2 px-3 rounded-xl transition-all duration-200"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Consultation</span>
          </a>

          <a
            href="tel:+919992969919"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:scale-[1.02] active:scale-95 text-zinc-300 hover:text-white text-xs py-2 px-3 rounded-xl transition-all duration-200"
          >
            <Phone className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>Direct Call Studio</span>
          </a>
        </div>
      ) : (
        <button
          onClick={() => {
            userDismissedRef.current = false;
            setIsOpen(true);
          }}
          className="group flex items-center gap-2.5 bg-[#121418]/90 hover:bg-[#181A20] border border-white/10 hover:border-amber-400/50 text-zinc-300 hover:text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl shadow-black/70 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD60A]"></span>
          </span>
          <Calendar className="w-3.5 h-3.5 text-[#FFD60A] group-hover:rotate-6 transition-transform" />
          <span>Quick Book</span>
        </button>
      )}
    </aside>
  );
};
