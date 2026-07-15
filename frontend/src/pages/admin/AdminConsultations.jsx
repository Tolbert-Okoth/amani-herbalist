import { useState, useEffect } from 'react';
import { Calendar, Phone, Video, MapPin, Building, CheckCircle2, Trash2 } from 'lucide-react';

import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminConsultations = () => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const response = await api.get('/consultations');
      if (response.data) setLeads(response.data);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const response = await api.put(`/consultations/${id}/status`, { status: newStatus });
    if (response.ok) {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    }
  };

  const handleConfirmBooking = async (bookingId, clientName, preferredDate) => {
    // Prompt the admin to set the exact time
    const time = window.prompt(`Confirm time for ${clientName} (Requested for ${new Date(preferredDate).toLocaleDateString()}). Enter time (e.g., "02:00 PM"):`);
    
    if (!time) return; // Admin cancelled

    try {
      // Calls our new backend route
      const response = await api.post(`/consultations/${bookingId}/confirm`, {
        confirmed_time: time
      });
      
      if (response.data?.success) {
        showToast('Confirmation sent to client via Email!', 'success');
        // Update local state
        setLeads(leads.map(lead => lead.id === bookingId ? { ...lead, status: 'Confirmed', confirmed_time: time } : lead));
      } else {
        showToast('Failed to send confirmation email.', 'error');
      }
    } catch (error) {
      showToast('Failed to send confirmation.', 'error');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this consultation?")) return;
    try {
      const response = await api.delete(`/consultations/${id}`);
      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== id));
        showToast('Consultation deleted.', 'success');
      } else {
        showToast("Failed to delete consultation: " + (response.data?.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast("Failed to delete consultation.", 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#fcfbf9] min-h-screen font-dm">
      <div className="mb-10">
        <h1 className="font-garamond text-3xl font-medium text-stone-900">B2B Consultations</h1>
        <p className="mt-1 text-sm text-stone-500">Manage incoming strategy sessions and clinic visits.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-[#811816] rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-stone-500 col-span-full bg-white p-8 rounded-2xl border border-stone-200 text-center">No consultation requests yet.</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-white border border-stone-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 hover:border-[#d2a356]/30">
              
              {/* Header: Name & Format */}
              <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 leading-tight">{lead.fname} {lead.lname}</h3>
                  <p className="text-[0.75rem] font-medium text-stone-400 flex items-center mt-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className={`p-2.5 rounded-xl border ${lead.type === 'physical' ? 'bg-[#fcf5f5] text-[#811816] border-[#811816]/10' : 'bg-stone-50 text-stone-600 border-stone-200'}`} title={lead.type === 'physical' ? 'Physical Visit' : 'Virtual Call'}>
                    {lead.type === 'physical' ? <MapPin className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="p-2.5 rounded-xl border bg-stone-50 text-stone-400 border-stone-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Consultation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-5">
                {lead.business && (
                  <p className="text-sm text-stone-700 flex items-start gap-2">
                    <Building className="w-4 h-4 text-[#d2a356] shrink-0 mt-0.5" />
                    <span className="font-medium">{lead.business}</span>
                  </p>
                )}
                <p className="text-sm text-stone-600"><strong>Email:</strong> {lead.email}</p>
                <p className="text-sm text-stone-600"><strong>Phone:</strong> {lead.phone || 'N/A'}</p>
              </div>

              {/* Concern/Message */}
              <div className="bg-[#faf8f4] p-4 rounded-xl text-[0.85rem] text-stone-600 leading-relaxed mb-6 flex-grow border border-stone-100">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Topics to Discuss</span>
                {lead.concern}
              </div>

              {/* Status Dropdown */}
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                className={`w-full p-3 rounded-xl text-sm font-bold border-2 cursor-pointer outline-none transition-colors appearance-none text-center ${
                  lead.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  lead.status === 'Contacted' ? 'bg-[#fcf5f5] text-[#811816] border-[#811816]/20' :
                  'bg-[#fdf8ef] text-[#d2a356] border-[#d2a356]/30'
                }`}
              >
                <option value="Pending">Pending Setup</option>
                <option value="Contacted">Client Contacted</option>
                <option value="Completed">Completed</option>
                <option value="Confirmed">Confirmed (via Email)</option>
              </select>

              {/* Confirm & Email Client Button */}
              {lead.status !== 'Completed' && lead.status !== 'Confirmed' && (
                <button 
                  onClick={() => handleConfirmBooking(lead.id, `${lead.fname} ${lead.lname}`, lead.created_at)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#d2a356] text-[#1c1a16] px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#811816] hover:text-[#f7f4ef] transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <CheckCircle2 size={16} /> Confirm & Email Client
                </button>
              )}

              {lead.status === 'Confirmed' && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-100">
                  <CheckCircle2 size={14} /> Confirmed via Email for {lead.confirmed_time}
                </div>
              )}


            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminConsultations;
