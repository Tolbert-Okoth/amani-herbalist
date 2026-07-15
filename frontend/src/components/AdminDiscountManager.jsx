import { useState, useEffect } from 'react';
import { Tag, Save, Loader2 } from 'lucide-react';
import api from '../api';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

const AdminDiscountManager = () => {
  const { showToast } = useToast();
  const { globalDiscount, updateLocalDiscount } = useSettings();
  const [newDiscount, setNewDiscount] = useState(globalDiscount);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if context changes
  useEffect(() => {
    setNewDiscount(globalDiscount);
  }, [globalDiscount]);

  const handleSave = async () => {
    if (newDiscount < 0 || newDiscount > 99) {
      showToast("Discount must be between 0 and 99%", "error");
      return;
    }

    setIsSaving(true);
    try {
      // The backend expects 'franchise_discount_rate'
      const response = await api.put('/settings', { 
        franchise_discount_rate: Number(newDiscount) 
      });
      
      if (response.ok) {
        updateLocalDiscount(Number(newDiscount)); // Updates UI everywhere instantly
        showToast(`Global B2B discount updated to ${newDiscount}%`, 'success');
      } else {
        showToast(`Failed to update discount: ${response.data?.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error("Discount update error:", error);
      showToast('Failed to update discount.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#ede8df] rounded-3xl p-8 max-w-md shadow-sm font-dm transition-all hover:shadow-md hover:border-[#d2a356]/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#fdf5f5] border border-[#811816]/10 flex items-center justify-center text-[#811816]">
          <Tag size={24} />
        </div>
        <div>
          <h3 className="font-garamond text-2xl font-medium text-[#1c1a16]">Global B2B Discount</h3>
          <p className="text-[0.8rem] text-[#8a8070] font-light">Controls the retail vs wholesale price gap</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <label className="block text-[0.7rem] uppercase tracking-widest text-[#a0998e] mb-2 ml-1">Current Discount Rate</label>
            <div className="relative">
              <input 
                type="number" 
                value={newDiscount} 
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="w-full border-2 border-[#ede8df] rounded-2xl py-3.5 pl-5 pr-10 text-xl font-bold text-[#811816] focus:border-[#d2a356] focus:ring-4 focus:ring-[#d2a356]/10 outline-none transition-all"
                min="0"
                max="99"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a0998e] font-bold text-lg">%</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
            <button 
                onClick={handleSave}
                disabled={isSaving || newDiscount === globalDiscount}
                className="w-full flex items-center justify-center gap-2 bg-[#811816] text-[#f7f4ef] px-6 py-4 rounded-2xl font-medium hover:bg-[#6a1210] disabled:bg-[#f0ece3] disabled:text-[#a0998e] transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98]"
            >
                {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save size={19} />
                )}
                {isSaving ? 'Updating...' : 'Save Discount Rate'}
            </button>
            <p className="text-center mt-4 text-[0.7rem] text-[#b0aaa0] font-light italic">
                * This updates the "crossed-out" retail prices across all shop pages instantly.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscountManager;
