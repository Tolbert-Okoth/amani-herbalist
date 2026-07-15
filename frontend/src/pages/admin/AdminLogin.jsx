import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/admin/login', formData);
      if (response.ok && response.data) {
        // 🟢 HttpOnly cookies now handle the token automatically.
        // We only store non-sensitive info for the UI logic.
        localStorage.setItem('fohow_admin_user', response.data.username);
        localStorage.setItem('fohow_admin_role', response.data.role);
        
        // Role-based redirection:
        if (response.data.role === 'boss') {
          navigate('/eden-secure-portal-hq');
        } else {
          navigate('/eden-secure-portal-hq/products');
        }
      } else {
        setError('Invalid credentials for Admin access.');
      }
    } catch (err) {
      setError('Access denied. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0504] flex items-center justify-center px-6 font-dm">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] aspect-square rounded-full bg-[#811816] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] aspect-square rounded-full bg-[#d2a356] opacity-5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#811816]/20 border border-[#d2a356]/30 mb-6">
            <span className="font-garamond text-3xl font-bold text-[#d2a356]">F</span>
          </div>
          <h1 className="font-garamond text-3xl font-medium text-[#f7f4ef]">Admin Command Center</h1>
          <p className="text-[#e8d5d5] opacity-60 text-sm mt-2">Authorized Access Only</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-[#811816]/30 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                <ShieldAlert size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[0.75rem] font-bold text-[#d2a356] uppercase tracking-[0.15em] mb-2 ml-1">
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0998e] group-focus-within:text-[#d2a356] transition-colors"
                  size={18}
                />
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white/10 border border-[#811816]/40 rounded-2xl py-4 pl-12 pr-4 text-[#f7f4ef] outline-none focus:border-[#d2a356] focus:ring-4 focus:ring-[#d2a356]/10 transition-all placeholder:text-stone-600"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.75rem] font-bold text-[#d2a356] uppercase tracking-[0.15em] mb-2 ml-1">
                Secure Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0998e] group-focus-within:text-[#d2a356] transition-colors"
                  size={18}
                />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="off"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/10 border border-[#811816]/40 rounded-2xl py-4 pl-12 pr-4 text-[#f7f4ef] outline-none focus:border-[#d2a356] focus:ring-4 focus:ring-[#d2a356]/10 transition-all placeholder:text-stone-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#d2a356] hover:bg-[#e0b772] text-[#1a0504] py-4 rounded-2xl font-bold tracking-wide transition-all hover:shadow-[0_0_20px_rgba(210,163,86,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Enter Command Center'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-stone-600 text-xs font-light">
          System ID: FOHOW-HQ-NAIROBI
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
