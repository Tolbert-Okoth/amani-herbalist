import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Truck, Plus, ArrowRight, Star, Leaf, Wind, Droplets, FlameKindling, ChevronDown } from 'lucide-react';
import api from '../api';

/* ─── tiny hook: triggers once element enters viewport ─── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); } 
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ─── animated counter ─── */
const Counter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 60);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(t); }
      else setCount(start);
    }, 20);
    return () => clearInterval(t);
  }, [visible, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Data ─── */
const testimonials = [
  { name: 'Wanjiru M.', location: 'Nairobi', rating: 5, text: "I've struggled with low energy for years. After two weeks of the Qi Restore tonic, I feel like myself again. The quality is exceptional." },
  { name: 'Otieno K.', location: 'Kisumu', rating: 5, text: "As someone who practices holistic living, I was skeptical. But these formulas are the real thing — authentic, potent, and beautifully packaged." },
  { name: 'Fatuma A.', location: 'Mombasa', rating: 5, text: "The sleep formula changed my life. No more tossing and turning. Pure herbal wisdom in every sip. M-Pesa payment made it so easy too." },
  { name: 'Muthoni G.', location: 'Eldoret', rating: 5, text: "My grandmother used similar herbs growing up. Finding this store felt like coming home. Genuine TCM knowledge with Kenyan roots." },
];

const benefits = [
  { icon: Leaf, title: 'Pure Botanicals', desc: 'Every ingredient is ethically sourced, third-party tested, and free from synthetic additives or fillers.' },
  { icon: Wind, title: 'Qi Circulation', desc: 'Formulas designed around the flow of vital energy — balancing organ systems for whole-body harmony.' },
  { icon: Droplets, title: 'Yin Nourishment', desc: "Deep hydration at the cellular level, replenishing the body's fluids and cooling excess heat." },
  { icon: FlameKindling, title: 'Yang Activation', desc: 'Warming herbs that ignite metabolic fire, dispel cold patterns, and restore physical vitality.' },
];

const pillars = [
  { number: '01', heading: 'Rooted in Tradition', body: 'Our formulas trace directly to classical Chinese pharmacopoeia, some unchanged for over 1,000 years. We respect what time has proven.' },
  { number: '02', heading: 'Adapted for Africa', body: "Kenya's altitude, climate, and diet create unique constitutional patterns. Our practitioners understand local bodies, not just ancient texts." },
  { number: '03', heading: 'Transparent Sourcing', body: 'Every batch carries a QR code linking to its origin farm, harvest date, and lab test results. Radical transparency.' },
];

/* ═══════════════════════════════════════════════════════════ */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [heroRef, heroVisible] = useInView(0.05);
  const [benefitsRef, benefitsVisible] = useInView();
  const [philosophyRef, philosophyVisible] = useInView();
  const [productsRef, productsVisible] = useInView();
  const [testimonialsRef, testimonialsVisible] = useInView();
  const [newsletterRef, newsletterVisible] = useInView();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setFeaturedProducts(response.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] overflow-x-hidden">

      {/* ════════ 1. HERO ════════ */}
      <section ref={heroRef} className="relative flex flex-col justify-center min-h-[100svh] px-6 pt-28 pb-16 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] max-w-[700px] aspect-square rounded-full bg-[radial-gradient(circle,#d6e8da_0%,transparent_70%)] opacity-45 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] max-w-[400px] aspect-square rounded-full bg-[radial-gradient(circle,#e8ddc8_0%,transparent_70%)] opacity-50 pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-16 items-center z-10">
          
          {/* LEFT: Typography */}
          <div>
            <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-6 flex items-center gap-3 fade-up ${heroVisible ? 'in' : ''}`}>
              <span className="w-8 h-[1px] bg-[#4a7c59] inline-block" />
              Traditional Chinese Medicine · Kenyan Wellness
            </p>

            <h1 className={`text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1.08] tracking-[-0.01em] text-[#1c1a16] mb-7 fade-up delay-100 ${heroVisible ? 'in' : ''}`}>
              Ancient Wisdom<br />
              for Modern<br />
              <em className="italic text-[#2c4c3b]">Kenyan Living.</em>
            </h1>

            <p className={`font-dm text-base font-light leading-relaxed text-[#5a5648] max-w-md mb-10 fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
              Restore balance to your Qi with time-honored herbal formulas, carefully crafted to nurture your body's natural vitality and inner harmony.
            </p>

            <div className={`flex flex-wrap gap-4 mb-12 fade-up delay-300 ${heroVisible ? 'in' : ''}`}>
              <Link to="/shop" className="font-dm inline-flex items-center gap-2 px-8 py-3.5 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#2c4c3b] hover:-translate-y-1">
                Shop the Collection <ArrowRight size={16} />
              </Link>
              <Link to="/philosophy" className="font-dm inline-flex items-center px-8 py-3.5 border-[1.5px] border-[#c8b89a] text-[#3a3630] rounded-full text-sm transition-all duration-300 hover:border-[#2c4c3b] hover:text-[#2c4c3b]">
                Our Philosophy
              </Link>
            </div>

            {/* Social Proof */}
            <div className={`font-dm flex items-center gap-4 fade-up delay-500 ${heroVisible ? 'in' : ''}`}>
              <div className="flex -space-x-2.5">
                {[1,5,3,8].map((n,i) => (
                  <img key={i} src={`https://i.pravatar.cc/80?img=${n}`} alt="Customer" className="w-9 h-9 rounded-full border-2 border-[#f7f4ef] object-cover" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_,i) => <Star key={i} size={11} className="fill-[#c8a855] text-[#c8a855]" />)}
                </div>
                <p className="text-xs text-[#6b6358]">Trusted by <strong className="text-[#1c1a16]">5,000+</strong> Kenyans</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className={`relative fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
            <div className="blob-mask overflow-hidden aspect-[4/5] bg-[#ddd]">
              <img src="https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Herbal apothecary" className="block w-full h-full object-cover" />
            </div>
            
            {/* Floating Badges */}
            <div className="font-dm absolute bottom-[8%] left-[-5%] bg-white rounded-2xl p-4 shadow-[0_16px_40px_rgba(28,26,22,0.12)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f0ea] flex items-center justify-center">
                <ShieldCheck size={18} className="text-[#4a7c59]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1c1a16] leading-tight">GMP Certified</p>
                <p className="text-[0.7rem] text-[#8a8070]">Lab-verified purity</p>
              </div>
            </div>
            
            <div className="font-dm absolute top-[10%] right-[-5%] bg-[#1c2e1f] rounded-2xl p-4 shadow-[0_16px_40px_rgba(28,26,22,0.2)] text-[#f7f4ef]">
              <p className="text-2xl font-semibold leading-none"><Counter end={1200} suffix="+" /></p>
              <p className="text-[0.7rem] font-light opacity-75 mt-1">Formulas trusted</p>
            </div>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-45 animate-bounce">
          <p className="font-dm text-[0.65rem] tracking-[0.15em] uppercase">Scroll</p>
          <ChevronDown size={14} />
        </div>
      </section>

      {/* ════════ 2. TRUST MARQUEE ════════ */}
      <div className="bg-[#1c2e1f] py-4 overflow-hidden">
        <div className="flex gap-16 animate-marquee whitespace-nowrap font-dm text-[#a8c5a0] text-[0.78rem] tracking-[0.12em] uppercase">
          {[...Array(2)].map((_, outer) => (
            <span key={outer} className="flex gap-16 pr-16">
              {['GMP Certified Formulas', 'Lipa na M-Pesa', 'Free Delivery over KES 10,000', 'Ethically Sourced Herbs', 'TCM Practitioner Formulated', 'No Synthetic Additives', '5,000+ Happy Customers'].map((t,i) => (
                <span key={i} className="flex items-center gap-4 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-[#4a7c59]" />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ 3. BENEFITS ════════ */}
      <section ref={benefitsRef} className="py-28 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 items-start">
            
            <div className={`col-span-1 fade-up ${benefitsVisible ? 'in' : ''}`}>
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-4 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#4a7c59]" /> The Science of Balance
              </p>
              <h2 className="text-[clamp(2.2rem,3.5vw,3.2rem)] font-light leading-[1.15] text-[#1c1a16] mb-5">
                Four Pillars of<br /><em className="text-[#2c4c3b]">Herbal Wisdom</em>
              </h2>
              <p className="font-dm text-[0.95rem] font-light leading-relaxed text-[#5a5648] max-w-[280px]">
                TCM theory identifies four core functions that govern your body's energy landscape.
              </p>
            </div>

            {benefits.map((b, i) => (
              <div key={i} className={`bg-white rounded-3xl p-8 border border-[#ede8df] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(74,124,89,0.18)] hover:-translate-y-1.5 fade-up ${benefitsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[#e8f0ea] flex items-center justify-center mb-5">
                  <b.icon size={22} className="text-[#4a7c59]" />
                </div>
                <h3 className="text-xl font-medium text-[#1c1a16] mb-2.5">{b.title}</h3>
                <p className="font-dm text-[0.88rem] font-light leading-relaxed text-[#7a7060]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 4. FEATURED PRODUCTS ════════ */}
      <section ref={productsRef} className="py-28 px-6 bg-[#f0ece3]">
        <div className="max-w-7xl mx-auto">
          
          <div className={`flex flex-wrap items-end justify-between gap-4 mb-14 fade-up ${productsVisible ? 'in' : ''}`}>
            <div>
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-3 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#4a7c59]" /> Featured Collection
              </p>
              <h2 className="text-[clamp(2.2rem,3.5vw,3.5rem)] font-light leading-[1.1] text-[#1c1a16]">
                Time-Honored<br /><em className="text-[#2c4c3b]">Remedies</em>
              </h2>
            </div>
            <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[#2c4c3b] text-sm font-medium pb-1 border-b border-[#4a7c59]">
              View full apothecary <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="font-dm flex items-center justify-center py-20 text-[#8a8070] gap-3">
              <div className="w-7 h-7 border-2 border-[#e0d8cc] border-t-[#4a7c59] rounded-full animate-spin" />
              Consulting the ancient texts…
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="font-dm p-16 text-center text-[#8a8070] border border-dashed border-[#c8b89a] rounded-3xl">
              No products found in the database yet.
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {featuredProducts.map((product, i) => (
                <Link to={`/product/${product.id}`} key={product.id} className={`flex flex-col bg-white rounded-[1.75rem] overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_60px_-10px_rgba(28,26,22,0.14)] group fade-up ${productsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                  
                  {/* Image Area */}
                  <div className="aspect-square bg-[#f0ece3] relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Leaf size={48} className="text-[#c8b89a]" />
                      </div>
                    )}
                    <span className="font-dm absolute top-4 left-4 bg-[#f7f4ef]/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.7rem] font-medium text-[#2c4c3b] tracking-wider">
                      {product.tcm_function_tag || 'Wellness'}
                    </span>
                  </div>

                  {/* Body Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-medium leading-[1.3] text-[#1c1a16] mb-2 flex-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ede8df]">
                      <span className="font-dm text-lg font-medium text-[#1c1a16]">
                        KES {Number(product.price_kes).toLocaleString()}
                      </span>
                      <button className="w-9 h-9 rounded-full bg-[#f0ece3] text-[#3a3630] flex items-center justify-center transition-all duration-300 group-hover:bg-[#1c2e1f] group-hover:text-white group-hover:rotate-90">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ 5. PHILOSOPHY ════════ */}
      <section ref={philosophyRef} className="py-28 px-6 bg-[#1c2e1f] text-[#f7f4ef] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#2c4c3b_0%,transparent_70%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`mb-16 fade-up ${philosophyVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#a8c5a0] mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[#a8c5a0]" /> Our Philosophy
            </p>
            <h2 className="text-[clamp(2.2rem,3.5vw,3.5rem)] font-light leading-[1.15] max-w-xl">
              Where <em className="text-[#a8c5a0]">5,000 years</em> of wisdom meets the African sun.
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[1px] bg-[#2c4c3b] rounded-3xl overflow-hidden">
            {pillars.map((p, i) => (
              <div key={i} className={`bg-[#1c2e1f] p-10 transition-all duration-300 hover:bg-[#152317] hover:-translate-y-1 fade-up ${philosophyVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <p className="font-dm text-xs tracking-[0.15em] text-[#4a7c59] mb-6 font-medium">{p.number}</p>
                <h3 className="text-2xl font-normal mb-3 leading-tight">{p.heading}</h3>
                <p className="font-dm text-sm font-light leading-relaxed text-[#8a9e8c] transition-colors duration-300 hover:text-[#c8c0b4]">{p.body}</p>
              </div>
            ))}
          </div>

          <div className={`mt-12 flex flex-wrap gap-12 items-center fade-up delay-300 ${philosophyVisible ? 'in' : ''}`}>
            <div className="flex flex-wrap gap-12">
              {[['5,000+', 'Kenyan Customers'], ['38', 'TCM Formulas'], ['12', 'Source Farms']].map(([n, l], i) => (
                <div key={i}>
                  <p className="text-[clamp(2rem,3vw,2.8rem)] font-light text-[#f7f4ef] leading-none">
                    <Counter end={parseInt(n)} suffix={n.includes('+') ? '+' : ''} />
                  </p>
                  <p className="font-dm text-xs text-[#8a9e8c] mt-2 font-light">{l}</p>
                </div>
              ))}
            </div>
            <Link to="/philosophy" className="font-dm ml-auto inline-flex items-center gap-2 px-8 py-3.5 border-[1.5px] border-[#4a7c59] text-[#a8c5a0] rounded-full text-sm transition-all duration-300 hover:bg-[#4a7c59] hover:text-white">
              Read Our Full Story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 6. TESTIMONIALS ════════ */}
      <section ref={testimonialsRef} className="py-28 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">
          
          <div className={`text-center mb-16 fade-up ${testimonialsVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-4 flex items-center justify-center gap-2">
              <span className="w-6 h-[1px] bg-[#4a7c59]" /> What Our Community Says <span className="w-6 h-[1px] bg-[#4a7c59]" />
            </p>
            <h2 className="text-[clamp(2.2rem,3.5vw,3.2rem)] font-light leading-[1.15] text-[#1c1a16]">
              Rooted in <em className="text-[#2c4c3b]">Real Results</em>
            </h2>
          </div>

          <div className={`max-w-3xl mx-auto mb-10 fade-up delay-100 ${testimonialsVisible ? 'in' : ''}`}>
            <div key={activeTestimonial} className="animate-[slideIn_0.4s_ease_forwards] bg-white border border-[#ede8df] rounded-[1.75rem] p-12 text-center">
              <div className="flex justify-center gap-1 mb-7">
                {[...Array(testimonials[activeTestimonial].rating)].map((_,i) => <Star key={i} size={16} className="fill-[#c8a855] text-[#c8a855]" />)}
              </div>
              <p className="text-[clamp(1.1rem,2vw,1.4rem)] font-light leading-relaxed text-[#2a2720] mb-8 italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex flex-col items-center gap-1">
                <img src={`https://i.pravatar.cc/80?img=${activeTestimonial + 10}`} alt={testimonials[activeTestimonial].name} className="w-11 h-11 rounded-full object-cover mb-2" />
                <p className="font-dm font-medium text-sm text-[#1c1a16]">{testimonials[activeTestimonial].name}</p>
                <p className="font-dm text-xs text-[#8a8070]">{testimonials[activeTestimonial].location}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2.5">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTestimonial(i)} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-[#1c2e1f] scale-150' : 'bg-[#c8b89a]'}`} 
              />
            ))}
          </div>

        </div>
      </section>

      {/* ════════ 7. NEWSLETTER ════════ */}
      <section ref={newsletterRef} className="py-24 px-6 bg-[#f0ece3]">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`fade-up ${newsletterVisible ? 'in' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-[#e8f0ea] flex items-center justify-center mx-auto mb-7">
              <Leaf size={26} className="text-[#4a7c59]" />
            </div>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-4">The Apothecary Circle</p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.2] text-[#1c1a16] mb-4">
              Herbal wisdom, delivered to your inbox.
            </h2>
            <p className="font-dm text-[0.95rem] font-light leading-relaxed text-[#5a5648] mb-10">
              Join 5,000+ Kenyans receiving seasonal wellness guides, early access to new formulas, and exclusive offers each month.
            </p>

            {subscribed ? (
              <div className="bg-[#e8f0ea] rounded-2xl p-6 border border-[#a8c5a0]">
                <p className="text-xl text-[#2c4c3b] mb-1">Welcome to the Circle 🌿</p>
                <p className="font-dm text-sm text-[#4a7c59] font-light">Your first seasonal guide is on its way.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 max-w-md mx-auto">
                <div className="flex bg-white border-[1.5px] border-[#e0d8cc] rounded-full overflow-hidden p-1 pl-5 gap-2 focus-within:border-[#4a7c59] transition-colors">
                  <input 
                    type="email" 
                    required 
                    placeholder="Your email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="font-dm flex-1 bg-transparent border-none outline-none text-sm text-[#1c1a16] font-light min-w-0" 
                  />
                  <button type="submit" className="font-dm px-6 py-3 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-sm font-medium transition-colors hover:bg-[#2c4c3b] whitespace-nowrap">
                    Join Free
                  </button>
                </div>
                <p className="font-dm text-xs text-[#8a8070] font-light">No spam. Unsubscribe anytime. We respect your privacy.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════ 8. FOOTER STRIP ════════ */}
      <div className="bg-[#1c1a16] p-6 flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-wrap gap-6 justify-center">
          {[{ icon: ShieldCheck, text: 'GMP Certified' }, { icon: Smartphone, text: 'Lipa na M-Pesa' }, { icon: Truck, text: 'Free Delivery over KES 10,000' }].map(({ icon: Icon, text }, i) => (
            <div key={i} className="font-dm flex items-center gap-2 text-[#8a8070] text-xs font-light">
              <Icon size={14} className="text-[#4a7c59]" />
              {text}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;