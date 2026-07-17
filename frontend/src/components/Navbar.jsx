import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add blur effect when scrolling down
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${
          scrolled || isMobileMenuOpen 
            ? 'bg-[#f7f4ef]/95 backdrop-blur-md border-b border-[#e8dfd5] py-3 md:py-4' 
            : 'bg-transparent py-4 md:py-6'
        }`}
      >
        <div className="px-6 mx-auto max-w-7xl flex items-center justify-between">

          {/* NAVBAR BRANDING */}
          <Link to="/" className="flex items-center gap-3 z-[70] relative group">
            {/* The Image Logo */}
            <img 
              src="/logo.png" 
              alt="Fohow Eden Life Logo" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none' }} // Hides image if path is wrong
            />
            
            {/* The Text Branding (Hidden on very small mobile screens to save space) */}
            <span className="font-garamond text-2xl tracking-wide text-[#1c1a16] hidden sm:block">
              <strong className="text-[#811816] font-medium">Fohow</strong> <span className="text-[#d2a356] font-light drop-shadow-[0_0_8px_rgba(210,163,86,0.3)]">Eden Life</span>
            </span>
          </Link>



          {/* Desktop Navigation - Glowing Gold Hover States */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2 w-max">
            {[
              { path: '/shop', label: 'Apothecary' },
              { path: '/philosophy', label: 'Philosophy' },
              { path: '/blog', label: 'Journal' },
              { path: '/clinical-map', label: 'Clinical Map' }
            ].map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`font-dm text-[0.95rem] font-medium transition-all duration-300 ${
                  location.pathname.startsWith(link.path) 
                    ? 'text-[#d2a356] drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]' 
                    : 'text-[#5a5648] hover:text-[#d2a356] hover:drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-[1px] h-4 bg-[#d2a356]/40 hidden lg:block" />
            
            <div className="relative group">
              <button className={`font-dm text-[0.95rem] font-medium flex items-center gap-1 transition-all duration-300 ${
                ['/resources', '/seminars'].some(p => location.pathname.startsWith(p))
                  ? 'text-[#d2a356] drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]'
                  : 'text-[#811816] hover:text-[#d2a356]'
              }`}>
                B2B Hub <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-2 flex flex-col min-w-[180px]">
                  <Link to="/resources" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-center ${location.pathname.startsWith('/resources') ? 'bg-[#fcf5f5] text-[#811816]' : 'text-[#5a5648] hover:bg-[#fcf5f5] hover:text-[#811816]'}`}>Resource Center</Link>
                  <Link to="/seminars" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-center ${location.pathname.startsWith('/seminars') ? 'bg-[#fcf5f5] text-[#811816]' : 'text-[#5a5648] hover:bg-[#fcf5f5] hover:text-[#811816]'}`}>Upcoming Seminars</Link>
                </div>
              </div>
            </div>
            
            <div className="w-[1px] h-4 bg-[#d2a356]/40 hidden lg:block" />

            <Link 
              to="/consultations" 
              className={`font-dm text-[0.95rem] font-medium transition-all duration-300 ${
                location.pathname.startsWith('/consultations')
                  ? 'text-[#d2a356] drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]'
                  : 'text-[#5a5648] hover:text-[#d2a356] hover:drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]'
              }`}
            >
              Consultations
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 md:gap-4 z-[70] relative">
            {/* Cart Icon - Glowing Gold Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#5a5648] transition-all duration-300 rounded-full hover:bg-[#811816]/5 hover:text-[#811816]"
              aria-label="Open Cart"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-[#811816] rounded-full bg-[#d2a356] drop-shadow-[0_0_6px_rgba(210,163,86,0.6)] translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="p-2 -mr-2 md:hidden text-[#5a5648] transition-colors hover:text-[#811816]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-[#f7f4ef] z-[100] h-[100dvh] pt-24 pb-8 overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col px-8 md:hidden ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex flex-col gap-8 text-center mt-8">
          {[
            { path: '/', label: 'Home', isB2B: false, exact: true },
            { path: '/shop', label: 'The Apothecary', isB2B: false },
            { path: '/philosophy', label: 'Our Philosophy', isB2B: false },
            { path: '/blog', label: 'Journal', isB2B: false },
            { path: '/clinical-map', label: 'Clinical Map', isB2B: false },
            { path: '/resources', label: 'Resource Center', isB2B: true },
            { path: '/seminars', label: 'Seminars', isB2B: true },
            { path: '/consultations', label: 'Consultations', isB2B: false }
          ].map(link => {
            const isActive = link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);
            const baseColor = link.isB2B ? 'text-[#811816]' : 'text-[#1c1a16]';
            return (
              <Link 
                key={link.path}
                to={link.path} 
                className={`font-garamond text-4xl font-light transition-all active:text-[#d2a356] active:drop-shadow-[0_0_8px_rgba(210,163,86,0.5)] ${
                  isActive ? 'text-[#d2a356] drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]' : baseColor
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        
        {/* Mobile menu bottom accent */}
        <div className="mt-auto pt-10 pb-4 flex justify-center">
          <div className="w-12 h-[2px] bg-[#d2a356] drop-shadow-[0_0_4px_rgba(210,163,86,0.5)] rounded-full"></div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
