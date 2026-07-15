import { useState } from 'react';
import { Brain, Wind, ActivitySquare, Footprints, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const BODY_ZONES = [
  {
    id: 'head',
    icon: Brain,
    title: 'Head & Shen',
    subtitle: 'Nervous System & Sleep',
    tcm_pillar: 'Regulate',
    symptoms: ['Brain Fog', 'Insomnia', 'Mood Swings', 'Anxiety'],
    description: 'In TCM, the mind (Shen) is housed in the Heart but reflects in the Head. Symptoms like poor sleep or lack of focus indicate a severe Yin-Yang imbalance within the nervous system requiring immediate regulation.',
    recommendation: 'Linchzhi / Reishi Formulas',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeLine: 'bg-blue-500'
  },
  {
    id: 'chest',
    icon: Wind,
    title: 'Lungs & Heart Qi',
    subtitle: 'Respiratory & Cardiovascular',
    tcm_pillar: 'Nourish',
    symptoms: ['Fatigue', 'Shortness of Breath', 'Poor Circulation', 'Palpitations'],
    description: 'The Lungs govern Qi and respiration, while the Heart governs the Blood. Weakness here leads to chronic exhaustion and poor circulation. Deep cellular nourishment and oxygenation are required.',
    recommendation: 'Cordyceps Sinensis Extract',
    color: 'text-[#811816]',
    bg: 'bg-[#fcf5f5]',
    border: 'border-[#811816]/20',
    activeLine: 'bg-[#811816]'
  },
  {
    id: 'gut',
    icon: ActivitySquare,
    title: 'Spleen & Stomach',
    subtitle: 'Digestive & Detoxification',
    tcm_pillar: 'Cleanse',
    symptoms: ['Sluggish Digestion', 'Bloating', 'Lethargy', 'Acid Reflux'],
    description: 'The Spleen is the root of post-natal Qi. Sluggish digestion and lethargy are clinical signs of "Dampness" and toxic buildup. The digestive pathways must be cleared before energy can be built.',
    recommendation: 'Sanqing & Aloe Tox-Clear',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeLine: 'bg-emerald-500'
  },
  {
    id: 'joints',
    icon: Footprints,
    title: 'Kidneys & Bones',
    subtitle: 'Skeletal & Vitality Root',
    tcm_pillar: 'Nourish & Regulate',
    symptoms: ['Lower Back Pain', 'Weak Knees', 'Joint Stiffness', 'Extreme Fatigue'],
    description: 'The Kidneys store "Jing" (vital essence) and strictly govern the bones and joints. Chronic back pain or weak knees indicate depleted Jing, requiring powerful supplementation to restore the body\'s root.',
    recommendation: 'Hai Zao Gai & Sanbao',
    color: 'text-[#d2a356]',
    bg: 'bg-[#fdf8ef]',
    border: 'border-[#d2a356]/30',
    activeLine: 'bg-[#d2a356]'
  }
];

const TCMBodyMap = () => {
  const [activeZone, setActiveZone] = useState(BODY_ZONES[0]);

  return (
    <section className="py-20 md:py-28 px-6 bg-[#f7f4ef] font-dm relative border-y border-[#ede8df]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-dm text-xs font-bold tracking-[0.2em] uppercase text-[#811816] mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#811816]" /> Interactive Anatomy <span className="w-8 h-[1px] bg-[#811816]" />
          </p>
          <h2 className="font-garamond text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1c1a16]">
            The <em className="text-[#811816] italic">Meridian</em> Network.
          </h2>
          <p className="text-[#5a5648] font-light max-w-xl mx-auto mt-4 text-[0.95rem] leading-relaxed">
            Select an anatomical system from the meridian pathway below to view clinical diagnoses and targeted wholesale formulations.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* LEFT: The Meridian Schematic Selector */}
          <div className="w-full lg:w-1/3 relative flex flex-col gap-4 py-4">
            {/* The Connecting Vertical Line */}
            <div className="absolute left-[39px] top-10 bottom-10 w-[2px] bg-[#ede8df] z-0 hidden sm:block" />

            {BODY_ZONES.map((zone) => {
              const isActive = activeZone.id === zone.id;
              const Icon = zone.icon;
              
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone)}
                  className={`relative z-10 flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 text-left border-[1.5px] ${
                    isActive 
                      ? `bg-white border-[#d2a356] shadow-[0_12px_24px_rgba(28,26,22,0.06)] scale-105 ml-0 lg:-mr-6` 
                      : 'bg-[#fcfbf9] border-transparent hover:border-[#ede8df] hover:bg-white'
                  }`}
                >
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive ? `${zone.bg} ${zone.color.replace('text-', 'border-')}` : 'bg-white border-[#ede8df] text-[#a0998e]'
                  }`}>
                    <Icon size={20} className={isActive ? zone.color : ''} />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h4 className={`font-garamond text-xl transition-colors duration-300 ${isActive ? 'text-[#1c1a16] font-medium' : 'text-[#5a5648]'}`}>
                      {zone.title}
                    </h4>
                    <p className={`text-[0.7rem] font-bold uppercase tracking-widest mt-0.5 transition-colors duration-300 ${isActive ? 'text-[#d2a356]' : 'text-[#a0998e]'}`}>
                      {zone.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: The Clinical Dossier Panel */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[2rem] border border-[#ede8df] shadow-[0_24px_60px_rgba(28,26,22,0.04)] overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Dossier Header */}
              <div className={`px-8 md:px-12 py-8 border-b border-[#ede8df] flex items-center justify-between transition-colors duration-500 ${activeZone.bg}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm border ${activeZone.border}`}>
                    <activeZone.icon size={28} className={activeZone.color} />
                  </div>
                  <div>
                    <h3 className="font-garamond text-3xl font-medium text-[#1c1a16]">{activeZone.title}</h3>
                    <p className="font-dm text-sm text-[#5a5648] mt-1">{activeZone.subtitle}</p>
                  </div>
                </div>
                
                <span className={`hidden sm:inline-flex font-dm text-[0.7rem] font-bold tracking-widest uppercase px-4 py-2 rounded-full border bg-white shadow-sm ${activeZone.color} ${activeZone.border}`}>
                  Pillar: {activeZone.tcm_pillar}
                </span>
              </div>

              {/* Dossier Body */}
              <div key={activeZone.id} className="p-8 md:p-12 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* Clinical Indicators */}
                <div className="mb-8">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a0998e] mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-[#811816]" /> Clinical Indicators
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeZone.symptoms.map((symptom, idx) => (
                      <span key={idx} className="bg-[#f0ece3] text-[#5a5648] text-[0.8rem] px-3 py-1.5 rounded-md border border-[#ede8df]">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TCM Diagnosis */}
                <div className="mb-10 flex-1">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a0998e] mb-3">
                    TCM Diagnosis & Methodology
                  </p>
                  <p className="text-[1rem] font-light leading-[1.8] text-[#3a3630]">
                    {activeZone.description}
                  </p>
                </div>

                {/* Prescription Block */}
                <div className={`mt-auto rounded-2xl p-6 border bg-[#fcfbf9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-500 ${activeZone.border}`}>
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#a0998e] mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className={activeZone.color} /> Recommended Wholesale Formula
                    </p>
                    <p className={`font-garamond text-2xl font-medium ${activeZone.color}`}>
                      {activeZone.recommendation}
                    </p>
                  </div>
                  
                  <Link 
                    to="/shop" 
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-[#1c1a16] text-[#f7f4ef] rounded-xl text-[0.85rem] font-medium tracking-wide transition-all hover:bg-[#811816] hover:shadow-lg shrink-0"
                  >
                    View in Catalog <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TCMBodyMap;
