import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import api from '../api';
import { Leaf, Droplets, Sun, ArrowRight, Wind, FlameKindling, Shield, Sprout } from 'lucide-react';


/* ── robust fade-up hook ── */
const useInView = (threshold = 0.12) => {
  const [visible, setVisible] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); } 
    }, { threshold });
    obs.observe(element);
    return () => obs.disconnect();
  }, [element, threshold]);

  return [setElement, visible];
};

/* ── initials helper ── */
const getInitials = (name) => {
  const cleanName = name.replace('Dr. ', '').replace('Team', '');
  return cleanName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

/* ── animated counter ── */
const Counter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [setRef, visible] = useInView();
  
  useEffect(() => {
    if (!visible) return;
    let n = 0;
    const step = Math.ceil(end / 55);
    const t = setInterval(() => { 
      n += step; 
      if (n >= end) { setCount(end); clearInterval(t); } 
      else setCount(n); 
    }, 22);
    return () => clearInterval(t);
  }, [visible, end]);
  
  return <span ref={setRef}>{count.toLocaleString()}{suffix}</span>;
};

/* ── data ── */
const values = [
  { icon: Sun,           title: 'Psychological Nourishment',  body: 'True health begins in the mind. We promote mental regulation, stress management, emotional balance, and a positive mindset as the first step to overall well-being.' },
  { icon: Wind,          title: 'Healthy Lifestyle Practices',body: 'Purposeful daily actions support wellness. This includes regular exercise, quality sleep, balanced work-life habits, and mindful routines.' },
  { icon: Leaf,          title: 'Dietary Nourishment',        body: '"Food is medicine." Fohow uses powerful TCM herbs to regulate internal organs, cleanse toxins, and supplement immunity and vitality.' },
  { icon: FlameKindling, title: 'Remarkable Effectiveness',   body: 'Every formulation must deliver clear, measurable results. We only bring products forward if they demonstrably improve your health.' },
  { icon: Droplets,      title: 'Natural & Safe',             body: 'Our products utilize 100% natural, pure herbal ingredients that are proven safe and effective for long-term daily use.' },
  { icon: Shield,        title: 'Advanced Technology',        body: 'We combine exclusive, 5,500-year-old TCM formulations with modern biotechnology to maintain maximum potency and absorption.' },
];

const timeline = [
  { year: 'Phase 1', title: 'Cleansing (Qing)',    body: 'First step: Remove toxins, waste, and blockages caused by poor diet, stress, and pollution. Essential for detoxifying the liver, kidneys, and intestines.' },
  { year: 'Phase 2', title: 'Regulating (Tiao)',   body: 'Restore balance and harmony in the organs, Qi, and Yin-Yang. This brings the body’s internal systems back to their natural, optimal state.' },
  { year: 'Phase 3', title: 'Supplementing (Bu)',  body: 'Rebuild strength, boost immunity, and deeply nourish vitality once the body is clean and balanced.' },
  { year: 'Phase 4', title: 'Maintaining',         body: 'The ongoing state of wellness. A balanced lifestyle and consistent nourishment ensure long-term health, resilience, and longevity.' },
];

const team = [
  { name: 'Fohow Research Institute', role: 'Formulation & R&D', bio: 'A world-class team of TCM experts, biologists, and pharmacologists leading the scientific modernization of our formulas.' },
  { name: 'Global Quality Assurance', role: 'Safety & Compliance', bio: 'Dedicated auditors ensuring every batch meets rigorous international GMP standards and passes comprehensive third-party testing.' },
  { name: 'Eden Life B2B Team', role: 'Local Kenyan Support', bio: 'Your dedicated local partners managing wholesale logistics, clinic onboarding, and seamless API-driven inventory supply.' },
];

