import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Leaf, Shield, Truck, RotateCcw, Star, ChevronDown, Tag, AlertTriangle } from 'lucide-react';

import api from '../api';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';

/* ── updated fade-up hook that handles loading states ── */
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

/* ── static trust bullets (B2B Focused) ── */
const trusts = [
  { icon: Shield, text: 'GMP Certified Manufacturing' },
  { icon: Leaf, text: 'Pharmaceutical-Grade Purity' },
  { icon: Truck, text: 'Fast Wholesale Fulfillment' },
  { icon: RotateCcw, text: 'Clinical Efficacy Guarantee' },
];

/* ── static B2B Accordion data ── */
const faqs = [
  { q: 'Clinical Application', a: 'Designed for practitioner dispensing. Refer to the classical TCM indications for dosage adjustments based on individual patient constitution and climate.' },
  { q: 'Ingredients & Sourcing', a: 'Each formula is crafted from concentrated whole-herb extracts standardised to active marker compounds. Sourced directly from certified organic farms.' },
  { q: 'Storage & Shelf Life', a: 'Store in a cool, dry place away from direct sunlight. All bulk orders carry a minimum of 24 months shelf life upon delivery.' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { addToCart, discountRate } = useCart();
  const { globalDiscount } = useSettings();


  const [heroRef, heroVisible] = useInView(0.05);
  const [detailsRef, detailsVisible] = useInView();
  const [relatedRef, relatedVisible] = useInView();
  const [relatedProducts, setRelated] = useState([]);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products'),
        ]);

        if (prodRes.ok) setProduct(prodRes.data);
        if (allRes.ok) setRelated(allRes.data.filter(p => String(p.id) !== String(id)).slice(0, 3));

      } catch (e) {
        console.error("Product detail fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-[100svh] flex items-center justify-center bg-[#f7f4ef] font-dm">
      <div className="w-8 h-8 border-2 border-[#e0d8cc] border-t-[#811816] rounded-full animate-spin" />
    </div>
  );

  /* ── not found ── */
  if (!product) return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-[#f7f4ef] gap-4 font-garamond pt-20">
      <h2 className="text-3xl font-light text-[#1c1a16]">Remedy Not Found</h2>
      <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[#811816] text-sm hover:text-[#d2a356] transition-colors">
        <ArrowLeft size={15} /> Back to Catalog
      </Link>
    </div>
  );

  /* ── The New Hierarchical Discount Logic ── */
  const retailPrice = Number(product.price_kes);

  let activeDiscount = 0;
  if (product.custom_discount !== null && product.custom_discount !== undefined && product.custom_discount !== '') {
    activeDiscount = Number(product.custom_discount);
  } else {
    activeDiscount = discountRate * 100;
  }

  // 2. Calculate Member Price based on whichever discount "won"
  const memberPrice = retailPrice * (1 - (activeDiscount / 100));

  const savingsPercent = activeDiscount;



  /* ── Reusable FAQ Accordion UI ── */
  const faqAccordion = (
    <div className="w-full">
      {faqs.map((f, i) => (
        <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="py-4 border-b border-[#ede8df] first:border-t-0 md:first:border-t cursor-pointer group">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[1rem] md:text-[1.05rem] font-normal text-[#1c1a16] transition-colors group-hover:text-[#811816]">{f.q}</span>
            <ChevronDown size={16} className={`text-[#8a8070] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : 'rotate-0'}`} />
          </div>
          {openFaq === i && (
            <p className="font-dm mt-3 text-[0.85rem] md:text-[0.88rem] font-light leading-[1.75] text-[#7a7060] animate-in slide-in-from-top-2 fade-in">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh] overflow-x-hidden pt-20">
      <SEO 
        title={product.name}
        description={product.excerpt || `Buy ${product.name} wholesale from Fohow Eden Life.`}
        path={`/product/${product.id}`}
        image={api.getImageUrl(product.image_url)}
        type="product"
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": api.getImageUrl(product.image_url),
          "description": product.excerpt || `Buy ${product.name} wholesale.`,
          "sku": `FOHOW-${product.id}`,
          "offers": {
            "@type": "Offer",
            "url": `${window.location.origin}/product/${product.id}`,
            "priceCurrency": "KES",
            "price": memberPrice,
            "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }}
      />

      {/* ── back link ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <Link to="/shop" className="font-dm inline-flex items-center gap-1.5 text-[0.82rem] text-[#8a8070] tracking-[0.04em] transition-colors hover:text-[#811816]">
          <ArrowLeft size={14} /> Back to Wholesale Catalog
        </Link>
      </div>

      {/* ══════════════════════════════════
          MAIN PRODUCT LAYOUT
      ══════════════════════════════════ */}
      <section ref={heroRef} className="max-w-7xl mx-auto px-6 pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

        {/* ── LEFT COLUMN (Image + FAQs on Desktop) ── */}
        <div className={`flex flex-col gap-8 md:gap-12 fade-up ${heroVisible ? 'in' : ''}`}>
          {/* main image */}
          <div className="rounded-[2rem] overflow-hidden aspect-square bg-[#f0ece3] relative border border-[#ede8df]">

            {/* PHASE 6: Savings Badge */}
            {savingsPercent > 0 && (
              <div className="absolute top-5 right-5 z-10 bg-[#d2a356] text-[#1c1a16] text-[0.75rem] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center gap-1">
                <Tag size={14} /> Save {savingsPercent}%
              </div>
            )}

            {product.image_url ? (
              <img
                src={api.getImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover block mix-blend-multiply"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf size={64} className="text-[#c8b89a]" />
              </div>
            )}
            {/* tag badge */}
            <span className="font-dm absolute top-5 left-5 bg-[#f7f4ef]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[0.72rem] font-medium text-[#811816] tracking-[0.06em] uppercase border border-[#811816]/10">
              {product.tcm_function_tag || product.category_name || 'Clinical Formula'}
            </span>
          </div>

          {/* Desktop FAQs */}
          <div className="hidden md:block w-full">
            <h3 className="font-dm text-[0.75rem] font-medium tracking-[0.18em] uppercase text-[#811816] mb-2 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#811816]" /> Clinical Information
            </h3>
            {faqAccordion}
          </div>
        </div>

        {/* ── RIGHT COLUMN (Buying Actions) ── */}
        <div className="flex flex-col gap-6 md:gap-8 pt-2 md:pt-0">

          {/* header */}
          <div className={`fade-up delay-100 ${heroVisible ? 'in' : ''}`}>
            <div className="flex gap-1 mb-3 md:mb-4 items-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-[#d2a356] text-[#d2a356]" />)}
              </div>
              <span className="font-dm text-[0.78rem] text-[#8a8070] ml-1.5 font-light">4.9 · Clinical Reviews</span>
            </div>

            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] tracking-[-0.01em] text-[#1c1a16] mb-4">
              {product.name}
            </h1>

            {/* UPGRADED: Smart Dual Price Display */}
            <div className="flex flex-col gap-1 mb-2">
              {savingsPercent > 0 && (
                <span className="font-dm text-[#a0998e] line-through text-[0.9rem]">
                  KES {retailPrice.toLocaleString()} Retail
                </span>
              )}

              <p className="font-dm text-[clamp(1.4rem,2vw,1.8rem)] font-medium text-[#811816] flex items-center">
                KES {Math.round(memberPrice).toLocaleString()}
                <span className="text-[0.8rem] text-[#d2a356] ml-3 uppercase tracking-widest bg-[#fdf8ef] px-2.5 py-1 rounded-full border border-[#d2a356]/30">Wholesale Price</span>
              </p>
            </div>
          </div>

          {/* description & ingredients */}
          <div className={`border-t border-[#ede8df] py-6 md:py-7 space-y-6 md:space-y-7 fade-up delay-200 ${heroVisible ? 'in' : ''}`}>
            <div>
              <h3 className="font-dm text-xs uppercase tracking-widest text-[#a0998e] mb-3">About this formula</h3>
              <div 
                className="font-dm text-[0.95rem] font-light leading-[1.8] text-[#5a5648] whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.full_description || product.description || 'A time-honored traditional herbal formula carefully sourced to restore natural harmony and vitality.') }}
              />
            </div>

            {product.ingredients_list && (
              <div className="bg-[#fcf5f5] p-5 rounded-2xl border border-[#811816]/10">
                <h3 className="font-dm flex items-center text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#811816] mb-2">
                  <Leaf size={13} className="mr-1.5" /> Key Ingredients / Materials
                </h3>
                <p className="font-dm text-[0.9rem] font-light leading-[1.6] text-[#811816]/90">{product.ingredients_list}</p>
              </div>
            )}
          </div>

          {/* quantity + add to cart */}
          <div className={`flex flex-col gap-4 border-t border-[#ede8df] pt-5 md:pt-6 fade-up delay-300 ${heroVisible ? 'in' : ''}`}>

            <div className="flex items-center justify-between">
              <span className="font-dm text-[0.85rem] uppercase tracking-widest text-[#a0998e]">Wholesale Order</span>
              {product.stock_quantity > 0 ? (
                <span className="font-dm text-[0.7rem] text-[#811816] tracking-[0.05em] uppercase font-medium bg-[#fcf5f5] px-2.5 py-1 rounded-full border border-[#811816]/10">In Stock: {product.stock_quantity}</span>
              ) : (
                <span className="font-dm text-[0.7rem] text-[#a04848] tracking-[0.05em] uppercase font-medium bg-[#fdf4f3] px-2.5 py-1 rounded-full border border-[#a04848]/10">Out of Stock</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className={`w-full sm:w-auto flex justify-between sm:justify-center items-center bg-white border-[1.5px] border-[#ede8df] rounded-full overflow-hidden transition-opacity ${product.stock_quantity === 0 ? 'opacity-50' : 'opacity-100'}`}>
                <button className="font-dm w-12 sm:w-11 h-12 sm:h-11 flex items-center justify-center bg-transparent text-[#8a8070] transition-colors hover:bg-[#811816] hover:text-white disabled:cursor-not-allowed" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock_quantity === 0}>
                  <Minus size={16} />
                </button>
                <span className="font-dm w-12 text-center text-base font-medium text-[#1c1a16]">{product.stock_quantity === 0 ? 0 : Math.min(quantity, product.stock_quantity)}</span>
                <button className="font-dm w-12 sm:w-11 h-12 sm:h-11 flex items-center justify-center bg-transparent text-[#8a8070] transition-colors hover:bg-[#811816] hover:text-white disabled:cursor-not-allowed" onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} disabled={quantity >= product.stock_quantity || product.stock_quantity === 0}>
                  <Plus size={16} />
                </button>
              </div>

              <button
                disabled={product.stock_quantity === 0}
                onClick={() => { addToCart(product, Math.min(quantity, product.stock_quantity)); setIsAdded(true); setTimeout(() => setIsAdded(false), 2200); }}
                className={`font-dm w-full sm:flex-1 sm:min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-8 rounded-full text-[0.95rem] font-medium transition-all duration-300 tracking-[0.02em] disabled:cursor-not-allowed ${product.stock_quantity === 0
                    ? 'bg-[#e0d8cc] text-[#a0998e]'
                    : isAdded
                      ? 'bg-[#d2a356] text-[#1c1a16] scale-95 drop-shadow-[0_0_8px_rgba(210,163,86,0.6)]'
                      : 'bg-[#811816] text-[#f7f4ef] hover:bg-[#6a1210] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(129,24,22,0.3)]'
                  }`}
              >
                <ShoppingBag size={17} />
                {product.stock_quantity === 0 ? 'Out of Stock' : (isAdded ? 'Added to Order ✓' : 'Add to Order')}
              </button>
            </div>
          </div>

          {/* total line */}
          {quantity > 1 && (
            <p className={`font-dm text-[0.85rem] text-[#8a8070] font-light text-center sm:text-left fade-up delay-300 ${heroVisible ? 'in' : ''}`}>
              Total: <strong className="text-[#1c1a16]">KES {(Number(product.price_kes) * quantity).toLocaleString()}</strong>
            </p>
          )}

          {/* trust strip */}
          <div className={`grid grid-cols-2 lg:grid-cols-2 gap-3 mt-2 fade-up delay-[400ms] ${heroVisible ? 'in' : ''}`}>
            {trusts.map(({ icon: Icon, text }, i) => (
              <div key={i} className="font-dm bg-white border border-[#ede8df] rounded-2xl p-3 md:p-3.5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-2.5 transition-all duration-300 hover:bg-[#fcf5f5] hover:border-[#811816]/20 hover:-translate-y-[3px]">
                <Icon size={16} className="text-[#811816] shrink-0 mt-0.5" />
                <span className="text-[0.7rem] md:text-[0.75rem] font-normal text-[#5a5648] leading-[1.35]">{text}</span>
              </div>
            ))}
          </div>

          {/* COMPLIANCE: Medical Disclaimer */}
          <div className={`mt-6 p-4 rounded-xl border border-[#ede8df] bg-[#fcfbf9] flex gap-3 items-start fade-up delay-[500ms] ${heroVisible ? 'in' : ''}`}>
            <AlertTriangle size={18} className="text-[#d2a356] shrink-0 mt-0.5" />
            <p className="font-dm text-[0.75rem] leading-relaxed text-[#8a8070]">
              <strong className="text-[#5a5648] uppercase tracking-wider text-[0.7rem]">Clinical Disclaimer:</strong><br />
              These formulations are traditional dietary supplements. They are not intended to diagnose, treat, cure, or prevent any disease. This information should not replace professional medical advice. Please consult with a qualified healthcare provider or our TCM practitioners before altering any prescribed medical treatments.
            </p>
          </div>


          {/* Mobile FAQs */}
          <div className="md:hidden mt-6 pt-6 border-t border-[#ede8df] fade-up delay-[400ms]">
            <h3 className="font-dm text-[0.75rem] font-medium tracking-[0.18em] uppercase text-[#811816] mb-2 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#811816]" /> Clinical Information
            </h3>
            {faqAccordion}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════
          PHILOSOPHY STRIP
      ══════════════════════════════════ */}
      <section ref={detailsRef} className="bg-[#2a0808] py-16 px-6 relative overflow-hidden shadow-inner bg-watermark">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#6a1210_0%,transparent_70%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10 items-center relative z-10">
          <div className={`fade-up ${detailsVisible ? 'in' : ''}`}>
            <p className="font-dm text-[0.72rem] tracking-[0.18em] uppercase text-[#d2a356] mb-2.5 font-medium drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">Why This Formula</p>
            <h3 className="text-[clamp(1.8rem,3vw,2.2rem)] font-light text-[#f7f4ef] leading-[1.2]">
              Rooted in<br /><em className="text-[#d2a356] italic">5,000 years</em> of wisdom.
            </h3>
          </div>
          {[['Classical Source', 'Derived from texts in the Shennong Bencao Jing, one of the oldest TCM pharmacopoeias in existence.'],
          ['Single-Origin Herbs', 'Each botanical is traceable to a named farm. Scan the QR on your package to see harvest records.'],
          ['Kenyan Constitution', 'Our practitioners adapt classical dosing for East African climate, diet, and constitutional patterns.'],
          ].map(([title, body], i) => (
            <div key={i} className={`border-l-2 md:border-l border-[#6a1210] pl-5 md:pl-6 fade-up ${detailsVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
              <p className="text-[1.1rem] md:text-[1.05rem] font-normal text-[#f7f4ef] mb-2">{title}</p>
              <p className="font-dm text-[0.9rem] md:text-[0.85rem] font-light leading-[1.7] text-[#e8d5d5] opacity-80">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          RELATED PRODUCTS 
      ══════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section ref={relatedRef} className="py-16 md:py-24 px-6 bg-[#f0ece3]">
          <div className="max-w-7xl mx-auto">

            <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-12 fade-up ${relatedVisible ? 'in' : ''}`}>
              <div>
                <p className="font-dm text-[0.72rem] font-medium tracking-[0.18em] uppercase text-[#811816] mb-2 flex items-center gap-2">
                  <span className="w-5 h-[1px] bg-[#811816]" /> Clinic Inventory
                </p>
                <h2 className="text-[clamp(2rem,3vw,2.8rem)] font-light text-[#1c1a16] leading-[1.1]">
                  Frequently Ordered <em className="text-[#811816] italic">Together</em>
                </h2>
              </div>
              <Link to="/shop" className="font-dm inline-flex items-center gap-1.5 text-[#811816] text-[0.88rem] font-medium border-b border-[#811816] pb-0.5 hover:text-[#d2a356] hover:border-[#d2a356] transition-colors self-start sm:self-auto">
                View Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {relatedProducts.map((p, i) => {
                // The New Hierarchical Discount Logic for Related Products
                const pRetailPrice = Number(p.price_kes);

                let pActiveDiscount = 0;
                if (p.custom_discount !== null && p.custom_discount !== undefined && p.custom_discount !== '') {
                  pActiveDiscount = Number(p.custom_discount);
                } else {
                  pActiveDiscount = discountRate * 100;
                }

                const pMemberPrice = pRetailPrice * (1 - (pActiveDiscount / 100));
                const pSavings = pActiveDiscount;



                return (
                  <Link to={`/product/${p.id}`} key={p.id} className={`flex flex-col bg-white rounded-[1.75rem] overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-10px_rgba(129,24,22,0.1)] hover:border-[#d2a356]/30 group fade-up ${relatedVisible ? 'in' : ''}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>

                    <div className="aspect-square overflow-hidden bg-[#fcfbf9] relative">
                      {/* Related Product Savings Badge */}
                      {pSavings > 0 && (
                        <div className="absolute top-3.5 right-3.5 z-10 bg-[#d2a356] text-[#1c1a16] text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                          Save {pSavings}%
                        </div>
                      )}

                      {p.image_url ? (
                        <img
                          src={api.getImageUrl(p.image_url)}
                          alt={p.name}
                          className="w-full h-full object-contain p-6 block transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf size={36} className="text-[#c8b89a]" />
                        </div>
                      )}
                      <span className="font-dm absolute top-3.5 left-3.5 bg-[#f7f4ef]/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.65rem] font-medium text-[#811816] border border-[#811816]/10 tracking-[0.06em] uppercase">
                        {p.category_name || p.tcm_function_tag || 'Wellness'}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-[1.2rem] font-medium text-[#1c1a16] mt-1 mb-3 leading-[1.3] transition-colors group-hover:text-[#811816] line-clamp-2">{p.name}</h3>

                      <div className="flex flex-col mt-auto">
                        {pSavings > 0 && (
                          <span className="font-dm text-[0.75rem] text-[#a0998e] line-through mb-0.5">
                            KES {pRetailPrice.toLocaleString()} Retail
                          </span>
                        )}
                        <div className="flex items-center justify-between border-t border-[#ede8df] pt-3 mt-1">

                          <span className="font-dm text-[1.1rem] font-medium text-[#811816]">KES {Math.round(pMemberPrice).toLocaleString()}</span>
                          <span className="w-8 h-8 rounded-full bg-[#fcf5f5] flex items-center justify-center transition-all duration-300 group-hover:bg-[#811816] group-hover:text-[#f7f4ef] border border-[#811816]/10 group-hover:drop-shadow-[0_0_8px_rgba(129,24,22,0.4)]">
                            <ShoppingBag size={14} className="text-[#811816] group-hover:text-[#f7f4ef]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
