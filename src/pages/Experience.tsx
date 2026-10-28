import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  HeartHandshake, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Smile, 
  Layers, 
  Flame 
} from 'lucide-react';
import { STUDIO_INFO, CERTIFICATIONS, STUDIO_PHOTOS } from '../data/studioData';
import { RoseOrnament, TattooMachineOrnament } from '../components/Ornaments';

interface ExperienceProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

export const Experience: React.FC<ExperienceProps> = ({ onOpenBooking }) => {
  const steps = [
    {
      num: '01',
      title: 'Consultation & Custom Concept',
      desc: 'We sit down with you to explore your ideas, symbolic meaning, placement, and skin tone to craft an entirely unique stencil.',
    },
    {
      num: '02',
      title: 'Digital Skin Mapping & Stencil Fit',
      desc: 'We position the thermal stencil, verify your anatomical flow in the mirror, and tweak proportions until it feels completely natural.',
    },
    {
      num: '03',
      title: 'Hospital-Grade Aseptic Prep',
      desc: 'Single-use sealed needle cartridges opened right in front of you. Hospital-grade Cavicide surface sanitation and medical barrier film.',
    },
    {
      num: '04',
      title: 'The Master Inking Session',
      desc: 'Relax in our ergonomic hydraulic beds with low-vibration rotary machines, soothing studio acoustics, and artist precision.',
    },
    {
      num: '05',
      title: 'Medical Aftercare & Healed Checkup',
      desc: 'Dermalize second-skin protective film applied. Detailed written aftercare instructions and a complimentary touch-up guarantee.',
    },
  ];

  const hygieneFeatures = [
    {
      title: 'Single-Use Needle Cartridges',
      desc: 'EO gas sterilized membranes, single-use disposable tubes and grips. Never reused under any circumstances.',
    },
    {
      title: 'Class-B Autoclave Sterilization',
      desc: 'Medical-grade steam sterilization for all stainless tools with periodic spore test certification.',
    },
    {
      title: 'Pure Vegan & Heavy-Metal Free Inks',
      desc: 'Cruelty-free, EU-compliant organic pigment dispersions that yield vibrant, long-lasting contrast without toxic fading.',
    },
    {
      title: 'Barrier Film & Cross-Contamination Guard',
      desc: 'All cords, spray bottles, power supplies, and armrests are shielded with fresh polyethylene protective barriers.',
    },
  ];

  return (
    <div className="bg-white text-zinc-800 min-h-screen pb-16 md:pb-0">
      {/* 1. DARK HERO */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-20 sm:py-28 border-b border-[#222222]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('${STUDIO_PHOTOS.studioWorkstation}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-[#0B0B0B]/70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                THE PHOENIX EXPERIENCE
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Where Artistry Meets Uncompromising Hygiene
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Getting inked is a transformative personal milestone. At Phoenix Tattooz, every detail — from our clinical sterilization protocols to custom design consultations — is engineered for your peace of mind and comfort.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm px-7 py-3.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <span>Book Free Studio Consultation</span>
                <Calendar className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-zinc-900 text-white py-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-highlight font-black text-[#FFD60A] tracking-tight">8+</div>
              <div className="text-xs uppercase text-zinc-400 mt-1 tracking-wider font-semibold">Years of Trust</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-highlight font-black text-[#FFD60A] tracking-tight">100%</div>
              <div className="text-xs uppercase text-zinc-400 mt-1 tracking-wider font-semibold">Sterile Protocols</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-highlight font-black text-[#FFD60A] tracking-tight">5000+</div>
              <div className="text-xs uppercase text-zinc-400 mt-1 tracking-wider font-semibold">Satisfied Clients</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-highlight font-black text-[#FFD60A] tracking-tight">4.9 ★</div>
              <div className="text-xs uppercase text-zinc-400 mt-1 tracking-wider font-semibold">Google Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 5-STEP JOURNEY */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <RoseOrnament className="absolute -left-12 top-20 w-80 h-80 text-zinc-200/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                OUR PROCESS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
              The Journey to Your Ink
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Crafted with intentional precision from initial spark to healed masterpiece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-serif font-bold text-[#FFD60A] mb-3">
                    {step.num}
                  </div>
                  <h3 className="font-serif font-bold text-base text-zinc-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLINICAL HYGIENE & SAFETY PROTOCOLS - DARK SECTION */}
      <section className="py-20 bg-[#0B0B0B] text-white border-y border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                    HYGIENE FIRST
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Hospital-Grade Safety, Every Single Session
                </h2>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed">
                We believe exceptional art cannot exist without clinical discipline. Our studio adheres strictly to international bloodborne pathogen protocols and sterile barrier standards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {hygieneFeatures.map((h, i) => (
                  <div key={i} className="bg-[#141414] p-4 rounded-xl border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#FFD60A] font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{h.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {h.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Photo with Yellow Offset Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md">
                <div className="absolute inset-0 bg-[#FFD60A] rounded-2xl transform translate-x-3 translate-y-3" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-800 bg-black aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1000&q=80"
                    alt="Sanitized professional tattoo workstation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/85 px-3 py-1.5 rounded-lg border border-zinc-700">
                    <span className="text-[11px] font-bold text-[#FFD60A] uppercase tracking-wider">
                      Sterile Workstation &bull; Hisar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CERTIFICATIONS & AMENITIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Certifications */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-0.5 bg-[#FFD60A]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    CREDENTIALS
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-zinc-900">
                  Certified &amp; Accredited
                </h2>
              </div>

              <div className="space-y-3">
                {CERTIFICATIONS.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <CheckCircle2 className="w-5 h-5 text-[#FFD60A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{cert.title}</h4>
                      <p className="text-[11px] text-zinc-500">{cert.desc} ({cert.location})</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <span className="font-script text-3xl text-zinc-900 font-bold">
                  Skilled | Certified | Trusted
                </span>
              </div>
            </div>

            {/* Studio Amenities */}
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-zinc-900">
                Studio Amenities for Your Comfort
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Tattooing can be an intense physical experience. We designed our studio space in Red Square Market to be as tranquil, relaxing, and welcoming as possible.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Coffee className="w-4 h-4 text-[#FFD60A]" />
                  <span>Artisanal Coffee &amp; Water</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Layers className="w-4 h-4 text-[#FFD60A]" />
                  <span>Ergonomic Hydraulic Chairs</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Clock className="w-4 h-4 text-[#FFD60A]" />
                  <span>Private Consultation Booths</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700">
                  <Smile className="w-4 h-4 text-[#FFD60A]" />
                  <span>Relaxing Ambient Soundscapes</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm py-3 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Book Your Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