/* ═══════════════════════════════════════════════════ */
const Philosophy = () => {
  const [totalFormulas, setTotalFormulas] = useState(38);

  // 🔵 NEW: Scroll to hash anchor for portal navigation (e.g., #education) 🔵
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // 500ms delay to allow animations to load
    }
  }, [hash]);


  const [heroRef, heroVisible]       = useInView(0.05);
  const [valuesRef, valuesVisible]   = useInView();
  const [storyRef, storyVisible]     = useInView();
  const [timelineRef, tlVisible]     = useInView();
  const [teamRef, teamVisible]       = useInView();
  const [ctaRef, ctaVisible]         = useInView();

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh] overflow-x-hidden">

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-24 pb-16 md:pt-28 md:pb-20 text-center">
        {/* bg blobs */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[900px] aspect-[16/7] rounded-full bg-[radial-gradient(ellipse,#fcf5f5_0%,transparent_70%)] opacity-70 pointer-events-none" />

        <div className="relative max-w-[860px] mx-auto z-10">
          <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)] fade-up ${heroVisible ? 'in' : ''}`}>
            <span className="w-7 h-[1px] bg-[#d2a356] inline-block" />
            Our Philosophies
            <span className="w-7 h-[1px] bg-[#d2a356] inline-block" />
          </p>

          <h1 className={`text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.08] tracking-[-0.015em] text-[#1c1a16] mb-6 md:mb-8 fade-up delay-[80ms] ${heroVisible ? 'in' : ''}`}>
            Inspired by <br />
            <em className="text-[#811816] italic">Fohow TCM.</em>
          </h1>

          <p className={`font-dm text-[clamp(1rem,1.8vw,1.15rem)] font-light leading-[1.8] text-[#5a5648] max-w-[640px] mx-auto mb-10 md:mb-12 fade-up delay-[180ms] ${heroVisible ? 'in' : ''}`}>
            Built on over 5,500 years of Traditional Chinese Medicine wisdom—encompassing Yin-Yang balance, Qi energy, and the Five Elements—combined with modern research to promote holistic wellness.
          </p>

          {/* stat row */}
          <div className={`font-dm flex flex-wrap justify-center gap-10 md:gap-12 fade-up delay-[280ms] ${heroVisible ? 'in' : ''}`}>
            {[['500+', 'B2B partners'], [totalFormulas.toString(), 'TCM formulas'], ['12', 'Source farms'], ['2016', 'Founded']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-[clamp(2rem,3.5vw,2.8rem)] font-light text-[#811816] leading-none">
                  <Counter end={parseInt(n.replace(/[^0-9]/g,''))} suffix={n.includes('+') ? '+' : ''} />
                </p>
                <p className="text-[0.78rem] font-normal text-[#8a8070] mt-1.5 tracking-[0.04em]">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. FULL-BLEED IMAGE BAND
      ══════════════════════════════════ */}
      <div className="h-[clamp(220px,35vw,480px)] overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1400&auto=format&fit=crop" alt="Herbal ingredients spread" className="w-full h-full object-cover object-[center_60%] block" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f7f4ef_0%,transparent_15%,transparent_85%,#f7f4ef_100%)]" />
      </div>

      {/* ══════════════════════════════════
          3. CORE VALUES GRID (FIXED 3x2)
      ══════════════════════════════════ */}
      <section ref={valuesRef} className="py-16 md:py-20 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">

          <div className={`text-center mb-10 md:mb-14 fade-up ${valuesVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#811816] mb-3 flex items-center justify-center gap-2">
              <span className="w-5 h-[1px] bg-[#811816] inline-block" /> Health Theories & Principles <span className="w-5 h-[1px] bg-[#811816] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[#1c1a16] leading-[1.1]">
              Uncompromising Commitments <br />to <em className="text-[#811816]">Your Wellbeing</em>
            </h2>
          </div>

          {/* EXPLICIT 3 COLUMN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {values.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className={`bg-[#faf8f4] border border-[#ede8df] rounded-3xl p-6 md:p-8 transition-all duration-300 hover:bg-white hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-10px_rgba(129,24,22,0.12)] hover:border-[#d2a356]/40 fade-up ${valuesVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i % 3 + 1) * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[#fcf5f5] flex items-center justify-center mb-5 border border-[#811816]/5">
                  <Icon size={22} className="text-[#811816]" />
                </div>
                <h3 className="text-[1.2rem] font-medium text-[#1c1a16] mb-2.5">{title}</h3>
                <p className="font-dm text-[0.88rem] font-light leading-[1.75] text-[#7a7060]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. OUR STORY (split layout)
      ══════════════════════════════════ */}
      <section ref={storyRef} className="py-16 md:py-20 px-6 bg-[#f0ece3]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* image */}
          <div className={`relative fade-up ${storyVisible ? 'in' : ''}`}>
            <div className="rounded-[30%_70%_60%_40%/40%_35%_65%_60%] overflow-hidden aspect-[4/5] bg-[#ddd]">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop" alt="Founder practising TCM" className="w-full h-full object-cover block" />
            </div>
            {/* floating quote */}
            <div className="absolute bottom-[6%] right-[-4%] bg-[#4a0e0d] border border-[#811816]/30 rounded-2xl p-5 max-w-[220px] shadow-[0_20px_48px_rgba(129,24,22,0.25)]">
              <p className="text-[1.05rem] font-light italic text-[#e8d5d5] leading-[1.5] mb-3">"Promoting health culture to benefit human life."</p>
              <p className="font-dm text-[0.7rem] font-normal text-[#d2a356] tracking-[0.05em] drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">— Our Purpose</p>
            </div>
          </div>

          {/* text */}
          <div>
            <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#811816] mb-3 flex items-center gap-2 fade-up ${storyVisible ? 'in' : ''}`}>
              <span className="w-5 h-[1px] bg-[#811816] inline-block" /> Company Mission
            </p>
            <h2 className={`text-[clamp(2rem,3vw,3rem)] font-light leading-[1.15] text-[#1c1a16] mb-5 fade-up delay-[80ms] ${storyVisible ? 'in' : ''}`}>
              Building a harmonious<br />cultural <em className="text-[#811816]">community.</em>
            </h2>
            <div className={`font-dm flex flex-col gap-4 fade-up delay-[180ms] ${storyVisible ? 'in' : ''}`}>
              <p className="text-[0.95rem] font-light leading-[1.8] text-[#5a5648]">
                <strong>Our Mission:</strong> To build a cultural community that transcends ethnicity, country, and religion towards a happy life — making the world more beautiful, warmer, and harmonious.
              </p>
              <p className="text-[0.95rem] font-light leading-[1.8] text-[#5a5648]">
                <strong>Our Vision:</strong> To become a respected world-class enterprise for 500 years, where partners with the same values strive, achieve, and inherit together.
              </p>
              <p className="text-[0.95rem] font-light leading-[1.8] text-[#5a5648]">
                We are firmly guided by the Three Modernizations of TCM: Scientific Modernization, Lifestyle Integration, and Internationalization, ensuring ancient wisdom thrives in the modern world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. TIMELINE
      ══════════════════════════════════ */}
      <section ref={timelineRef} className="py-16 md:py-20 px-6 bg-[#2a0808] relative overflow-hidden shadow-inner">
        <div className="absolute top-[-20%] right-[-8%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#6a1210_0%,transparent_70%)] opacity-40 pointer-events-none" />

        <div className="max-w-[860px] mx-auto relative z-10">
          <div className={`mb-12 text-center fade-up ${tlVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-3 flex items-center justify-center gap-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">
              <span className="w-5 h-[1px] bg-[#d2a356] inline-block" /> The Practical Sequence <span className="w-5 h-[1px] bg-[#d2a356] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#f7f4ef] leading-[1.1]">
              The Three Pillars of <em className="text-[#d2a356] italic">Fohow TCM</em>
            </h2>
          </div>

          <div className="flex flex-col">
            {timeline.map((item, i) => (
              <div key={i} className={`flex gap-6 md:gap-8 relative fade-up ${tlVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms`, paddingBottom: i < timeline.length - 1 ? '3rem' : 0 }}>
                {/* left: year + line */}
                <div className="flex flex-col items-center w-16 md:w-20 shrink-0">
                  <p className="font-dm text-[0.78rem] font-medium text-[#d2a356] tracking-[0.08em] mb-2">{item.year}</p>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#d2a356] border-[3px] border-[#f7f4ef] shadow-[0_0_0_2px_#d2a356] shrink-0 mt-1.5" />
                  {i < timeline.length - 1 && <div className="flex-1 w-0.5 bg-gradient-to-b from-[#d2a356] to-[#811816] mt-1 rounded-full opacity-80" />}
                </div>
                {/* right: content */}
                <div className="pb-2">
                  <h3 className="text-[1.2rem] font-medium text-[#f7f4ef] mb-2 leading-[1.2]">{item.title}</h3>
                  <p className="font-dm text-[0.88rem] font-light leading-[1.75] text-[#e8d5d5]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. TEAM (FIXED 3 COLUMNS)
      ══════════════════════════════════ */}
      <section ref={teamRef} className="py-16 md:py-20 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">

          <div className={`text-center mb-10 md:mb-14 fade-up ${teamVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#811816] mb-3 flex items-center justify-center gap-2">
              <span className="w-5 h-[1px] bg-[#811816] inline-block" /> Our Support Ecosystem <span className="w-5 h-[1px] bg-[#811816] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1c1a16] leading-[1.1]">
              Global Expertise, <em className="text-[#811816]">Local Partnership.</em>
            </h2>
          </div>

          {/* EXPLICIT 3 COLUMN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className={`bg-white rounded-3xl overflow-hidden border border-[#ede8df] transition-all duration-400 hover:shadow-[0_24px_48px_-12px_rgba(129,24,22,0.1)] hover:border-[#d2a356]/40 hover:-translate-y-1.5 group fade-up ${teamVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>

                <div className="aspect-[4/3] overflow-hidden bg-[#fcf5f5] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fdf8ef_0%,transparent_70%)] opacity-70 transition-transform duration-700 group-hover:scale-125" />

                  <div className="w-24 h-24 rounded-full bg-[#811816] flex items-center justify-center text-[#d2a356] text-3xl font-serif shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 border-4 border-[#fcf5f5]">
                    {getInitials(member.name)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-[1.2rem] font-medium text-[#1c1a16] mb-1">{member.name}</h3>
                  <p className="font-dm text-[0.75rem] font-medium text-[#811816] tracking-[0.06em] uppercase mb-3">{member.role}</p>
                  <p className="font-dm text-[0.83rem] font-light leading-[1.7] text-[#7a7060]">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. CTA BAND
      ══════════════════════════════════ */}

      <section ref={ctaRef} className="py-16 md:py-20 px-6 bg-[#f0ece3] text-center border-t-[2px] border-[#ede8df]">
        <div className={`max-w-[600px] mx-auto fade-up ${ctaVisible ? 'in' : ''}`}>
          <div className="w-14 h-14 rounded-full bg-[#fcf5f5] flex items-center justify-center mx-auto mb-6 border border-[#811816]/10">
            <Sprout size={24} className="text-[#811816]" />
          </div>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1c1a16] leading-[1.2] mb-4">
            Ready to secure your<br /><em className="text-[#811816] italic">wholesale supply?</em>
          </h2>
          <p className="font-dm text-[0.95rem] font-light leading-[1.8] text-[#5a5648] mb-8">
            Browse our full apothecary of {totalFormulas} classical formulas, each crafted for the constitution and backed by clinical TCM theory.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="font-dm inline-flex items-center gap-2 px-8 py-3.5 bg-[#811816] text-[#f7f4ef] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#6a1210] hover:drop-shadow-[0_4px_12px_rgba(129,24,22,0.3)] hover:-translate-y-0.5">
              Shop the Collection <ArrowRight size={15} />
            </Link>
            <Link to="/consultations" className="font-dm inline-flex items-center px-8 py-3.5 border-[1.5px] border-[#811816] text-[#811816] rounded-full text-sm transition-all duration-300 hover:bg-[#fcf5f5] hover:border-[#811816] hover:text-[#811816]">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Philosophy;
