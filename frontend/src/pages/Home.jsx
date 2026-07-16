import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Truck, Plus, ArrowRight, Star, Leaf, FlameKindling, Sun, Sprout, Quote, FileText, Users, Calendar, MapPin } from 'lucide-react';
import api from '../api';
import BioVitalityQuiz from '../components/BioVitalityQuiz';

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

/* ─── initials helper ─── */
const getInitials = (name) => {
  const parts = name.replace('Dr. ', '').split(' ');
  return parts.map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

/* ─── Data ─── */
const testimonials = [
  {
    name: 'Dr. Kamau N.',
    location: 'Clinic Owner, Nairobi',
    rating: 5,
    text: "We stock three of Fohow's immune formulas in our pharmacy. Our clients keep coming back — the quality speaks for itself. Ordering wholesale has been seamless."
  },
  {
    name: 'Sarah Wanjiku',
    location: 'Pharmacy Director, Kisumu',
    rating: 5,
    text: "The B2B pricing structure is exceptional. Fohow's Linchzhi capsules are our top-moving premium product, and the Halal certification gives our clients complete peace of mind."
  },
  {
    name: 'Dr. Omondi',
    location: 'TCM Practitioner, Mombasa',
    rating: 5,
    text: "The physical consultations at Cargen House changed how we prescribe. The knowledge transfer regarding the Nourish pillar and Cordyceps is world-class."
  }
];

const benefits = [
  { icon: FlameKindling, title: 'Remarkable Effectiveness', desc: 'Every formulation must deliver clear, measurable results. We only bring products forward if they demonstrably improve your health.' },
  { icon: Leaf, title: 'Natural & Safe', desc: 'Our products utilize 100% natural, pure herbal ingredients that are proven safe and effective for long-term daily use.' },
  { icon: ShieldCheck, title: 'Advanced Technology', desc: 'Exclusive, 5,500-year-old TCM formulations combined with modern biotechnology to maintain maximum potency and absorption.' },
  { icon: Sun, title: 'Psychological Nourishment', desc: 'True health begins in the mind. Fohow promotes mental regulation, stress management, and a positive mindset.' },
];

const pillars = [
  { number: '01', heading: 'Cleansing (Qing)', body: 'The first step: Remove toxins, waste, and blockages caused by poor diet, stress, and pollution to prepare the body.' },
  { number: '02', heading: 'Regulating (Tiao)', body: 'Restore balance and harmony in the organs, Qi, and Yin-Yang, bringing internal systems back to their natural, optimal state.' },
  { number: '03', heading: 'Supplementing (Bu)', body: 'Rebuild strength, boost immunity, and deeply nourish vitality once the body is clean and perfectly balanced.' },
];

/* ═══════════════════════════════════════════════════════════ */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [regionalAds, setRegionalAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [heroRef, heroVisible] = useInView(0.05);
  const [benefitsRef, benefitsVisible] = useInView();
  const [philosophyRef, philosophyVisible] = useInView();
  const [productsRef, productsVisible] = useInView();
  const [testimonialsRef, testimonialsVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/products');
        if (response.ok && response.data) {
          const allProducts = response.data;
          
          // 1. Find explicitly featured products
          const featured = allProducts.filter(p => p.is_featured === true || p.is_featured === 'true');
          
          // 2. Pad to exactly 3 layout items to prevent the CSS grid from breaking
          let finalDisplay = [...featured];
          if (finalDisplay.length < 3) {
            const nonFeatured = allProducts.filter(p => p.is_featured !== true && p.is_featured !== 'true');
            finalDisplay = [...finalDisplay, ...nonFeatured];
          }

          setFeaturedProducts(finalDisplay.slice(0, 3));
          setStats({ totalProducts: allProducts.length || 38 });
        }

        const adsResponse = await api.get('/regional-ads');
        if (adsResponse.ok && Array.isArray(adsResponse.data)) {
          const activeAds = adsResponse.data.filter(ad => ad.is_active);
          setRegionalAds(activeAds);
        }

      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (regionalAds.length <= 1) return;
    const t = setInterval(() => setCurrentAdIndex(p => (p + 1) % regionalAds.length), 5000);
    return () => clearInterval(t);
  }, [regionalAds.length]);

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] overflow-x-hidden">

      {/* ════════ 1. HERO ════════ */}
      <section ref={heroRef} className="relative flex flex-col justify-center min-h-[85svh] px-6 pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">

        <div className="absolute top-[-20%] right-[-10%] w-[70vw] max-w-[700px] aspect-square rounded-full bg-[radial-gradient(circle,#fdf8ef_0%,transparent_70%)] opacity-70 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] max-w-[400px] aspect-square rounded-full bg-[radial-gradient(circle,#fcf5f5_0%,transparent_70%)] opacity-80 pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8 md:gap-12 items-center z-10">

          <div>
            <p className={`font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-4 flex items-center gap-3 fade-up ${heroVisible ? 'in' : ''} drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]`}>
              <span className="w-8 h-[1px] bg-[#d2a356] inline-block" />
              Traditional Chinese Medicine · Kenyan Wellness
            </p>

            <h1 className={`text-[clamp(2.8rem,5.5vw,5rem)] font-light leading-[1.08] tracking-[-0.01em] text-[#1c1a16] mb-5 fade-up delay-100 ${heroVisible ? 'in' : ''}`}>
              Ancient Wisdom<br />
              for Modern<br />
              <em className="italic text-[#811816]">Kenyan Living.</em>
            </h1>

            <p className={`font-dm text-[0.95rem] font-light leading-relaxed text-[#5a5648] max-w-md mb-8 fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
              Restore balance to your Qi with time-honored herbal formulas, carefully crafted to nurture your body's natural vitality and inner harmony.
            </p>

            <div className={`flex flex-wrap gap-4 mb-10 fade-up delay-300 ${heroVisible ? 'in' : ''}`}>
              <Link to="/shop" className="font-dm inline-flex items-center gap-2 px-8 py-3 bg-[#811816] text-[#f7f4ef] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#6a1210] hover:-translate-y-1 hover:drop-shadow-[0_4px_12px_rgba(129,24,22,0.3)]">
                Shop the Collection <ArrowRight size={16} />
              </Link>
              <Link to="/philosophy" className="font-dm inline-flex items-center px-8 py-3 border-[1.5px] border-[#d2a356] text-[#3a3630] rounded-full text-sm transition-all duration-300 hover:border-[#811816] hover:text-[#811816]">
                Our Philosophy
              </Link>
            </div>

            <div className={`font-dm flex items-center gap-4 fade-up delay-500 ${heroVisible ? 'in' : ''}`}>
              <div className="flex -space-x-2.5">
                {['WM', 'OK', 'FA', 'MG'].map((initials, i) => {
                  const hues = ['#811816', '#6a1210', '#a0201d', '#4a0e0d'];
                  return (
                    <div key={i} style={{ backgroundColor: hues[i] }} className="w-9 h-9 rounded-full border-2 border-[#f7f4ef] flex items-center justify-center text-white text-[0.58rem] font-bold shrink-0 shadow-sm">
                      {initials}
                    </div>
                  );
                })}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-[#d2a356] text-[#d2a356]" />)}
                </div>
                <p className="text-xs text-[#6b6358]">Trusted by <strong className="text-[#1c1a16]">500+</strong> Businesses</p>
              </div>
            </div>
          </div>

          <div className={`relative fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
            <div className="blob-mask overflow-hidden aspect-[4/5] bg-[#2a0808] relative group">
              <video
                src="/hero-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(106,18,16,0.2)_0%,rgba(42,8,8,0.4)_60%,rgba(26,5,4,0.6)_100%)] pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[80%] aspect-square rounded-full border-[40px] border-[#811816]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-[55%] aspect-square rounded-full border-[20px] border-[#d2a356]" />
              </div>
            </div>

            <div className="font-dm absolute bottom-[8%] left-[-5%] bg-white rounded-2xl p-4 shadow-[0_16px_40px_rgba(129,24,22,0.08)] flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-full bg-[#fcf5f5] flex items-center justify-center border border-[#811816]/5">
                <ShieldCheck size={18} className="text-[#811816]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1c1a16] leading-tight">GMP Certified</p>
                <p className="text-[0.7rem] text-[#8a8070]">Lab-verified purity</p>
              </div>
            </div>

            <div className="font-dm absolute top-[10%] right-[-5%] bg-[#4a0e0d] rounded-2xl p-4 shadow-[0_16px_40px_rgba(129,24,22,0.15)] text-[#f7f4ef] hover:-translate-y-1 transition-transform border border-[#811816]/30">
              <p className="text-2xl font-semibold leading-none text-[#d2a356]"><Counter end={stats.totalProducts} suffix="+" /></p>
              <p className="text-[0.7rem] font-light opacity-80 mt-1 text-[#e8d5d5]">Formulas in stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 2. TRUST MARQUEE ════════ */}
      <div className="bg-[#1a0504] py-3 overflow-hidden border-y-[2px] border-[#811816]/30">
        <div className="flex gap-16 animate-marquee whitespace-nowrap font-dm text-[#d2a356] text-[0.78rem] tracking-[0.12em] uppercase opacity-90 transform-gpu will-change-transform">
          {[...Array(2)].map((_, outer) => (
            <span key={outer} className="flex gap-16 pr-16">
              {['5,500+ Years of TCM Wisdom', 'Lipa na M-Pesa', 'Cleanse, Regulate, Supplement', 'Scientific Modernization', 'Flat Rate Delivery', 'Remarkable Effectiveness', '500+ B2B Partners'].map((t, i) => (
                <span key={i} className="flex items-center gap-4 shrink-0 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d2a356] shadow-[0_0_4px_rgba(210,163,86,0.6)]" />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ 2.5 BIO-VITALITY QUIZ (CONVERSION ENGINE) ════════ */}
      <section className="bg-[#f7f4ef]">
        <BioVitalityQuiz />
      </section>

      {/* ════════ 3. BENEFITS ════════ */}
      <section ref={benefitsRef} className="py-16 md:py-20 px-6 bg-[#f7f4ef]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">

            <div className={`col-span-1 md:row-span-2 flex flex-col justify-center fade-up ${benefitsVisible ? 'in' : ''}`}>
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#811816] mb-3 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#811816]" /> The Fohow Standard
              </p>
              <h2 className="text-[clamp(2.2rem,3vw,3.2rem)] font-light leading-[1.15] text-[#1c1a16] mb-4">
                Uncompromising <br /><em className="text-[#811816]">Principles</em>
              </h2>
              <p className="font-dm text-[0.95rem] font-light leading-relaxed text-[#5a5648] max-w-[280px]">
                Every Fohow product and protocol is built upon strict rules for efficacy, purity, and holistic well-being.
              </p>
            </div>

            {benefits.map((b, i) => (
              <div key={i} className={`bg-white rounded-3xl p-6 md:p-8 border border-[#ede8df] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(129,24,22,0.08)] hover:border-[#d2a356]/40 hover:-translate-y-1.5 fade-up ${benefitsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[#fcf5f5] flex items-center justify-center mb-4 border border-[#811816]/5">
                  <b.icon size={22} className="text-[#811816]" />
                </div>
                <h3 className="text-[1.15rem] font-medium text-[#1c1a16] mb-2.5">{b.title}</h3>
                <p className="font-dm text-[0.88rem] font-light leading-relaxed text-[#7a7060]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 4. FEATURED PRODUCTS ════════ */}
      <section ref={productsRef} className="py-16 md:py-20 px-6 bg-[#f0ece3]">
        <div className="max-w-7xl mx-auto">

          <div className={`flex flex-wrap items-end justify-between gap-4 mb-10 fade-up ${productsVisible ? 'in' : ''}`}>
            <div>
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-3 flex items-center gap-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">
                <span className="w-6 h-[1px] bg-[#d2a356]" /> Featured Collection
              </p>
              <h2 className="text-[clamp(2.2rem,3vw,3.5rem)] font-light leading-[1.1] text-[#1c1a16]">
                Time-Honored<br /><em className="text-[#811816]">Remedies</em>
              </h2>
            </div>
            <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[#811816] text-sm font-medium pb-1 border-b border-[#811816] transition-colors hover:text-[#d2a356] hover:border-[#d2a356]">
              View full apothecary <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="font-dm flex items-center justify-center py-12 text-[#8a8070] gap-3">
              <div className="w-7 h-7 border-2 border-[#e0d8cc] border-t-[#811816] rounded-full animate-spin" />
              Consulting the ancient texts…
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="font-dm p-12 text-center text-[#8a8070] border border-dashed border-[#c8b89a] rounded-3xl">
              No products found in the database yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {featuredProducts.map((product, i) => (
                <Link to={`/product/${product.id}`} key={product.id} className={`flex flex-col bg-white rounded-[1.75rem] overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_60px_-10px_rgba(129,24,22,0.1)] hover:border-[#d2a356]/40 group fade-up ${productsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>

                  <div className="aspect-square bg-[#f0ece3] relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={api.getImageUrl(product.image_url)}
                        alt={product.name}
                        className="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Leaf size={48} className="text-[#c8b89a]" />
                      </div>
                    )}
                    <span className="font-dm absolute top-4 left-4 bg-[#f7f4ef]/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.7rem] font-medium text-[#811816] border border-[#811816]/10 tracking-wider">
                      {product.tcm_function_tag || 'Wellness'}
                    </span>
                  </div>

                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <h3 className="text-[1.15rem] font-medium leading-[1.3] text-[#1c1a16] mb-2 flex-1 group-hover:text-[#811816] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ede8df]">
                      <span className="font-dm text-lg font-medium text-[#1c1a16]">
                        KES {Number(product.price_kes).toLocaleString()}
                      </span>
                      <button className="w-9 h-9 rounded-full bg-[#f0ece3] text-[#3a3630] flex items-center justify-center transition-all duration-300 group-hover:bg-[#811816] group-hover:text-[#d2a356] group-hover:rotate-90 group-hover:drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]">
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
      <section ref={philosophyRef} className="py-16 md:py-20 px-6 bg-[#2a0808] text-[#f7f4ef] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#6a1210_0%,transparent_70%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`mb-10 fade-up ${philosophyVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-3 flex items-center gap-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">
              <span className="w-6 h-[1px] bg-[#d2a356]" /> The Practical Sequence
            </p>
            <h2 className="text-[clamp(2.2rem,3vw,3.5rem)] font-light leading-[1.15] max-w-xl">
              The Three Pillars of <em className="text-[#d2a356] italic">Fohow TCM.</em>
            </h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[1px] bg-[#6a1210] rounded-3xl overflow-hidden shadow-2xl">
            {pillars.map((p, i) => (
              <div key={i} className={`bg-[#2a0808] p-8 md:p-10 transition-all duration-300 hover:bg-[#1a0504] hover:-translate-y-1 fade-up ${philosophyVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <p className="font-dm text-xs tracking-[0.15em] text-[#d2a356] mb-5 font-medium drop-shadow-[0_0_2px_rgba(210,163,86,0.5)]">{p.number}</p>
                <h3 className="text-xl md:text-2xl font-normal mb-2.5 leading-tight">{p.heading}</h3>
                <p className="font-dm text-[0.88rem] font-light leading-relaxed text-[#e8d5d5] transition-colors duration-300 hover:text-[#f7f4ef]">{p.body}</p>
              </div>
            ))}
          </div>

          <div className={`mt-10 flex flex-wrap gap-8 items-center fade-up delay-300 ${philosophyVisible ? 'in' : ''}`}>
            <div className="flex flex-wrap gap-8 md:gap-12">
              {[['500+', 'B2B Partners'], [stats.totalProducts.toString(), 'TCM Formulas'], ['12', 'Source Farms']].map(([n, l], i) => (
                <div key={i}>
                  <p className="text-[clamp(1.8rem,2.5vw,2.5rem)] font-light text-[#d2a356] leading-none drop-shadow-[0_0_8px_rgba(210,163,86,0.3)]">
                    <Counter end={parseInt(n)} suffix={n.includes('+') ? '+' : ''} />
                  </p>
                  <p className="font-dm text-xs text-[#e8d5d5] mt-1.5 font-light opacity-80">{l}</p>
                </div>
              ))}
            </div>
            <Link to="/philosophy" className="font-dm ml-auto inline-flex items-center gap-2 px-8 py-3 border-[1.5px] border-[#d2a356] text-[#d2a356] rounded-full text-sm transition-all duration-300 hover:bg-[#d2a356] hover:text-[#1c1a16] hover:drop-shadow-[0_0_12px_rgba(210,163,86,0.5)]">
              Read Our Full Story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 6. TESTIMONIALS (Luxury Typography Version) ════════ */}
      <section ref={testimonialsRef} className="py-20 md:py-28 px-6 bg-tcm-lattice overflow-hidden">
        <div className="max-w-6xl mx-auto">

          <div className={`text-center mb-16 fade-up ${testimonialsVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#811816] mb-3 flex items-center justify-center gap-2">
              <span className="w-6 h-[1px] bg-[#811816]" /> What Our Community Says <span className="w-6 h-[1px] bg-[#811816]" />
            </p>
            <h2 className="text-[clamp(2.2rem,3vw,3.2rem)] font-light leading-[1.15] text-[#1c1a16]">
              Trusted by Kenyan <em className="text-[#811816] italic">Practitioners.</em>
            </h2>
          </div>

          <div className={`relative max-w-4xl mx-auto fade-up delay-100 ${testimonialsVisible ? 'in' : ''}`}>
            {/* Slider Container */}
            <div className="relative min-h-[450px] md:min-h-[300px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_12px_40px_rgba(28,26,22,0.06)] border border-[#ede8df] ${index === activeTestimonial ? 'opacity-100 translate-x-0 z-10' :
                      index < activeTestimonial ? 'opacity-0 -translate-x-full z-0' : 'opacity-0 translate-x-full z-0'
                    }`}
                >
                  {/* Luxury Typography Avatar */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full shrink-0 border-[6px] border-[#fcf5f5] shadow-[0_8px_24px_rgba(129,24,22,0.12)] bg-gradient-to-br from-[#811816] to-[#4a0e0d] flex items-center justify-center relative overflow-hidden">
                    <Leaf className="absolute w-20 h-20 text-white/5 -bottom-4 -right-4" />
                    <span className="font-garamond text-3xl md:text-5xl text-[#d2a356] font-medium drop-shadow-md">
                      {getInitials(testimonial.name)}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="text-center md:text-left flex-1 font-dm">
                    <Quote className="w-10 h-10 text-[#d2a356]/30 mb-4 mx-auto md:mx-0" />
                    <p className="text-[#5a5648] text-[0.95rem] md:text-lg font-light leading-relaxed mb-6 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-garamond text-xl md:text-2xl font-medium text-[#1c1a16]">{testimonial.name}</h4>
                        <p className="text-[0.7rem] md:text-[0.8rem] font-bold text-[#d2a356] uppercase tracking-widest mt-1">{testimonial.location}</p>
                      </div>
                      {/* Rating Stars */}
                      <div className="flex justify-center md:justify-end gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < Math.floor(testimonial.rating) ? "fill-[#d2a356] text-[#d2a356]" : "text-[#ede8df]"} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-10 relative z-20">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-[#811816] w-8' : 'bg-[#c8b89a] w-2.5 hover:bg-[#d2a356]'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════ 6.5 B2B RESOURCES CTA ════════ */}
      <section className="py-16 md:py-20 px-6 bg-white border-t border-[#ede8df]">
        <div className="max-w-6xl mx-auto bg-[#1a0504] rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-30%] right-[-10%] w-[50vw] max-w-[400px] aspect-square rounded-full bg-[#811816] opacity-30 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] max-w-[300px] aspect-square rounded-full bg-[#d2a356] opacity-20 blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
            <div className="text-center md:text-left flex-1 max-w-2xl">
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">B2B Clinic Hub</p>
              <h2 className="font-garamond text-3xl md:text-4xl lg:text-5xl font-light text-[#f7f4ef] mb-4">
                Clinical Resources & Seminars
              </h2>
              <p className="font-dm text-[0.95rem] md:text-lg font-light leading-relaxed text-[#e8d5d5]">
                Access our library of product guides, download franchise forms, and RSVP for our upcoming TCM practitioner seminars to scale your clinic's offerings.
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
              <Link to="/resources" className="font-dm inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#d2a356] text-[#1a0504] rounded-full text-[0.95rem] font-bold transition-all duration-300 hover:bg-[#e0b772] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(210,163,86,0.4)] w-full md:w-auto">
                Access Resource Center <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* DYNAMIC REGIONAL ADS CAROUSEL */}
          {regionalAds.length > 0 && (
            <div className="relative z-10 w-full rounded-2xl overflow-hidden shadow-2xl border border-[#d2a356]/30 bg-[#1c1a16] group">
              <div className="relative w-full aspect-[4/3] md:aspect-[21/9]">
                {regionalAds.map((ad, i) => (
                  <div 
                    key={ad.id} 
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${i === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <img 
                      src={api.getImageUrl(ad.flyer_url)} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Navigation Dots */}
                {regionalAds.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {regionalAds.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentAdIndex(i)}
                        className={`h-2 rounded-full transition-all shadow-sm ${i === currentAdIndex ? 'bg-[#d2a356] w-6' : 'bg-white/60 w-2 hover:bg-white'}`}
                        aria-label={`Go to ad ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════ 7. FINAL CTA (CONSULTATION) ════════ */}
      <section ref={ctaRef} className="py-16 md:py-20 px-6 bg-[#f0ece3]">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`fade-up ${ctaVisible ? 'in' : ''}`}>
            <div className="w-14 h-14 rounded-full bg-[#fcf5f5] flex items-center justify-center mx-auto mb-5 border border-[#811816]/10">
              <Sprout size={24} className="text-[#811816]" />
            </div>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">Partner With Us</p>
            <h2 className="text-[clamp(2rem,3vw,3rem)] font-light leading-[1.2] text-[#1c1a16] mb-4">
              Let's build your wholesale protocol.
            </h2>
            <p className="font-dm text-[0.95rem] font-light leading-relaxed text-[#5a5648] mb-8 max-w-lg mx-auto">
              Book a direct consultation with our TCM practitioners to discuss custom clinic formulations, B2B pricing tiers, and how to best integrate Fohow products into your practice.
            </p>

            <Link to="/consultations" className="font-dm inline-flex px-8 py-3.5 bg-[#d2a356] text-[#1c1a16] rounded-full text-[0.95rem] font-bold tracking-[0.02em] transition-all duration-300 hover:bg-[#e0b772] hover:-translate-y-0.5 hover:drop-shadow-[0_8px_20px_rgba(210,163,86,0.4)] whitespace-nowrap">
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 8. FOOTER STRIP ════════ */}
      <div className="bg-[#1a0504] p-5 flex flex-wrap items-center justify-center gap-5 border-t-[2px] border-[#811816]/30">
        <div className="flex flex-wrap gap-5 justify-center">
          {[{ icon: ShieldCheck, text: 'GMP Certified' }, { icon: Smartphone, text: 'Lipa na M-Pesa' }, { icon: Truck, text: 'Flat Rate Delivery' }].map(({ icon: Icon, text }, i) => (
            <div key={i} className="font-dm flex items-center gap-2 text-[#d2a356] text-[0.7rem] font-light opacity-90">
              <Icon size={14} className="text-[#811816]" />
              {text}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
