import { useState, useEffect, useRef } from 'react';
import { Plus, Search, SlidersHorizontal, X, Leaf, ArrowRight, MessageSquare, Tag, Filter } from 'lucide-react';
import api from '../api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

/* ── robust fade-up hook ── */
const useInView = (threshold = 0.08) => {
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


/* ── TCM Pillar Navigation ── */
const categoryGroups = {
  "Cleanse (Detoxification)": [
    "Blood Detox", "Detox", "Skin Detox", "Gut Health", "Oral Care"
  ],
  "Regulate (Balance)": [
    "Cardiovascular", "Energy", "Digestive", "Joint Health", "Eye Health", "Women's Health", "Men's Health", "Pain Relief"
  ],
  "Nourish (Supplementation)": [
    "Bone Health", "Immunity", "Qi Tonic", "Kidney Tonic", "Longevity", "General Wellness", "Antioxidant", "Anti-Aging", "Beauty", "Skin Care", "Hair Care", "Skin Health"
  ],
  "Therapy & Accessories": [
    "Therapy Accessory", "Wellness", "Accessories"
  ]
};

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

const Shop = () => {

  // Prevent scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, discountRate } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(location.state?.search || '');

  // Hydrate targeted search queries from external components like MeridianMap
  useEffect(() => {
    if (location.state?.search) {
      setSearchQuery(location.state.search);
      // Clean up state immediately so manual clears work
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [expandedGroup, setExpandedGroup] = useState("");
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { globalDiscount } = useSettings();
  const [sortBy, setSortBy] = useState('default');

  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  const [headerRef, headerVisible] = useInView(0.05);
  const [gridRef, gridVisible] = useInView(0.04);

  // Fetch data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.ok && response.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);
          const uniqueCategories = ['All', ...new Set(response.data.map(p => p.category_name).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileFilterOpen]);

  // Filter Engine
  useEffect(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category_name.toLowerCase() === selectedCategory.toLowerCase());
    }

    result = result.filter(p => Number(p.price_kes) <= maxPrice);

    result = [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price_kes) - Number(b.price_kes);
      if (sortBy === 'price_desc') return Number(b.price_kes) - Number(a.price_kes);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, maxPrice, products, sortBy]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(200000);
    setSortBy('default');
    setExpandedGroup("");
    setIsMobileFilterOpen(false); 
  };

  return (
    // REMOVED: overflow-x-hidden to prevent flexbox clipping
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh]">

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <div ref={headerRef} className="bg-white border-b border-[#ede8df] px-6 pt-24 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className={`fade-up ${headerVisible ? 'in' : ''}`}>
            <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#d2a356] mb-2.5 flex items-center gap-2">
              <span className="w-5 h-[1px] bg-[#d2a356] inline-block" /> Wholesale Catalog
            </p>
            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.08] tracking-[-0.01em] text-[#1c1a16]">
              B2B <em className="text-[#811816] italic">Apothecary</em>
            </h1>
          </div>

          <div className={`flex items-center gap-3 fade-up delay-100 ${headerVisible ? 'in' : ''}`}>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden font-dm flex items-center gap-2 border-[1.5px] border-[#ede8df] bg-[#f7f4ef] text-[#3a3630] rounded-full py-2.5 px-4 text-[0.82rem] font-normal hover:border-[#d2a356] transition-all"
            >
              <Filter size={14} /> Filters
              {selectedCategory !== 'All' && <span className="w-2 h-2 rounded-full bg-[#811816]" />}
            </button>

            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSort(v => !v)}
                className={`font-dm flex items-center gap-2 border-[1.5px] rounded-full py-2.5 px-4 text-[0.82rem] font-normal transition-all duration-300 whitespace-nowrap ${showSort
                    ? 'bg-[#811816] text-[#f7f4ef] border-[#811816] drop-shadow-[0_0_8px_rgba(210,163,86,0.4)]'
                    : 'bg-[#f7f4ef] text-[#3a3630] border-[#ede8df] hover:border-[#d2a356] hover:text-[#811816]'
                  }`}
              >
                <SlidersHorizontal size={14} />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </button>

              {showSort && (
                <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#ede8df] rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(28,26,22,0.1)] z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setSortBy(o.value); setShowSort(false); }}
                      className={`font-dm block w-full text-left py-2.5 px-3.5 text-[0.82rem] rounded-xl transition-colors ${sortBy === o.value
                          ? 'font-medium text-[#811816] bg-[#fcf5f5]'
                          : 'font-light text-[#5a5648] hover:bg-[#f0ece3] hover:text-[#1c1a16]'
                        }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-10">

        {isMobileFilterOpen && (
          <div 
            className="fixed inset-0 z-40 bg-[#1a0504]/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* 🟢 THE BULLETPROOF FIX: Standard Tailwind Responsive Drawer Pattern */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[340px] bg-[#f7f4ef] p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:w-1/4 md:p-0 md:shadow-none md:bg-transparent md:z-auto md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] custom-scrollbar md:pr-4 md:pb-8 shrink-0
        `}>
          
          <div className="flex items-center justify-between md:hidden mb-8 pb-4 border-b border-[#ede8df]">
            <h2 className="font-garamond text-2xl text-[#1c1a16]">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#ede8df] text-[#a0998e] hover:text-[#811816]">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Search Bar */}
            <div>
              <h3 className="font-dm text-sm uppercase tracking-widest text-[#a0998e] mb-4">Search</h3>
              <div className="flex items-center gap-2 bg-white border-[1.5px] border-[#ede8df] rounded-full py-2.5 px-4 transition-all focus-within:border-[#d2a356] focus-within:ring-4 focus-within:ring-[#d2a356]/20">
                <Search size={15} className="text-[#b0a898] shrink-0" />
                <input
                  type="text"
                  placeholder="Search catalog…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-dm w-full bg-transparent border-none outline-none text-[0.88rem] font-light text-[#1c1a16] placeholder-[#b0a898]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#b0a898] hover:text-[#811816]">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Category List */}
            <div>
              <h3 className="font-dm text-sm uppercase tracking-widest text-[#a0998e] mb-4">Pillars of Health</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group mb-1 min-h-[30px]">
                  <div className={`w-4 h-4 shrink-0 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${selectedCategory === 'All' ? 'border-[#811816] bg-[#811816]' : 'border-[#c8b89a] bg-transparent group-hover:border-[#d2a356]'}`}>
                    {selectedCategory === 'All' && <div className="w-1.5 h-1.5 bg-[#d2a356] rounded-full drop-shadow-[0_0_2px_rgba(210,163,86,1)]" />}
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'All'}
                    onChange={() => setSelectedCategory('All')}
                    className="hidden"
                  />
                  <span className={`font-dm text-[0.95rem] transition-colors ${selectedCategory === 'All' ? "font-medium text-[#811816]" : "font-light text-[#1c1a16] group-hover:text-[#811816]"}`}>
                    All Remedies
                  </span>
                </label>

                {Object.entries(categoryGroups).map(([groupName, subCategories]) => (
                  <div key={groupName} className="border border-[#ede8df] rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-[#d2a356]/50">
                    <button
                      onClick={() => setExpandedGroup(expandedGroup === groupName ? "" : groupName)}
                      className="w-full text-left px-4 py-3.5 font-dm text-[0.9rem] font-medium text-[#1c1a16] hover:bg-[#fcfbf9] flex justify-between items-center transition-colors focus:outline-none group"
                    >
                      <span className="group-hover:text-[#811816] transition-colors">{groupName}</span>
                      <span className="text-[#d2a356] text-xl font-light leading-none transform transition-transform duration-300">
                        {expandedGroup === groupName ? '−' : '+'}
                      </span>
                    </button>

                    {expandedGroup === groupName && (
                      <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar border-t border-[#ede8df] bg-[#fdfaf5]">
                        {subCategories.map((cat) => {
                          if (!categories.some(c => c.toLowerCase() === cat.toLowerCase())) return null;
                          return (
                            <label key={cat} className="flex items-start gap-3 cursor-pointer group mt-2 pt-1 border-transparent focus-within:ring-2 ring-[#d2a356] rounded-lg">
                              <div className={`mt-0.5 shrink-0 w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${selectedCategory === cat ? 'border-[#811816] bg-[#811816]' : 'border-[#c8b89a] bg-transparent group-hover:border-[#d2a356]'}`}>
                                {selectedCategory === cat && <div className="w-[5px] h-[5px] bg-[#d2a356] rounded-full drop-shadow-[0_0_2px_rgba(210,163,86,1)]" />}
                              </div>
                              <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === cat}
                                onChange={() => { setSelectedCategory(cat); setIsMobileFilterOpen(false); }}
                                className="hidden"
                              />
                              <span className={`font-dm text-[0.85rem] leading-[1.25] transition-colors ${selectedCategory === cat ? "font-medium text-[#811816]" : "font-light text-[#5a5648] group-hover:text-[#811816]"}`}>
                                {cat}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <h3 className="font-dm text-sm uppercase tracking-widest text-[#a0998e] mb-4 flex justify-between items-center">
                <span>Max Price</span>
                <span className="text-[#1c1a16] font-medium text-xs">KES {maxPrice.toLocaleString()}</span>
              </h3>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-[#ede8df] rounded-lg appearance-none cursor-pointer accent-[#811816]"
              />
            </div>

            {/* Wholesale Promo Card */}
            <div className="bg-[#811816] rounded-3xl p-6 text-center shadow-lg mt-8 hidden md:block relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,#a52a2a_0%,transparent_70%)] opacity-50" />
              <div className="w-12 h-12 bg-[#6a1210] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                <MessageSquare size={20} className="text-[#d2a356]" />
              </div>
              <h4 className="font-normal text-[1.2rem] text-[#f7f4ef] mb-2 relative z-10">Need a custom order?</h4>
              <p className="font-dm text-[0.85rem] text-[#e8d5d5] font-light mb-6 relative z-10">
                Our B2B team can help you formulate the perfect inventory for your clinic.
              </p>
              <Link to="/consultations" className="font-dm block w-full py-3 bg-[#d2a356] text-[#1c1a16] rounded-full text-[0.85rem] font-medium hover:bg-[#e0b772] transition-all duration-300 relative z-10">
                Contact Support
              </Link>
            </div>
            
            <div className="md:hidden pt-4 pb-8 border-t border-[#ede8df]">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3.5 bg-[#811816] text-white font-dm text-sm font-bold rounded-xl"
              >
                Apply Filters & View Products
              </button>
            </div>
          </div>
        </aside>

        {/* --- PRODUCT GRID --- */}
        <main ref={gridRef} className="w-full md:w-3/4 pb-20">

          {!loading && (
            <p className={`font-dm text-[0.78rem] font-light text-[#a0998e] mb-6 fade-up ${gridVisible ? 'in' : ''}`}>
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'remedy' : 'remedies'}
              {selectedCategory !== 'All' && <span> in <strong className="text-[#811816] font-medium">{selectedCategory}</strong></span>}
            </p>
          )}

          {loading ? (
            <div className="font-dm flex items-center justify-center py-24 text-[#8a8070] gap-3">
              <div className="w-6 h-6 border-2 border-[#e0d8cc] border-t-[#811816] rounded-full animate-spin" />
              Loading catalog…
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 px-8 text-center border border-dashed border-[#c8b89a] rounded-3xl bg-white">
              <Leaf size={36} className="text-[#c8b89a] mx-auto mb-4" />
              <p className="text-2xl font-light text-[#1c1a16] mb-2">
                No remedies match your current filters.
              </p>
              <button
                onClick={clearSearch}
                className="font-dm mt-4 py-2.5 px-6 bg-[#811816] text-[#f7f4ef] rounded-full text-[0.82rem] font-medium hover:bg-[#6a1210] transition-all duration-300"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredProducts.map((product, i) => {

                const pRetailPrice = Number(product.price_kes);
                
                let activeDiscount = 0;
                if (product.custom_discount !== null && product.custom_discount !== undefined && product.custom_discount !== '') {
                  // Explicit override on product level
                  activeDiscount = Number(product.custom_discount);
                } else {
                  // Otherwise use the global/franchise rate from Context
                  activeDiscount = discountRate * 100;
                }
                
                const pMemberPrice = pRetailPrice * (1 - (activeDiscount / 100));
                const savingsPercent = activeDiscount;

                return (
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    key={product.id}
                    className={`flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_56px_-12px_rgba(28,26,22,0.13)] hover:border-[#d2a356]/30 group cursor-pointer fade-up ${gridVisible ? 'in' : ''}`}
                    style={{ transitionDelay: `${Math.min((i % 4) + 1, 8) * 60}ms` }}
                  >
                    <div className="aspect-square overflow-hidden bg-[#f0ece3] relative">
                      {savingsPercent > 0 && (
                        <div className="absolute top-3.5 right-3.5 z-10 bg-[#d2a356] text-[#1c1a16] text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Tag size={12} /> Save {savingsPercent}%
                        </div>
                      )}
                      {product.image_url ? (
                        <img
                          src={api.getImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                          <Leaf size={44} className="text-[#c8b89a]" />
                          <span className="font-dm text-xs text-[#a0998e]">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-dm absolute top-3.5 left-3.5 bg-[#f7f4ef]/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.68rem] font-medium text-[#811816] tracking-[0.06em] uppercase border border-[#811816]/10">
                        {product.category_name || product.tcm_function_tag || 'Wellness'}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-[1.2rem] font-normal leading-[1.3] text-[#1c1a16] mb-3 line-clamp-2 transition-colors group-hover:text-[#811816]">
                        {product.name}
                      </h3>

                      <div className="font-dm text-[0.7rem] uppercase tracking-[0.05em] font-medium mb-auto">
                        {product.stock_quantity > 0 ? (
                          <span className="text-[#811816] bg-[#fcf5f5] px-2.5 py-1 rounded-full inline-block">
                            In Stock: {product.stock_quantity} units
                          </span>
                        ) : (
                          <span className="text-[#a04848] bg-[#fdf4f3] px-2.5 py-1 rounded-full inline-block">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col pt-4 border-t border-[#ede8df] mt-4">
                        {savingsPercent > 0 && (
                          <span className="font-dm text-[0.8rem] text-[#8a8070] line-through decoration-[#8a8070]/40">KES {pRetailPrice.toLocaleString()}</span>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-garamond text-[1.2rem] text-[#811816] font-medium leading-none mt-0.5">
                            KES {Math.round(pMemberPrice).toLocaleString()}
                          </span>
                          <button
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${product.stock_quantity > 0
                                ? 'bg-[#f0ece3] text-[#811816] group-hover:bg-[#811816] group-hover:text-[#d2a356] group-hover:rotate-90 group-hover:drop-shadow-[0_0_8px_rgba(210,163,86,0.5)]'
                                : 'bg-[#f7f4ef] text-[#c8b89a] cursor-not-allowed'
                              }`}
                            onClick={e => {
                              e.stopPropagation();
                              if (product.stock_quantity > 0) {
                                addToCart(product, 1);
                              }
                            }}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <div className="bg-[#4a0e0d] py-14 px-6 border-t-4 border-[#d2a356]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[clamp(1.4rem,2.5vw,2rem)] font-light text-[#d2a356] leading-[1.2] mb-1.5 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">
              Need help building your clinic's inventory?
            </p>
            <p className="font-dm text-[0.88rem] font-light text-[#e8d5d5] max-w-xl">
              Book a direct consultation with our TCM practitioners to discuss custom pricing, wholesale tiers, and clinic integration.
            </p>
          </div>
          <Link
            to="/consultations"
            className="font-dm inline-flex items-center gap-2 py-3 px-7 border-[1.5px] border-[#d2a356] text-[#d2a356] rounded-full text-[0.88rem] font-normal transition-all duration-300 whitespace-nowrap hover:bg-[#d2a356] hover:text-[#1c1a16] hover:drop-shadow-[0_0_12px_rgba(210,163,86,0.6)]"
          >
            Partner With Us <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Shop;