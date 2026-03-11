import { useState, useEffect, useRef } from 'react';
import { Plus, Search, SlidersHorizontal, X, Leaf, ArrowRight } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

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

/* ── TCM filter tags ── */
const ALL_TAGS = ['All', 'Qi Tonic', 'Yin Nourish', 'Yang Activate', 'Blood Build', 'Digestion', 'Sleep', 'Immunity', 'Wellness'];

/* ── sort options ── */
const SORT_OPTIONS = [
  { label: 'Default',         value: 'default' },
  { label: 'Price: Low–High', value: 'price_asc' },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Name A–Z',        value: 'name_asc' },
];

const Shop = () => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag]     = useState('All');
  const [sortBy, setSortBy]           = useState('default');
  const [showSort, setShowSort]       = useState(false);
  const sortRef = useRef(null);

  const [headerRef, headerVisible] = useInView(0.05);
  const [gridRef, gridVisible]     = useInView(0.04);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { 
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); 
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* filter + sort */
  const filtered = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => activeTag === 'All' || (p.tcm_function_tag || 'Wellness') === activeTag)
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return Number(a.price_kes) - Number(b.price_kes);
      if (sortBy === 'price_desc') return Number(b.price_kes) - Number(a.price_kes);
      if (sortBy === 'name_asc')   return a.name.localeCompare(b.name);
      return 0;
    });

  const clearSearch = () => { setSearchQuery(''); setActiveTag('All'); };

  return (
    <div className="font-garamond bg-[#f7f4ef] text-[#1c1a16] min-h-[100svh]">

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <div ref={headerRef} className="bg-white border-b border-[#ede8df] px-6 pt-24 pb-10">
        <div className="max-w-7xl mx-auto">

          {/* top row */}
          <div className={`flex flex-wrap items-end justify-between gap-6 mb-10 fade-up ${headerVisible ? 'in' : ''}`}>
            <div>
              <p className="font-dm text-xs font-medium tracking-[0.18em] uppercase text-[#4a7c59] mb-2.5 flex items-center gap-2">
                <span className="w-5 h-[1px] bg-[#4a7c59] inline-block" /> The Apothecary
              </p>
              <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.08] tracking-[-0.01em] text-[#1c1a16]">
                All Herbal <em className="text-[#2c4c3b] italic">Remedies</em>
              </h1>
            </div>

            {/* search + sort */}
            <div className="flex gap-3 flex-wrap items-center">

              {/* search */}
              <div className="flex items-center gap-2 bg-[#f7f4ef] border-[1.5px] border-[#ede8df] rounded-full py-2.5 px-4 w-60 transition-all duration-200 focus-within:border-[#4a7c59] focus-within:ring-4 focus-within:ring-[#4a7c59]/10">
                <Search size={15} className="text-[#b0a898] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search remedies…" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="font-dm w-full bg-transparent border-none outline-none text-[0.88rem] font-light text-[#1c1a16] placeholder-[#b0a898]" 
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#b0a898] hover:text-[#1c1a16] transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* sort dropdown */}
              <div ref={sortRef} className="relative">
                <button 
                  onClick={() => setShowSort(v => !v)} 
                  className={`font-dm flex items-center gap-2 border-[1.5px] rounded-full py-2.5 px-4 text-[0.82rem] font-normal transition-colors whitespace-nowrap ${
                    showSort 
                    ? 'bg-[#1c2e1f] text-[#f7f4ef] border-[#1c2e1f]' 
                    : 'bg-[#f7f4ef] text-[#3a3630] border-[#ede8df] hover:border-[#c8b89a]'
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
                        className={`font-dm block w-full text-left py-2.5 px-3.5 text-[0.82rem] rounded-xl transition-colors ${
                          sortBy === o.value 
                          ? 'font-medium text-[#2c4c3b] bg-[#e8f0ea]' 
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

          {/* filter tag row */}
          <div className={`flex gap-2 flex-wrap items-center fade-up delay-100 ${headerVisible ? 'in' : ''}`}>
            {ALL_TAGS.map(tag => (
              <button 
                key={tag} 
                onClick={() => setActiveTag(tag)} 
                className={`font-dm py-1.5 px-4 rounded-full text-[0.78rem] font-normal border-[1.5px] transition-all duration-200 hover:-translate-y-0.5 ${
                  activeTag === tag 
                  ? 'bg-[#1c2e1f] border-[#1c2e1f] text-[#f7f4ef]' 
                  : 'bg-[#f7f4ef] border-[#ede8df] text-[#5a5648] hover:border-[#c8b89a]'
                }`}
              >
                {tag}
              </button>
            ))}
            {(activeTag !== 'All' || searchQuery) && (
              <button 
                onClick={clearSearch} 
                className="font-dm flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-[0.75rem] font-normal border-[1.5px] border-[#f0a898] bg-[#fdf4f3] text-[#b05a48] transition-opacity hover:opacity-80"
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* result count */}
          {!loading && (
            <p className={`font-dm text-[0.78rem] font-light text-[#a0998e] mt-5 fade-up delay-200 ${headerVisible ? 'in' : ''}`}>
              {filtered.length} {filtered.length === 1 ? 'remedy' : 'remedies'} found
              {activeTag !== 'All' && <span> in <strong className="text-[#4a7c59] font-medium">{activeTag}</strong></span>}
              {searchQuery && <span> matching "<strong className="text-[#1c1a16] font-medium">{searchQuery}</strong>"</span>}
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════
          PRODUCT GRID
      ══════════════════════════════════ */}
      <div ref={gridRef} className="max-w-7xl mx-auto px-6 pt-16 pb-24">

        {loading ? (
          <div className="font-dm flex items-center justify-center py-24 text-[#8a8070] gap-3">
            <div className="w-6 h-6 border-2 border-[#e0d8cc] border-t-[#4a7c59] rounded-full animate-spin" />
            Loading the apothecary…
          </div>

        ) : filtered.length === 0 ? (
          <div className="py-20 px-8 text-center border border-dashed border-[#c8b89a] rounded-3xl bg-white">
            <Leaf size={36} className="text-[#c8b89a] mx-auto mb-4" />
            <p className="text-2xl font-light text-[#1c1a16] mb-2">
              {searchQuery ? 'No remedies match your search.' : 'No products in the database yet.'}
            </p>
            {(searchQuery || activeTag !== 'All') && (
              <button 
                onClick={clearSearch} 
                className="font-dm mt-4 py-2.5 px-6 bg-[#1c2e1f] text-[#f7f4ef] rounded-full text-[0.82rem] font-medium hover:bg-[#2c4c3b] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {filtered.map((product, i) => (
              <Link 
                to={`/product/${product.id}`} 
                key={product.id}
                className={`flex flex-col bg-white rounded-3xl overflow-hidden border border-[#ede8df] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_56px_-12px_rgba(28,26,22,0.13)] group fade-up ${gridVisible ? 'in' : ''}`}
                style={{ transitionDelay: `${Math.min((i % 4) + 1, 8) * 60}ms` }}
              >

                {/* image */}
                <div className="aspect-square overflow-hidden bg-[#f0ece3] relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf size={44} className="text-[#c8b89a]" />
                    </div>
                  )}
                  {/* tag badge */}
                  <span className="font-dm absolute top-3.5 left-3.5 bg-[#f7f4ef]/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.68rem] font-medium text-[#2c4c3b] tracking-[0.06em] uppercase">
                    {product.tcm_function_tag || 'Wellness'}
                  </span>
                </div>

                {/* body */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-[1.2rem] font-normal leading-[1.3] text-[#1c1a16] flex-grow mb-4 line-clamp-2 transition-colors group-hover:text-[#4a7c59]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-[#ede8df]">
                    <span className="font-dm text-[1.05rem] font-medium text-[#1c1a16]">
                      KES {Number(product.price_kes).toLocaleString()}
                    </span>
                    <button 
                      className="w-9 h-9 rounded-full bg-[#f0ece3] text-[#4a7c59] flex items-center justify-center transition-all duration-300 group-hover:bg-[#1c2e1f] group-hover:text-white group-hover:rotate-90"
                      onClick={e => e.preventDefault()} 
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          BOTTOM PHILOSOPHY NUDGE
      ══════════════════════════════════ */}
      <div className="bg-[#1c2e1f] py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[clamp(1.4rem,2.5vw,2rem)] font-light text-[#f7f4ef] leading-[1.2] mb-1.5">
              Not sure where to start?
            </p>
            <p className="font-dm text-[0.88rem] font-light text-[#8a9e8c]">
              Read about our philosophy to find the right formula for your constitution.
            </p>
          </div>
          <Link 
            to="/philosophy" 
            className="font-dm inline-flex items-center gap-2 py-3 px-7 border-[1.5px] border-[#4a7c59] text-[#a8c5a0] rounded-full text-[0.88rem] font-normal transition-all duration-300 whitespace-nowrap hover:bg-[#4a7c59] hover:text-white"
          >
            Our Philosophy <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Shop;