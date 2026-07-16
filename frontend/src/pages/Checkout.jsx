import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, ShieldCheck, Lock, CheckCircle2, Leaf, Minus, Plus, Trash2, Truck, Map, Tag, X, AlertCircle, User, Copy, Check } from 'lucide-react';

import { useCart } from '../context/CartContext';
import api from '../api';

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

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu",
  "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru",
  "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

const Checkout = () => {
  const {
    cartItems,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    franchiseId,
    discountRate,
    applyFranchise,
    removeFranchise,
    removeFromCart,
    updateQuantity,
    clearCart,
    globalSettings,
    cartTax,
  } = useCart();

  // 🟢 Fixed Delivery Fee (Home Delivery Only)
  const delivery = globalSettings?.home_delivery_fee ?? 500;
  const grandTotal = cartTotal + delivery;

  const navigate = useNavigate();

  // Checkout Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copied, setCopied] = useState('');

  const [inputId, setInputId] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [applyingFranchise, setApplyingFranchise] = useState(false);
  const [piiConsent, setPiiConsent] = useState(false);

  // Cleaned up FormData with LocalStorage Hydration (Failsafe against abandonment)
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('fohow_checkout_data');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      firstName: '', lastName: '', email: '', phone: '', idNumber: '',
      county: '', town: '', address: ''
    };
  });

  // Sync valid entries back to storage to prevent data loss on accidental navigation
  useEffect(() => {
    if (!isDone) {
      localStorage.setItem('fohow_checkout_data', JSON.stringify(formData));
    }
  }, [formData, isDone]);

  const [mpesaNumber, setMpesaNumber] = useState('');

  const [leftRef, leftVisible] = useInView();
  const [rightRef, rightVisible] = useInView();

  const [errors, setErrors] = useState({});

  // 📝 Regex Patterns for 254 Compliance
  const REGEX = {
    name: /^[a-zA-Z\s]{2,40}$/,
    email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    phone: /^(7|1)[0-9]{8}$/, // Safaricom/Kenyan 9-digit suffix
    id: /^[0-9]{6,12}$/      // Supports Kenyan IDs and Passports (digit-only as per spec)
  };

  const validateField = (id, value) => {
    let error = "";
    if (!value) {
      error = "Required.";
    } else {
      if (id === 'firstName' || id === 'lastName') {
        if (!REGEX.name.test(value)) error = "Use letters only (min 2).";
      } else if (id === 'email') {
        if (!REGEX.email.test(value)) error = "Enter a valid email.";
      } else if (id === 'phone' || id === 'mpesaNumber') {
        if (!REGEX.phone.test(value)) error = "9 digits (e.g. 712345678).";
      } else if (id === 'idNumber') {
        if (!REGEX.id.test(value)) error = "6-12 digits required.";
      }
    }
    if (error) {
      setErrors(prev => ({ ...prev, [id]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    return error === "";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Real-time validation clearing
    if (errors[id]) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    // Auto-fill M-Pesa number seamlessly with contact phone
    if (id === 'phone') {
      setMpesaNumber(prev => (prev === '' || prev === formData.phone) ? value : prev);
      if (errors.mpesaNumber) setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.mpesaNumber;
        return newErrors;
      });
    }
  };

  const handleApplyFranchise = async (e) => {
    e.preventDefault();
    setApplyingFranchise(true);
    setDiscountError('');
    const result = await applyFranchise(inputId);
    setApplyingFranchise(false);
    if (result.success) {
      setInputId('');
    } else {
      setDiscountError(result.error || 'Invalid Franchise ID.');
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  // Poll for payment confirmation if order is done
  useEffect(() => {
    let interval;
    if (isDone && placedOrderNumber && !paymentConfirmed) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/mpesa/status/${placedOrderNumber}`);
          if (res.data && res.data.status === 'Paid') {
            setPaymentConfirmed(true);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDone, placedOrderNumber, paymentConfirmed]);

  if (cartItems.length === 0 && !isDone) return (
    <div className="font-garamond bg-[#f7f4ef] min-h-[100svh] flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#fcf5f5] border border-[#811816]/10 flex items-center justify-center mb-2">
        <Leaf size={28} className="text-[#d2a356]" />
      </div>
      <h2 className="text-[2.2rem] font-light text-[#1c1a16]">Your bag is empty</h2>
      <button onClick={() => navigate('/shop')} className="font-dm flex items-center gap-1.5 text-[#811816] text-[0.88rem] hover:underline">
        <ArrowLeft size={14} /> Return to Shop
      </button>
    </div>
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 🛡️ Final validation check
    const fieldErrors = {};
    let isValid = true;

    // Check all form fields
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (!value) {
        fieldErrors[key] = "Required";
        isValid = false;
      } else {
        // Run regex checks
        if (key === 'firstName' || key === 'lastName') {
          if (!REGEX.name.test(value)) { fieldErrors[key] = "Use letters only (min 2)"; isValid = false; }
        } else if (key === 'email') {
          if (!REGEX.email.test(value)) { fieldErrors[key] = "Invalid format"; isValid = false; }
        } else if (key === 'phone') {
          if (!REGEX.phone.test(value)) { fieldErrors[key] = "9 digits (e.g. 712345678)"; isValid = false; }
        } else if (key === 'idNumber') {
          if (!REGEX.id.test(value)) { fieldErrors[key] = "6-12 digits required"; isValid = false; }
        }
      }
    });

    // Check M-Pesa number specifically
    if (!REGEX.phone.test(mpesaNumber)) {
      fieldErrors.mpesaNumber = "Enter a valid 9-digit number";
      isValid = false;
    }

    // Check PII Consent
    if (!piiConsent) {
      fieldErrors.piiConsent = "You must agree to the data protection policy.";
      isValid = false;
    }

    if (!isValid) {
      setErrors(fieldErrors);
      // Find first error and scroll to it
      const firstErrorField = Object.keys(fieldErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsProcessing(true);

    const orderPayload = {
      customer: {
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, phone: formData.phone,
        idNumber: formData.idNumber
      },
      delivery: {
        method: 'home', // 🟢 Fixed: Changed back to 'home' to match DB logic
        fee: delivery,
        address: {
          county: formData.county,
          estate: formData.town,
          building: formData.address
        }
      },
      payment: {
        method: 'mpesa',
        mpesaNumber: mpesaNumber
      },
      items: cartItems.map(item => ({
        id: item.id, name: item.name, quantity: item.quantity, price_kes: item.price_kes
      })),
      franchiseId: franchiseId || null,
      totals: {
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: cartTax,
        deliveryFee: delivery,
        grandTotal: grandTotal
      },
      piiConsent: piiConsent
    };

    try {
      const response = await api.post('/orders/checkout', orderPayload);
      const data = response.data;

      if (data.success || response.status === 200) {
        if (clearCart) clearCart();
        if (data.orderNumber) setPlacedOrderNumber(data.orderNumber);
        setIsDone(true);
      } else {
        alert(`Failed to place order: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Network error. Please make sure your backend server is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isDone) return (
    <div className="font-garamond bg-[#f7f4ef] min-h-[100svh] flex flex-col items-center justify-center p-8 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#fcf5f5] flex items-center justify-center mb-3 animate-in zoom-in duration-500 border border-[#811816]/10">
        <CheckCircle2 size={32} className="text-[#811816]" />
      </div>
      <h2 className="text-[clamp(2rem,4vw,3rem)] font-light text-[#1c1a16] leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {paymentConfirmed ? (
          <>Payment Received.<br /><em className="text-[#811816] italic">Thank you.</em></>
        ) : (
          <>Order Received.<br /><em className="text-[#811816] italic">Pending Verification.</em></>
        )}
      </h2>
      <p className="font-dm text-[0.95rem] font-light text-[#5a5648] max-w-[420px] leading-[1.75] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        {paymentConfirmed ? (
          <>Your wholesale order is confirmed and currently being processed for <strong className="text-[#811816]">Home Delivery</strong>. A confirmation receipt will arrive via SMS and email shortly.</>
        ) : (
          <>Please check your email for payment instructions. We will contact you shortly once your payment is verified to process your order for <strong className="text-[#811816]">Home Delivery</strong>.</>
        )}
      </p>
      <button onClick={() => navigate('/shop')} className="font-dm mt-4 flex items-center gap-2 py-3.5 px-8 bg-[#811816] text-[#f7f4ef] rounded-full text-[0.88rem] font-medium transition-colors hover:bg-[#6a1210] hover:drop-shadow-[0_0_8px_rgba(129,24,22,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <ArrowLeft size={14} /> Continue Browsing
      </button>
    </div>
  );

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh]">

      {/* ── top nav bar ── */}
      <div className="bg-white border-b border-[#ede8df] py-5 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link to="/shop" className="font-dm flex items-center gap-1.5 text-[0.82rem] font-normal text-[#8a8070] transition-colors hover:text-[#811816]">
            <ArrowLeft size={14} /> Back to Apothecary
          </Link>
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-[#d2a356]" />
            <span className="font-dm text-[0.72rem] font-normal text-[#8a8070]">Secure 254 Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

        {/* ══════════════════════════════
            LEFT: FORM
        ══════════════════════════════ */}
        <div ref={leftRef} className={`w-full lg:flex-1 min-w-0 fade-up ${leftVisible ? 'in' : ''}`}>
          <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] text-[#1c1a16] mb-10">
            Complete your<br /><em className="text-[#811816] italic">order.</em>
          </h1>

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-10">

            {/* STEP 1: Contact Details */}
            <section className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="font-dm w-7 h-7 rounded-full bg-[#811816] text-[#f7f4ef] flex items-center justify-center text-[0.75rem] font-medium shrink-0">1</span>
                  <h2 className="text-[1.4rem] font-normal text-[#1c1a16]">Contact Info</h2>
                </div>
                <User size={20} className="text-[#a0998e]" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      required type="text" id="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      onBlur={(e) => validateField('firstName', e.target.value)}
                      placeholder="First Name" 
                      className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.firstName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                    />
                    <label htmlFor="firstName" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.firstName ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>First Name</label>
                    {errors.firstName && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.firstName}</p>}
                  </div>
                  <div className="relative">
                    <input 
                      required type="text" id="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      onBlur={(e) => validateField('lastName', e.target.value)}
                      placeholder="Last Name" 
                      className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.lastName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                    />
                    <label htmlFor="lastName" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.lastName ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>Last Name</label>
                    {errors.lastName && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div className="relative">
                    <input 
                      required type="email" id="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="Email" 
                      className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                    />
                    <label htmlFor="email" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.email ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>Email Address</label>
                    {errors.email && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                  </div>
                  <div className={`flex flex-col gap-1`}>
                    <div className={`flex items-center bg-[#faf8f4] border-[1.5px] rounded-2xl overflow-hidden transition-all focus-within:ring-[3px] ${errors.phone ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-[#ede8df] focus-within:border-[#d2a356] focus-within:ring-[#d2a356]/20'}`}>
                      <span className="font-dm py-3 pl-4 pr-3 text-[0.9rem] font-medium text-[#5a5648] border-r border-[#ede8df]">+254</span>
                      <input 
                        required type="tel" id="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        onBlur={(e) => validateField('phone', e.target.value)}
                        placeholder="Primary Phone" 
                        className="font-dm flex-1 py-3 px-4 bg-transparent border-none outline-none text-[0.9rem] font-light text-[#1c1a16] placeholder:text-[#a0998e]" 
                      />
                    </div>
                    {errors.phone && <p className="text-[0.65rem] text-red-500 font-medium pl-2 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="relative">
                  <input 
                    required type="text" id="idNumber" 
                    value={formData.idNumber} 
                    onChange={handleInputChange} 
                    onBlur={(e) => validateField('idNumber', e.target.value)}
                    placeholder="National ID / Passport Number" 
                    className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.idNumber ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                  />
                  <label htmlFor="idNumber" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.idNumber ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>National ID / Passport Number</label>
                  {errors.idNumber && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.idNumber}</p>}
                </div>
              </div>
            </section>

            {/* STEP 2: Delivery Details */}
            <section className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="font-dm w-7 h-7 rounded-full bg-[#811816] text-[#f7f4ef] flex items-center justify-center text-[0.75rem] font-medium shrink-0">2</span>
                  <h2 className="text-[1.4rem] font-normal text-[#1c1a16]">Delivery Details</h2>
                </div>
                <Truck size={20} className="text-[#a0998e]" />
              </div>

              <div className="bg-[#fcf5f5] border border-[#811816]/10 p-4 rounded-2xl mb-4 flex gap-3">
                <Map size={18} className="text-[#811816] shrink-0 mt-0.5" />
                <p className="font-dm text-[0.8rem] text-[#5a5648] leading-relaxed">
                  Enter your physical location below. We offer guaranteed nationwide shipping for all healthcare products via our verified logistics partners.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <select 
                    required id="county" 
                    value={formData.county} 
                    onChange={handleInputChange} 
                    onBlur={(e) => validateField('county', e.target.value)}
                    className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] appearance-none cursor-pointer ${errors.county ? 'border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`}
                  >
                    <option value="" disabled></option>
                    {KENYAN_COUNTIES.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                  <label htmlFor="county" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-valid:top-[0.45rem] peer-valid:text-[0.68rem] ${errors.county ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-valid:text-[#811816]'}`}>Select County</label>
                  {errors.county && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.county}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      required type="text" id="town" 
                      value={formData.town} 
                      onChange={handleInputChange} 
                      onBlur={(e) => validateField('town', e.target.value)}
                      placeholder="Town / Estate" 
                      className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.town ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                    />
                    <label htmlFor="town" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.town ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>Town / Estate</label>
                    {errors.town && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.town}</p>}
                  </div>
                  <div className="relative">
                    <input 
                      required type="text" id="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      onBlur={(e) => validateField('address', e.target.value)}
                      placeholder="Building / Street" 
                      className={`peer w-full bg-[#faf8f4] border-[1.5px] rounded-2xl pt-[1.1rem] px-4 pb-2 font-dm text-[0.9rem] font-light text-[#1c1a16] outline-none transition-all focus:ring-[3px] placeholder-transparent ${errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-[#ede8df] focus:border-[#d2a356] focus:ring-[#d2a356]/20'}`} 
                    />
                    <label htmlFor="address" className={`absolute left-4 top-1/2 -translate-y-1/2 font-dm text-[0.85rem] font-light pointer-events-none transition-all peer-focus:top-[0.45rem] peer-focus:text-[0.68rem] peer-focus:font-medium peer-not-placeholder-shown:top-[0.45rem] peer-not-placeholder-shown:text-[0.68rem] ${errors.address ? 'text-red-400 peer-focus:text-red-400' : 'text-[#a0998e] peer-focus:text-[#d2a356] peer-not-placeholder-shown:text-[#811816]'}`}>Exact Building / Street</label>
                    {errors.address && <p className="absolute left-4 -bottom-5 text-[0.65rem] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.address}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 3: Payment Method (Locked to M-Pesa) */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="font-dm w-7 h-7 rounded-full bg-[#811816] text-[#f7f4ef] flex items-center justify-center text-[0.75rem] font-medium shrink-0">3</span>
                  <h2 className="text-[1.4rem] font-normal text-[#1c1a16]">Secure Payment</h2>
                </div>
                <Lock size={18} className="text-[#a0998e]" />
              </div>

              <div className="bg-white border-2 border-[#811816] rounded-[20px] overflow-hidden shadow-[0_8px_24px_rgba(129,24,22,0.08)]">
                <div className="bg-[#811816] px-6 py-3 flex items-center gap-2">
                  <Smartphone size={18} className="text-white" />
                  <span className="font-dm text-[0.85rem] font-medium text-white tracking-wider uppercase">Lipa na M-Pesa (Paybill)</span>
                </div>
                <div className="p-6">
                  <p className="font-dm text-[0.95rem] font-medium text-[#1c1a16] mb-4">
                    Please make your payment to our official Paybill below.
                  </p>
                  
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center justify-between bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-xl p-3">
                      <div>
                        <p className="font-dm text-[0.75rem] text-[#8a8070] uppercase tracking-wider mb-0.5">Paybill Number</p>
                        <p className="font-dm text-[1.2rem] font-bold text-[#811816]">222111</p>
                      </div>
                      <button type="button" onClick={() => handleCopy('222111', 'paybill')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ede8df] text-[#5a5648] hover:bg-[#f0ece3] transition-colors">
                        {copied === 'paybill' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        <span className="font-dm text-[0.75rem] font-medium">{copied === 'paybill' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-[#faf8f4] border-[1.5px] border-[#ede8df] rounded-xl p-3">
                      <div>
                        <p className="font-dm text-[0.75rem] text-[#8a8070] uppercase tracking-wider mb-0.5">Account Number</p>
                        <p className="font-dm text-[1.2rem] font-bold text-[#811816]">79814</p>
                      </div>
                      <button type="button" onClick={() => handleCopy('79814', 'account')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ede8df] text-[#5a5648] hover:bg-[#f0ece3] transition-colors">
                        {copied === 'account' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        <span className="font-dm text-[0.75rem] font-medium">{copied === 'account' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="bg-[#fcf5f5] rounded-xl p-3 border border-[#811816]/10">
                      <p className="font-dm text-[0.75rem] text-[#8a8070] uppercase tracking-wider mb-0.5">Account Name</p>
                      <p className="font-dm text-[1rem] font-bold text-[#1c1a16]">FOHOW EDEN LIFE</p>
                    </div>
                  </div>

                  <p className="font-dm text-[0.85rem] font-light text-[#8a8070] mb-4">
                    Enter the M-Pesa number you will use to pay. This helps us verify your transaction quickly.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center bg-[#faf8f4] border-[1.5px] rounded-2xl overflow-hidden transition-all focus-within:ring-[3px] ${errors.mpesaNumber ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/10' : 'border-[#ede8df] focus-within:border-[#d2a356] focus-within:ring-[#d2a356]/20'}`}>
                      <span className="font-dm py-3.5 pl-4 pr-3 text-[0.95rem] font-medium text-[#5a5648] border-r border-[#ede8df]">+254</span>
                      <input
                        id="mpesaNumber"
                        type="tel" required placeholder="Paying Phone Number"
                        value={mpesaNumber} 
                        onChange={e => {
                          setMpesaNumber(e.target.value);
                          if (errors.mpesaNumber) setErrors(prev => ({ ...prev, mpesaNumber: "" }));
                        }}
                        onBlur={(e) => validateField('mpesaNumber', e.target.value)}
                        className="font-dm flex-1 py-3.5 px-4 bg-transparent border-none outline-none text-[0.95rem] font-bold text-[#1c1a16] placeholder:text-[#a0998e] placeholder:font-normal"
                      />
                    </div>
                    {errors.mpesaNumber && <p className="text-[0.65rem] text-red-500 font-medium pl-2 animate-in fade-in slide-in-from-top-1">{errors.mpesaNumber}</p>}
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* ══════════════════════════════
            RIGHT: ORDER SUMMARY (dark)
        ══════════════════════════════ */}
        <div ref={rightRef} className={`w-full lg:w-[clamp(320px,35vw,440px)] shrink-0 fade-up delay-200 ${rightVisible ? 'in' : ''}`}>
          <div className="sticky top-[5.5rem] bg-[#2a0808] rounded-[32px] p-[clamp(1.75rem,4vw,2.5rem)] text-[#f7f4ef] overflow-hidden shadow-2xl">
            {/* bg glow */}
            <div className="absolute top-[-20%] right-[-15%] w-[60%] aspect-square rounded-full bg-[radial-gradient(circle,#811816_0%,transparent_70%)] opacity-40 pointer-events-none" />

            <h2 className="relative text-[1.6rem] font-light text-[#f7f4ef] mb-7">Order Summary</h2>

            {/* items */}
            <ul className="relative max-h-[240px] overflow-y-auto flex flex-col gap-4 pb-5 mb-5 border-b border-white/10 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0ece3] overflow-hidden shrink-0 relative flex items-center justify-center">
                    {item.image_url ? (
                      <img src={api.getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <Leaf size={18} className="text-[#c8b89a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.95rem] font-normal text-[#f7f4ef] leading-[1.3] mb-1.5 truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => updateQuantity?.(item.id, Math.max(1, item.quantity - 1))} className="w-[22px] h-[22px] rounded-full bg-white/5 flex items-center justify-center text-[#d2a356] transition-colors hover:bg-white/15">
                        <Minus size={10} />
                      </button>
                      <span className="font-dm text-[0.78rem] font-medium text-[#f7f4ef] w-5 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity?.(item.id, item.quantity + 1)} className="w-[22px] h-[22px] rounded-full bg-white/5 flex items-center justify-center text-[#d2a356] transition-colors hover:bg-white/15">
                        <Plus size={10} />
                      </button>
                      <button type="button" onClick={() => removeFromCart?.(item.id)} className="ml-1 w-[22px] h-[22px] rounded-full bg-transparent flex items-center justify-center text-[#e8d5d5]/50 transition-colors hover:text-[#e0b772]">
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

            {/* Franchise ID Integration */}
            <div className="relative mb-5 pb-5 border-b border-white/10">
              {franchiseId ? (
                <div className="flex items-center justify-between p-3 bg-[#4a0e0d] border border-[#d2a356]/40 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-[#d2a356]" />
                    <div>
                      <p className="font-dm text-[0.75rem] uppercase tracking-widest text-[#d2a356] font-bold">Franchise Applied</p>
                      <p className="font-dm text-[0.85rem] font-medium text-[#f7f4ef]">{franchiseId}</p>
                    </div>
                  </div>
                  <button onClick={removeFranchise} className="text-[#e8d5d5] hover:text-red-400 transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="font-dm text-[0.8rem] font-medium text-[#e8d5d5] flex items-center gap-1.5">
                    <Tag size={14} className="text-[#d2a356]" /> Have a Franchise ID?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      placeholder="Enter ID for discount"
                      className="flex-1 px-3.5 py-2 bg-[#1a0504]/50 border border-[#811816]/30 text-[#f7f4ef] placeholder:text-[#e8d5d5]/50 rounded-xl font-dm text-[0.85rem] outline-none focus:border-[#d2a356] transition-colors uppercase"
                    />
                    <button
                      onClick={handleApplyFranchise}
                      disabled={applyingFranchise}
                      className="px-4 py-2 bg-[#811816] text-[#f7f4ef] hover:bg-[#d2a356] hover:text-[#1a0504] font-dm text-[0.85rem] font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {applyingFranchise ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && <p className="font-dm text-xs text-red-400 mt-1">{discountError}</p>}
                </div>
              )}
            </div>

            {/* totals */}
            <div className="font-dm flex flex-col gap-2.5 mb-6 relative">
              <div className="flex justify-between text-[0.85rem] font-light text-[#e8d5d5]">
                <span>Retail Subtotal</span><span className="text-[#f7f4ef] font-medium">KES {cartSubtotal.toLocaleString()}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-[0.85rem] font-medium text-[#d2a356] animate-in slide-in-from-top-1 fade-in">
                  <span>Total Savings (Discount Applied)</span><span>- KES {cartDiscount.toLocaleString()}</span>
                </div>
              )}


              <div className="flex justify-between text-[0.85rem] font-light text-[#e8d5d5]">
                <span>Logistics (Home Delivery)</span><span className="text-[#f7f4ef] font-medium">KES {delivery.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-5 border-t border-white/10 mb-2 relative">
              <span className="font-dm text-[0.88rem] font-light text-[#e8d5d5]">Total</span>
              <span className="text-[clamp(1.6rem,2.5vw,2rem)] font-light text-[#d2a356] leading-none drop-shadow-[0_0_8px_rgba(210,163,86,0.3)]">
                <span className="font-dm text-[0.75rem] text-[#e8d5d5] mr-1.5">KES</span>
                {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* B2B Transaction Limit Notice */}
            {grandTotal > 250000 && (
              <div className="flex gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <AlertCircle size={15} className="text-[#d2a356] shrink-0 mt-0.5" />
                <p className="font-dm text-[0.7rem] text-[#e8d5d5]/70 leading-relaxed">
                  <strong className="text-[#d2a356]">Wholesale Notice:</strong> Orders over KES 250,000 exceed Safaricom's limit. Please split into multiple orders.
                </p>
              </div>
            )}

            {/* Mandatory Policy Acknowledgement */}
            <p className="font-dm text-[0.75rem] text-[#e8d5d5]/60 mb-6 leading-relaxed italic text-center">
              * By paying, you acknowledge our <strong className="text-[#d2a356]">Strict No-Return Policy</strong>. Due to health & hygiene, all TCM sales are final.
            </p>

            {/* PII Consent Checkbox */}
            <div className="flex items-start gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
              <input 
                type="checkbox" 
                id="piiConsent" 
                checked={piiConsent}
                onChange={(e) => {
                  setPiiConsent(e.target.checked);
                  if (errors.piiConsent && e.target.checked) setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.piiConsent;
                    return newErrors;
                  });
                }}
                className="mt-1 w-4 h-4 accent-[#d2a356] bg-transparent border-white/20 shrink-0 cursor-pointer"
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="piiConsent" className="font-dm text-[0.8rem] text-[#e8d5d5] leading-relaxed cursor-pointer">
                  I consent to the collection and processing of my personal and payment data in accordance with the <strong className="text-[#d2a356]">Kenya Data Protection Act</strong>.
                </label>
                {errors.piiConsent && <p id="piiConsent-error" className="text-[0.65rem] text-red-400 font-medium animate-in fade-in slide-in-from-top-1">{errors.piiConsent}</p>}
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="relative w-full bg-[#d2a356] text-[#1c1a16] py-4 rounded-xl font-dm font-bold text-[0.95rem] tracking-[0.02em] hover:bg-[#e0b772] hover:drop-shadow-[0_0_12px_rgba(210,163,86,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#1c1a16]/30 border-t-[#1c1a16] rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Smartphone size={18} />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;