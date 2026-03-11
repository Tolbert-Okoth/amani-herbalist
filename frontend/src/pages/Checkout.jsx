import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, CreditCard, ShieldCheck, Lock, CheckCircle2, Leaf, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

/* ── robust fade-up hook ── */
const useInView = (threshold = 0.05) => {
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

const FREE_DELIVERY_THRESHOLD = 10000;

const Checkout = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing]   = useState(false);
  const [isDone, setIsDone]               = useState(false);
  const [mpesaNumber, setMpesaNumber]     = useState('');

  const [leftRef, leftVisible]   = useInView();
  const [rightRef, rightVisible] = useInView();

  const delivery = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 350;
  const grandTotal = cartTotal + delivery;
  const progressPct = Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  /* ── empty cart ── */
  if (cartItems.length === 0 && !isDone) return (
    <div className="font-garamond bg-[#f7f4ef] min-h-[100svh] flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#f0ece3] flex items-center justify-center mb-2">
        <Leaf size={28} className="text-[#c8b89a]" />
      </div>
      <h2 className="text-[2.2rem] font-light text-[#1c1a16]">Your bag is empty</h2>
      <button onClick={() => navigate('/shop')} className="font-dm flex items-center gap-1.5 text-[#4a7c59] text-[0.88rem] hover:underline">
        <ArrowLeft size={14} /> Return to Shop
      </button>
    </div>
  );

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setIsDone(true); }, 3000);
  };

  /* ── success screen ── */
  if (isDone) return (
    <div className="font-garamond bg-[#f7f4ef] min-h-[100svh] flex flex-col items-center justify-center p-8 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#e8f0ea] flex items-center justify-center mb-3 animate-in zoom-in duration-500">
        <CheckCircle2 size={32} className="text-[#4a7c59]" />
      </div>
      <h2 className="text-[clamp(2rem,4vw,3rem)] font-light text-[#1c1a16] leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
        Order Confirmed.<br /><em className="text-[#2c4c3b]">Thank you.</em>
      </h2>
      <p className="font-dm text-[0.95rem] font-light text-[#5a5648] max-w-[420px] leading-[1.75] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        {paymentMethod === 'mpesa' ? 'An M-Pesa STK push has been sent to your phone. ' : 'Your payment was processed securely. '}
        A confirmation will arrive in your inbox shortly.
      </p>
      <button onClick={() => navigate('/shop')} className="font-dm mt-4 flex items-center gap-2 py-3.5 px-8 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-[0.88rem] font-medium transition-colors hover:bg-[#2c4c3b] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <ArrowLeft size={14} /> Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh]">
      
      {/* ── top nav bar ── */}
      <div className="bg-white border-b border-[#ede8df] py-5 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[0.82rem] font-normal text-[#8a8070] transition-colors hover:text-[#2c4c3b]">
            <ArrowLeft size={14} /> Back to Apothecary
          </Link>
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-[#4a7c59]" />
            <span className="font-dm text-[0.72rem] font-normal text-[#8a8070]">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12 pb-24 flex flex-wrap gap-12 items-start">

        {/* ══════════════════════════════
            LEFT: FORM
        ══════════════════════════════ */}
        <div ref={leftRef} className={`flex-1 min-w-0 fade-up ${leftVisible ? 'in' : ''}`}>

          <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] text-[#1c1a16] mb-10">
            Complete your<br /><em className="text-[#2c4c3b]">order.</em>
          </h1>

          <form id="checkout-form" onSubmit={handlePayment} className="flex flex-col gap-10">

            {/* STEP 1 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-dm w-7 h-7 rounded-full bg-[#1c2e1f] text-[#f7f4ef] flex items-center justify-center text-[0.75rem] font-medium shrink-0">1</span>
                <h2 className="text-[1.4rem] font-normal text-[#1c1a16]">Contact Details</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input required type="text" id="fn" placeholder="First Name" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="fn" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">First Name</label>
                  </div>
                  <div className="relative">
                    <input required type="text" id="ln" placeholder="Last Name" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="ln" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Last Name</label>
                  </div>
                </div>
                <div className="relative">
                  <input required type="email" id="em" placeholder="Email" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                  <label htmlFor="em" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Email Address</label>
                </div>
                <div className="relative">
                  <input required type="text" id="addr" placeholder="Address" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                  <label htmlFor="addr" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Delivery Address</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input required type="text" id="city" placeholder="City" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="city" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">City / Town</label>
                  </div>
                  <div className="relative">
                    <input type="text" id="postal" placeholder="Postal" className="peer w-full bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:border-[#4a7c59] focus:ring-[3px] focus:ring-[#4a7c59]/10 placeholder-transparent" />
                    <label htmlFor="postal" className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light text-[#a0998e] pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:-translate-y-0 peer-focus:text-[0.68rem] peer-focus:text-[#4a7c59] peer-focus:font-medium peer-focus:tracking-[0.04em] peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[0.68rem] peer-not-placeholder-shown:text-[#4a7c59] peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:tracking-[0.04em]">Postal Code</label>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2 */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-dm w-7 h-7 rounded-full bg-[#1c2e1f] text-[#f7f4ef] flex items-center justify-center text-[0.75rem] font-medium shrink-0">2</span>
                <h2 className="text-[1.4rem] font-normal text-[#1c1a16]">Payment Method</h2>
              </div>

              {/* toggles */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{ v: 'mpesa', icon: Smartphone, label: 'Lipa na M-Pesa' }, { v: 'card', icon: CreditCard, label: 'Credit / Debit Card' }].map(({ v, icon: Icon, label }) => (
                  <button 
                    key={v} 
                    type="button" 
                    onClick={() => setPaymentMethod(v)} 
                    className={`font-dm relative flex flex-col items-center justify-center gap-2 p-5 rounded-[18px] border-2 text-[0.82rem] transition-all duration-300 overflow-hidden hover:-translate-y-0.5 ${
                      paymentMethod === v 
                      ? 'bg-white border-[#1c2e1f] text-[#1c2e1f] font-medium shadow-[0_8px_24px_rgba(28,46,31,0.1)]' 
                      : 'bg-[#faf8f4] border-[#ede8df] text-[#7a7060] font-light'
                    }`}
                  >
                    {paymentMethod === v && <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#4a7c59]" />}
                    <Icon size={22} className={paymentMethod === v ? 'text-[#4a7c59]' : 'text-[#b0a898]'} />
                    {label}
                  </button>
                ))}
              </div>

              {/* payment fields */}
              <div className="bg-white border border-[#ede8df] rounded-[20px] overflow-hidden">
                {paymentMethod === 'mpesa' ? (
                  <div className="p-7 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-[#e8f0ea] flex items-center justify-center">
                        <Smartphone size={18} className="text-[#4a7c59]" />
                      </div>
                      <div>
                        <p className="font-dm text-[0.88rem] font-medium text-[#1c1a16] mb-[0.15rem]">M-Pesa STK Push</p>
                        <p className="font-dm text-[0.78rem] font-light text-[#8a8070]">We'll send a payment prompt to your phone.</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl overflow-hidden transition-colors focus-within:border-[#4a7c59]">
                      <span className="font-dm py-3.5 pl-4 pr-3 text-[0.9rem] font-normal text-[#5a5648] border-r border-[#ede8df] whitespace-nowrap">+254</span>
                      <input 
                        type="tel" 
                        required={paymentMethod === 'mpesa'} 
                        placeholder="712 345 678" 
                        value={mpesaNumber} 
                        onChange={e => setMpesaNumber(e.target.value)}
                        className="font-dm flex-1 py-3.5 px-4 bg-transparent border-none outline-none text-[0.9rem] font-light text-[#1c1a16]" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-7 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-[#e8f0ea] flex items-center justify-center">
                        <CreditCard size={18} className="text-[#4a7c59]" />
                      </div>
                      <div>
                        <p className="font-dm text-[0.88rem] font-medium text-[#1c1a16] mb-[0.15rem]">Secure Card Payment</p>
                        <p className="font-dm text-[0.78rem] font-light text-[#8a8070]">Encrypted and processed by Stripe.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl py-3 px-4 gap-2 focus-within:border-[#4a7c59] transition-colors">
                        <input type="text" placeholder="Card number" className="font-dm flex-1 bg-transparent border-none outline-none text-[0.9rem] font-light text-[#1c1a16]" />
                        <CreditCard size={16} className="text-[#c8b89a]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['MM / YY', 'CVC'].map(p => (
                          <input key={p} type="text" placeholder={p} className="font-dm bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-2xl py-3 px-4 text-[0.9rem] font-light text-[#1c1a16] outline-none focus:border-[#4a7c59] transition-colors" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>

        {/* ══════════════════════════════
            RIGHT: ORDER SUMMARY (dark)
        ══════════════════════════════ */}
        <div ref={rightRef} className={`w-[clamp(320px,35vw,440px)] shrink-0 fade-up delay-200 ${rightVisible ? 'in' : ''}`}>
          <div className="sticky top-[5.5rem] bg-[#1c2e1f] rounded-[32px] p-[clamp(1.75rem,4vw,2.5rem)] text-[#f7f4ef] overflow-hidden">
            {/* bg glow */}
            <div className="absolute top-[-20%] right-[-15%] w-[60%] aspect-square rounded-full bg-[radial-gradient(circle,#2c4c3b_0%,transparent_70%)] opacity-60 pointer-events-none" />

            <h2 className="relative text-[1.6rem] font-light text-[#f7f4ef] mb-7">Order Summary</h2>

            {/* free delivery progress */}
            {cartTotal < FREE_DELIVERY_THRESHOLD && (
              <div className="relative bg-white/5 rounded-2xl p-4 mb-6">
                <p className="font-dm text-[0.75rem] font-light text-[#a8c5a0] mb-2.5">
                  Add <strong className="text-[#f7f4ef]">KES {(FREE_DELIVERY_THRESHOLD - cartTotal).toLocaleString()}</strong> for free delivery
                </p>
                <div className="h-[5px] bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4a7c59] to-[#a8c5a0] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            {/* items (with Tailwind custom scrollbar variants) */}
            <ul className="relative max-h-[280px] overflow-y-auto flex flex-col gap-4 pb-5 mb-5 border-b border-white/10 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden shrink-0 relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Leaf size={18} className="text-white/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.95rem] font-normal text-[#f7f4ef] leading-[1.3] mb-1.5 truncate">{item.name}</p>
                    {/* qty controls */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity?.(item.id, Math.max(1, item.quantity - 1))} className="w-[22px] h-[22px] rounded-full bg-white/5 flex items-center justify-center text-[#a8c5a0] transition-colors hover:bg-white/15">
                        <Minus size={10} />
                      </button>
                      <span className="font-dm text-[0.78rem] font-medium text-[#f7f4ef] w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity?.(item.id, item.quantity + 1)} className="w-[22px] h-[22px] rounded-full bg-white/5 flex items-center justify-center text-[#a8c5a0] transition-colors hover:bg-white/15">
                        <Plus size={10} />
                      </button>
                      <button onClick={() => removeFromCart?.(item.id)} className="ml-1 w-[22px] h-[22px] rounded-full bg-transparent flex items-center justify-center text-white/25 transition-colors hover:text-[#f0a898]">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <span className="font-dm text-[0.88rem] font-normal text-[#f7f4ef] shrink-0">
                    KES {(Number(item.price_kes) * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            {/* totals */}
            <div className="font-dm flex flex-col gap-2.5 mb-6">
              {[
                ['Subtotal', `KES ${cartTotal.toLocaleString()}`], 
                ['Delivery', delivery === 0 ? 'Free' : `KES ${delivery.toLocaleString()}`]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-[0.85rem] font-light text-[#8a9e8c]">
                  <span>{l}</span><span className="text-[#d8d0c4]">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end pt-5 border-t border-white/10 mb-7">
              <span className="font-dm text-[0.88rem] font-light text-[#8a9e8c]">Total</span>
              <span className="text-[clamp(1.6rem,2.5vw,2rem)] font-light text-[#f7f4ef] leading-none">
                <span className="font-dm text-[0.75rem] text-[#8a9e8c] mr-1.5">KES</span>
                {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* submit */}
            <button 
              form="checkout-form" 
              type="submit" 
              disabled={isProcessing} 
              className={`font-dm w-full p-4 bg-[#f7f4ef] text-[#1c2e1f] rounded-full text-[0.95rem] font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.18)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-[18px] h-[18px] border-2 border-[#1c2e1f]/20 border-t-[#1c2e1f] rounded-full animate-spin" />
                  Processing…
                </>
              ) : paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Pay Securely'}
            </button>

            {/* trust line */}
            <div className="flex flex-col gap-2.5 mt-5">
              {[
                { icon: Lock, text: '256-bit SSL Encrypted Checkout' }, 
                { icon: ShieldCheck, text: 'GMP Certified Authentic Products' }, 
                { icon: CheckCircle2, text: '30-Day Satisfaction Guarantee' }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="font-dm flex items-center gap-2.5 text-[0.76rem] font-light text-[#6a8a6c]">
                  <Icon size={13} className="text-[#4a7c59] shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;