import { useState, useEffect } from 'react';
import { Plus, Trash2, X, FileText, Download, UploadCloud, Edit, CheckCircle, Clock } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminDocuments = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    is_published: true,
    file: null
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
        setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Permanently delete document: "${title}"?`)) {
      try {
        const response = await api.delete(`/documents/${id}`);
        if (response.ok) {
          fetchDocuments();
          showToast('Document permanently deleted.', 'success');
        } else {
          showToast("Error deleting document: " + (response.data?.error || 'Unknown error'), 'error');
        }
      } catch (err) {
        showToast("Error deleting document.", "error");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file && !isEditing) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('excerpt', formData.excerpt);
    data.append('is_published', formData.is_published);
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      let response;
      if (isEditing) {
        response = await api.sendForm(`/documents/${currentDocId}`, 'PUT', data);
      } else {
        response = await api.sendForm('/documents', 'POST', data);
      }
      
      if (response.ok) {
        fetchDocuments();
        setIsModalOpen(false);
        setFormData({ title: '', excerpt: '', is_published: true, file: null });
        showToast(isEditing ? 'Document successfully updated.' : 'Document successfully uploaded.', 'success');
      } else {
        showToast(`Error ${isEditing ? 'updating' : 'uploading'} document: ` + (response.raw?.error || response.data?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast(`Error ${isEditing ? 'updating' : 'uploading'} document.`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setCurrentDocId(null);
    setFormData({ title: '', excerpt: '', is_published: true, file: null });
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setIsEditing(true);
    setCurrentDocId(doc.id);
    setFormData({
      title: doc.title || '',
      excerpt: doc.excerpt || '',
      is_published: doc.is_published,
      file: null // Don't require file re-upload
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Resource Center</h1>
          <p className="mt-1 text-sm text-stone-500">Manage downloadable marketing materials and guides.</p>
        </div>
        <button 
          onClick={openNewModal} 
          className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] rounded-lg shadow-sm hover:bg-[#6a1210] hover:shadow-md transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Upload Document
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-stone-50 text-stone-500 text-sm border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium">Document Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Uploaded</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="3" className="py-8 text-center text-stone-500">Loading documents...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan="3" className="py-8 text-center text-stone-500">No documents uploaded yet.</td></tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#fcf5f5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fdf8ef] flex items-center justify-center text-[#d2a356] shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{doc.title}</div>
                          {doc.excerpt && (
                            <div className="text-xs text-stone-500 mt-1 line-clamp-1">{doc.excerpt}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                          <Clock size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={api.getImageUrl(doc.file_url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block p-2 text-stone-400 hover:text-[#d2a356] transition-colors"
                        title="Download/View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => openEditModal(doc)} 
                        className="inline-block p-2 text-stone-400 hover:text-blue-600 transition-colors ml-2"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id, doc.title)} 
                        className="inline-block p-2 text-stone-400 hover:text-red-600 transition-colors ml-2"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 will-change-transform">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center">
                {isEditing ? <Edit className="w-5 h-5 mr-2 text-[#811816]"/> : <UploadCloud className="w-5 h-5 mr-2 text-[#811816]"/>} 
                {isEditing ? 'Edit Document' : 'Upload Document'}
              </h2>
              <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-stone-400 hover:text-[#811816] transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Document Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Fohow Product Guide 2024"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Short Excerpt (Preview)</label>
                <textarea 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                  placeholder="A brief description of what this document contains..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all resize-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Publish Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
                    <input 
                      type="radio" 
                      name="is_published"
                      checked={formData.is_published === true}
                      onChange={() => setFormData({...formData, is_published: true})}
                      className="w-4 h-4 text-[#811816] focus:ring-[#811816]"
                    />
                    Publish Now
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700">
                    <input 
                      type="radio" 
                      name="is_published"
                      checked={formData.is_published === false}
                      onChange={() => setFormData({...formData, is_published: false})}
                      className="w-4 h-4 text-[#811816] focus:ring-[#811816]"
                    />
                    Save as Draft (Publish Later)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">File Attachment {isEditing && '(Optional - Leave empty to keep current)'}</label>
                <input 
                  required={!isEditing} 
                  type="file" 
                  accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png"
                  onChange={handleFileChange} 
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fdf8ef] file:text-[#d2a356] hover:file:bg-[#f8eecd]" 
                />
                <p className="mt-2 text-xs text-stone-400">Accepted formats: PDF, Word, Excel, PowerPoint, Images.</p>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-stone-100">
                <div className="flex-1"></div>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isUploading}
                  className="px-5 py-2.5 font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-8 py-2.5 font-medium text-[#f7f4ef] bg-[#811816] hover:bg-[#6a1210] hover:shadow-md rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Save Changes' : 'Upload File')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
