import { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

import api from '../api';

const ICONS = { ShoppingBag, ShieldCheck, Calendar };
const THEMES = {
  order: { color: "text-blue-600", bg: "bg-blue-50" },
  franchise: { color: "text-[#d2a356]", bg: "bg-[#fdf8ef]" },
  consultation: { color: "text-[#811816]", bg: "bg-[#fcf5f5]" }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const SocialProofTicker = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 'state' controls if it's currently showing ('entering', 'entered', 'exiting', 'exited')
  const [phase, setPhase] = useState('exited'); 
  const [hasDismissed, setHasDismissed] = useState(false);

  // Fetch Live Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/ads/social-proof');
        if (res.data?.success && res.data.data.length > 0) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load social proof metrics");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (hasDismissed) return;

    // 1. Initial wait before showing the first one
    const initialDelay = setTimeout(() => {
      setPhase('entering');
    }, 15000);

    // 2. The master cycle
    const cycleInterval = setInterval(() => {
      // Start the exit animation
      setPhase('exiting');

      // Wait 600ms for exit animation to finish, then swap data and enter
      setTimeout(() => {
        setPhase('exited');
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        
        // Wait a tiny bit while exited, then enter again
        setTimeout(() => {
          setPhase('entering');
        }, 500); 

      }, 600);

    }, 22000); 

    return () => {
      clearTimeout(initialDelay);
      clearInterval(cycleInterval);
    };
  }, [hasDismissed, notifications]);

  // If completely exited, dismissed, or no data yet, render nothing
  if (phase === 'exited' || hasDismissed || notifications.length === 0) return null;

  const currentData = notifications[currentIndex];
  const Icon = ICONS[currentData.icon] || ShoppingBag;
  const theme = THEMES[currentData.type] || THEMES.order;
  const isClosing = phase === 'exiting';

  return (
    <div 
      className={`
        fixed z-[60] transition-all duration-500 ease-in-out
        bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto
        ${isClosing ? 'opacity-0 translate-y-4 md:translate-y-8' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-[0_20px_50px_-12px_rgba(28,26,22,0.15)] pr-10 relative max-w-sm mx-auto md:mx-0 group">
        
        {/* Subtle hover-to-close button */}
        <button 
          onClick={() => {
            setPhase('exiting');
            setTimeout(() => setHasDismissed(true), 500);
          }}
          className="absolute top-2 right-2 text-stone-300 hover:text-[#811816] md:opacity-0 md:group-hover:opacity-100 transition-colors md:transition-opacity p-2"
          aria-label="Dismiss notification"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${theme.bg}`}>
            <Icon className={`w-5 h-5 ${theme.color}`} />
          </div>
          
          <div className="flex flex-col font-dm text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[0.85rem] font-bold text-stone-900">{currentData.name}</span>
              <span className="text-[0.7rem] text-stone-400">in {currentData.location}</span>
            </div>
            
            <p className="text-[0.8rem] text-stone-600 leading-snug mb-1">
              {currentData.action}
            </p>
            
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={12} className="text-[#d2a356]" />
              <span className="text-[0.65rem] font-bold tracking-wider text-[#d2a356] uppercase">
                Verified • {timeAgo(currentData.created_at)}
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SocialProofTicker;