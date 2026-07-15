import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, ShieldCheck, Lock, CheckCircle, Smartphone, Truck } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a0504] border-t-[4px] border-[#811816] font-dm">
      
      {/* ════════ FOOTER TOP: LINKS & INFO (PERFECTLY SPACED) ════════ */}
      <div className="px-6 pt-12 pb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10 md:gap-8">
          
          {/* COLUMN 1: Brand & Social */}
          <div className="flex flex-col gap-5 md:w-[35%] max-w-sm">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <img 
                src="/logo.png" 
                alt="Fohow Eden Life Logo" 
                className="h-12 w-12 object-cover rounded-full opacity-90 transition-opacity group-hover:opacity-100" 
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <h3 className="font-garamond text-2xl text-[#d2a356]">
                <span className="text-[#811816]">Fohow</span> Eden Life
              </h3>
            </Link>

            <p className="text-[0.85rem] text-[#e8d5d5] font-light leading-relaxed">
              Nationwide B2B Wholesale Distributors of premium TCM health and wellness formulas. Partnering with clinics and businesses across Kenya.
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <a href="https://www.instagram.com/edenlifefohow/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#2a0808] flex items-center justify-center text-[#d2a356] hover:bg-[#811816] hover:text-[#f7f4ef] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@edenlifefohow" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#2a0808] flex items-center justify-center text-[#d2a356] hover:bg-[#811816] hover:text-[#f7f4ef] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2: Explore */}
          <div className="flex flex-col gap-4 md:w-[25%]">
            <h4 className="text-[0.95rem] font-medium text-[#f7f4ef]">Explore</h4>
            <nav className="flex flex-col gap-3 text-[0.85rem] text-[#a0998e]">
              <Link to="/shop" className="hover:text-[#d2a356] transition-colors w-fit">The Apothecary</Link>
              <Link to="/philosophy" className="hover:text-[#d2a356] transition-colors w-fit">Our Philosophy</Link>
              <Link to="/resources" className="hover:text-[#d2a356] transition-colors w-fit">Resource Center</Link>
              <Link to="/consultations" className="text-[#d2a356] hover:text-[#e0b772] transition-colors w-fit">Book Free Consultation</Link>
              <Link to="/blog" className="hover:text-[#d2a356] transition-colors w-fit">Journal</Link>

            </nav>
          </div>

          {/* COLUMN 3: Headquarters */}
          <div className="flex flex-col gap-4 md:w-[30%] max-w-sm">
            <h4 className="text-[0.95rem] font-medium text-[#f7f4ef]">Headquarters</h4>
            <div className="flex flex-col gap-3 text-[0.85rem] text-[#a0998e]">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#811816] shrink-0 mt-1" />
                <p className="leading-relaxed">
                  Cargen House, Suite M203<br/>
                  Mezzanine Floor, Harambee Ave<br/>
                  Nairobi, Kenya
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#811816] shrink-0" />
                <a href="tel:+254793055015" className="hover:text-[#d2a356] transition-colors">
                  0793 055 015
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#811816] shrink-0" />
                <a href="mailto:edenlife29@gmail.com" className="hover:text-[#d2a356] transition-colors">
                  edenlife29@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════ TRUST BADGES & PAYMENT SECURITY ════════ */}
      <div className="px-6 py-10 border-y border-[#811816]/30 bg-[#1a0504]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 text-[#d2a356]">
          {[
            { icon: ShieldCheck, text: 'GMP Certified' }, 
            { icon: Lock, text: 'SSL SECURE PAYMENT' },
            { icon: Smartphone, text: 'Lipa na M-Pesa' }, 
            { icon: CheckCircle, text: 'Encrypted Checkout' },
            { icon: Truck, text: 'Fast Fulfillment' }
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-[0.8rem] font-bold uppercase tracking-widest opacity-90 hover:opacity-100 transition-opacity">
              <Icon size={20} className="text-[#811816]" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ════════ LEGAL & BOTTOM LINKS ════════ */}
      <div className="px-6 py-8 bg-[#110302]">
        <div className="max-w-5xl mx-auto text-center">
          <h4 className="text-[#d2a356] text-[0.75rem] font-bold uppercase tracking-[0.15em] mb-3">
            Terms & Conditions / Return Policy
          </h4>
          <p className="text-[#8a8070] text-[0.75rem] font-light leading-relaxed max-w-3xl mx-auto mb-8">
            <strong className="text-[#e8d5d5] font-medium">Strict No-Return Policy:</strong> Due to strict health, safety, and hygiene protocols regarding consumable TCM supplements, <strong className="text-[#811816] font-medium">all sales are final. Goods once sold cannot be returned, exchanged, or refunded.</strong> Please ensure your wholesale order is accurate before completing payment.
          </p>
          
          {/* THE CUSTOM B2B NAVIGATION */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-[0.8rem] text-[#d2a356] font-medium uppercase tracking-widest mb-6">
            <Link to="/clinical-map" className="hover:text-[#f7f4ef] transition-colors">
              Interactive Clinical Map
            </Link>
            <span className="text-[#811816] opacity-50">|</span>
            <Link to="/seminars" className="hover:text-[#f7f4ef] transition-colors">
              Upcoming Seminars
            </Link>
            <span className="text-[#811816] opacity-50">|</span>
            <Link to="/privacy" className="hover:text-[#f7f4ef] transition-colors">
              Privacy Policy
            </Link>
          </div>

          <p className="text-[#5a5648] text-[0.7rem] uppercase tracking-wider">
            © {currentYear} Fohow Eden Life Kenya.
          </p>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;