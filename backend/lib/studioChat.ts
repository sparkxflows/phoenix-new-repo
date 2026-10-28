// Studio AI brain — shared by the Vercel chat function.
// Extracted verbatim from server.ts so both runtimes answer identically.

export const STUDIO_SYSTEM_PROMPT = `You are "Phoenix AI", the official studio assistant for Phoenix Tattooz Studio & Academy in Hisar, Haryana, India.
You provide warm, artistic, knowledgeable, respectful, and helpful guidance to clients and visitors.

Key Information about Phoenix Tattooz Studio:
- Founder & Master Artist: Rohit Sharma (8+ years experience, 1500+ tattoos completed, internationally recognized realism, portrait, and black & grey master).
- Resident Artists:
  * Kavya Singh (Fine line, botanical, watercolor & color illustrative specialist).
  * Aryan Verma (Geometric, tribal, sacred geometry, and modern calligraphy specialist).
- Studio Address: 2nd Floor, Red Square Market Cue-1, SCO-159, near Bikaner sweets & Pahuja bakers, Hisar, Haryana 125001, India.
- Operating Hours: 10:00 AM to 9:00 PM, 7 days a week (Monday to Sunday).
- Contact Phone / WhatsApp: +91 99929 69919 (or 09992969919).
- Email: phoenixtattoozhisar@gmail.com
- Services:
  1. Custom Tattooing: Black & Grey Realism, Portraiture, Fine-Line, Color Illustrative, Japanese/Oriental, Minimalist, Script & Lettering.
  2. Tattoo Cover-Ups & Reworks: Expert consultation to transform old, faded, or unwanted tattoos into stunning fresh art.
  3. Cosmetic Tattooing: Microblading, Ombre Powder Brows, Lip Blush, Lash Line Enhancement.
  4. Body Piercing: Ear (lobe, helix, industrial, tragus), Nose, Septum, Belly/Navel, Eyebrow, Tongue. Always performed using 100% implant-grade titanium jewelry and sterile needles.
  5. Phoenix Tattoo Academy: Professional hands-on certification training (3-month & 6-month intensive courses) covering tattoo mechanics, hygiene/sterilization protocols, skin anatomy, stencil art, client management, and practical needle work on synthetic skins and supervised models.

Pricing Guidance (Approximations):
- Studio Minimum Setup: ₹1,000 - ₹1,500 (covers single-use medical-grade sterile kit, consumables, and artist prep).
- Small / Minimalist pieces (1-3 inches): ~₹1,500 - ₹3,500.
- Medium Custom Pieces: ~₹4,000 - ₹12,000 depending on detail, shading, and placement.
- Large Projects (Sleeves, Backpieces, Chest): Priced per session or hourly package after an in-person design consultation.
- Piercing: ₹500 - ₹1,500 including sterile titanium initial jewelry.
- Consultation: 100% Free initial design consultation and placement sizing.

Hygiene & Safety Standards (100% Hospital Grade):
- Single-use, sealed, sterilized needle cartridges opened directly in front of the client.
- Medical-grade autoclave sterilization for reusable stainless tools.
- Premium, certified, non-toxic, vegan inks (Dynamic, Eternal, World Famous).
- Complete barrier protection (clip cord sleeves, machine bags, dental bibs, medical nitrile gloves).
- Biohazard sharps disposal adhering to clinical standards.

Aftercare Protocols (Standard Healing):
- Leave the protective bandage / second skin on for 3-4 hours (or 24-48 hours if using Derm Shield / SecondSkin).
- Wash gently with lukewarm water and mild fragrance-free antibacterial soap. Pat dry with clean paper towel (never rub).
- After day 3, apply a whisper-thin layer of unscented tattoo balm or lotion 2-3 times daily. Do not over-saturate.
- DO NOT scratch, peel, or pick scabs.
- NO swimming, hot tubs, baths, or saunas for 2-3 weeks. Quick showers only.
- Protect from direct sunlight during healing; use SPF 50+ once fully healed.

Instructions for your responses:
- Be concise, friendly, and structured. Use bullet points or short paragraphs for readability.
- When the user asks about booking, tell them they can book right here using the "Book Appointment" button or visit in person at Red Square Market, Hisar.
- You are powered strictly by the free-tier Gemini 3.8 Flash model. Never suggest any paid model or subscription.`;

