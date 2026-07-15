import { useState, useEffect } from 'react';
import { Activity, Brain, Moon, Coffee, Shield, Sparkles, ArrowRight, RefreshCcw, CheckCircle2, Leaf, Zap, Wind, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const QUESTIONS = [
  {
    id: 1, title: "How would you describe your daily energy levels?", icon: Zap,
    options: [
      { text: "Chronically exhausted, even after sleeping.", value: 'cleanse', icon: Activity },
      { text: "Frequent afternoon crashes and mood swings.", value: 'regulate', icon: Activity },
      { text: "Steady and high, but looking to optimize.", value: 'nourish', icon: Zap }
    ]
  },
  {
    id: 2, title: "How is your digestion and gut health?", icon: Wind,
    options: [
      { text: "Sluggish, frequent bloating, or irregular.", value: 'cleanse', icon: Coffee },
      { text: "Sensitive to certain foods, occasional discomfort.", value: 'regulate', icon: Leaf },
      { text: "Perfectly fine, strong metabolism.", value: 'nourish', icon: Shield }
    ]
  },
  {
    id: 3, title: "How well do you manage stress and sleep?", icon: Moon,
    options: [
      { text: "High stress, brain fog, and severe insomnia.", value: 'cleanse', icon: Brain },
      { text: "Hard to fall asleep, mild anxiety.", value: 'regulate', icon: Activity },
      { text: "Deep sleep and calm, just need mental sharpness.", value: 'nourish', icon: Sparkles }
    ]
  }
];

const BioVitalityQuiz = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.ok && response.data) setInventory(response.data);
      } catch (err) {
        console.error("Failed to fetch products for quiz");
      }
    };
    fetchProducts();
  }, []);

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (step < QUESTIONS.length) {
        setStep(step + 1);
      } else {
        analyzeResults();
      }
    }, 400);
  };

  const analyzeResults = () => {
    setStep(4);
    const counts = { cleanse: 0, regulate: 0, nourish: 0 };
    Object.values(answers).forEach(val => counts[val]++);
    const topPillar = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    setTimeout(() => {
      setResult(topPillar);
      setStep(5);
    }, 2500);
  };

  // 1. SMART CATALOG ROUTING
  const getResultContent = () => {
    switch(result) {
      case 'cleanse':
        return {
          title: "The Cleanse Protocol",
          desc: "Your bio-markers indicate systemic toxic buildup and sluggish digestion. We recommend our premier herbal detox blend to clear toxins and restore pathways.",
          productName: "Fohow sanquing oral liquid", 
          searchKeyword: "sanquing", // Matches your catalog spelling
          color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200"
        };
      case 'regulate':
        return {
          title: "The Regulate Protocol",
          desc: "Your system is fluctuating. You are experiencing imbalances in Yin and Yang. We recommend our Ganoderma extract to calm the Shen, boost immunity, and regulate your nervous system.",
          productName: "Fohow linchzhi (ganoderma)",
          searchKeyword: "linchzhi",
          color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200"
        };
      case 'nourish':
      default:
        return {
          title: "The Nourish Protocol",
          desc: "Your foundational health is solid! Now it's time to supercharge your cellular vitality. We recommend our ultimate Qi Tonic to boost stamina and deep foundational energy.",
          productName: "Fohow sanbao oral liquid",
          searchKeyword: "sanbao", // Uses Sanbao instead of standard Oral Liquid based on catalog
          color: "text-[#811816]", bg: "bg-[#fcf5f5]", border: "border-[#811816]/20"
        };
    }
  };

  const handleQuickAdd = (searchKeyword) => {
    // Looks for the specific keyword in the live database array
    const targetProduct = inventory.find(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()));
    
    if (targetProduct) {
      if (targetProduct.stock_quantity > 0) {
        addToCart(targetProduct, 1); 
        navigate('/checkout');       
      } else {
        showToast("This recommended protocol is currently out of stock. Please check back later.", 'error');
      }
    } else {
      // Failsafe: if the database hasn't loaded or name is slightly off, go to shop
      navigate('/shop');
    }
  };

  return (
    // 2. FULL-WIDTH UI FIX APPLIED HERE
    <div className="w-full bg-white border-y border-[#ede8df] font-dm overflow-hidden relative transition-all duration-500">
      
      {step > 0 && step <= QUESTIONS.length && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f0ece3]">
          <div className="h-full bg-[#811816] transition-all duration-500 ease-out" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto py-16 md:py-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#fcf5f5] flex items-center justify-center mb-6 border border-[#811816]/10 shadow-[0_0_20px_rgba(129,24,22,0.1)]">
              <Activity className="w-10 h-10 text-[#811816]" strokeWidth={1.5} />
            </div>
            <span className="font-dm text-[0.7rem] font-bold tracking-[0.2em] text-[#d2a356] uppercase mb-4 block">Interactive Diagnostic</span>
            <h2 className="font-garamond text-4xl text-[#1c1a16] font-light mb-4 leading-tight">
              Discover your <em className="text-[#811816] italic">Bio-Vitality</em> score.
            </h2>
            <p className="font-dm text-[0.95rem] text-[#5a5648] font-light leading-relaxed mb-10">
              In Traditional Chinese Medicine, true health requires a perfect balance of Cleansing, Regulating, and Nourishing. Take our 60-second clinical assessment to find your missing pillar.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="font-dm flex items-center justify-center w-full sm:w-auto mx-auto px-10 py-4 bg-[#811816] text-[#f7f4ef] rounded-full text-[0.95rem] font-medium tracking-[0.02em] hover:bg-[#6a1210] transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(129,24,22,0.25)]"
            >
              Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {step > 0 && step <= QUESTIONS.length && (
          <div key={step} className="animate-in slide-in-from-right-8 fade-in duration-500 w-full max-w-xl mx-auto">
            {(() => {
              const q = QUESTIONS[step - 1];
              const Icon = q.icon;
              return (
                <>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fdf8ef] flex items-center justify-center mb-6 border border-[#d2a356]/30 text-[#d2a356]">
                    <Icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <span className="font-dm text-xs font-bold tracking-widest text-[#a0998e] uppercase mb-3 block">Question {step} of {QUESTIONS.length}</span>
                  <h3 className="font-garamond text-3xl text-[#1c1a16] font-light mb-10">{q.title}</h3>
                  
                  <div className="flex flex-col gap-3">
                    {q.options.map((opt, idx) => {
                      const OptIcon = opt.icon;
                      const isSelected = answers[q.id] === opt.value;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(q.id, opt.value)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-[1.5px] text-left transition-all duration-300 group ${
                            isSelected 
                              ? 'border-[#811816] bg-[#fcf5f5] shadow-[0_4px_12px_rgba(129,24,22,0.08)] scale-[1.02]' 
                              : 'border-[#ede8df] bg-[#faf8f4] hover:border-[#d2a356] hover:bg-white'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#811816] text-white' : 'bg-white text-[#a0998e] group-hover:text-[#d2a356] border border-[#ede8df] group-hover:border-[#d2a356]/30'}`}>
                            <OptIcon size={18} />
                          </div>
                          <span className={`font-dm text-[0.95rem] ${isSelected ? 'font-medium text-[#811816]' : 'font-light text-[#5a5648] group-hover:text-[#1c1a16]'}`}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {step === 4 && (
          <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-[#f0ece3] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#d2a356] rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-[#811816] animate-pulse" />
              </div>
            </div>
            <h3 className="font-garamond text-2xl text-[#1c1a16] mb-2">Analyzing Bio-Markers...</h3>
            <p className="font-dm text-[#a0998e] font-light text-sm animate-pulse">Mapping to TCM Pathways</p>
          </div>
        )}

        {step === 5 && result && (
          <div className="animate-in zoom-in-95 fade-in duration-700 w-full max-w-xl mx-auto">
            {(() => {
              const res = getResultContent();
              return (
                <>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#fdf8ef] border border-[#d2a356]/30 text-[#d2a356] font-dm text-[0.7rem] font-bold tracking-widest uppercase mb-6">
                    <CheckCircle2 size={14} className="mr-1.5" /> Diagnosis Complete
                  </span>
                  
                  <h2 className="font-garamond text-4xl text-[#1c1a16] font-light mb-4">
                    Your body requires:<br/>
                    <em className={`italic font-medium ${res.color}`}>{res.title}</em>
                  </h2>
                  
                  <p className="font-dm text-[0.95rem] text-[#5a5648] font-light leading-relaxed mb-8 p-6 bg-[#faf8f4] border border-[#ede8df] rounded-2xl">
                    {res.desc}
                  </p>

                  <div className={`p-6 rounded-[2rem] border ${res.bg} ${res.border} flex flex-col sm:flex-row items-center justify-between gap-6 text-left`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <Leaf className={`w-8 h-8 ${res.color}`} />
                      </div>
                      <div>
                        <p className="font-dm text-[0.75rem] font-bold uppercase tracking-widest text-stone-500 mb-0.5">Recommended Formula</p>
                        <h4 className={`font-garamond text-xl font-medium ${res.color}`}>{res.productName}</h4>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleQuickAdd(res.searchKeyword)}
                      className="w-full sm:w-auto font-dm flex items-center justify-center px-6 py-3 bg-[#811816] text-[#f7f4ef] rounded-xl text-[0.9rem] font-medium transition-all hover:bg-[#6a1210] hover:shadow-lg shrink-0"
                    >
                      <ShoppingBag size={16} className="mr-2" /> Add to Cart
                    </button>
                  </div>

                  <button 
                    onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                    className="mt-8 font-dm text-[0.8rem] text-[#a0998e] hover:text-[#811816] flex items-center justify-center mx-auto transition-colors"
                  >
                    <RefreshCcw size={14} className="mr-1.5" /> Retake Assessment
                  </button>
                </>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
};

export default BioVitalityQuiz;
