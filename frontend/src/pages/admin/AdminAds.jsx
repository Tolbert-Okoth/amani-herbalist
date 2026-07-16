import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Image as ImageIcon, Eye, EyeOff, Edit, MoveUp, MoveDown } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminAds = () => {
  const { showToast } = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    is_active: true,
    display_order: 0
  });
  const [flyerFile, setFlyerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/regional-ads');
      if (response.ok && Array.isArray(response.data)) {
        setAds(response.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ad) => {
    try {
      const response = await api.put(`/regional-ads/${ad.id}/status`, { is_active: !ad.is_active });
      if (response.ok) {
        setAds(ads.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
        showToast(`Ad marked as ${!ad.is_active ? 'Active' : 'Inactive'}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the ad "${title}"?`)) return;
    
    try {
      const response = await api.delete(`/regional-ads/${id}`);
      if (response.ok) {
        showToast('Ad deleted successfully', 'success');
        fetchAds();
      } else {
        showToast('Failed to delete ad', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete ad', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flyerFile) {
      return showToast('Please select a flyer image to upload.', 'error');
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('is_active', formData.is_active);
      data.append('display_order', formData.display_order);
      data.append('flyer', flyerFile);

      const response = await api.post('/regional-ads', data);

      if (response.ok) {
        showToast('Ad uploaded successfully', 'success');
        setIsModalOpen(false);
        fetchAds();
      } else {
        showToast(response.data?.error || response.data?.message || response.raw?.error || 'Failed to upload ad', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to upload ad', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewModal = () => {
    setFormData({
      title: '',
      is_active: true,
      display_order: ads.length
    });
    setFlyerFile(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Regional Calendar Ads</h1>
          <p className="mt-1 text-sm text-stone-500">Upload standalone flyers to display as rotating banners on the homepage.</p>
        </div>
        <button 
          onClick={openNewModal} 
          className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] rounded-lg shadow-sm hover:bg-[#6a1210] hover:shadow-md transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Upload New Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-stone-500">Loading ads...</div>
        ) : ads.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p>No ads uploaded yet.</p>
          </div>
        ) : (
          ads.map(ad => (
            <div key={ad.id} className={`bg-white rounded-2xl overflow-hidden border transition-all ${ad.is_active ? 'border-[#d2a356]/30 shadow-md' : 'border-stone-200 opacity-60 grayscale-[50%]'}`}>
              <div className="aspect-[4/5] bg-stone-100 relative group">
                <img src={api.getImageUrl(ad.flyer_url)} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => window.open(api.getImageUrl(ad.flyer_url), '_blank')} className="bg-white/90 text-stone-900 p-2 rounded-full hover:scale-110 transition-transform">
                    <Eye size={20} />
                  </button>
                </div>
                {!ad.is_active && (
                  <div className="absolute top-3 left-3 bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-stone-900 text-sm mb-1 truncate">{ad.title || 'Untitled Ad'}</h3>
                <p className="text-xs text-stone-500 mb-4">Uploaded: {new Date(ad.created_at).toLocaleDateString()}</p>
                
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <button 
                    onClick={() => handleToggleStatus(ad)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${ad.is_active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {ad.is_active ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
                  </button>

                  <button 
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-[#811816]"/> Upload Ad Flyer
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-stone-400 hover:bg-stone-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Internal Title (Admin Only)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Mombasa Regional June"
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Flyer Image (Required)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFlyerFile(e.target.files[0])}
                    className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#fcf5f5] file:text-[#811816] hover:file:bg-[#811816] hover:file:text-white transition-all cursor-pointer"
                  />
                  {flyerFile && <p className="text-[10px] text-stone-500 mt-1 pl-2">Selected: {flyerFile.name}</p>}
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-stone-200 bg-stone-50 hover:border-[#d2a356]/30 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active}
                      onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 text-[#811816] rounded border-stone-300 focus:ring-[#811816]"
                    />
                    <span className="text-sm font-medium text-stone-900">Make ad visible immediately</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#811816] text-[#f7f4ef] rounded-xl font-bold text-sm hover:bg-[#6a1210] shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center">
                  {isSubmitting ? 'Uploading...' : 'Upload Flyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAds;
