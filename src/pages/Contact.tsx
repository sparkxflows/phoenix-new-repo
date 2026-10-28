import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Calendar,
  Compass
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { DragonOrnament, RoseOrnament } from '../components/Ornaments';
import { saveContactToSupabase } from '../lib/supabase';

interface ContactProps {
  onOpenBooking: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenBooking }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Custom Tattooing',
    message: '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Save to Supabase
    await saveContactToSupabase({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      service: formData.service,
      message: formData.message.trim(),
    });

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Phoenix Tattooz! My name is ${formData.name || 'a client'}. I would like to inquire about ${formData.service}. Contact: ${formData.phone || ''}`
    );
    window.open(`https://wa.me/919992969919?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white text-zinc-800 min-h-screen pb-16 md:pb-0">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-16 sm:py-24 border-b border-[#222222]">
        <RoseOrnament className="absolute -right-12 top-6 w-72 h-72 text-zinc-700/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FFD60A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFD60A]">
                GET IN TOUCH
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Visit Our Studio in Hisar
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Have a question about your tattoo concept, cover-up, or academy enrollment? Reach out directly or drop by Red Square Market.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & FORM */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-zinc-900">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Studio Location</h3>
                  <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                    {STUDIO_INFO.address}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 font-medium">
                    Landmarks: Above SCO-159 &bull; Near Bikaner Sweets &amp; Pahuja Bakers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-zinc-900">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Call / WhatsApp</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Direct studio hotline:
                  </p>
                  <a
                    href={`tel:${STUDIO_INFO.phone}`}
                    className="text-base font-bold text-zinc-900 hover:text-[#0B0B0B] underline tracking-wider block mt-0.5"
                  >
                    {STUDIO_INFO.displayPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/30 flex items-center justify-center shrink-0 text-zinc-900">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Operating Hours</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    {STUDIO_INFO.hours}
                  </p>
                  <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Open All 7 Days
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-ping" />
                <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider">
                  Need Fast Answers?
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Connect directly with Rohit Sharma and senior artists on WhatsApp for rapid size &amp; price estimations.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={openWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </button>
                <button
                  onClick={onOpenBooking}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200 p-8 rounded-2xl shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-900">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-zinc-600 max-w-md mx-auto">
                  Thank you, <strong className="text-zinc-900">{formData.name}</strong>. Our team at Phoenix Tattooz Hisar has received your request and will call you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-[#0B0B0B] underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-serif text-2xl font-bold text-zinc-900">
                    Send Us a Message
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Fill out the form below and we will get back to you within 2 hours during studio hours.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A] ${
                        errors.name ? 'border-rose-400' : 'border-zinc-300'
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 09992969919"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A] ${
                        errors.phone ? 'border-rose-400' : 'border-zinc-300'
                      }`}
                      required
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Service of Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="Custom Tattooing">Custom Tattooing</option>
                      <option value="Black & Grey Realism">Black &amp; Grey Realism</option>
                      <option value="Cover-Up & Rework">Cover-Up &amp; Rework</option>
                      <option value="Cosmetic Tattooing">Cosmetic Tattooing (Brows/Lips)</option>
                      <option value="Laser Tattoo Removal">Laser Tattoo Removal</option>
                      <option value="Academy Apprenticeship">Tattoo Academy Course</option>
                      <option value="Body Piercing">Body Piercing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Tell Us About Your Idea
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your design, desired placement, approximate size, or any questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#FFD60A] hover:bg-[#ffe033] text-black font-bold text-sm py-3.5 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Send Message to Phoenix Studio</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. LARGE MAP SECTION */}
      <section className="bg-zinc-100 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-[#FFD60A]" />
            <span className="font-serif font-bold text-base text-zinc-900">
              Interactive Google Map &bull; Red Square Market Cue-1, Hisar
            </span>
          </div>
          <a
            href="https://maps.google.com/?q=Red+Square+Market+Hisar+Haryana"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#0B0B0B] underline hover:text-black"
          >
            Open in Google Maps &rarr;
          </a>
        </div>
        <div className="w-full h-[450px] bg-zinc-200 relative overflow-hidden border-b border-zinc-300">
          <iframe
            title="Phoenix Tattooz Studio Location Map in Hisar"
            src="https://maps.google.com/maps?q=Red+Square+Market+Hisar+Haryana&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
};
