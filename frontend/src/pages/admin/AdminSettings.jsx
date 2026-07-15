import { useState, useEffect } from 'react';
import { Truck, Tag, Save, RefreshCcw, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../api';

// Depending on how you set up your providers, import the context that holds your settings
import { useSettings } from '../../context/SettingsContext'; 
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const { showToast } = useToast();
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    home_delivery_fee: 500,
    pickup_delivery_fee: 200,
    franchise_discount_rate: 20,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data) setSettings(response.data);
      } catch (err) {
        console.error("Using local defaults; backend settings route not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      
      // 🔥 Instantly re-broadcast the new settings to the whole app (Checkout included)
      if (refreshSettings) await refreshSettings(); 
      
      showToast("Business configurations saved and broadcasted globally.", "success");
    } catch (err) {
      showToast("Failed to save configurations.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center text-[#d2a356] font-bold flex items-center justify-center h-screen bg-[#fcfbf9]">
      <RefreshCcw className="animate-spin inline mr-3"/> Loading Configurations...
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#fcfbf9] min-h-screen font-dm">
      {/* ════════ HEADER ════════ */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-[#1c1a16]">Global Settings</h1>
          <p className="mt-1 text-sm text-[#8a8070]">Live configuration for delivery fees and B2B pricing logic.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 text-sm font-bold text-[#f7f4ef] bg-[#811816] rounded-xl hover:bg-[#6a1210] hover:shadow-md transition-all disabled:opacity-70"
        >
          {saving ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Applying...' : 'Apply Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ════════ LOGISTICS CARD ════════ */}
        <div className="bg-white border border-[#ede8df] rounded-[2rem] p-8 shadow-sm hover:border-[#d2a356]/30 transition-colors">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#ede8df]">
            <div className="w-10 h-10 rounded-full bg-[#fcf5f5] flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#811816]" />
            </div>
            <h2 className="text-xl font-garamond font-bold text-[#1c1a16]">Logistics & Delivery</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-[0.7rem] font-bold text-[#a0998e] uppercase tracking-widest mb-2">
                <MapPin size={14} /> Home Delivery Fee (KES)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#8a8070]">KES</span>
                <input 
                  type="number" 
                  value={settings.home_delivery_fee} 
                  onChange={e => setSettings({...settings, home_delivery_fee: Number(e.target.value)})} 
                  className="w-full pl-14 pr-4 py-3.5 bg-[#fcfbf9] border border-[#ede8df] rounded-xl focus:border-[#d2a356] focus:ring-1 focus:ring-[#d2a356] outline-none font-bold text-[#1c1a16] transition-all" 
                />
              </div>
            </div>
            
            <div className="opacity-60">
              <label className="block text-[0.7rem] font-bold text-[#a0998e] uppercase tracking-widest mb-2">
                Pickup Station Fee (Inactive)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#8a8070]">KES</span>
                <input 
                  type="number" 
                  disabled
                  value={settings.pickup_delivery_fee} 
                  onChange={e => setSettings({...settings, pickup_delivery_fee: Number(e.target.value)})} 
                  className="w-full pl-14 pr-4 py-3.5 bg-[#fcfbf9] border border-[#ede8df] rounded-xl outline-none font-bold text-[#1c1a16] cursor-not-allowed" 
                />
              </div>
              <p className="text-[0.7rem] text-[#8a8070] italic mt-2">* Currently hidden from checkout per standard operations.</p>
            </div>
          </div>
        </div>

        {/* ════════ B2B PRICING CARD ════════ */}
        <div className="bg-white border border-[#ede8df] rounded-[2rem] p-8 shadow-sm hover:border-[#d2a356]/30 transition-colors">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#ede8df]">
            <div className="w-10 h-10 rounded-full bg-[#fdf8ef] flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#d2a356]" />
            </div>
            <h2 className="text-xl font-garamond font-bold text-[#1c1a16]">B2B Franchise Pricing</h2>
          </div>
          
          <div>
            <label className="block text-[0.7rem] font-bold text-[#a0998e] uppercase tracking-widest mb-2">
              Global Member Discount Rate
            </label>
            <div className="relative">
              <input 
                type="number" 
                max="100"
                min="0"
                value={settings.franchise_discount_rate} 
                onChange={e => setSettings({...settings, franchise_discount_rate: Number(e.target.value)})} 
                className="w-full px-4 py-3.5 bg-[#fcfbf9] border border-[#ede8df] rounded-xl focus:border-[#d2a356] focus:ring-1 focus:ring-[#d2a356] outline-none font-bold text-[#1c1a16] text-lg transition-all" 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#811816] font-black text-lg">%</span>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-[#fdf8ef] border border-[#d2a356]/20">
              <p className="text-[0.8rem] text-[#5a5648] flex items-start gap-2 leading-relaxed">
                <ShieldCheck size={16} className="text-[#d2a356] shrink-0 mt-0.5" /> 
                Changing this percentage instantly alters the cart total for any buyer who successfully validates their Fohow Franchise ID during checkout.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;