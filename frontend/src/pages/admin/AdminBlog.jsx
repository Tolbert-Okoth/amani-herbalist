import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, FileText } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminBlog = () => {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', author: 'Fohow Eden Life', is_published: true
  });

  const fetchBlogs = async () => {
    setLoading(true);
    const response = await api.get('/blogs');
    if (response.data) setBlogs(response.data);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Permanently delete article: "${title}"?`)) {
      const response = await api.delete(`/blogs/${id}`);
      if (response.ok) {
        fetchBlogs();
        showToast("Article deleted successfully.", "success");
      }
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setIsEditing(true);
      setEditId(blog.id);
      setFormData({
        title: blog.title, excerpt: blog.excerpt || '', content: blog.content, 
        author: blog.author || 'Fohow Eden Life', is_published: blog.is_published
      });
    } else {
      setIsEditing(false);
      setEditId(null);
      setFormData({ title: '', excerpt: '', content: '', author: 'Fohow Eden Life', is_published: true });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    const response = isEditing 
      ? await api.sendForm(`/blogs/${editId}`, 'PUT', data)
      : await api.sendForm('/blogs', 'POST', data);

    if (response.ok) {
      fetchBlogs();
      setIsModalOpen(false);
      showToast(`Article successfully ${isEditing ? 'updated' : 'published'}.`, "success");
    } else {
      showToast("Error saving blog post.", "error");
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-stone-500">Manage articles and TCM education.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] rounded-lg shadow-sm hover:bg-[#6a1210] hover:shadow-md transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" /> Write Article
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-sm border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-medium">Image</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {loading ? <tr><td colSpan="5" className="py-8 text-center text-stone-500">Loading articles...</td></tr> : 
              blogs.length === 0 ? <tr><td colSpan="5" className="py-8 text-center text-stone-500">No blog posts yet.</td></tr> :
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-[#fcf5f5]/50 transition-colors">
                  <td className="px-6 py-4">
                    {blog.image_url ? 
                      <img src={api.getImageUrl(blog.image_url)} alt="cover" className="w-16 h-10 object-cover rounded shadow-sm border border-stone-100" /> : 
                      <div className="w-16 h-10 bg-stone-100 rounded flex items-center justify-center text-stone-400"><ImageIcon className="w-4 h-4"/></div>
                    }
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-900">{blog.title}</td>
                  <td className="px-6 py-4 text-stone-500">{new Date(blog.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${blog.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(blog)} className="p-2 text-stone-400 hover:text-[#d2a356] transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(blog.id, blog.title)} className="p-2 text-stone-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 will-change-transform">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#811816]"/> {isEditing ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-[#811816] transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Article Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Cover Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-medium file:bg-[#fcf5f5] file:text-[#811816] hover:file:bg-[#811816]/10 cursor-pointer text-stone-500 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Short Excerpt (For preview cards)</label>
                <textarea rows="2" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1.5">Full Article Content</label>
                <textarea required rows="12" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-stone-100">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 rounded border-stone-300 text-[#811816] focus:ring-[#811816] accent-[#811816] cursor-pointer" />
                  <span className="ml-2.5 font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Publish immediately</span>
                </label>
                <div className="flex-1"></div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 font-medium text-[#f7f4ef] bg-[#811816] hover:bg-[#6a1210] hover:shadow-md rounded-xl transition-all duration-300">{isEditing ? 'Save Changes' : 'Publish Article'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
