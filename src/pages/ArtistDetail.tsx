import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Star, 
  Instagram, 
  Facebook, 
  Youtube, 
  Award, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lightbulb, 
  User as UserIcon, 
  Flower2, 
  Quote,
  Search
} from 'lucide-react';
import { CLIENT_REVIEWS } from '../data/studioData';
import { useArtists } from '../lib/studioContent';
import { LightboxModal } from '../components/LightboxModal';

interface ArtistDetailProps {
  onOpenBooking: (artistId?: string) => void;
}

export const ArtistDetail: React.FC<ArtistDetailProps> = ({ onOpenBooking }) => {
  const artists = useArtists();
  const rohit = artists.find((a) => a.id === 'rohit-sharma') || artists[0];
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<any>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const portfolio = rohit?.portfolio || [];

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(1, portfolio.length - 3));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="bg-white text-zinc-800 min-h-screen pb-16 md:pb-0">
      {/* 1. DARK HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-16 sm:py-24 border-b border-[#222222]">
        {/* Background glow and subtle noise */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-[#0B0B0B]/70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Photo + Brush Slogan */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900 aspect-[4/5]">
                <img
                  src={rohit.image}
                  alt="Rohit Sharma tattoo artist tattooing"
                  className="w-full h-full object-cover"
                />

                {/* Handwritten script slogan */}
                <div className="absolute top-4 left-5 pointer-events-none select-none z-10">
                  <span className="font-script text-3xl sm:text-4xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
                    Turning
                  </span>
                  <span className="font-script text-3xl sm:text-4xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight -mt-1">
                    Ideas Into
                  </span>
                  <span className="font-script text-4xl sm:text-5xl text-[#FFD60A] font-bold block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight -mt-1">
                    Art
                  </span>
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="lg:col-span-4 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                    OUR ARTIST
                  </span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {rohit.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FFD60A] uppercase mt-1">
                  {rohit.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {rohit.bio}
              </p>

              {/* Social icons and Book button */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2.5">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-[#FFD60A] hover:border-[#FFD60A] transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => onOpenBooking(rohit.id)}
                  className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <span>Book Appointment</span>
                  <Calendar className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>

            {/* Right: Stats Card */}
            <div className="lg:col-span-3">
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD60A]/15 flex items-center justify-center text-[#FFD60A]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-serif text-white">5+</div>
                      <div className="text-[11px] text-zinc-400">Years of Experience</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD60A]/15 flex items-center justify-center text-[#FFD60A]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-serif text-white">500+</div>
                      <div className="text-[11px] text-zinc-400">Happy Clients</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD60A]/15 flex items-center justify-center text-[#FFD60A]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-serif text-white">1000+</div>
                      <div className="text-[11px] text-zinc-400">Tattoos Completed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD60A]/15 flex items-center justify-center text-[#FFD60A]">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-lg font-bold font-serif text-white">4.9</div>
                      <div className="text-[11px] text-zinc-400">Client Rating ★★★★★</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 text-center">
                  <span className="font-script text-2xl text-[#FFD60A] block">
                    “Same Skin Different Story”
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT ROHIT (More Than Just a Tattoo Artist) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    ABOUT ROHIT
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                  More Than Just a Tattoo Artist
                </h2>
              </div>

              <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
                <p>
                  Rohit started his journey in 2019 with a simple passion — art and self-expression. Over the years, he has developed his skills, style and a loyal client base. His work is known for clean lines, detailed shading and meaningful designs.
                </p>
                <p>
                  For him, tattooing is not just a profession, it's a way to connect with people and bring their ideas to life.
                </p>
              </div>

              <div className="pt-2">
                <div className="font-script text-3xl text-zinc-900 font-bold">
                  Rohit Sharma
                </div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Tattoo Artist
                </div>
              </div>
            </div>

            {/* Center Photo with Yellow Offset Frame */}
            <div className="lg:col-span-3 relative">
              <div className="relative mx-auto max-w-xs">
                {/* Yellow offset background plate */}
                <div className="absolute inset-0 bg-[#FFD60A] rounded-2xl transform translate-x-3 translate-y-3" />
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-zinc-900 bg-zinc-900 aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80"
                    alt="Rohit Sharma tattooing in studio"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: Experience & Training Timeline */}
            <div className="lg:col-span-4 space-y-4 lg:pl-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 mb-4">
                EXPERIENCE &amp; TRAINING
              </h3>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200">
                {rohit.timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#FFD60A] ring-4 ring-white shadow-sm" />
                    <div className="text-xs font-bold text-zinc-900">
                      {item.year}
                    </div>
                    <div className="text-xs font-semibold text-zinc-800 leading-snug">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPECIALIZATIONS (4 Cards) - DARK */}
      <section className="py-20 bg-[#0B0B0B] text-white border-y border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                SPECIALIZATIONS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Areas of Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#141414] p-6 rounded-2xl border border-zinc-800 text-center flex flex-col items-center space-y-3 group hover:border-[#FFD60A]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Black &amp; Grey Realism
              </h3>
              <p className="text-xs text-zinc-400">
                Life-like tattoos with depth and emotion.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#141414] p-6 rounded-2xl border border-zinc-800 text-center flex flex-col items-center space-y-3 group hover:border-[#FFD60A]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-110 transition-transform">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Custom Designs
              </h3>
              <p className="text-xs text-zinc-400">
                Your idea, our creativity.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#141414] p-6 rounded-2xl border border-zinc-800 text-center flex flex-col items-center space-y-3 group hover:border-[#FFD60A]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-110 transition-transform">
                <UserIcon className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Portraits
              </h3>
              <p className="text-xs text-zinc-400">
                Capturing emotions in ink.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#141414] p-6 rounded-2xl border border-zinc-800 text-center flex flex-col items-center space-y-3 group hover:border-[#FFD60A]/50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] group-hover:scale-110 transition-transform">
                <Flower2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Cover Ups &amp; Reworks
              </h3>
              <p className="text-xs text-zinc-400">
                New life for old tattoos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED WORK CAROUSEL */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  ARTIST GALLERY
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
                Featured Work
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/gallery"
                className="text-xs font-bold text-zinc-800 hover:text-black border-b border-[#FFD60A] pb-0.5 flex items-center gap-1"
              >
                <span>View All Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevCarousel}
                  aria-label="Previous portfolio"
                  className="w-8 h-8 rounded-full border border-zinc-300 hover:border-zinc-500 flex items-center justify-center text-zinc-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextCarousel}
                  aria-label="Next portfolio"
                  className="w-8 h-8 rounded-full border border-zinc-300 hover:border-zinc-500 flex items-center justify-center text-zinc-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel items */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {portfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedLightboxItem({ ...item, artist: rohit.name })}
                className="group relative rounded-xl overflow-hidden bg-black aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-[#FFD60A] uppercase">
                    {item.category}
                  </span>
                  <div className="text-xs font-bold text-white truncate">
                    {item.title}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-300">
                    <Search className="w-3 h-3 text-[#FFD60A]" />
                    <span>Zoom</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHAT PEOPLE SAY (3 Reviews) */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-[#FFD60A]" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  CLIENT REVIEWS
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
                What People Say
              </h2>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl font-bold font-serif text-zinc-900">4.9/5</span>
                <div className="flex text-[#FFD60A] text-sm">★★★★★</div>
              </div>
              <span className="text-xs text-zinc-500">
                Based on 250+ Happy Clients
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLIENT_REVIEWS.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-zinc-300" />
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{review.name}</div>
                      <div className="text-[10px] text-zinc-500">{review.city}</div>
                    </div>
                  </div>
                  <div className="flex text-[#FFD60A] text-xs">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOOK YOUR APPOINTMENT TODAY CTA */}
      <section className="bg-[#0B0B0B] text-white py-16 relative overflow-hidden border-t border-[#1F1F1F]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1400&q=80')`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                READY TO GET INKED?
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Book Your Tattoo Appointment Today
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Let's turn your ideas into timeless art. Walk-ins are welcome, but appointments are recommended.
              </p>
            </div>

            <button
              onClick={() => onOpenBooking(rohit.id)}
              className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm px-8 py-3.5 rounded-lg shadow-lg shadow-yellow-500/20 transition-all cursor-pointer shrink-0"
            >
              <span>Book Appointment</span>
              <Calendar className="w-4 h-4 text-black" />
            </button>
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
          onOpenBooking(rohit.id);
        }}
      />
    </div>
  );
};
