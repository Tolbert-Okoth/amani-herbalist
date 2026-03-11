import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  { icon: Leaf,          title: 'Pure Sourcing',      body: 'Every root, mushroom, and leaf is rigorously vetted for purity, ensuring you receive the unadulterated healing power of nature.' },
  { icon: Droplets,      title: 'Restoring Qi',       body: 'Our formulas nourish vital energy (Qi) and bring internal systems back to harmony — treating root causes, not just symptoms.' },
  { icon: Sun,           title: 'Modern Wellness',    body: 'Ancient formulas adapted for the stresses of contemporary life — boosting immunity, clearing brain fog, and elevating daily energy.' },
  { icon: Wind,          title: 'Yin & Yang Balance', body: 'Every blend is calibrated to your constitutional pattern, harmonising cooling Yin nourishment with warming Yang activation.' },
  { icon: FlameKindling, title: 'Transparent Craft',  body: 'Each batch carries a QR code linking to its origin farm, harvest date, and third-party lab certificate. Radical honesty.' },
  { icon: Shield,        title: 'GMP Certified',      body: 'Manufactured under Good Manufacturing Practice standards. Every capsule, tincture, and tea meets pharmaceutical-grade consistency.' },
];

const timeline = [
  { year: '2016', title: 'The Seed',        body: "Founder Amara Njoroge returns from Shanghai with a Master's in TCM and a single question: why can't Kenyan bodies access this wisdom locally?" },
  { year: '2018', title: 'First Formulas',  body: 'Three signature blends — for Qi fatigue, sleep, and digestion — are tested with a small Nairobi community. Results surpass expectations.' },
  { year: '2020', title: 'GMP Certification',body: "After two years of investment, Amani becomes Kenya's first TCM herbalist to achieve pharmaceutical-grade manufacturing certification." },
  { year: '2023', title: 'The Apothecary',  body: 'The full online apothecary launches with 38 formulas. Over 5,000 Kenyans now use Amani products as part of their daily wellness ritual.' },
];

const team = [
  { name: 'Amara Njoroge', role: 'Founder & Head Practitioner', img: 'https://i.pravatar.cc/300?img=47', bio: 'MSc Traditional Chinese Medicine, Shanghai University. 14 years clinical experience.' },
  { name: 'Dr. Kipchoge Ruto', role: 'Herbal Pharmacologist', img: 'https://i.pravatar.cc/300?img=53', bio: 'PhD Pharmacognosy, University of Nairobi. Specialises in East African botanical adaptation.' },
  { name: 'Zawadi Ochieng', role: 'Sourcing & Quality Lead', img: 'https://i.pravatar.cc/300?img=44', bio: 'Former WHO supply-chain auditor. Oversees all farm partnerships across 4 continents.' },
];