// Intelligent fallback generator for zero-downtime reliability
export function generateSmartFallback(message: string): string {
  const query = message.toLowerCase();

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('how much') || query.includes('charge')) {
    return `**Phoenix Tattooz Pricing Guide:**\n\n` +
      `• **Studio Minimum:** ₹1,000 - ₹1,500 (covers single-use sterile medical setup & consumables)\n` +
      `• **Small / Minimalist Tattoos (1–3 inches):** Starting from ₹1,500 – ₹3,500\n` +
      `• **Medium Custom Artworks:** ₹4,000 – ₹12,000 depending on intricate shading and color\n` +
      `• **Large Scale (Sleeves, Chest, Back):** Quoted per session during consultation\n` +
      `• **Body Piercing:** ₹500 – ₹1,500 (includes sterile implant-grade titanium jewelry)\n\n` +
      `💡 *We offer 100% FREE design consultations! Click **"Book Appointment"** to reserve your slot or chat with us on WhatsApp at +91 99929 69919.*`;
  }

  if (query.includes('aftercare') || query.includes('heal') || query.includes('care') || query.includes('wash') || query.includes('cream') || query.includes('lotion')) {
    return `**Essential Tattoo Aftercare Instructions:**\n\n` +
      `1. **First 3–4 Hours:** Leave initial protective bandage on. Remove gently and wash with lukewarm water & fragrance-free antibacterial soap.\n` +
      `2. **Drying:** Gently pat dry with a clean paper towel. Never rub with a cloth towel.\n` +
      `3. **Moisturizing (Day 3+):** Apply a tiny, sheer layer of unscented tattoo balm or lotion 2–3 times daily. Avoid over-applying.\n` +
      `4. **What to Avoid:** No swimming (pools/hot tubs) for 2–3 weeks, avoid direct sunlight, and **never pick or scratch scabs**.\n\n` +
      `Have questions about your healing? Feel free to visit the studio or call us at +91 99929 69919!`;
  }

  if (query.includes('pain') || query.includes('hurt') || query.includes('sensitive')) {
    return `**Tattoo Pain & Sensitivity Guide:**\n\n` +
      `Pain varies depending on placement:\n` +
      `• **Least painful:** Outer bicep, forearm, outer thigh, calves.\n` +
      `• **Moderate:** Shoulder, wrist, upper back.\n` +
      `• **Most sensitive:** Ribs, fingers, neck, spine, inner ankle.\n\n` +
      `Our master artists use fine-tuned modern rotary machines and gentle techniques to keep you comfortable. We take regular breaks whenever you need!`;
  }

  if (query.includes('book') || query.includes('appointment') || query.includes('consult') || query.includes('slot') || query.includes('visit')) {
    return `**How to Book at Phoenix Tattooz:**\n\n` +
      `• **Online:** Click the yellow **"Book Appointment"** button on this website to select your artist, service, date, and preferred time.\n` +
      `• **Direct Phone / WhatsApp:** +91 99929 69919\n` +
      `• **Walk-in Consultation:** 2nd Floor, Red Square Market Cue-1, SCO-159 (near Bikaner Sweets), Hisar, Haryana.\n` +
      `• **Studio Hours:** 10:00 AM – 9:00 PM, every single day!`;
  }

  if (query.includes('artist') || query.includes('rohit') || query.includes('kavya') || query.includes('aryan')) {
    return `**Meet Our Resident Master Artists:**\n\n` +
      `• **Rohit Sharma (Founder & Master Artist):** 8+ years experience, 1500+ tattoos. Specializes in Hyper-Realism, Black & Grey, Portraits, and Large Custom Projects.\n` +
      `• **Kavya Singh:** Specialist in Fine-Line precision, Botanical, Watercolor, and Illustrative color tattoos.\n` +
      `• **Aryan Verma:** Specialist in Sacred Geometry, Tribal, Dotwork, and Modern Script/Calligraphy.\n\n` +
      `You can explore each artist's full portfolio in our **Artists** section!`;
  }

  if (query.includes('pierce') || query.includes('piercing')) {
    return `**Professional Body Piercing at Phoenix:**\n\n` +
      `• **Services:** Ear Lobe, Helix, Tragus, Conch, Industrial, Nose Pin/Ring, Septum, Eyebrow, and Navel/Belly.\n` +
      `• **Jewelry:** 100% Medical Implant-Grade Titanium (hypoallergenic, nickel-free).\n` +
      `• **Price Range:** ₹500 – ₹1,500 depending on placement and jewelry selection.\n` +
      `• **Safety:** Single-use sterile catheter needles, hospital-grade autoclave sanitation.`;
  }

  if (query.includes('review') || query.includes('feedback') || query.includes('rating') || query.includes('thought') || query.includes('view') || query.includes('philosophy') || query.includes('creed')) {
    return `**Client Reviews & Studio Views at Phoenix Tattooz:**\n\n` +
      `• **Rating:** 5.0 ★ Stars across 1,000+ satisfied clients in Hisar, Haryana & NCR.\n` +
      `• **Our Core Philosophy — “Same Skin, Different Story”:** We never copy-paste stencils. Every custom tattoo is an intimate chapter of your life, crafted with hospital-grade sterility and fine art mastery.\n` +
      `• **Client Highlights:** Hyper-realism portraits by Rohit Sharma, delicate botanical lines by Sneha, pain-free application, and lifetime touch-up support.\n` +
      `• **Read & Share:** You can explore all verified reviews and submit your own feedback in our dedicated **Reviews** section!`;
  }

  if (query.includes('academy') || query.includes('learn') || query.includes('course') || query.includes('training') || query.includes('classes')) {
    return `**Phoenix Tattoo Academy Certification Courses:**\n\n` +
      `Turn your passion into a certified professional tattoo career:\n` +
      `• **Comprehensive Modules:** Machine tuning & needle dynamics, skin anatomy & physiology, sterile cross-contamination prevention, advanced stencil creation, realism shading, and real client practice.\n` +
      `• **Duration:** 3-Month Foundations or 6-Month Masterclass with lifetime mentorship.\n` +
      `• Contact Master Rohit Sharma directly at +91 99929 69919 to enroll or schedule an academy tour.`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('timing') || query.includes('hours') || query.includes('open')) {
    return `**Studio Location & Working Hours:**\n\n` +
      `📍 **Address:** 2nd Floor, Red Square Market Cue-1, SCO-159, near Bikaner sweets & Pahuja bakers, Hisar, Haryana 125001\n` +
      `⏰ **Hours:** 10:00 AM – 9:00 PM (Open 7 days a week, Monday through Sunday)\n` +
      `📞 **Call / WhatsApp:** +91 99929 69919\n` +
      `✉️ **Email:** phoenixtattoozhisar@gmail.com`;
  }

  return `Welcome to **Phoenix Tattooz Studio & Academy** in Hisar!\n\n` +
    `I can help you with:\n` +
    `• **Custom Tattoo Ideas & Sizing Estimates**\n` +
    `• **Pricing & Free Consultations**\n` +
    `• **Aftercare & Safe Healing Steps**\n` +
    `• **Body Piercing Options & Safety**\n` +
    `• **Master Artists (Rohit, Kavya, Aryan)**\n` +
    `• **Tattoo Academy Professional Training**\n\n` +
    `What would you like to know today? You can also click **"Book Appointment"** at any time to reserve your session.`;
}
