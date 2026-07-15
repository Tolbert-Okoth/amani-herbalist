import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Clock, ArrowRight, Ticket, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Your configured Axios instance

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added to make the RSVP button work!

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        // Handle varying backend response formats just to be safe
        const eventsData = response.data?.data || response.data || [];
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section id="education" className="py-20 md:py-28 px-6 bg-[#fcfbf9] font-dm border-t border-[#ede8df] relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,#ede8df_0%,transparent_70%)] opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-in fade-in duration-700">
          <div>
            <p className="font-dm text-xs font-bold tracking-[0.2em] uppercase text-[#811816] mb-3 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[#811816]" /> Education & Community
            </p>
            <h2 className="font-garamond text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1c1a16]">
              Upcoming <em className="text-[#811816] italic">Seminars.</em>
            </h2>
          </div>
          <Link 
            to="/consultations" 
            className="font-dm flex items-center gap-2 text-[#811816] text-[0.9rem] font-medium border-b border-[#811816] pb-1 hover:text-[#d2a356] hover:border-[#d2a356] transition-colors"
          >
            Request Private Clinic Training <ArrowRight size={16} />
          </Link>
        </div>

        {/* Dynamic Events List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#a0998e]">
            <div className="w-8 h-8 border-2 border-[#ede8df] border-t-[#811816] rounded-full animate-spin mb-4" />
            <p>Loading upcoming events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#d2a356]/50">
            <CalendarDays size={40} className="text-[#d2a356]/50 mx-auto mb-4" />
            <h3 className="font-garamond text-2xl text-[#1c1a16] mb-2">No public seminars scheduled.</h3>
            <p className="text-[#a0998e]">Check back soon or request private clinic training above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {events.map((event, i) => (
              <div 
                key={event.id} 
                className="bg-white rounded-3xl border border-[#ede8df] p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center transition-all duration-500 hover:shadow-[0_20px_40px_rgba(28,26,22,0.06)] hover:border-[#d2a356]/40 group animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
              >
                
                {/* Date Block */}
                <div className="flex md:flex-col items-center justify-center gap-3 md:gap-0 bg-[#fcf5f5] w-full md:w-32 py-4 rounded-2xl border border-[#811816]/10 shrink-0 group-hover:bg-[#811816] transition-colors duration-500">
                  <span className="font-dm text-sm font-bold tracking-widest text-[#811816] group-hover:text-[#d2a356] transition-colors">
                    {event.event_month}
                  </span>
                  <span className="font-garamond text-4xl md:text-5xl text-[#1c1a16] group-hover:text-[#f7f4ef] transition-colors leading-none mt-1">
                    {event.event_date}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-dm text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#fdf8ef] text-[#d2a356] border border-[#d2a356]/30">
                      {event.category}
                    </span>
                    {event.is_online && (
                      <span className="font-dm text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                        Virtual
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-garamond text-2xl font-medium text-[#1c1a16] mb-3 group-hover:text-[#811816] transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="font-dm text-[0.95rem] text-[#5a5648] font-light leading-relaxed mb-5 max-w-2xl">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-5 text-[0.8rem] text-[#8a8070] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-[#c8b89a]" /> {event.event_time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-[#c8b89a]" /> {event.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-[#c8b89a]" /> 
                      {event.spots_left === 'Unlimited' ? 'Unlimited Capacity' : <span className="text-[#811816]">{event.spots_left} spots remaining</span>}
                    </div>
                  </div>
                </div>

                {/* THE FIXED RSVP BUTTON */}
                <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button 
                    onClick={() => navigate('/consultations')} 
                    className="w-full md:w-auto font-dm flex items-center justify-center gap-2 px-8 py-4 bg-white border-[1.5px] border-[#ede8df] text-[#1c1a16] rounded-xl text-[0.9rem] font-bold transition-all duration-300 hover:bg-[#811816] hover:border-[#811816] hover:text-[#f7f4ef] hover:shadow-lg"
                  >
                    <Ticket size={18} /> RSVP Now
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default UpcomingEvents;
