import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, ArrowRight, Video, Phone, Clock, Star, Leaf, CheckCircle2 } from 'lucide-react';

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

const perks = [
  { icon: Video,    title: 'Video or Phone',      body: 'Choose the format that suits you — secure video calls or a simple phone consultation.' },
  { icon: Clock,    title: '45-Minute Session',   body: 'Dedicated time with a certified TCM practitioner to assess your unique constitution.' },
  { icon: Leaf,     title: 'Custom Formula Plan', body: "Leave with a personalised herbal regimen mapped to your body's specific patterns." },
  { icon: Calendar, title: 'Flexible Scheduling', body: 'Morning and evening slots available six days a week across Kenyan time zones.' },
];

const practitioners = [
  { name: 'Amara Njoroge', title: 'Head TCM Practitioner', img: 'https://i.pravatar.cc/200?img=47', rating: 4.9, reviews: 214 },
  { name: 'Dr. Kipchoge Ruto', title: 'Herbal Pharmacologist', img: 'https://i.pravatar.cc/200?img=53', rating: 4.8, reviews: 178 },
];

const Consultations = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ fname: '', lname: '', email: '', phone: '', concern: '', type: 'video' });

  const [heroRef, heroVisible]   = useInView(0.05);
  const [perksRef, perksVisible] = useInView();
  const [formRef, formVisible]   = useInView();
  const [teamRef, teamVisible]   = useInView();

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh]">

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pt-32 pb-20">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] max-w-[700px] aspect-square rounded-full bg-[radial-gradient(circle,#d6e8da_0%,transparent_70%)] opacity-50 pointer-events-none" />

        <div className="max-w-[760px] mx-auto text-center relative z-10">
          <p className={`font-dm text-[0.72rem] font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-5 flex items-center justify-center gap-3 fade-up ${heroVisible ? 'in' : ''}`}>
            <span className="w-6 h-[1px] bg-[#4a7c59] inline-block" /> Expert Guidance <span className="w-6 h-[1px] bg-[#4a7c59] inline-block" />
          </p>
          <h1 className={`text-[clamp(2.8rem,6vw,5rem)] font-light leading-[1.08] tracking-[-0.015em] text-[#1c1a16] mb-6 fade-up delay-[80ms] ${heroVisible ? 'in' : ''}`}>
            Book a Private<br /><em className="text-[#2c4c3b] italic">Consultation.</em>
          </h1>
          <p className={`font-dm text-[1.05rem] font-light leading-[1.8] text-[#5a5648] max-w-[560px] mx-auto fade-up delay-[180ms] ${heroVisible ? 'in' : ''}`}>
            Not sure which remedy is right for your body's constitution? Speak with our certified TCM practitioners to create a tailored herbal regimen — from anywhere in Kenya.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════
          PERKS GRID
      ══════════════════════════════ */}
      <section ref={perksRef} className="px-6 pb-20 bg-[#f7f4ef]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {perks.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className={`bg-white border border-[#ede8df] rounded-[22px] p-7 transition-all duration-300 hover:shadow-[0_18px_40px_-10px_rgba(74,124,89,0.15)] hover:-translate-y-1 fade-up ${perksVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
              <div className="w-11 h-11 rounded-[13px] bg-[#e8f0ea] flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#4a7c59]" />
              </div>
              <h3 className="text-[1.1rem] font-normal text-[#1c1a16] mb-2">{title}</h3>
              <p className="font-dm text-[0.83rem] font-light leading-[1.7] text-[#7a7060]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          FORM + PRACTITIONERS
      ══════════════════════════════ */}
      <section ref={formRef} className="px-6 pb-24 bg-[#f0ece3]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 items-start pt-12">

          {/* FORM */}
          <div className={`bg-white rounded-[32px] p-[clamp(2rem,5vw,3rem)] border border-[#ede8df] shadow-[0_24px_60px_rgba(28,26,22,0.07)] fade-up ${formVisible ? 'in' : ''}`}>
            {submitted ? (
              <div className="text-center py-12 px-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-[#e8f0ea] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={28} className="text-[#4a7c59]" />
                </div>
                <h3 className="text-[1.8rem] font-light text-[#1c1a16] mb-3">Request Received</h3>
                <p className="font-dm text-[0.9rem] font-light leading-[1.75] text-[#5a5648]">
                  Our team will contact you within 24 hours to confirm your appointment. Check your inbox for a confirmation email.
                </p>
              </div>
            ) : (
              <>
                <p className="font-dm text-[0.7rem] font-medium tracking-[0.16em] uppercase text-[#4a7c59] mb-2">Get Started</p>
                <h2 className="text-[clamp(1.7rem,3vw,2.2rem)] font-light text-[#1c1a16] mb-8 leading-[1.2]">
                  Request an<br /><em className="text-[#2c4c3b]">Appointment</em>
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input type="text" required id="fn" placeholder="First Name" value={form.fname} onChange={set('fname')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                      <label htmlFor="fn" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">First Name</label>
                    </div>
                    <div className="relative">
                      <input type="text" required id="ln" placeholder="Last Name" value={form.lname} onChange={set('lname')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                      <label htmlFor="ln" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Last Name</label>
                    </div>
                  </div>

                  <div className="relative">
                    <input type="email" required id="em" placeholder="Email" value={form.email} onChange={set('email')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="em" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Email Address</label>
                  </div>

                  <div className="relative">
                    <input type="tel" id="ph" placeholder="Phone" value={form.phone} onChange={set('phone')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-5 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="ph" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Phone Number (optional)</label>
                  </div>

                  {/* consultation type */}
                  <div>
                    <p className="font-dm text-[0.75rem] font-medium text-[#8a8070] tracking-[0.08em] uppercase mb-2.5">Preferred Format</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[{ v: 'video', icon: Video, label: 'Video Call' }, { v: 'phone', icon: Phone, label: 'Phone Call' }].map(({ v, icon: Icon, label }) => (
                        <button key={v} type="button" onClick={() => setForm(p => ({ ...p, type: v }))} 
                          className={`font-dm flex items-center justify-center gap-2 p-3 rounded-2xl border-[1.5px] text-[0.82rem] font-normal cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                            form.type === v ? 'bg-[#1c2e1f] border-[#1c2e1f] text-[#f7f4ef]' : 'bg-[#faf8f4] border-[#ede8df] text-[#5a5648]'
                          }`}>
                          <Icon size={15} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <textarea rows={4} required id="cc" placeholder="Concern" value={form.concern} onChange={set('concern')} className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-6 pb-2 px-4 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none resize-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="cc" className="absolute left-4 top-4 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-2 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">What are you seeking help with?</label>
                  </div>

                  <button type="submit" className="font-dm mt-2 flex items-center justify-center gap-2 p-4 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-[0.92rem] font-medium tracking-[0.02em] transition-all duration-300 hover:bg-[#2c4c3b] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(28,46,31,0.22)]">
                    Submit Request <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* PRACTITIONERS */}
          <div ref={teamRef} className="flex flex-col gap-6 pt-6 md:pt-14">
            <div className={`fade-up ${teamVisible ? 'in' : ''}`}>
              <p className="font-dm text-[0.72rem] font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-2 flex items-center gap-2">
                <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" /> Your Practitioners
              </p>
              <h3 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-[#1c1a16] leading-[1.15] mb-5">
                Practitioners, not <em className="text-[#2c4c3b]">chatbots.</em>
              </h3>
              <p className="font-dm text-[0.9rem] font-light leading-[1.8] text-[#5a5648] mb-2">
                Every consultation is with a human TCM clinician — no AI-generated advice, no generic wellness scripts.
              </p>
            </div>

            {practitioners.map((p, i) => (
              <div key={i} className={`bg-white border border-[#ede8df] rounded-3xl p-6 flex gap-5 items-center transition-all duration-300 hover:shadow-[0_20px_44px_-10px_rgba(28,26,22,0.12)] hover:-translate-y-1 fade-up ${teamVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <img src={p.img} alt={p.name} className="w-[68px] h-[68px] rounded-full object-cover shrink-0" />
                <div>
                  <h4 className="text-[1.15rem] font-normal text-[#1c1a16] mb-1">{p.name}</h4>
                  <p className="font-dm text-[0.72rem] font-medium text-[#4a7c59] tracking-[0.06em] uppercase mb-2">{p.title}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_,j) => <Star key={j} size={11} className="fill-[#c8a855] text-[#c8a855]" />)}
                    <span className="font-dm text-[0.75rem] text-[#8a8070] ml-1">{p.rating} · {p.reviews} sessions</span>
                  </div>
                </div>
              </div>
            ))}

            {/* mini trust note */}
            <div className={`bg-[#1c2e1f] rounded-[22px] p-6 flex gap-4 items-start fade-up delay-300 ${teamVisible ? 'in' : ''}`}>
              <MessageSquare size={20} className="text-[#a8c5a0] shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-normal text-[#f7f4ef] mb-1">Confidential & secure</p>
                <p className="font-dm text-[0.82rem] font-light text-[#8a9e8c] leading-[1.65]">All consultations are private. Your health information is never shared without your explicit consent.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Consultations;