import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Image as GalleryIcon, Phone, Calendar } from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';

interface MobileBottomBarProps {
  onOpenBooking: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenBooking }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Do not show on admin panel
  if (isAdmin) return null;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-lg border-t border-zinc-800/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive
                ? 'text-[#FFD60A] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* Artists */}
        <NavLink
          to="/artists"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive
                ? 'text-[#FFD60A] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Artists</span>
        </NavLink>

        {/* Quick Book Appointment CTA */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          aria-label="Book studio appointment"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFD60A] text-black shadow-lg shadow-yellow-500/25 flex items-center justify-center transform group-active:scale-95 transition-transform border-2 border-[#0B0B0B]">
            <Calendar className="w-6 h-6 text-black" />
          </div>
          <span className="text-[10px] font-bold text-[#FFD60A] mt-0.5">Book</span>
        </button>

        {/* Gallery */}
        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive
                ? 'text-[#FFD60A] font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`
          }
        >
          <GalleryIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Gallery</span>
        </NavLink>

        {/* Call Studio Direct */}
        <a
          href={`tel:${STUDIO_INFO.phone}`}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          aria-label={`Call studio at ${STUDIO_INFO.phone}`}
        >
          <Phone className="w-5 h-5 mb-0.5 text-zinc-300" />
          <span className="text-[10px] tracking-tight">Call</span>
        </a>
      </div>
    </nav>
  );
};
