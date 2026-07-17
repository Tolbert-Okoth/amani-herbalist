import { useState, useEffect, useCallback, useRef } from 'react';
import { X, BookOpen, ArrowRight, Smartphone, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import api from '../api';

// ─── Shared keyframes ─────────────────────────────────────────────────────────
const STYLES = `
  @keyframes ei-backdrop-in  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes ei-card-in      { from { opacity: 0; transform: translateY(28px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
  @keyframes ei-left-in      { from { opacity: 0; transform: translateX(-24px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes ei-right-in     { from { opacity: 0; transform: translateX(24px)  } to { opacity: 1; transform: translateX(0) } }
  @keyframes ei-shimmer      { from { background-position: -200% center } to { background-position: 200% center } }
  @keyframes ei-pulse        { 0%,100% { transform: scale(1); opacity: .55 } 50% { transform: scale(1.5); opacity: 0 } }
  @keyframes ei-badge-in     { from { opacity: 0; transform: translateY(-8px) scale(.9) } to { opacity: 1; transform: translateY(0) scale(1) } }
  @keyframes ei-check-in     { from { opacity: 0; transform: scale(.6) rotate(-15deg) } to { opacity: 1; transform: scale(1) rotate(0) } }
  @keyframes ei-success-text { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes ei-progress     { from { width: 0% } to { width: 100% } }
  @keyframes ei-float        {
    0%, 100% { transform: translateY(0px) rotate(0deg) }
    33%  { transform: translateY(-8px) rotate(2deg) }
    66%  { transform: translateY(-4px) rotate(-1.5deg) }
  }
  @keyframes ei-book-glow    { 0%,100% { box-shadow: 0 0 20px rgba(210,163,86,.2) } 50% { box-shadow: 0 0 40px rgba(210,163,86,.45) } }

  .ei-backdrop  { animation: ei-backdrop-in .35s cubic-bezier(.4,0,.2,1) both }
  .ei-card      { animation: ei-card-in     .45s cubic-bezier(.34,1.22,.64,1) .05s both }
  .ei-left      { animation: ei-left-in     .5s  cubic-bezier(.34,1.1,.64,1) .1s  both }
  .ei-right     { animation: ei-right-in    .5s  cubic-bezier(.34,1.1,.64,1) .18s both }
  .ei-badge     { animation: ei-badge-in    .45s cubic-bezier(.34,1.2,.64,1) .35s both }

  .ei-book-icon { animation: ei-float 6s ease-in-out infinite, ei-book-glow 3s ease-in-out infinite }

  .ei-btn {
    position: relative; overflow: hidden;
    transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
  }
  .ei-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%);
    background-size: 200% 100%; background-position: -200% center;
  }
  .ei-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(129,24,22,.38); }
  .ei-btn:not(:disabled):hover::after { animation: ei-shimmer .55s ease forwards }
  .ei-btn:not(:disabled):active { transform: translateY(0); }

  .ei-input-wrap { position: relative }
  .ei-input-wrap:focus-within .ei-input-border {
    border-color: #d2a356;
    box-shadow: 0 0 0 3.5px rgba(210,163,86,.2);
  }
  .ei-input-wrap:focus-within .ei-input-icon { color: #d2a356 }

  .ei-close { transition: background-color .15s ease, color .15s ease, transform .15s ease }
  .ei-close:hover { background-color: rgba(255,255,255,.12) !important; color: #d2a356 !important; transform: rotate(90deg) }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

// ─── Phone validation ─────────────────────────────────────────────────────────
const KE_PHONE_RE = /^(?:\+?254)?0?(?:7[0-9]{8}|1[01][0-9]{7})$/;

function validatePhone(raw) {
  const digits = raw.replace(/[\s\-()]/g, '');
  if (!digits || digits === '+254') return 'Please enter your WhatsApp number.';
  if (!KE_PHONE_RE.test(digits)) return 'Enter a valid Kenyan number (e.g. +254 712 345 678).';
  return null;
}

// ─── Guide highlights ─────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  '12-page clinical integration manual',
  'Exclusive B2B wholesale price list',
  'TCM formula adaptation protocols',
  'Regulatory & compliance checklist',
];

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '48px 40px',
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #fcf5f5, #fff)',
        border: '1.5px solid rgba(129,24,22,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        animation: 'ei-check-in .5s cubic-bezier(.34,1.4,.64,1) both',
      }}>
        <CheckCircle2 size={36} color="#811816" strokeWidth={1.5} />
      </div>

      <h2 style={{
        fontFamily: 'EB Garamond, Georgia, serif',
        fontSize: '2rem', fontWeight: 400, color: '#1c1a16',
        marginBottom: 8,
        animation: 'ei-success-text .5s ease .1s both',
      }}>
        Guide on its way!
      </h2>
      <p style={{
        fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
        fontWeight: 300, color: '#5a5648', lineHeight: 1.7, maxWidth: 280,
        animation: 'ei-success-text .5s ease .2s both',
      }}>
        Check your WhatsApp shortly. Your clinical integration guide and wholesale catalog are on their way.
      </p>

      {/* Auto-close progress bar */}
      <div style={{
        width: '100%', maxWidth: 240, height: 2,
        background: '#ede8df', borderRadius: 99,
        overflow: 'hidden', marginTop: 32,
        animation: 'ei-success-text .5s ease .3s both',
      }}>
        <div style={{
          height: '100%', background: 'linear-gradient(90deg, #811816, #d2a356)',
          borderRadius: 99,
          animation: 'ei-progress 4.5s linear .1s both',
        }} />
      </div>
      <span style={{
        fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
        color: '#a0998e', marginTop: 8,
        animation: 'ei-success-text .4s ease .35s both',
      }}>
        Closing automatically…
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const ExitIntentPopup = () => {
  const [phase, setPhase]       = useState('idle'); // idle | open | closing
  const [phone, setPhone]       = useState('+254 ');
  const [error, setError]       = useState('');
  const [touched, setTouched]   = useState(false);
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const overlayRef               = useRef(null);
  const inputRef                 = useRef(null);

  useEffect(() => { injectStyles('exit-intent-styles', STYLES); }, []);

  // ── Exit-intent & Mobile Idle logic ──────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem('fohow_exit_intent')) return;

    let isArmed = false;
    let hasEngaged = false;
    let idleTimer;

    // 1. Check if user is actually interacting with the page
    const checkEngagement = () => {
      hasEngaged = true;
      document.removeEventListener('mousemove', checkEngagement);
      document.removeEventListener('scroll', checkEngagement);
      document.removeEventListener('touchstart', checkEngagement);
    };

    document.addEventListener('mousemove', checkEngagement, { passive: true });
    document.addEventListener('scroll', checkEngagement, { passive: true });
    document.addEventListener('touchstart', checkEngagement, { passive: true });

    // Arm the popup after 8 seconds (don't fire immediately)
    const armTimer = setTimeout(() => { isArmed = true; }, 8000);

    // Helper to safely trigger the popup
    const triggerPopup = () => {
      // Check if the Promo Popup is currently active or recently closed
      const promoActive = sessionStorage.getItem('fohow_promo_active');
      const promoSeen   = sessionStorage.getItem('fohow_promo_seen');
      if (promoActive && !promoSeen) return;

      const closedAt = Number(sessionStorage.getItem('fohow_promo_closed_at') || 0);
      if (Date.now() - closedAt < 1500) return; // Wait 1.5s after promo closes

      setPhase('open');
      sessionStorage.setItem('fohow_exit_intent', 'true');
      cleanupListeners();
    };

    // ── TRIGGER A: Desktop Mouseout (Exit Intent) ──
    const handleMouseOut = (e) => {
      if (!isArmed || !hasEngaged) return;
      if (!e.relatedTarget && e.clientY <= 0) {
        triggerPopup();
      }
    };

    // ── TRIGGER B: Mobile Inactivity (Idle Timer) ──
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isArmed && hasEngaged) {
        // If they stop touching/scrolling for 12 seconds, fire the popup
        idleTimer = setTimeout(triggerPopup, 12000); 
      }
    };

    // Attach listeners
    document.addEventListener('mouseout', handleMouseOut);
    
    // Listeners to reset the mobile idle timer
    document.addEventListener('touchstart', resetIdleTimer, { passive: true });
    document.addEventListener('scroll', resetIdleTimer, { passive: true });

    const cleanupListeners = () => {
      clearTimeout(armTimer);
      clearTimeout(idleTimer);
      document.removeEventListener('mousemove', checkEngagement);
      document.removeEventListener('scroll', checkEngagement);
      document.removeEventListener('touchstart', checkEngagement);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('touchstart', resetIdleTimer);
      document.removeEventListener('scroll', resetIdleTimer);
    };

    return cleanupListeners;
  }, []);

  // ── Focus trap on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'open') setTimeout(() => inputRef.current?.focus(), 400);
  }, [phase]);

  // ── Close ───────────────────────────────────────────────────────────────────
  const close = useCallback(() => {
    setPhase('closing');
    setTimeout(() => setPhase('idle'), 300);
  }, []);

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

  // ── Validation ──────────────────────────────────────────────────────────────
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (touched) setError(validatePhone(e.target.value) ?? '');
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validatePhone(phone) ?? '');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validatePhone(phone);
    if (err) { setError(err); inputRef.current?.focus(); return; }

    setStatus('loading');
    try {
      const response = await api.post('/leads', {
        phone: phone.replace(/[\s\-()]/g, ''),
        source: 'exit_intent',
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Lead submission failed:', err);
      setStatus('error');
    }
  };

  if (phase === 'idle') return null;

  const isClosing = phase === 'closing';

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Claim your free TCM clinical guide"
      onClick={handleOverlayClick}
      className="ei-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(10,3,3,.75)',
        backdropFilter: 'blur(12px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
        opacity: isClosing ? 0 : 1,
        transition: isClosing ? 'opacity .3s ease' : 'none',
      }}
    >
      {/* ── Card ── */}
      <div
        className="ei-card"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 880,
          borderRadius: 28,
          boxShadow: '0 40px 100px rgba(26,5,4,.28), 0 0 0 1px rgba(210,163,86,.16)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          transform: isClosing ? 'scale(.96) translateY(12px)' : undefined,
          transition: isClosing ? 'transform .3s ease' : 'none',
        }}
      >
        {/* ══════════════════ LEFT — Brand Panel ═════════════════════ */}
        <div
          className="ei-left"
          style={{
            width: '44%', flexShrink: 0,
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(160deg, #2a0806 0%, #1a0504 60%, #0f0303 100%)',
            display: window.innerWidth < 768 ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '52px 40px',
          }}
        >
          {/* Noise texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: .04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />

          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 40%, rgba(129,24,22,.5) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Book icon */}
          <div className="ei-book-icon" style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2a0806, #1a0504)',
            border: '1.5px solid rgba(210,163,86,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28, position: 'relative', zIndex: 1,
          }}>
            {/* Pulse ring */}
            <div style={{
              position: 'absolute', inset: -5, borderRadius: '50%',
              border: '1.5px solid rgba(210,163,86,.3)',
              animation: 'ei-pulse 2.8s cubic-bezier(.4,0,.6,1) infinite',
            }} />
            <BookOpen size={38} color="#d2a356" strokeWidth={1} />
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: '1.9rem', fontWeight: 400, lineHeight: 1.2,
            color: '#d2a356', textAlign: 'center',
            marginBottom: 14, position: 'relative', zIndex: 1,
            textShadow: '0 0 30px rgba(210,163,86,.25)',
          }}>
            The TCM Clinical<br />Integration Guide
          </h3>

          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
            fontWeight: 300, color: 'rgba(232,213,213,.7)',
            textAlign: 'center', lineHeight: 1.7,
            marginBottom: 32, position: 'relative', zIndex: 1,
          }}>
            A 12-page manual for adapting ancient Chinese formulas to the modern Kenyan clinical practice.
          </p>

          {/* Highlight list */}
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0,
            width: '100%', position: 'relative', zIndex: 1,
          }}>
            {HIGHLIGHTS.map((item, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
                fontWeight: 400, color: 'rgba(232,213,213,.8)',
                padding: '6px 0',
                borderBottom: i < HIGHLIGHTS.length - 1 ? '1px solid rgba(210,163,86,.1)' : 'none',
                animation: `ei-right-in .45s cubic-bezier(.34,1.1,.64,1) ${.4 + i * .07}s both`,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#d2a356', flexShrink: 0,
                }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ══════════════════ RIGHT — Form / Success ══════════════════ */}
        <div
          className="ei-right"
          style={{
            flex: 1, background: '#fff', display: 'flex',
            flexDirection: 'column', position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close offer"
            className="ei-close"
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: '50%', border: 'none',
              cursor: 'pointer', background: 'rgba(160,153,142,.12)', color: '#a0998e',
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>

          {status === 'success' ? (
            <SuccessScreen onClose={close} />
          ) : (
            <div style={{ padding: '44px 44px 36px', display: 'flex', flexDirection: 'column', flex: 1 }}>

              {/* Tag */}
              <div className="ei-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                marginBottom: 20, alignSelf: 'flex-start',
                background: 'rgba(129,24,22,.06)', border: '1px solid rgba(129,24,22,.12)',
                borderRadius: 99, padding: '5px 13px',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#811816', animation: 'ei-pulse 2s infinite',
                }} />
                <span style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem',
                  fontWeight: 700, letterSpacing: '.13em',
                  textTransform: 'uppercase', color: '#811816',
                }}>
                  Wait before you go
                </span>
              </div>

              {/* Headline */}
              <h2 style={{
                fontFamily: 'EB Garamond, Georgia, serif',
                fontSize: 'clamp(1.7rem, 3vw, 2.3rem)',
                fontWeight: 400, lineHeight: 1.1,
                color: '#1c1a16', marginBottom: 10,
              }}>
                Claim your free{' '}
                <em style={{ color: '#811816', fontStyle: 'italic' }}>guide.</em>
              </h2>

              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
                fontWeight: 300, color: '#5a5648', lineHeight: 1.8,
                marginBottom: 28,
              }}>
                Drop your WhatsApp number below and we'll instantly send you our exclusive B2B wholesale catalog and clinical integration guide.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Input */}
                <div className="ei-input-wrap">
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, padding: '13px 16px',
                    background: '#faf8f4',
                    border: `1.5px solid ${error && touched ? '#c0392b' : '#ede8df'}`,
                    borderRadius: 12,
                    transition: 'border-color .2s ease, box-shadow .2s ease',
                  }}
                    className="ei-input-border"
                  >
                    <Smartphone
                      size={18} strokeWidth={1.8}
                      className="ei-input-icon"
                      style={{ color: '#a0998e', flexShrink: 0, transition: 'color .2s ease' }}
                    />
                    <input
                      ref={inputRef}
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="WhatsApp Number (e.g. 0712 345 678)"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      aria-invalid={!!(error && touched)}
                      aria-describedby={error && touched ? 'ei-phone-error' : undefined}
                      style={{
                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
                        color: '#1c1a16', letterSpacing: '.01em',
                      }}
                    />
                  </div>

                  {/* Inline error */}
                  {error && touched && (
                    <div id="ei-phone-error" role="alert" style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      marginTop: 6, paddingLeft: 4,
                    }}>
                      <AlertCircle size={12} color="#c0392b" strokeWidth={2.5} />
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.73rem',
                        color: '#c0392b', fontWeight: 500,
                      }}>
                        {error}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  aria-busy={status === 'loading'}
                  className="ei-btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#811816', color: '#fff', border: 'none',
                    borderRadius: 12, padding: '15px 24px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', fontWeight: 600,
                    letterSpacing: '.02em',
                    opacity: status === 'loading' ? .75 : 1,
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{ animation: 'spin 1s linear infinite' }}>
                        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send My Free Guide
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* API error */}
                {status === 'error' && (
                  <div role="alert" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <AlertCircle size={14} color="#c0392b" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#c0392b',
                    }}>
                      Something went wrong. Please try again in a moment.
                    </span>
                  </div>
                )}
              </form>

              {/* Trust footer */}
              <div style={{
                marginTop: 20, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6,
              }}>
                <Lock size={11} color="#a0998e" strokeWidth={2.2} />
                <span style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
                  color: '#a0998e', letterSpacing: '.02em',
                }}>
                  Your number stays private. No spam, ever.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;