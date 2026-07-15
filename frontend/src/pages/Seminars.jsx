import { useState, useEffect } from 'react';
import { Calendar, MapPin, X, Loader2, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Seminars = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    attendee_name: '',
    phone_number: '',
    clinic_name: '',
    email_address: '',
    attendee_count: 1
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        if (response.ok && response.data) {
          const allEvents = Array.isArray(response.data) ? response.data : (response.data.data || []);
          setEvents(allEvents.filter(e => e.is_active));
        } else {
          setError('Failed to load seminars.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setFormData({ attendee_name: '', phone_number: '', clinic_name: '', email_address: '', attendee_count: 1 });
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post(`/events/${selectedEvent.id}/rsvp`, formData);
      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        alert(response.data?.error || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group events by month for timeline view
  const groupedEvents = events.reduce((acc, event) => {
    const dateObj = new Date(event.date);
    const monthYear = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(event);
    return acc;
  }, {});

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-16 font-dm">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-garamond text-4xl md:text-5xl font-medium text-[#1a0504] mb-4">Regional Seminars</h1>
          <p className="text-lg text-stone-600">
            Join our upcoming product training and certification events in your region. View the calendar and RSVP below.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#811816] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-3 opacity-70" />
            <p className="text-stone-500 font-medium">New regional seminars will be announced soon.</p>
            <p className="text-sm text-stone-400 mt-1">Please check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([monthYear, monthEvents], monthIndex, monthArray) => (
              <div key={monthYear}>
                <h2 className="font-garamond text-2xl font-bold text-[#811816] mb-6 border-b border-[#811816]/10 pb-2">{monthYear}</h2>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {monthEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const dayName = eventDate.toLocaleDateString(undefined, { weekday: 'short' });
                    const dayNum = eventDate.toLocaleDateString(undefined, { day: 'numeric' });
                    const time = eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div 
                        key={event.id} 
                        className="w-full sm:w-[350px] shrink-0 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#d2a356]/40 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden"
                        onClick={() => openModal(event)}
                      >
                        {/* Flyer Ad Space */}
                        <div className="w-full h-48 bg-stone-100 relative overflow-hidden border-b border-stone-100">
                          <img 
                            src={event.flyer_url ? `http://localhost:5001${event.flyer_url}` : '/assets/fohow-placeholder-flyer.png'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-[#811816] shadow-sm flex items-center gap-1.5 border border-white/50">
                            <Calendar size={14} />
                            {dayName}, {dayNum} {monthYear.split(' ')[0]}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-garamond font-bold text-xl text-[#1a0504] leading-tight mb-2 group-hover:text-[#811816] transition-colors">{event.title}</h3>
                          
                          <div className="flex items-center text-xs font-medium text-stone-500 gap-1.5 mb-4 bg-stone-50 w-fit px-2 py-1 rounded-md border border-stone-100">
                            <MapPin size={12} className="text-[#d2a356]" /> {event.location_city}
                            <span className="mx-1 text-stone-300">|</span>
                            <span>{time}</span>
                          </div>
                          
                          <div className="text-sm text-stone-600 mb-6 line-clamp-2 flex-1 leading-relaxed">
                            {event.description}
                          </div>
                          
                          <button className="w-full py-2.5 bg-stone-50 border border-stone-200 text-stone-700 font-bold text-sm rounded-xl group-hover:bg-[#811816] group-hover:border-[#811816] group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                            RSVP Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {monthIndex === monthArray.length - 1 && (
                    <div className="w-full sm:w-[350px] shrink-0 bg-gradient-to-br from-[#fcf5f5] to-[#fdf8ef] rounded-2xl p-6 border border-[#d2a356]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center items-center text-center transition-all cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#d2a356]/60 group relative overflow-hidden">
                      <div className="absolute top-[-20%] left-[-20%] w-[120px] aspect-square rounded-full bg-[#d2a356] opacity-10 blur-[30px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#811816] mb-5 shadow-sm border border-[#ede8df] group-hover:scale-110 transition-transform duration-300 z-10">
                        <Users size={24} />
                      </div>
                      <h3 className="font-garamond font-bold text-2xl text-[#1a0504] mb-3 z-10">Private Clinic Training</h3>
                      <p className="text-sm text-stone-600 mb-6 leading-relaxed z-10">
                        Want to train your entire clinic staff on TCM principles? Book a private seminar at your location.
                      </p>
                      <Link to="/consultations" className="text-sm font-bold text-[#811816] uppercase tracking-widest flex items-center gap-2 group-hover:text-[#d2a356] transition-colors z-10">
                        Book Private <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 bg-[#fcfbf9]">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 transition-colors bg-white rounded-full p-1 border border-stone-200"
              >
                <X size={18} />
              </button>
              <h2 className="font-garamond text-2xl font-bold text-[#1a0504] pr-8 leading-tight">
                {selectedEvent.title}
              </h2>
              <div className="flex flex-col gap-1 mt-3">
                <div className="flex items-center text-sm text-[#811816] font-medium gap-1.5">
                  <Calendar size={14} /> 
                  {new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(selectedEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-stone-500 gap-1.5">
                  <MapPin size={14} /> {selectedEvent.location_city}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">RSVP Confirmed!</h3>
                  <p className="text-stone-500 text-sm mb-6">
                    Thank you for registering. We look forward to seeing you at the event!
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.attendee_name} 
                      onChange={e => setFormData({...formData, attendee_name: e.target.value})} 
                      placeholder="Dr. Jane Doe"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.phone_number} 
                      onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                      placeholder="+254 700 000000"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Clinic / Pharmacy Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.clinic_name} 
                      onChange={e => setFormData({...formData, clinic_name: e.target.value})} 
                      placeholder="Eden Wellness Center"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email_address} 
                      onChange={e => setFormData({...formData, email_address: e.target.value})} 
                      placeholder="dr.jane@example.com"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Number of Attendees</label>
                    <select 
                      value={formData.attendee_count} 
                      onChange={e => setFormData({...formData, attendee_count: parseInt(e.target.value)})} 
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 outline-none transition-all bg-white" 
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#811816] text-[#f7f4ef] font-bold rounded-xl mt-4 hover:bg-[#6a1210] hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm RSVP'}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Seminars;
