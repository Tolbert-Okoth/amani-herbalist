import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, ShieldAlert, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 w-80 px-4 py-3.5 rounded-2xl shadow-[0_12px_40px_rgba(28,26,22,0.15)] border bg-white animate-in slide-in-from-bottom-5 fade-in duration-300 font-dm transition-all ${
              toast.type === 'success' ? 'border-[#4a7c59]/20' :
              toast.type === 'error' ? 'border-red-500/20' :
              'border-[#d2a356]/30'
            }`}
          >
            <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
              toast.type === 'success' ? 'bg-[#f0fdf4] text-[#4a7c59]' :
              toast.type === 'error' ? 'bg-[#fef2f2] text-red-500' :
              'bg-[#fdf8ef] text-[#d2a356]'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} /> :
               toast.type === 'error' ? <ShieldAlert size={16} /> :
               <Info size={16} />}
            </div>
            
            <p className="flex-1 text-[0.85rem] font-medium text-[#1c1a16] leading-tight">
              {toast.message}
            </p>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="shrink-0 p-1.5 text-[#a0998e] hover:text-[#1c1a16] hover:bg-[#f7f4ef] rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
