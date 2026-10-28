import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Instagram, Facebook, Youtube, Lock } from 'lucide-react';
import { PhoenixLogo } from './PhoenixLogo';
import { STUDIO_INFO } from '../data/studioData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0B0B] text-zinc-300 border-t border-[#1F1F1F] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD60A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Col 1: Studio Identity */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <PhoenixLogo size={60} />
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Phoenix Tattooz
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#FFD60A] font-medium">
                  Studio &amp; Academy
                </p>
                <p className="text-xs text-zinc-400">Hisar, Haryana</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm pt-2">
              Premier custom tattoo studio and training academy in Hisar. Where passion, hygiene, and timeless art unite to ink your personal story.
            </p>

            <div className="pt-2 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFD60A] block">
                Hisar's Best Tattoos
              </span>
              <p className="font-serif text-sm text-zinc-100 font-bold leading-snug">
                “Wear Your Story, <span className="text-[#FFD60A]">Leave the Rest Behind.</span>”
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  About Us &amp; Services
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Meet Our Artists
                </Link>
              </li>
              <li>
                <Link to="/artists/rohit-sharma" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Rohit Sharma Profile
                </Link>
              </li>
              <li>
                <Link to="/experience" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Studio Experience &amp; Hygiene
                </Link>
              </li>
              <li>
                <Link to="/gallery?tab=photos" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Photo Gallery (Tattoos &amp; Piercing)
                </Link>
              </li>
              <li>
                <Link to="/gallery?tab=videos" className="text-zinc-300 hover:text-[#FFD60A] transition-colors flex items-center gap-1.5">
                  <span>Video Gallery &amp; Reels</span>
                  <span className="text-[9px] bg-[#FFD60A] text-black font-extrabold px-1.5 py-0.2 rounded">HD</span>
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-zinc-300 hover:text-[#FFD60A] transition-colors flex items-center gap-1.5">
                  <span>Client Reviews &amp; Studio Creed</span>
                  <span className="text-[10px] bg-[#FFD60A]/20 text-[#FFD60A] px-1.5 py-0.2 rounded font-mono">5.0 ★</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-300 hover:text-[#FFD60A] transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
              {/* Admin Sign Up or Login Link strictly located in footer */}
              <li className="pt-2 border-t border-zinc-800/80">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#FFD60A] transition-colors font-medium group"
                >
                  <Lock className="w-3.5 h-3.5 text-[#FFD60A] group-hover:scale-110 transition-transform" />
                  <span>Admin Portal (Sign In)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details & Hours */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Studio Information
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FFD60A] shrink-0 mt-0.5" />
                <span className="text-zinc-300 leading-snug">
                  {STUDIO_INFO.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <a
                  href={`tel:${STUDIO_INFO.phone}`}
                  className="text-zinc-200 hover:text-[#FFD60A] font-medium tracking-wide transition-colors"
                >
                  {STUDIO_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <span className="text-zinc-300">
                  {STUDIO_INFO.hours}
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Walk-ins welcome &bull; Prior booking recommended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-zinc-500">
              &copy; 2025 Phoenix Tattooz Studio &amp; Academy. All rights reserved.
            </p>
            <span className="hidden sm:inline text-zinc-700">&bull;</span>
            <Link
              to="/admin"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-[#FFD60A]" />
              <span>Admin Access</span>
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