/* ═══════════════════════════════════════════════════ */
const Philosophy = () => {
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
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-32 pb-24 text-center">
        {/* bg blobs */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[900px] aspect-[16/7] rounded-full bg-[radial-gradient(ellipse,#d6e8da_0%,transparent_70%)] opacity-50 pointer-events-none" />

        <div className="relative max-w-[860px] mx-auto z-10">
          <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-5 flex items-center justify-center gap-3 fade-up ${heroVisible ? 'in' : ''}`}>
            <span className="w-7 h-[1px] bg-[#4a7c59] inline-block" />
            Our Roots
            <span className="w-7 h-[1px] bg-[#4a7c59] inline-block" />
          </p>

          <h1 className={`text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-[1.08] tracking-[-0.015em] text-[#1c1a16] mb-8 fade-up delay-[80ms] ${heroVisible ? 'in' : ''}`}>
            Bridging Ancient Wisdom<br />
            with <em className="text-[#2c4c3b] italic">Kenyan Vitality.</em>
          </h1>

          <p className={`font-dm text-[clamp(1rem,1.8vw,1.15rem)] font-light leading-[1.8] text-[#5a5648] max-w-[640px] mx-auto mb-12 fade-up delay-[180ms] ${heroVisible ? 'in' : ''}`}>
            At Amani Herbalists, we believe true healing comes from the earth. By combining the time-tested principles of Traditional Chinese Medicine with a deep understanding of modern Kenyan lifestyles, we create remedies that restore profound balance.
          </p>

          {/* stat row */}
          <div className={`font-dm flex flex-wrap justify-center gap-12 fade-up delay-[280ms] ${heroVisible ? 'in' : ''}`}>
            {[['5,000+', 'Kenyan customers'], ['38', 'TCM formulas'], ['12', 'Source farms'], ['2016', 'Founded']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-[clamp(2rem,3.5vw,2.8rem)] font-light text-[#1c2e1f] leading-none">
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
          3. CORE VALUES GRID
      ══════════════════════════════════ */}
      <section ref={valuesRef} className="py-24 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">

          <div className={`text-center mb-16 fade-up ${valuesVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-3 flex items-center justify-center gap-2">
              <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" /> What We Stand For <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[#1c1a16] leading-[1.1]">
              Six Commitments to <em className="text-[#2c4c3b]">Your Wellbeing</em>
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {values.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className={`bg-[#faf8f4] border border-[#ede8df] rounded-3xl p-8 transition-all duration-300 hover:bg-white hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-10px_rgba(74,124,89,0.16)] fade-up ${valuesVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i % 3 + 1) * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[#e8f0ea] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#4a7c59]" />
                </div>
                <h3 className="text-[1.3rem] font-normal text-[#1c1a16] mb-2.5">{title}</h3>
                <p className="font-dm text-[0.88rem] font-light leading-[1.75] text-[#7a7060]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. OUR STORY (split layout)
      ══════════════════════════════════ */}
      <section ref={storyRef} className="py-24 px-6 bg-[#f0ece3]">
        <div className="max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-20 items-center">

          {/* image */}
          <div className={`relative fade-up ${storyVisible ? 'in' : ''}`}>
            <div className="rounded-[30%_70%_60%_40%/40%_35%_65%_60%] overflow-hidden aspect-[4/5] bg-[#ddd]">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop" alt="Founder practising TCM" className="w-full h-full object-cover block" />
            </div>
            {/* floating quote */}
            <div className="absolute bottom-[6%] right-[-4%] bg-[#1c2e1f] rounded-2xl p-5 max-w-[220px] shadow-[0_20px_48px_rgba(28,46,31,0.25)]">
              <p className="text-[1.05rem] font-light italic text-[#e8f0ea] leading-[1.5] mb-3">"Healing should feel like coming home."</p>
              <p className="font-dm text-[0.7rem] font-normal text-[#8a9e8c] tracking-[0.05em]">— Amara Njoroge, Founder</p>
            </div>
          </div>

          {/* text */}
          <div>
            <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-4 flex items-center gap-2 fade-up ${storyVisible ? 'in' : ''}`}>
              <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" /> Our Story
            </p>
            <h2 className={`text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.15] text-[#1c1a16] mb-6 fade-up delay-[80ms] ${storyVisible ? 'in' : ''}`}>
              A practitioner's answer<br />to an <em className="text-[#2c4c3b]">unmet need.</em>
            </h2>
            <div className={`font-dm flex flex-col gap-4 fade-up delay-[180ms] ${storyVisible ? 'in' : ''}`}>
              <p className="text-[0.95rem] font-light leading-[1.8] text-[#5a5648]">
                When Amara Njoroge returned from Shanghai with a Master's in Traditional Chinese Medicine, she noticed a gap: the wisdom she had studied for years was simply inaccessible to most Kenyans — either too expensive, too unfamiliar, or simply unavailable.
              </p>
              <p className="text-[0.95rem] font-light leading-[1.8] text-[#5a5648]">
                Amani Herbalists was founded to close that gap. Every formula begins with classical TCM theory, is adapted for East African bodies and climate, and is manufactured to pharmaceutical-grade standards before it ever reaches your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. TIMELINE
      ══════════════════════════════════ */}
      <section ref={timelineRef} className="py-24 px-6 bg-[#1c2e1f] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-8%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#2c4c3b_0%,transparent_70%)] opacity-50 pointer-events-none" />

        <div className="max-w-[860px] mx-auto relative z-10">
          <div className={`mb-16 text-center fade-up ${tlVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#a8c5a0] mb-3 flex items-center justify-center gap-2">
              <span className="w-5 h-[1px] bg-[#a8c5a0] inline-block" /> The Journey <span className="w-5 h-[1px] bg-[#a8c5a0] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#f7f4ef] leading-[1.1]">
              How Amani <em className="text-[#a8c5a0]">Came to Be</em>
            </h2>
          </div>

          <div className="flex flex-col">
            {timeline.map((item, i) => (
              <div key={i} className={`flex gap-8 relative fade-up ${tlVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms`, paddingBottom: i < timeline.length - 1 ? '3rem' : 0 }}>
                {/* left: year + line */}
                <div className="flex flex-col items-center w-20 shrink-0">
                  <p className="font-dm text-[0.78rem] font-medium text-[#4a7c59] tracking-[0.08em] mb-2">{item.year}</p>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#4a7c59] border-[3px] border-[#f7f4ef] shadow-[0_0_0_2px_#4a7c59] shrink-0 mt-1.5" />
                  {i < timeline.length - 1 && <div className="flex-1 w-0.5 bg-gradient-to-b from-[#4a7c59] to-[#2c4c3b] mt-1 rounded-full" />}
                </div>
                {/* right: content */}
                <div className="pb-2">
                  <h3 className="text-[1.3rem] font-normal text-[#f7f4ef] mb-2 leading-[1.2]">{item.title}</h3>
                  <p className="font-dm text-[0.88rem] font-light leading-[1.75] text-[#8a9e8c]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. TEAM
      ══════════════════════════════════ */}
      <section ref={teamRef} className="py-24 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">

          <div className={`text-center mb-14 fade-up ${teamVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-3 flex items-center justify-center gap-2">
              <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" /> The People <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" />
            </p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1c1a16] leading-[1.1]">
              Practitioners, not <em className="text-[#2c4c3b]">marketers.</em>
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {team.map((member, i) => (
              <div key={i} className={`bg-white rounded-3xl overflow-hidden border border-[#ede8df] transition-all duration-400 hover:shadow-[0_24px_48px_-12px_rgba(28,26,22,0.14)] hover:-translate-y-1.5 group fade-up ${teamVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <div className="aspect-[4/3] overflow-hidden bg-[#f0ece3]">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h3 className="text-[1.3rem] font-normal text-[#1c1a16] mb-1">{member.name}</h3>
                  <p className="font-dm text-[0.75rem] font-medium text-[#4a7c59] tracking-[0.06em] uppercase mb-3">{member.role}</p>
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
      <section ref={ctaRef} className="py-24 px-6 bg-[#f0ece3] text-center">
        <div className={`max-w-[600px] mx-auto fade-up ${ctaVisible ? 'in' : ''}`}>
          <div className="w-14 h-14 rounded-full bg-[#e8f0ea] flex items-center justify-center mx-auto mb-7">
            <Sprout size={24} className="text-[#4a7c59]" />
          </div>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light text-[#1c1a16] leading-[1.2] mb-4">
            Ready to begin your<br /><em className="text-[#2c4c3b]">healing journey?</em>
          </h2>
          <p className="font-dm text-[0.95rem] font-light leading-[1.8] text-[#5a5648] mb-10">
            Browse our full apothecary of 38 classical formulas, each crafted for the Kenyan constitution and backed by clinical TCM theory.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="font-dm inline-flex items-center gap-2 px-8 py-3.5 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#2c4c3b] hover:-translate-y-0.5">
              Shop the Collection <ArrowRight size={15} />
            </Link>
            <Link to="/" className="font-dm inline-flex items-center px-8 py-3.5 border-[1.5px] border-[#c8b89a] text-[#3a3630] rounded-full text-sm transition-all duration-300 hover:border-[#2c4c3b] hover:text-[#2c4c3b]">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Philosophy;