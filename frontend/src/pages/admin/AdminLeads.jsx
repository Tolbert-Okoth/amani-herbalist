import { useState, useEffect } from 'react';
import { Smartphone, Calendar, MessageCircle, UserPlus, Trash2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminLeads = () => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get('/leads'); 
        if (response.ok && response.data) setLeads(response.data);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/leads/${id}/status`, { status: newStatus });
      if (response.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
        showToast(`Lead status updated to ${newStatus}`, 'success');
      } else {
        showToast("Failed to update status: " + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast("Failed to update status.", 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      const response = await api.delete(`/leads/${id}`);
      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== id));
        showToast('Lead deleted successfully.', 'success');
      } else {
        showToast("Failed to delete lead: " + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast("Failed to delete lead.", 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">WhatsApp Leads</h1>
          <p className="mt-1 text-sm text-stone-500">Captured numbers from the Exit-Intent Pop-up.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
          <UserPlus className="w-5 h-5 text-[#811816]" />
          <span className="font-bold text-stone-900">{leads.length} Total Leads</span>
        </div>
      </div>

      <div className="bg-white border shadow-sm border-stone-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-stone-50 text-stone-500 text-sm border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-medium">WhatsApp Number</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Captured On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center text-stone-500">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-stone-500">No leads captured yet.</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-[#fcf5f5]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e8f0ea] flex items-center justify-center border border-[#4a7c59]/20">
                          <Smartphone className="w-5 h-5 text-[#4a7c59]" />
                        </div>
                        <span className="font-bold text-stone-900 text-base">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600 font-medium">{lead.source || 'Exit-Intent Popup'}</td>
                    <td className="px-6 py-4 text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 cursor-pointer focus:outline-none transition-colors appearance-none text-center ${
                          lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          lead.status === 'Contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-[#fdf8ef] text-[#d2a356] border-[#d2a356]/30'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello!%20Here%20is%20the%20Fohow%20Clinical%20Guide%20you%20requested:`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#f0ece3] text-[#1c1a16] hover:bg-[#811816] hover:text-[#f7f4ef] rounded-lg transition-colors font-medium text-xs"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" />
                          Message
                        </a>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="inline-flex items-center justify-center p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
