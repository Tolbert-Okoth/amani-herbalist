import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Leaf, Shield, Truck, RotateCcw, Star, ChevronDown } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';

/* ── updated fade-up hook that handles loading states ── */
const useInView = (threshold = 0.12) => {
  const [visible, setVisible] = useState(false);
  const [element, setElement] = useState(null); // Uses state so it knows when the DOM loads

  useEffect(() => {
    if (!element) return; // Waits until the loading screen is gone
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); } 
    }, { threshold });
    obs.observe(element);
    return () => obs.disconnect();
  }, [element, threshold]);

  return [setElement, visible];
};

/* ── static trust bullets ── */
const trusts = [
  { icon: Shield,    text: 'GMP Certified Formula' },
  { icon: Leaf,      text: 'No Synthetic Additives' },
  { icon: Truck,     text: 'Free delivery over KES 10,000' },
  { icon: RotateCcw, text: '30-Day Satisfaction Guarantee' },
];

/* ── static "how to use" accordion data ── */
const faqs = [
  { q: 'Suggested Use',       a: 'Take 2 capsules or 5 ml tincture twice daily, ideally 30 minutes before meals. Consistency over 4–6 weeks yields the best results.' },
  { q: 'Ingredients',         a: 'Each formula is crafted from concentrated whole-herb extracts standardised to active marker compounds. Full ingredient list printed on packaging.' },
  { q: 'Safety & Precautions', a: 'Consult a qualified TCM practitioner if pregnant, nursing, or on prescription medication. Keep out of reach of children.' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded]   = useState(false);
  const [openFaq, setOpenFaq]   = useState(null);
  const { addToCart } = useCart();

  const [heroRef, heroVisible]         = useInView(0.05);
  const [detailsRef, detailsVisible]   = useInView();
  const [relatedRef, relatedVisible]   = useInView();
  const [relatedProducts, setRelated]  = useState([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [prodRes, allRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
        ]);
        setProduct(prodRes.data);
        setRelated(allRes.data.filter(p => String(p.id) !== String(id)).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-[100svh] flex items-center justify-center bg-[#f7f4ef] font-dm">
      <div className="w-8 h-8 border-2 border-[#e0d8cc] border-t-[#4a7c59] rounded-full animate-spin" />
    </div>
  );

  /* ── not found ── */
  if (!product) return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-[#f7f4ef] gap-4 font-garamond">
      <h2 className="text-3xl font-light text-[#1c1a16]">Remedy Not Found</h2>
      <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[#4a7c59] text-sm hover:underline">
        <ArrowLeft size={15} /> Back to Apothecary
      </Link>
    </div>
  );

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh] overflow-x-hidden">

      {/* ── back link ── */}
      <div className="max-w-7xl mx-auto px-6 pt-28">
        <Link to="/shop" className="font-dm inline-flex items-center gap-1.5 text-[0.82rem] text-[#8a8070] tracking-[0.04em] transition-colors hover:text-[#2c4c3b]">
          <ArrowLeft size={14} /> Back to Apothecary
        </Link>
      </div>

      {/* ══════════════════════════════════
          MAIN PRODUCT LAYOUT
      ══════════════════════════════════ */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-10 pb-20 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-16 items-start">

        {/* ── LEFT: image ── */}
        <div className={`sticky top-24 fade-up ${heroVisible ? 'in' : ''}`}>

          {/* main image */}
          <div className="rounded-[2rem] overflow-hidden aspect-square bg-[#f0ece3] relative border border-[#ede8df]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover block" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf size={64} className="text-[#c8b89a]" />
              </div>
            )}
            {/* tag badge */}
            <span className="font-dm absolute top-5 left-5 bg-[#f7f4ef]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[0.72rem] font-medium text-[#2c4c3b] tracking-[0.06em] uppercase">
              {product.tcm_function_tag || 'Wellness'}
            </span>
          </div>

          {/* thumbnail strip */}
          <div className="flex gap-3 mt-4">
            {[0,1,2].map(i => (
              <div key={i} className={`flex-1 aspect-square rounded-2xl overflow-hidden bg-[#ede8df] cursor-pointer border-2 ${i === 0 ? 'border-[#4a7c59]' : 'border-transparent transition-colors hover:border-[#c8b89a]'}`}>
                {i === 0 && product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf size={18} className="text-[#c8b89a]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: details ── */}
        <div className="flex flex-col gap-8">

          {/* header */}
          <div className={`fade-up delay-100 ${heroVisible ? 'in' : ''}`}>
            <div className="flex gap-1 mb-4 items-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_,i) => <Star key={i} size={13} className="fill-[#c8a855] text-[#c8a855]" />)}
              </div>
              <span className="font-dm text-[0.78rem] text-[#8a8070] ml-1.5 font-light">4.9 · 128 reviews</span>
            </div>
            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] tracking-[-0.01em] text-[#1c1a16] mb-3">
              {product.name}
            </h1>
            <p className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-normal text-[#2c4c3b]">
              KES {Number(product.price_kes).toLocaleString()}
            </p>
          </div>

          {/* description */}
          <div className={`border-t border-[#ede8df] pt-7 fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
            <p className="font-dm text-base font-light leading-[1.8] text-[#5a5648]">
              {product.description || 'A time-honored traditional herbal formula carefully sourced to restore natural harmony and vitality. Each batch is third-party tested and crafted according to classical TCM pharmacopoeia.'}
            </p>
          </div>

          {/* quantity + add to cart */}
          <div className={`flex flex-wrap gap-4 items-center fade-up delay-300 ${heroVisible ? 'in' : ''}`}>

            {/* qty */}
            <div className="flex items-center bg-white border-[1.5px] border-[#ede8df] rounded-full overflow-hidden">
              <button className="font-dm w-11 h-11 flex items-center justify-center bg-transparent text-[#8a8070] transition-colors hover:bg-[#1c2e1f] hover:text-white" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={16} />
              </button>
              <span className="font-dm w-12 text-center text-base font-medium text-[#1c1a16]">{quantity}</span>
              <button className="font-dm w-11 h-11 flex items-center justify-center bg-transparent text-[#8a8070] transition-colors hover:bg-[#1c2e1f] hover:text-white" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>

            {/* add to cart */}
            <button
              onClick={() => { addToCart(product, quantity); setIsAdded(true); setTimeout(() => setIsAdded(false), 2200); }}
              className={`font-dm flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-8 rounded-full text-[0.95rem] font-medium transition-all duration-300 tracking-[0.02em] ${
                isAdded 
                ? 'bg-[#4a7c59] text-[#f7f4ef] scale-95' 
                : 'bg-[#1c2e1f] text-[#f7f4ef] hover:bg-[#2c4c3b] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(28,46,31,0.22)]'
              }`}
            >
              <ShoppingBag size={17} />
              {isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
          </div>

          {/* total line */}
          {quantity > 1 && (
            <p className={`font-dm text-[0.82rem] text-[#8a8070] font-light fade-up delay-300 ${heroVisible ? 'in' : ''}`}>
              Total: <strong className="text-[#1c1a16]">KES {(Number(product.price_kes) * quantity).toLocaleString()}</strong>
            </p>
          )}

          {/* trust strip */}
          <div className={`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 fade-up delay-[400ms] ${heroVisible ? 'in' : ''}`}>
            {trusts.map(({ icon: Icon, text }, i) => (
              <div key={i} className="font-dm bg-white border border-[#ede8df] rounded-2xl p-3.5 flex items-center gap-2.5 transition-all duration-300 hover:bg-[#e8f0ea] hover:-translate-y-[3px]">
                <Icon size={15} className="text-[#4a7c59] shrink-0" />
                <span className="text-[0.75rem] font-normal text-[#5a5648] leading-[1.35]">{text}</span>
              </div>
            ))}
          </div>

          {/* FAQ accordion */}
          <div className={`mt-4 fade-up delay-[400ms] ${heroVisible ? 'in' : ''}`}>
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="py-4 border-b border-[#ede8df] first:border-t cursor-pointer group">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[1.05rem] font-normal text-[#1c1a16] transition-colors group-hover:text-[#4a7c59]">{f.q}</span>
                  <ChevronDown size={16} className={`text-[#8a8070] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : 'rotate-0'}`} />
                </div>
                {openFaq === i && (
                  <p className="font-dm mt-3 text-[0.88rem] font-light leading-[1.75] text-[#7a7060] animate-in slide-in-from-top-2 fade-in">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PHILOSOPHY STRIP
      ══════════════════════════════════ */}
      <section ref={detailsRef} className="bg-[#1c2e1f] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 items-center">
          <div className={`fade-up ${detailsVisible ? 'in' : ''}`}>
            <p className="font-dm text-[0.72rem] tracking-[0.18em] uppercase text-[#a8c5a0] mb-2.5 font-medium">Why This Formula</p>
            <h3 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-[#f7f4ef] leading-[1.2]">
              Rooted in<br /><em className="text-[#a8c5a0]">5,000 years</em> of wisdom.
            </h3>
          </div>
          {[['Classical Source', 'Derived from texts in the Shennong Bencao Jing, one of the oldest TCM pharmacopoeias in existence.'],
            ['Single-Origin Herbs', 'Each botanical is traceable to a named farm. Scan the QR on your package to see harvest records.'],
            ['Kenyan Constitution', 'Our practitioners adapt classical dosing for East African climate, diet, and constitutional patterns.'],
          ].map(([title, body], i) => (
            <div key={i} className={`border-l border-[#2c4c3b] pl-6 fade-up ${detailsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
              <p className="text-[1.05rem] font-normal text-[#f7f4ef] mb-2">{title}</p>
              <p className="font-dm text-[0.85rem] font-light leading-[1.7] text-[#8a9e8c]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          RELATED PRODUCTS
      ══════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section ref={relatedRef} className="py-24 px-6 bg-[#f0ece3]">
          <div className="max-w-7xl mx-auto">
            
            <div className={`flex flex-wrap items-end justify-between gap-4 mb-12 fade-up ${relatedVisible ? 'in' : ''}`}>
              <div>
                <p className="font-dm text-[0.72rem] font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-2 flex items-center gap-2">
                  <span className="w-5 h-[1px] bg-[#4a7c59]" /> Continue Your Journey
                </p>
                <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-light text-[#1c1a16] leading-[1.1]">
                  You May Also <em className="text-[#2c4c3b]">Benefit From</em>
                </h2>
              </div>
              <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[#2c4c3b] text-[0.88rem] font-medium border-b border-[#4a7c59] pb-0.5 hover:opacity-80 transition-opacity">
                Full Apothecary →
              </Link>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              {relatedProducts.map((p, i) => (
                <Link to={`/product/${p.id}`} key={p.id} className={`flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-10px_rgba(28,26,22,0.13)] group fade-up ${relatedVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                  
                  <div className="aspect-square overflow-hidden bg-[#f0ece3]">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf size={36} className="text-[#c8b89a]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <span className="font-dm text-[0.7rem] font-medium text-[#4a7c59] tracking-[0.06em] uppercase">{p.tcm_function_tag || 'Wellness'}</span>
                    <h3 className="text-[1.2rem] font-normal text-[#1c1a16] mt-1.5 mb-3 leading-[1.25] transition-colors group-hover:text-[#4a7c59]">{p.name}</h3>
                    
                    <div className="flex items-center justify-between border-t border-[#ede8df] pt-3.5 mt-auto">
                      <span className="font-dm text-base font-medium text-[#1c1a16]">KES {Number(p.price_kes).toLocaleString()}</span>
                      <span className="w-8 h-8 rounded-full bg-[#f0ece3] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#1c2e1f] group-hover:text-white">
                        <Plus size={15} className="group-hover:text-white text-[#4a7c59]" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;