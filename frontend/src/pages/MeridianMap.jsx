import { useState } from 'react';
import { Brain, Wind, ActivitySquare, Footprints, ArrowRight, Activity, CheckCircle2, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

// PHASE 7: Upgraded with Live Catalog Data Mapping
const BODY_ZONES = [
  {
    id: 'head',
    icon: Brain,
    title: 'Head & Shen',
    subtitle: 'Nervous System & Mental Clarity',
    tcm_pillar: 'Regulate',
    symptoms: ['Brain Fog', 'Insomnia', 'Mood Swings', 'Mental Fatigue'],
    description: 'In TCM, the mind (Shen) is housed in the Heart but reflects in the Head. Symptoms like poor sleep or lack of focus indicate a Yin-Yang imbalance within the nervous system requiring immediate regulation.',
    recommendations: [
      { name: 'Fohow linchzhi (ganoderma)', role: 'Calms the Shen & boosts immunity' },
      { name: 'Renshen Multi Power', role: 'Enhances stamina & mental clarity' }
    ],
    catalog_keywords: ['linchzhi', 'renshen'],
    theme: 'text-[#d2a356] border-[#d2a356]', // Gold
    glow: 'drop-shadow-[0_0_15px_rgba(210,163,86,0.4)]'
  },
  {
    id: 'chest',
    icon: Wind,
    title: 'Heart & Blood',
    subtitle: 'Cardiovascular & Circulation',
    tcm_pillar: 'Regulate & Cleanse',
    symptoms: ['Fatigue', 'Shortness of Breath', 'Poor Circulation', 'Palpitations'],
    description: 'The Heart governs the Blood and vessels. Weakness here leads to chronic exhaustion and poor circulation. Targeted cardiovascular support and blood purification are required to restore flow.',
    recommendations: [
      { name: 'Xue Qing Fu (Blood Cleanser)', role: 'Purifies blood & improves circulation' },
      { name: 'Salvia extract tablets', role: 'Regulates blood flow & heart support' },
      { name: 'Garlic essential oil softgel', role: 'Boosts immunity & cardiovascular health' }
    ],
    catalog_keywords: ['xue qing', 'salvia', 'garlic'],
    theme: 'text-[#f7f4ef] border-[#f7f4ef]', // White/Cream
    glow: 'drop-shadow-[0_0_15px_rgba(247,244,239,0.3)]'
  },
  {
    id: 'gut',
    icon: ActivitySquare,
    title: 'Spleen & Stomach',
    subtitle: 'Digestive & Detoxification',
    tcm_pillar: 'Cleanse',
    symptoms: ['Sluggish Digestion', 'Bloating', 'Lethargy', 'Acid Reflux'],
    description: 'The Spleen is the root of post-natal Qi. Sluggish digestion and lethargy are clinical signs of "Dampness" and toxic buildup. The digestive pathways must be cleared before energy can be built.',
    recommendations: [
      { name: 'Fohow sanquing oral liquid', role: 'Premier herbal detox blend' },
      { name: 'Fohow meigui (probiotics)', role: 'Balances gut flora & digestion' },
      { name: 'Boss Tea', role: 'Aids daily digestion & weight management' }
    ],
    catalog_keywords: ['sanquing', 'meigui', 'boss tea'],
    theme: 'text-[#4ade80] border-[#4ade80]', // Emerald/Mint for Cleanse
    glow: 'drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]'
  },
  {
    id: 'joints',
    icon: Footprints,
    title: 'Kidneys & Bones',
    subtitle: 'Skeletal & Vitality Root',
    tcm_pillar: 'Nourish',
    symptoms: ['Lower Back Pain', 'Weak Knees', 'Joint Stiffness', 'Extreme Fatigue'],
    description: 'The Kidneys store "Jing" (vital essence) and strictly govern the bones and joints. Chronic back pain or weak knees indicate depleted Jing, requiring powerful supplementation to restore the body\'s root.',
    recommendations: [
      { name: 'Hai Zao Gai (Calcium)', role: 'Supports bone density & joint health' },
      { name: 'Fohow sanbao oral liquid', role: 'Ultimate deep Qi & essence tonic' },
      { name: 'Movement Plus', role: 'Targeted mobility & joint pain relief' },
      { name: 'Fohow liuwei cha tea', role: 'Daily kidney & adrenal support' }
    ],
    catalog_keywords: ['hai zao', 'sanbao', 'movement', 'liuwei'],
    theme: 'text-[#60a5fa] border-[#60a5fa]', // Blue for Water/Kidney element
    glow: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]'
  }
];

