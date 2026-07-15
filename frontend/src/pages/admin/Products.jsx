import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Package } from 'lucide-react';
import api from '../../api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const { showToast } = useToast();
  const { globalDiscount } = useSettings();
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price_kes: '', category_id: '', stock_quantity: '', description: '', full_description: '', ingredients_list: '',
    is_featured: false, custom_discount: ''
  });

  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const response = await api.get('/products');
    if (response.ok && response.data) setProducts(response.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const uniqueCategories = Array.from(
    new Map(products.filter(p => p.category_id).map(p => [p.category_id, p.category_name])).entries()
  );

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently delete ${name}?`)) {
      const response = await api.delete(`/products/${id}`);
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast(`Product deleted successfully.`, "success");
      } else {
        showToast("Failed to delete product: " + (response.data?.error || 'Unknown error'), "error");
      }
    }
  };

  // --- OPEN MODAL FOR ADDING ---
  const handleAddNew = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', price_kes: '', category_id: '', stock_quantity: '', description: '', full_description: '', ingredients_list: '', is_featured: false, custom_discount: '' });

    setImageFile(null);
    setIsModalOpen(true);
  };

  // --- OPEN MODAL FOR EDITING ---
  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      price_kes: product.price_kes,
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || 0,
      description: product.description || '',
      full_description: product.full_description || '',
      ingredients_list: product.ingredients_list || '',
      is_featured: product.is_featured || false,
      custom_discount: product.custom_discount || ''
    });

    setImageFile(null); // Reset file input
    setIsModalOpen(true);
  };

  // --- SUBMIT FORM (Handles both Add and Edit) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We MUST use FormData to send files to the backend
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price_kes', formData.price_kes);
    data.append('category_id', formData.category_id);
    data.append('stock_quantity', formData.stock_quantity);
    data.append('description', formData.description);
    data.append('full_description', formData.full_description);
    data.append('ingredients_list', formData.ingredients_list);
    data.append('is_featured', formData.is_featured);
    data.append('custom_discount', formData.custom_discount);

    
    if (imageFile) {
      data.append('image', imageFile); // Attach the actual file!
    }

    let response;
    if (isEditing) {
      response = await api.sendForm(`/products/${editId}`, 'PUT', data);
    } else {
      response = await api.sendForm('/products', 'POST', data);
    }

    if (response.ok) {
      fetchProducts();
      setIsModalOpen(false);
      showToast(`Product successfully ${isEditing ? 'updated' : 'added'}!`, "success");
    } else {
      showToast("Error saving product: " + (response.data?.error || 'Unknown error'), "error");
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Products ({products.length})</h1>
          <p className="mt-1 text-sm text-stone-500">Manage your apothecary inventory and pricing.</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] transition-all bg-[#811816] rounded-xl hover:bg-[#6a1210] shadow-sm hover:shadow-md duration-300">
          <Plus className="w-4 h-4 mr-2" /> Add New Product
        </button>
      </div>

      <div className="flex items-center justify-between p-4 mb-6 bg-white border shadow-sm border-stone-200 rounded-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute w-4 h-4 text-stone-400 left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full py-2.5 pl-10 pr-4 text-sm border rounded-xl bg-stone-50 border-stone-200 focus:outline-none focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 transition-all" 
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm border-stone-200 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Price (KES)</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100">
              {loading ? <tr><td colSpan="5" className="py-10 text-center text-stone-500">Loading live database...</td></tr> : 
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-[#fcf5f5]/50">
                    <td className="px-6 py-4">
                      {/* Show the uploaded image, or a placeholder icon if none exists */}
                      {product.image_url ? (
                        <img src={api.getImageUrl(product.image_url)} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-stone-200 mix-blend-multiply" />
                      ) : (
                        <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200 text-stone-400"><ImageIcon className="w-5 h-5"/></div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">{product.name}</td>
                    <td className="px-6 py-4 font-medium text-stone-900">{Number(product.price_kes).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${product.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* EDIT BUTTON */}
                      <button onClick={() => handleEdit(product)} className="p-2 mr-2 transition-colors rounded-lg text-stone-400 hover:text-[#d2a356] hover:bg-stone-50">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 transition-colors rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 will-change-transform">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#811816]" />
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200 transition"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              
              {/* IMAGE UPLOAD FIELD */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-[#fcf5f5] file:text-[#811816] hover:file:bg-[#811816]/10 transition cursor-pointer" 
                  />
                </div>
                {isEditing && <p className="text-xs text-stone-400 mt-2">Leave blank to keep current image.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Price (KES)</label>
                  <input required type="number" value={formData.price_kes} onChange={e => setFormData({...formData, price_kes: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1.5">Stock Quantity</label>
                  <input required type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" />
                </div>
              </div>

              {/* Admin Pricing Strategy UI */}
              <div className="flex flex-col gap-3 p-5 bg-[#fcfbf9] border border-[#ede8df] rounded-2xl">
                <label className="font-dm text-sm font-bold text-[#1c1a16] flex items-center gap-2">
                  B2B Pricing Strategy
                </label>
                
                <select 
                  value={
                    formData.custom_discount === null || formData.custom_discount === '' ? 'global' : 
                    formData.custom_discount === 0 || formData.custom_discount === '0' || formData.custom_discount === 0 ? 'none' : 'custom'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'global') setFormData({ ...formData, custom_discount: '' });
                    if (val === 'none') setFormData({ ...formData, custom_discount: 0 });
                    if (val === 'custom') setFormData({ ...formData, custom_discount: 15 }); // default starting point
                  }}
                  className="w-full border border-[#ede8df] rounded-xl p-3 bg-white font-dm focus:border-[#d2a356] outline-none"
                >
                  <option value="global">Use Global Discount (Currently {globalDiscount}%)</option>
                  <option value="none">No Discount (Sell at Strict Retail Price)</option>
                  <option value="custom">Override with Custom Discount</option>
                </select>

                {/* Only show the number input if they select "Custom" */}
                {formData.custom_discount !== null && formData.custom_discount !== '' && formData.custom_discount !== 0 && formData.custom_discount !== '0' && (
                  <div className="relative mt-2 animate-in fade-in zoom-in-95 duration-300">
                    <input 
                      type="number" 
                      value={formData.custom_discount}
                      onChange={(e) => setFormData({...formData, custom_discount: Number(e.target.value)})}
                      className="w-full border-2 border-[#d2a356] rounded-xl p-3 focus:ring-4 ring-[#d2a356]/20 outline-none font-dm font-medium text-[#811816]"
                      min="1"
                      max="99"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#811816] font-bold">% OFF</span>
                  </div>
                )}
              </div>



              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all">
                  <option value="" disabled>Select a category...</option>
                  {uniqueCategories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Brief Description</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Full Description</label>
                <textarea rows="3" value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Ingredients List</label>
                <textarea rows="2" value={formData.ingredients_list} onChange={e => setFormData({...formData, ingredients_list: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <label className="flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.is_featured} 
                    onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                    className="w-5 h-5 rounded border-stone-300 text-[#811816] focus:ring-[#811816] accent-[#811816] cursor-pointer" 
                  />
                  <span className="ml-2.5 font-bold text-stone-700 group-hover:text-stone-900 transition-colors">Feature in its Local Category Pop-up</span>
                </label>
              </div>

              <div className="pt-5 flex justify-end gap-3 pb-2 border-t border-stone-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] hover:bg-[#6a1210] rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
                  {isEditing ? 'Save Changes' : 'Upload Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
