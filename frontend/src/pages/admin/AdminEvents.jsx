import React, { useState, useEffect, Fragment } from 'react';
import { Plus, Trash2, X, Calendar, MapPin, Users, Edit, ChevronDown, ChevronUp, CheckCircle2, Phone, Building, Mail } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminEvents = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [rsvps, setRsvps] = useState({});
  const [loadingRsvps, setLoadingRsvps] = useState({});

  const handleRSVPStatusChange = async (eventId, rsvpId, newStatus) => {
    try {
      const response = await api.put(`/events/rsvps/${rsvpId}/status`, { status: newStatus });
      if (response.ok) {
        setRsvps(prev => ({
          ...prev,
          [eventId]: prev[eventId].map(r => r.id === rsvpId ? { ...r, status: newStatus } : r)
        }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleConfirmRSVP = async (eventId, rsvpId, attendeeName) => {
    const instructions = window.prompt(`Confirm instructions/arrival time for ${attendeeName} (e.g. "Arrive by 8:30 AM for registration"):`);
    if (!instructions) return;

    try {
      const response = await api.post(`/events/rsvps/${rsvpId}/confirm`, {
        confirmed_time: instructions
      });
      if (response.data?.success) {
        showToast('Confirmation sent via Email!', 'success');
        setRsvps(prev => ({
          ...prev,
          [eventId]: prev[eventId].map(r => r.id === rsvpId ? { ...r, status: 'Confirmed', confirmed_time: instructions } : r)
        }));
      } else {
        showToast('Failed to send confirmation.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to confirm RSVP.', 'error');
    }
  };

  const handleDeleteRSVP = async (eventId, rsvpId) => {
    if (!window.confirm("Are you sure you want to permanently delete this RSVP?")) return;
    try {
      const response = await api.delete(`/events/rsvps/${rsvpId}`);
      if (response.ok) {
        showToast('RSVP deleted.', 'success');
        setRsvps(prev => ({
          ...prev,
          [eventId]: prev[eventId].filter(r => r.id !== rsvpId)
        }));
      } else {
        showToast('Failed to delete RSVP', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete RSVP', 'error');
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location_city: '',
    description: '',
    is_active: true
  });
  const [flyerFile, setFlyerFile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      if (response.ok && response.data) {
        setEvents(Array.isArray(response.data) ? response.data : (response.data.data || []));
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchRsvps = async (eventId) => {
    setLoadingRsvps(prev => ({ ...prev, [eventId]: true }));
    try {
      const response = await api.get(`/events/${eventId}/rsvps`);
      if (response.ok && response.data) {
        setRsvps(prev => ({ ...prev, [eventId]: Array.isArray(response.data) ? response.data : [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch RSVPs for event ${eventId}:`, err);
    } finally {
      setLoadingRsvps(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const toggleEventExpand = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      if (!rsvps[eventId]) {
        fetchRsvps(eventId);
      }
    }
  };

  const handleEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    
    // Format date for datetime-local input
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toISOString().slice(0, 16);
    
    setFormData({
      title: event.title,
      date: dateStr,
      location_city: event.location_city,
      description: event.description,
      is_active: event.is_active
    });
    setFlyerFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Permanently delete event: "${title}"?`)) {
      try {
        const response = await api.delete(`/events/${id}`);
        if (response.ok) {
          fetchEvents();
          showToast('Event permanently deleted.', 'success');
        } else {
          showToast("Error deleting event: " + (response.data?.error || 'Unknown error'), 'error');
        }
      } catch (err) {
        showToast("Error deleting event.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('date', formData.date);
      data.append('location_city', formData.location_city);
      data.append('description', formData.description);
      data.append('is_active', formData.is_active);
      if (flyerFile) {
        data.append('flyer', flyerFile);
      }

      let response;
      if (isEditing) {
        response = await api.put(`/events/${editId}`, data);
      } else {
        response = await api.post('/events', data);
      }
      
      if (response.ok) {
        fetchEvents();
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
          title: '',
          date: '',
          location_city: '',
          description: '',
          is_active: true
        });
        setFlyerFile(null);
        showToast(`Event successfully ${isEditing ? 'updated' : 'scheduled'}.`, 'success');
      } else {
        showToast("Error saving event: " + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast("Error saving event.", "error");
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: '',
      date: '',
      location_city: '',
      description: '',
      is_active: true
    });
    setFlyerFile(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-stone-900">Upcoming Seminars</h1>
          <p className="mt-1 text-sm text-stone-500">Manage educational events and view RSVPs.</p>
        </div>
        <button 
          onClick={openNewModal} 
          className="flex items-center px-5 py-2.5 text-sm font-medium text-[#f7f4ef] bg-[#811816] rounded-lg shadow-sm hover:bg-[#6a1210] hover:shadow-md transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Event
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-sm border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Event Title</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-stone-500">Loading events...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-stone-500">No upcoming events scheduled.</td></tr>
            ) : (
              events.map((event) => (
                <React.Fragment key={event.id}>
                  <tr className={`hover:bg-[#fcf5f5]/50 transition-colors ${expandedEventId === event.id ? 'bg-[#fcf5f5]/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-stone-900">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#811816]">
                      <div className="flex items-center gap-3">
                        {event.flyer_url && (
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-stone-200">
                            <img src={api.getImageUrl(event.flyer_url)} alt="Flyer" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span>{event.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-600 flex items-center gap-1.5">
                        <MapPin size={14} className="text-stone-400" />
                        {event.location_city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleEventExpand(event.id)}
                        className="p-2 text-stone-500 hover:text-[#811816] transition-colors bg-stone-100 hover:bg-stone-200 rounded-lg mr-2 inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Users size={14} /> RSVPs {expandedEventId === event.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                      <button 
                        onClick={() => handleEdit(event)} 
                        className="p-2 text-stone-400 hover:text-[#d2a356] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id, event.title)} 
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {expandedEventId === event.id && (
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <td colSpan="5" className="px-6 py-6">
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                          <div className="px-4 py-3 border-b border-stone-100 bg-[#fdf8ef] flex items-center justify-between">
                            <h4 className="font-bold text-[#811816] text-xs uppercase tracking-wider">RSVP List</h4>
                            <span className="text-xs font-medium text-[#d2a356] bg-white px-2 py-1 rounded-md border border-[#d2a356]/20">
                              {rsvps[event.id]?.length || 0} Registered
                            </span>
                          </div>
                          {loadingRsvps[event.id] ? (
                            <div className="p-4 text-center text-stone-500 text-xs">Loading RSVPs...</div>
                          ) : !rsvps[event.id] || rsvps[event.id].length === 0 ? (
                            <div className="p-4 text-center text-stone-500 text-xs">No RSVPs yet for this event.</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-stone-50/50">
                              {rsvps[event.id].map(rsvp => (
                                <div key={rsvp.id} className="bg-white border border-stone-200 rounded-[1rem] p-5 shadow-sm flex flex-col relative hover:shadow-md transition-all hover:border-[#d2a356]/30">
                                  
                                  <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                                    <div>
                                      <h3 className="font-bold text-base text-stone-900 leading-tight flex items-center gap-2">
                                        {rsvp.attendee_name}
                                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">{rsvp.attendee_count} Guests</span>
                                      </h3>
                                      <p className="text-[0.7rem] font-medium text-stone-400 mt-1 uppercase tracking-wider">
                                        Reg: {new Date(rsvp.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteRSVP(event.id, rsvp.id)}
                                      className="p-1.5 rounded-lg border bg-stone-50 text-stone-400 border-stone-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                                      title="Delete RSVP"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="space-y-2 mb-4 flex-grow">
                                    {rsvp.clinic_name && (
                                      <p className="text-xs text-stone-700 flex items-start gap-2">
                                        <Building className="w-3.5 h-3.5 text-[#d2a356] shrink-0 mt-0.5" />
                                        <span className="font-medium">{rsvp.clinic_name}</span>
                                      </p>
                                    )}
                                    <p className="text-xs text-stone-600 flex items-center gap-2">
                                      <Mail className="w-3.5 h-3.5 text-stone-400" /> {rsvp.email_address || 'N/A'}
                                    </p>
                                    <p className="text-xs text-stone-600 flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-stone-400" /> {rsvp.phone_number}
                                    </p>
                                  </div>

                                  <select
                                    value={rsvp.status || 'Pending'}
                                    onChange={(e) => handleRSVPStatusChange(event.id, rsvp.id, e.target.value)}
                                    className={`w-full p-2.5 rounded-xl text-xs font-bold border-2 cursor-pointer outline-none transition-colors appearance-none text-center ${
                                      rsvp.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      rsvp.status === 'Contacted' ? 'bg-[#fcf5f5] text-[#811816] border-[#811816]/20' :
                                      rsvp.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-[#fdf8ef] text-[#d2a356] border-[#d2a356]/30'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Confirmed">Confirmed (Email Sent)</option>
                                    <option value="Completed">Attended</option>
                                  </select>

                                  {rsvp.status !== 'Completed' && rsvp.status !== 'Confirmed' && (
                                    <button 
                                      onClick={() => handleConfirmRSVP(event.id, rsvp.id, rsvp.attendee_name)}
                                      className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#d2a356] text-[#1c1a16] px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-[#811816] hover:text-[#f7f4ef] transition-all duration-300 shadow-sm"
                                    >
                                      <CheckCircle2 size={14} /> Confirm & Email
                                    </button>
                                  )}

                                  {rsvp.status === 'Confirmed' && rsvp.confirmed_time && (
                                    <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center text-center gap-1 border border-blue-100">
                                      <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Instructions Sent:</span>
                                      <span className="font-medium text-blue-600/80 line-clamp-1">{rsvp.confirmed_time}</span>
                                    </div>
                                  )}

                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 will-change-transform">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#811816]"/> {isEditing ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-[#811816] transition-colors">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Event Title</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Regional Product Training"
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Date & Time</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Location / City</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.location_city} 
                      onChange={e => setFormData({...formData, location_city: e.target.value})} 
                      placeholder="e.g. Nairobi CBD"
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Event details..."
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer group w-fit">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active} 
                      onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                      className="w-5 h-5 rounded border-stone-300 text-[#811816] focus:ring-[#811816] accent-[#811816] cursor-pointer" 
                    />
                    <span className="ml-2.5 font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Event is Active (Visible & accepting RSVPs)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Event Flyer (Image Ad)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFlyerFile(e.target.files[0])} 
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:border-[#d2a356] outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fcf5f5] file:text-[#811816] hover:file:bg-[#fdf8ef]" 
                  />
                  <p className="text-xs text-stone-400 mt-1">Upload a visually appealing flyer to display on the Seminars & Homepage ad space.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-stone-100 mt-4">
                <div className="flex-1"></div>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 font-medium text-[#f7f4ef] bg-[#811816] hover:bg-[#6a1210] hover:shadow-md rounded-xl transition-all duration-300"
                >
                  {isEditing ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