const MeridianMap = () => {
  const [activeZone, setActiveZone] = useState(BODY_ZONES[0]);

  return (
    <div className="min-h-screen bg-[#1a0504] font-dm relative pt-24 pb-20 overflow-hidden">
      
      {/* Deep Maroon Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4a0e0d_0%,#1a0504_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] aspect-square rounded-full bg-[radial-gradient(circle,#811816_0%,transparent_70%)] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-dm text-xs font-bold tracking-[0.2em] uppercase text-[#d2a356] mb-3 flex items-center justify-center gap-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.3)]">
            <span className="w-8 h-[1px] bg-[#d2a356]" /> Interactive Clinical Map <span className="w-8 h-[1px] bg-[#d2a356]" />
          </p>
          <h1 className="font-garamond text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.1] text-[#f7f4ef] mb-4">
            The <em className="text-[#d2a356] italic">Meridian</em> Network.
          </h1>
          <p className="text-[#e8d5d5] font-light max-w-xl mx-auto text-[0.95rem] leading-relaxed opacity-80">
            Select an anatomical system from the meridian pathway below to view clinical diagnoses and targeted wholesale formulations.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* LEFT: The Meridian Schematic Selector */}
          <div className="w-full lg:w-1/3 relative flex flex-col gap-4 py-4">
            {/* The Connecting Vertical Line */}
            <div className="absolute left-[39px] top-10 bottom-10 w-[2px] bg-[#811816]/50 z-0 hidden sm:block" />

            {BODY_ZONES.map((zone) => {
              const isActive = activeZone.id === zone.id;
              const Icon = zone.icon;
              
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone)}
                  className={`relative z-10 flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 text-left border-[1.5px] group ${
                    isActive 
                      ? `bg-[#2a0808] border-[#d2a356] shadow-[0_0_30px_rgba(210,163,86,0.1)] scale-105 ml-0 lg:-mr-6` 
                      : 'bg-[#1a0504]/50 border-[#811816]/30 hover:border-[#811816] hover:bg-[#2a0808]'
                  }`}
                >
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 border-[1.5px] ${
                    isActive ? `bg-[#4a0e0d] border-[#d2a356] ${zone.theme.split(' ')[0]} ${zone.glow}` : 'bg-[#1a0504] border-[#811816]/50 text-[#a0998e] group-hover:text-[#d2a356]'
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h4 className={`font-garamond text-xl transition-colors duration-300 ${isActive ? 'text-[#f7f4ef] font-medium' : 'text-[#e8d5d5]'}`}>
                      {zone.title}
                    </h4>
                    <p className={`text-[0.7rem] font-bold uppercase tracking-widest mt-0.5 transition-colors duration-300 ${isActive ? 'text-[#d2a356]' : 'text-[#811816]'}`}>
                      {zone.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: The Clinical Dossier Panel */}
          <div className="w-full lg:w-2/3">
            <div className="bg-[#2a0808] rounded-[2rem] border border-[#811816]/40 shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col min-h-[520px] relative">
              
              {/* Abstract overlay inside dossier */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#811816]/20 to-transparent pointer-events-none" />

              {/* Dossier Header */}
              <div className="px-8 md:px-12 py-8 bg-[#1a0504]/80 border-b border-[#811816]/30 flex items-center justify-between backdrop-blur-sm z-10">
                <div className="flex items-center gap-5">
                  <div className={`p-3.5 rounded-xl bg-[#2a0808] shadow-inner border transition-colors duration-500 ${activeZone.theme}`}>
                    <activeZone.icon size={28} className={activeZone.theme.split(' ')[0]} />
                  </div>
                  <div>
                    <h3 className="font-garamond text-3xl font-medium text-[#f7f4ef]">{activeZone.title}</h3>
                    <p className="font-dm text-sm text-[#e8d5d5] mt-1 opacity-80">{activeZone.subtitle}</p>
                  </div>
                </div>
                
                <span className={`hidden sm:inline-flex font-dm text-[0.7rem] font-bold tracking-widest uppercase px-4 py-2 rounded-full border bg-[#2a0808] shadow-sm transition-colors duration-500 ${activeZone.theme}`}>
                  Pillar: {activeZone.tcm_pillar}
                </span>
              </div>

              {/* Dossier Body */}
              <div key={activeZone.id} className="p-8 md:p-12 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 z-10">
                
                {/* Clinical Indicators */}
                <div className="mb-8">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#d2a356] mb-4 flex items-center gap-2 drop-shadow-[0_0_2px_rgba(210,163,86,0.4)]">
                    <Activity size={14} /> Clinical Indicators
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {activeZone.symptoms.map((symptom, idx) => (
                      <span key={idx} className="bg-[#1a0504] text-[#e8d5d5] text-[0.8rem] px-3.5 py-1.5 rounded-lg border border-[#811816]/40 shadow-inner">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TCM Diagnosis */}
                <div className="mb-10 flex-1">
                  <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#d2a356] mb-3 drop-shadow-[0_0_2px_rgba(210,163,86,0.4)]">
                    TCM Diagnosis & Methodology
                  </p>
                  <p className="text-[1.05rem] font-light leading-[1.8] text-[#f7f4ef] opacity-90">
                    {activeZone.description}
                  </p>
                </div>

                {/* Catalog Prescription Block (UPDATED) */}
                <div className="mt-auto rounded-2xl p-6 md:p-8 bg-[#1a0504]/80 border border-[#811816]/40 flex flex-col shadow-inner relative overflow-hidden">
                  
                  {/* Subtle glow behind text based on active category */}
                  <div className={`absolute -left-10 -top-10 w-32 h-32 rounded-full blur-[40px] transition-colors duration-500 opacity-20 ${activeZone.theme.replace('text-', 'bg-').replace('border-', '')}`} />

                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between mb-4 border-b border-[#811816]/30 pb-3">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#a0998e] flex items-center gap-1.5">
                        <CheckCircle2 size={12} className={activeZone.theme.split(' ')[0]} /> Recommended Formulations
                      </p>
                    </div>
                    
                    {/* The Catalog List */}
                    <div className="flex flex-col gap-3 mb-6">
                      {activeZone.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Pill size={14} className={`mt-1 shrink-0 transition-colors duration-500 ${activeZone.theme.split(' ')[0]}`} />
                          <div>
                            <p className="font-garamond text-lg font-medium text-[#f7f4ef] leading-tight">
                              {rec.name}
                            </p>
                            <p className="font-dm text-[0.8rem] text-[#a0998e] mt-0.5">
                              {rec.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link 
                      to="/shop" 
                      state={{ catalogFilters: activeZone.catalog_keywords }}
                      className="w-full flex items-center justify-center px-7 py-3.5 bg-[#d2a356] text-[#1c1a16] rounded-xl text-[0.9rem] font-bold tracking-wide transition-all hover:bg-[#e0b772] hover:drop-shadow-[0_0_15px_rgba(210,163,86,0.5)] shrink-0"
                    >
                      View in Catalog <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MeridianMap;
