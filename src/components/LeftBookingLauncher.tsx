import React, { useState } from 'react';
import { Calendar, Phone, MessageCircle, X } from 'lucide-react';

interface LeftBookingLauncherProps {
  onOpenBooking: (artistId?: string, serviceId?: string, categoryId?: 'tattoo' | 'removal' | 'training' | 'piercing') => void;
}

export const LeftBookingLauncher: React.FC<LeftBookingLauncherProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside 
      aria-label="Quick Booking"
      className="hidden lg:block fixed bottom-6 left-6 z-30 select-none font-sans"
    >
      {isOpen ? (
        <div className="bg-[#121418] border border-zinc-800 rounded-2xl p-3 shadow-2xl shadow-black/80 w-64 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Connect</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            className="w-full flex items-center gap-2.5 bg-[#FFD60A] text-black font-bold text-xs py-2 px-3 rounded-xl transition-transform active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <a
            href="https://wa.me/919992969919"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-xl border border-zinc-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Consultation</span>
          </a>
          <a
            href="tel:+919992969919"
            className="w-full flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs py-2 px-3 rounded-xl border border-zinc-800 transition-colors"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Direct Call Studio</span>
          </a>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#121418]/90 hover:bg-[#181A20] border border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-white px-3.5 py-2 rounded-full text-xs font-medium shadow-lg shadow-black/50 transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#FFD60A]" />
          <span>Quick Book</span>
        </button>
      )}
    </aside>
  );
};
