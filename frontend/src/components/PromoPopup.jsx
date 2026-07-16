import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Star, Package, Shield, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api';

// ─── Animation keyframes injected once ───────────────────────────────────────
const STYLES = `
  @keyframes pp-backdrop-in   { from { opacity: 0 } to { opacity: 1 } }
  @keyframes pp-card-in       { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
  @keyframes pp-left-in       { from { opacity: 0; transform: translateX(-20px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes pp-right-in      { from { opacity: 0; transform: translateX(20px)  } to { opacity: 1; transform: translateX(0) } }
  @keyframes pp-pulse-ring    { 0%,100% { transform: scale(1); opacity: .6 } 50% { transform: scale(1.45); opacity: 0 } }
  @keyframes pp-shimmer       { from { background-position: -200% center } to { background-position: 200% center } }
  @keyframes pp-check-draw    { from { stroke-dashoffset: 60 } to { stroke-dashoffset: 0 } }
  @keyframes pp-tag-in        { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes pp-badge-in      { from { opacity: 0; transform: translateY(-6px) scale(.9) } to { opacity: 1; transform: translateY(0) scale(1) } }
  
  @media (max-width: 768px) {
    .pp-left { display: none !important; }
  }

  .pp-backdrop  { animation: pp-backdrop-in .35s cubic-bezier(.4,0,.2,1) both }
  .pp-card      { animation: pp-card-in     .45s cubic-bezier(.34,1.26,.64,1) .05s both }
  .pp-left      { animation: pp-left-in     .5s  cubic-bezier(.34,1.1,.64,1) .15s both }
  .pp-right     { animation: pp-right-in    .5s  cubic-bezier(.34,1.1,.64,1) .2s  both }
  .pp-tag       { animation: pp-tag-in      .4s  cubic-bezier(.34,1.1,.64,1) .35s both }
  .pp-badge     { animation: pp-badge-in    .5s  cubic-bezier(.34,1.3,.64,1) .4s  both }

  .pp-btn-primary {
    position: relative; overflow: hidden;
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, background-color .2s ease;
  }
  .pp-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 50%, transparent 60%);
    background-size: 200% 100%; background-position: -200% center; transition: none;
  }
  .pp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(129,24,22,.35); }
  .pp-btn-primary:hover::after { animation: pp-shimmer .6s ease forwards }
  .pp-btn-primary:active { transform: translateY(0); box-shadow: none }

  .pp-btn-secondary { transition: background-color .18s ease, border-color .18s ease, transform .18s ease }
  .pp-btn-secondary:hover { background-color: #fcf5f5; border-color: #d2a356; transform: translateY(-1px) }

  .pp-close { transition: background-color .15s ease, color .15s ease, transform .15s ease }
  .pp-close:hover { background-color: #fcf5f5; color: #811816; transform: rotate(90deg) }

  .pp-pulse-ring {
    position: absolute; inset: -4px; border-radius: 9999px;
    border: 2px solid #811816; animation: pp-pulse-ring 2s cubic-bezier(.4,0,.6,1) infinite;
  }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Shield, label: 'Verified Wholesale' },
  { icon: Package, label: 'Fast Dispatch'      },
  { icon: Star,    label: '4.9 Rating'         },
];

// ─── Stock indicator ──────────────────────────────────────────────────────────
function StockBar({ stock = 70 }) {
  const pct = Math.min(100, Math.max(0, stock));
  const color = pct < 25 ? '#c0392b' : pct < 60 ? '#d2a356' : '#27ae60';
  const label = pct < 25 ? 'Low stock — act fast' : pct < 60 ? 'Selling fast' : 'In stock';
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600,
          letterSpacing: '.08em', textTransform: 'uppercase', color }}>
          {label}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#8a8070' }}>
          {pct}% remaining
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: '#ede8df', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: 'width 1.2s cubic-bezier(.4,0,.2,1) .6s',
        }} />
      </div>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// ─── Component ────────────────────────────────────────────────────────────────
const PromoPopup = ({ currentCategory = 'All' }) => { // 🟢 NEW: Accepts context
  const [phase, setPhase]               = useState('idle');
  const [featuredProduct, setFeatured]  = useState(null);
  const [addedPulse, setAddedPulse]     = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false); // 🟢 Prevents double-firing
  const overlayRef                      = useRef(null);
  const { addToCart }                    = useCart();
  const navigate                         = useNavigate();

  useEffect(() => { injectStyles('promo-popup-styles', STYLES); }, []);

  // ── Data fetch (Contextually Relevant) ──
  useEffect(() => {
    // Frequency Cap: Only show once per session
    if (sessionStorage.getItem('fohow_promo_seen')) return;

    const fetchFeatured = async () => {
      try {
        // 🟢 Pass the current category to get a highly relevant ad
        const res = await api.get('/products/featured', { params: { category: currentCategory } });
        const product = res.data?.data ?? res.data ?? null;
        if (product?.id) setFeatured(product);
      } catch {
        console.error("No featured product found.");
      }
    };
    fetchFeatured();
  }, [currentCategory]);

  // ── Advanced Triggers (Scroll & Exit Intent) ──
  useEffect(() => {
    const triggerPopup = () => {
      if (!featuredProduct || hasTriggered || phase !== 'idle') return;
      setHasTriggered(true);
      setPhase('open');
      sessionStorage.setItem('fohow_promo_seen', 'true');
    };

    // Trigger 1: Scroll Depth (Fires when user scrolls 50% down the page)
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const triggerPoint = document.documentElement.scrollHeight * 0.5;
      
      if (scrollPosition > triggerPoint) {
        triggerPopup();
      }
    };

    // Trigger 2: Exit Intent (Fires when mouse leaves the top of the viewport)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        triggerPopup();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Check current position in case already scrolled
    const scrollPosition = window.scrollY + window.innerHeight;
    const triggerPoint = document.documentElement.scrollHeight * 0.5;
    if (scrollPosition > triggerPoint) {
      triggerPopup();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [featuredProduct, hasTriggered, phase]);

  // ── Analytics Tracking (Impressions) ──
  useEffect(() => {
    if (phase === 'open' && featuredProduct) {
      // Silently log the impression to the database
      api.post('/banners/track', { 
        productId: featuredProduct.id, 
        event: 'impression' 
      }).catch(() => {}); // Ignore errors, don't interrupt UX
    }
  }, [phase, featuredProduct]);

  // ── Handlers ──
  const close = useCallback(() => {
    setPhase('closing');
    setTimeout(() => setPhase('idle'), 300);
  }, []);

  // ── Backdrop click ──────────────────────────────────────────────────────────
  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) close();
  }, [close]);

  // ── Escape key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'open') return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, close]);

  // ── Analytics Tracking (Clicks/Conversions) ──
  const handleAddToCart = () => {
    // Log the conversion
    api.post('/ads/track', { 
      productId: featuredProduct.id, 
      event: 'conversion' 
    }).catch(() => {});

    addToCart(featuredProduct, 1);
    setAddedPulse(true);
    
    // Smooth SPA navigation after brief delay to show animation
    setTimeout(() => {
      navigate(`/product/${featuredProduct.slug}`);
      close();
    }, 500);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    // Log the click
    api.post('/ads/track', { 
      productId: featuredProduct.id, 
      event: 'click' 
    }).catch(() => {});
    navigate(`/product/${featuredProduct.slug}`);
    close();
  };

  if (phase === 'idle' || !featuredProduct) return null;

  const imageUrl = api.getImageUrl(featuredProduct.image_url);

  const isClosing = phase === 'closing';

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Featured product: ${featuredProduct.name}`}
      onClick={handleOverlayClick}
      className="pp-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(10,3,3,.72)',
        backdropFilter: 'blur(10px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.4)',
        opacity: isClosing ? 0 : 1,
        transition: isClosing ? 'opacity .3s ease' : 'none',
      }}
    >
      {/* ── Card ── */}
      <div
        className="pp-card"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 880,
          background: '#faf8f4',
          borderRadius: 28,
          boxShadow: '0 32px 80px rgba(26,5,4,.22), 0 0 0 1px rgba(210,163,86,.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          transform: isClosing ? 'scale(.97) translateY(10px)' : undefined,
          transition: isClosing ? 'transform .3s ease' : 'none',
        }}
      >
        {/* ── Close ── */}
        <button
          onClick={close}
          aria-label="Close promotion"
          className="pp-close"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(250,248,244,.9)', color: '#a0998e',
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* ══════════════════ LEFT — Product Image ═══════════════════ */}
        <div
          className="pp-left"
          style={{
            width: '45%', minHeight: 480, flexShrink: 0,
            position: 'relative', overflow: 'hidden',
            background: '#f0ece3',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={featuredProduct.name}
              loading="eager"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                mixBlendMode: 'multiply',
                transition: 'transform .6s cubic-bezier(.4,0,.2,1)',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle at 50% 60%, #5a1210 0%, #1a0504 100%)',
            }}>
              <ShoppingBag size={64} strokeWidth={.8} color="rgba(210,163,86,.3)" />
            </div>
          )}

          {/* Gradient vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(26,5,4,.08) 0%, transparent 50%, rgba(26,5,4,.18) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Bottom label strip */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '24px 24px 20px',
            background: 'linear-gradient(to top, rgba(26,5,4,.6) 0%, transparent 100%)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(210,163,86,.18)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(210,163,86,.35)',
              borderRadius: 99, padding: '5px 12px',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#d2a356', display: 'block',
              }} />
              <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '.12em',
                textTransform: 'uppercase', color: '#d2a356',
              }}>
                Featured Spotlight
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════ RIGHT — Details ════════════════════════ */}
        <div
          className="pp-right"
          style={{
            flex: 1, padding: '44px 44px 36px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: '#fff',
          }}
        >
          {/* Trust badges */}
          <div className="pp-badge" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#faf8f4', border: '1px solid #ede8df',
                borderRadius: 99, padding: '4px 10px',
              }}>
                <Icon size={11} color="#811816" strokeWidth={2.2} />
                <span style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
                  fontWeight: 600, color: '#5a5648', letterSpacing: '.04em',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Product name */}
          <h2 style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: 'clamp(1.7rem, 3vw, 2.4rem)',
            fontWeight: 400, lineHeight: 1.1,
            color: '#1c1a16', marginBottom: 12,
          }}>
            {featuredProduct.name}
          </h2>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.7rem', fontWeight: 700,
              color: '#811816', letterSpacing: '-.02em',
            }}>
              KES {Number(featuredProduct.price_kes).toLocaleString()}
            </span>
            {featuredProduct.retail_price_kes && (
              <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                color: '#a0998e', textDecoration: 'line-through',
              }}>
                KES {Number(featuredProduct.retail_price_kes).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock bar */}
          <StockBar stock={featuredProduct.stock_pct ?? 68} />

          {/* Description */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
            fontWeight: 300, color: '#5a5648', lineHeight: 1.75,
            marginBottom: 28,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {stripHtml(featuredProduct.description || featuredProduct.full_description)
              || 'Discover our featured remedy for holistic health and vitality.'}
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleAddToCart}
              disabled={addedPulse}
              aria-label={`Add ${featuredProduct.name} to cart`}
              className="pp-btn-primary"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: addedPulse ? '#27ae60' : '#811816',
                color: '#fff', border: 'none', borderRadius: 14,
                padding: '15px 24px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
                letterSpacing: '.02em',
                transition: 'background-color .3s ease',
              }}
            >
              {addedPulse ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" strokeDasharray="60" strokeDashoffset="0"
                      style={{ animation: 'pp-check-draw .35s ease forwards' }} />
                  </svg>
                  Added to Order
                </>
              ) : (
                <>
                  <ShoppingBag size={16} strokeWidth={2} />
                  Add to Wholesale Order
                  <ArrowRight size={15} strokeWidth={2} style={{ marginLeft: 2 }} />
                </>
              )}
            </button>

            <a
              href={`/product/${featuredProduct.slug}`}
              onClick={handleViewDetails}
              className="pp-btn-secondary"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#faf8f4', border: '1.5px solid rgba(210,163,86,.4)',
                color: '#811816', borderRadius: 14, padding: '12px 24px',
                textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500,
              }}
            >
              View Full Details
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {/* Dismiss link */}
          <button
            onClick={close}
            style={{
              marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
              fontWeight: 400, color: '#a0998e',
              transition: 'color .15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#5a5648'}
            onMouseLeave={e => e.currentTarget.style.color = '#a0998e'}
          >
            No thanks, continue browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;