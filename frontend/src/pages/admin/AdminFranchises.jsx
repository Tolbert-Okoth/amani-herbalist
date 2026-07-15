import { useState, useEffect } from 'react';
import { Tag, Plus, ShieldCheck, X, Trash2, Save, Pencil } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminFranchises = () => {
  const { showToast } = useToast();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_rate: 20 });

  // Track which card is in "edit rate" mode and its pending value
  const [editRates, setEditRates] = useState({}); // { [id]: pendingRate }
  const [savingRate, setSavingRate] = useState(null); // id currently saving

  const fetchFranchises = async () => {
    try {
      const response = await api.get('/franchises');
      if (response.data) setFranchises(response.data.data || response.data);
    } catch (err) {
      console.error("Failed to fetch franchises", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFranchises(); }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/franchises/${id}`, { is_active: !currentStatus });
      setFranchises(franchises.map(f => f.id === id ? { ...f, is_active: !currentStatus } : f));
      showToast(`Status updated successfully.`, 'success');
    } catch (err) {
      showToast("Failed to update franchise status.", "error");
    }
  };

  // Save the edited discount rate for a specific franchise
  const handleUpdateRate = async (id) => {
    const newRatePercent = editRates[id];
    if (newRatePercent === undefined || Number(newRatePercent) < 1 || Number(newRatePercent) > 99) {
      showToast('Discount rate must be between 1% and 99%.', 'error');
      return;
    }
    setSavingRate(id);
    try {
      const decimal = Number(newRatePercent) / 100;
      await api.put(`/franchises/${id}`, { discount_rate: decimal });
      // Update local state immediately
      setFranchises(prev => prev.map(f => f.id === id ? { ...f, discount_rate: decimal } : f));
      // Exit edit mode for this card
      setEditRates(prev => { const next = { ...prev }; delete next[id]; return next; });
      showToast(`Rate successfully updated to ${newRatePercent}%`, 'success');
    } catch (err) {
      showToast("Failed to update discount rate.", "error");
    } finally {
      setSavingRate(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount_rate: formData.discount_rate / 100
      };
      const response = await api.post('/franchises', payload);
      if (response.data) {
        fetchFranchises();
        setIsModalOpen(false);
        setFormData({ code: '', discount_rate: 20 });
        showToast(`Franchise code successfully generated.`, 'success');
      }
    } catch (err) {
      showToast("Error creating Franchise ID. It might already exist.", "error");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Permanently delete Franchise ID "${code}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/franchises/${id}`);
      setFranchises(franchises.filter(f => f.id !== id));
      showToast(`Code successfully erased.`, 'success');
    } catch (err) {
      showToast("Failed to delete Franchise ID.", "error");
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Franchise IDs</h1>
          <p className="mt-1 text-sm text-stone-500">Manage B2B discount codes for clinic owners.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] rounded-xl hover:bg-[#6a1210] shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> Generate ID
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center text-stone-500">Loading codes...</div>
        ) : franchises.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-3xl border border-stone-200 text-center text-stone-500">No Franchise IDs generated yet.</div>
        ) : (
          franchises.map((f) => {
            const isEditing = editRates[f.id] !== undefined;
            const isSaving = savingRate === f.id;
            return (
              <div key={f.id} className={`bg-white border rounded-3xl p-6 shadow-sm transition-all ${f.is_active ? 'border-[#d2a356]/30' : 'border-stone-200 opacity-60'}`}>

                {/* Header row: code + enable/disable toggle */}
                <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${f.is_active ? 'text-[#d2a356]' : 'text-stone-400'}`} />
                    <h3 className="font-bold text-xl text-stone-900 tracking-wider">{f.code}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleActive(f.id, f.is_active)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${f.is_active ? 'bg-[#fcf5f5] text-[#811816] border-[#811816]/20 hover:bg-red-50' : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'}`}
                  >
                    {f.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {/* Discount rate — inline editable */}
                <div className="mb-4">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 font-medium">Discount Rate</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={editRates[f.id]}
                          onChange={e => setEditRates(prev => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-[#d2a356] rounded-xl outline-none font-bold text-[#811816] text-lg pr-8"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleUpdateRate(f.id); if (e.key === 'Escape') setEditRates(prev => { const n = {...prev}; delete n[f.id]; return n; }); }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                      </div>
                      <button
                        onClick={() => handleUpdateRate(f.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-[#4a7c59] rounded-xl hover:bg-[#3a6249] transition-colors disabled:opacity-60"
                      >
                        <Save size={14} />
                        {isSaving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditRates(prev => { const n = {...prev}; delete n[f.id]; return n; })}
                        className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-2xl text-[#4a7c59]">{(f.discount_rate * 100).toFixed(0)}% OFF</p>
                      <button
                        onClick={() => setEditRates(prev => ({ ...prev, [f.id]: (f.discount_rate * 100).toFixed(0) }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#d2a356] bg-[#fdf8ef] border border-[#d2a356]/30 rounded-xl hover:bg-[#f7f0e0] transition-colors"
                      >
                        <Pencil size={12} />
                        Edit Rate
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="flex justify-end border-t border-stone-100 pt-4">
                  <button
                    onClick={() => handleDelete(f.id, f.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 will-change-transform">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><Tag className="w-5 h-5 text-[#811816]"/> New Franchise ID</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200 transition"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Franchise Code</label>
                <input
                  required type="text"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. FHW-NAIROBI"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none uppercase font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Discount Rate (%)</label>
                <div className="relative">
                  <input
                    required type="number" min="1" max="99"
                    value={formData.discount_rate}
                    onChange={e => setFormData({...formData, discount_rate: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none font-bold text-stone-900 pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                </div>
                <p className="text-xs text-stone-400 mt-1.5">Applied when this code is validated at checkout.</p>
              </div>
              <button type="submit" className="w-full py-3 mt-2 font-bold text-[#f7f4ef] bg-[#811816] hover:bg-[#6a1210] rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                Generate ID
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFranchises;
