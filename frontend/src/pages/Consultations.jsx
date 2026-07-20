import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Phone, Clock, Star, MapPin, CheckCircle2, Building, Navigation, ShieldCheck } from 'lucide-react';
import api from '../api';
import SEO from '../components/SEO';
/* ── robust fade-up hook ── */
const useInView = (threshold = 0.1) => {
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

const perks = [
  { icon: MapPin, title: 'Cargen House Visit', body: 'Meet face-to-face with our TCM experts at our Harambee Avenue headquarters.' },
  { icon: ShieldCheck, title: '100% Free of Charge', body: 'Our professional strategy and health assessment sessions carry no hidden fees.' },
  { icon: Clock, title: 'Strategy Session', body: 'Dedicated time to assess your pharmacy or clinic’s inventory requirements and B2B pricing.' },
  { icon: Calendar, title: 'Seamless Onboarding', body: 'Fast wholesale account setup, product training, and dedicated clinical integration.' },
];

const supportTeams = [
  { name: 'B2B Wholesale Team', title: 'Account Management', rating: 4.9, reviews: 342 },
  { name: 'Clinical Support', title: 'TCM Integration', rating: 5.0, reviews: 218 },
];

const Consultations = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ fname: '', lname: '', business: '', email: '', phone: '', concern: '', type: 'physical' });
  const [errorMsg, setErrorMsg] = useState('');

  const [heroRef, heroVisible] = useInView(0.05);
  const [perksRef, perksVisible] = useInView();
  const [formRef, formVisible] = useInView();
  const [teamRef, teamVisible] = useInView();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await api.post('/consultations', form);
      if (response.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(response.data?.error || 'Failed to submit request.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh] overflow-x-hidden">
      <SEO 
        title="Book a Free Consultation | Fohow Eden Life"
        description="Book a free consultation at our Cargen House headquarters. Let our experts formulate a customized TCM wellness plan for you or your business."
        path="/consultations"
      />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] max-w-[700px] aspect-square rounded-full bg-[radial-gradient(circle,#fcf5f5_0%,transparent_70%)] opacity-70 pointer-events-none" />

        <div className="max-w-[760px] mx-auto text-center relative z-10">
          <p className={`font-dm text-[0.75rem] font-bold tracking-[0.2em] uppercase text-[#d2a356] mb-4 flex items-center justify-center gap-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)] fade-up ${heroVisible ? 'in' : ''}`}>
            <span className="w-8 h-[1.5px] bg-[#d2a356] inline-block" /> Consultation is 100% FREE <span className="w-8 h-[1.5px] bg-[#d2a356] inline-block" />
          </p>
          <h1 className={`text-[clamp(2.8rem,6vw,5rem)] font-light leading-[1.08] tracking-[-0.015em] text-[#1c1a16] mb-5 md:mb-6 fade-up delay-[80ms] ${heroVisible ? 'in' : ''}`}>
            Book your Physical<br /><em className="text-[#811816] italic">Visit.</em>
          </h1>
          <p className={`font-dm text-[1rem] md:text-[1.05rem] font-light leading-[1.8] text-[#5a5648] max-w-[560px] mx-auto fade-up delay-[180ms] ${heroVisible ? 'in' : ''}`}>
            Visit us at Cargen House to speak directly with our B2B team. Discuss wholesale pricing tiers, custom clinic formulations, and seamlessly integrate Fohow TCM products into your business.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════
          PERKS GRID (FIXED 4-COL)
      ══════════════════════════════ */}
      <section ref={perksRef} className="px-6 pb-16 md:pb-20 bg-[#f7f4ef]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {perks.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className={`bg-white border border-[#ede8df] rounded-[22px] p-6 md:p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-10px_rgba(129,24,22,0.1)] hover:border-[#d2a356]/40 hover:-translate-y-1 fade-up ${perksVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
              <div className="w-11 h-11 rounded-[13px] bg-[#fcf5f5] flex items-center justify-center mb-4 border border-[#811816]/5">
                <Icon size={20} className="text-[#811816]" />
              </div>
              <h3 className="text-[1.1rem] font-normal text-[#1c1a16] mb-2">{title}</h3>
              <p className="font-dm text-[0.83rem] font-light leading-[1.7] text-[#7a7060]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          FORM + SUPPORT TEAMS / MAP
      ══════════════════════════════ */}
      <section ref={formRef} className="px-6 py-16 md:py-20 bg-[#f0ece3]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* FORM */}
          <div className={`bg-white rounded-[32px] p-[clamp(2rem,5vw,3rem)] border border-[#ede8df] shadow-[0_24px_60px_rgba(28,26,22,0.07)] fade-up ${formVisible ? 'in' : ''}`}>
            {submitted ? (
              <div className="text-center py-12 px-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-[#fcf5f5] flex items-center justify-center mx-auto mb-6 border border-[#811816]/10">
                  <CheckCircle2 size={28} className="text-[#811816]" />
                </div>
                <h3 className="text-[1.8rem] font-light text-[#1c1a16] mb-3">Request Received</h3>
                <p className="font-dm text-[0.9rem] font-light leading-[1.75] text-[#5a5648]">
                  Our B2B onboarding team will contact you shortly to confirm your requested time for {form.type === 'physical' ? 'your visit to Cargen House' : 'your virtual call'}. Check your inbox for a confirmation email.
                </p>
              </div>
            ) : (
              <>
                <p className="font-dm text-[0.7rem] font-medium tracking-[0.16em] uppercase text-[#d2a356] mb-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.2)]">Partner With Us</p>
                <h2 className="text-[clamp(1.7rem,3vw,2.2rem)] font-light text-[#1c1a16] mb-8 leading-[1.2]">
                  Request a<br /><em className="text-[#811816]">Strategy Session</em>
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input type="text" required id="fn" placeholder="First Name" value={form.fname} onChange={set('fname')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                      <label htmlFor="fn" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">First Name</label>
                    </div>
                    <div className="relative">
                      <input type="text" required id="ln" placeholder="Last Name" value={form.lname} onChange={set('lname')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                      <label htmlFor="ln" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Last Name</label>
                    </div>
                  </div>

                  {/* business row */}
                  <div className="relative">
                    <input type="text" id="biz" placeholder="Clinic or Business Name (Optional)" value={form.business} onChange={set('business')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                    <label htmlFor="biz" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Clinic/Business Name (Optional)</label>
                  </div>

                  <div className="relative">
                    <input type="email" required id="em" placeholder="Email Address" value={form.email} onChange={set('email')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                    <label htmlFor="em" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Email Address</label>
                  </div>

                  <div className="relative">
                    <input type="tel" required id="ph" placeholder="Phone" value={form.phone} onChange={set('phone')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                    <label htmlFor="ph" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Phone Number</label>
                  </div>

                  {/* consultation type */}
                  <div>
                    <p className="font-dm text-[0.75rem] font-medium text-[#8a8070] tracking-[0.08em] uppercase mb-2.5 mt-2">Preferred Format</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { v: 'physical', icon: MapPin, label: 'Visit Cargen House' },
                        { v: 'virtual', icon: Phone, label: 'Phone/Virtual Call' }
                      ].map(({ v, icon: Icon, label }) => (
                        <button key={v} type="button" onClick={() => setForm(p => ({ ...p, type: v }))}
                          className={`font-dm flex items-center justify-center gap-2 p-3 rounded-2xl border-[1.5px] text-[0.82rem] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${form.type === v ? 'bg-[#811816] border-[#811816] text-[#f7f4ef] drop-shadow-[0_4px_12px_rgba(129,24,22,0.3)]' : 'bg-[#faf8f4] border-[#ede8df] text-[#5a5648] hover:border-[#d2a356]'
                            }`}>
                          <Icon size={16} className={form.type === v ? 'text-[#d2a356]' : ''} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <textarea rows={4} required id="cc" placeholder="Concern" value={form.concern} onChange={set('concern')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-6 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none resize-none transition-all focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 placeholder-transparent" />
                    <label htmlFor="cc" className="absolute left-4 top-4 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-2 peer-focus:text-[0.68rem] peer-focus:text-[#d2a356] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#811816] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">What would you like to discuss?</label>
                  </div>

                  {errorMsg && (
                    <p className="font-dm text-[0.85rem] text-[#811816] font-medium bg-[#fcf5f5] p-3 rounded-xl border border-[#811816]/10 animate-in fade-in slide-in-from-top-2">
                      {errorMsg}
                    </p>
                  )}

                  <button type="submit" className="font-dm mt-2 flex items-center justify-center gap-2 p-4 bg-[#d2a356] text-[#1c1a16] rounded-full text-[0.95rem] font-bold tracking-[0.02em] transition-all duration-300 hover:bg-[#e0b772] hover:-translate-y-0.5 hover:drop-shadow-[0_8px_20px_rgba(210,163,86,0.4)]">
                    Request Free Session <ArrowRight size={18} />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* TEAMS & MAP */}
          <div ref={teamRef} className="flex flex-col gap-6 lg:pt-8">
            <div className={`fade-up ${teamVisible ? 'in' : ''}`}>
              <p className="font-dm text-[0.72rem] font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-2 flex items-center gap-2">
                <span className="w-5 h-[1px] bg-[#d2a356] inline-block" /> Support Ecosystem
              </p>
              <h3 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-[#1c1a16] leading-[1.15] mb-4 md:mb-5">
                Partners, not <em className="text-[#811816] italic">just suppliers.</em>
              </h3>
              <p className="font-dm text-[0.9rem] md:text-[0.95rem] font-light leading-[1.8] text-[#5a5648] mb-2">
                Every consultation connects you directly with our Kenyan B2B and Clinical Support teams to ensure your business thrives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {supportTeams.map((p, i) => (
                <div key={i} className={`bg-white border border-[#ede8df] rounded-3xl p-5 flex gap-4 items-center transition-all duration-300 hover:shadow-[0_20px_44px_-10px_rgba(129,24,22,0.08)] hover:border-[#d2a356]/30 hover:-translate-y-1 fade-up ${teamVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                  {/* Initials circle */}
                  <div className="w-[60px] h-[60px] rounded-full bg-[#4a0e0d] flex items-center justify-center text-[#d2a356] text-xl font-serif shrink-0 border-[3px] border-[#fcf5f5] shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#811816_0%,transparent_70%)] opacity-50" />
                    <span className="relative z-10">{getInitials(p.name)}</span>
                  </div>
                  <div>
                    <h4 className="text-[1.1rem] font-normal text-[#1c1a16] mb-1">{p.name}</h4>
                    <p className="font-dm text-[0.7rem] font-medium text-[#811816] tracking-[0.06em] uppercase mb-1.5">{p.title}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => <Star key={j} size={11} className="fill-[#d2a356] text-[#d2a356]" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Google Map Hub */}
            <div className={`mt-4 rounded-[2rem] overflow-hidden border-[1.5px] border-[#ede8df] bg-white shadow-sm fade-up delay-300 ${teamVisible ? 'in' : ''}`}>
              <div className="p-5 border-b border-[#ede8df] flex items-start gap-3 bg-[#fcf5f5]/50">
                <Navigation size={18} className="text-[#811816] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-[#1c1a16] text-[0.95rem]">Cargen House Headquarters</h4>
                  <p className="font-dm text-[0.8rem] text-[#8a8070] mt-0.5">Suite M203, Mezzanine Floor, Harambee Avenue, Nairobi.</p>
                </div>
              </div>
              {/* Google Maps iFrame */}
              <div className="w-full h-[220px] bg-stone-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816654215233!2d36.82025171475399!3d-1.2835266990635467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d7a6411085%3A0xc34575f0a0d0a751!2sCargen%20House%2C%20Harambee%20Ave%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Cargen House Location"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Consultations;
