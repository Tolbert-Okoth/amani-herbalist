import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings, LogOut, Calendar, Users, Tag, Menu, X, Store, ChevronRight, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const navItems = [
  { name: 'Overview',       path: '/eden-secure-portal-hq',               icon: LayoutDashboard, bossOnly: true },
  { name: 'Products',       path: '/eden-secure-portal-hq/products',      icon: Package },
  { name: 'Orders',         path: '/eden-secure-portal-hq/orders',        icon: ShoppingCart },
  { name: 'Leads',          path: '/eden-secure-portal-hq/leads',         icon: Users, bossOnly: true },
  { name: 'Franchises',     path: '/eden-secure-portal-hq/franchises',    icon: Tag, bossOnly: true },
  { name: 'Blog',           path: '/eden-secure-portal-hq/blog',          icon: FileText, bossOnly: true },
  { name: 'Documents',      path: '/eden-secure-portal-hq/documents',     icon: FileText, bossOnly: true },
  { name: 'Consultations',  path: '/eden-secure-portal-hq/consultations', icon: Calendar, bossOnly: true },
  { name: 'Events',         path: '/eden-secure-portal-hq/events',        icon: Calendar, bossOnly: true },
  { name: 'Regional Ads',   path: '/eden-secure-portal-hq/ads',           icon: ImageIcon, bossOnly: true },
  { name: 'Settings',       path: '/eden-secure-portal-hq/settings',      icon: Settings, bossOnly: true },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('fohow_admin_role');
  const user = localStorage.getItem('fohow_admin_user');

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!role) return <Navigate to="/eden-secure-portal-hq/login" replace />;

  if (role !== 'boss') {
    const tryingToAccessBossRoute = navItems.some(item => {
      if (!item.bossOnly) return false;
      if (item.path === '/eden-secure-portal-hq') return location.pathname === '/eden-secure-portal-hq';
      return location.pathname.startsWith(item.path);
    });
    if (tryingToAccessBossRoute) return <Navigate to="/eden-secure-portal-hq/orders" replace />;
  }

  useEffect(() => {
    const checkCrossTabLogout = () => {
      if (!localStorage.getItem('fohow_admin_role')) navigate('/eden-secure-portal-hq/login', { replace: true });
    };
    window.addEventListener('storage', checkCrossTabLogout);
    return () => window.removeEventListener('storage', checkCrossTabLogout);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // 🟢 CRITICAL: Notify server to clear HttpOnly cookie
      await api.post('/auth/admin/logout');
    } catch (err) {
      console.error("Logout error (cleanupping local anyway):", err);
    } finally {
      localStorage.removeItem('fohow_admin_user');
      localStorage.removeItem('fohow_admin_role');
      navigate('/eden-secure-portal-hq/login', { replace: true });
    }
  };

  const filteredNavItems = navItems.filter(item => !item.bossOnly || role === 'boss');

  // Shared sidebar nav content
  const SidebarContent = ({ onClose }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-[#811816]/30 shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-garamond text-xl font-bold text-[#f7f4ef]">Fohow</span>
          <span className="font-garamond text-xl text-[#d2a356] drop-shadow-[0_0_8px_rgba(210,163,86,0.3)]">Admin</span>
        </div>
        {/* Close button (mobile only) */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-[#a0998e] hover:text-[#f7f4ef] hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-4 border-b border-[#811816]/10 shrink-0">
        <p className="text-[0.6rem] uppercase tracking-widest text-[#a0998e] mb-1">Command Center</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${role === 'boss' ? 'bg-[#d2a356]' : 'bg-blue-400'}`} />
          <p className="text-xs font-medium text-[#f7f4ef] truncate">
            <span className={role === 'boss' ? 'text-[#d2a356]' : 'text-blue-400 font-bold'}>{role.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/eden-secure-portal-hq'
            ? location.pathname === '/eden-secure-portal-hq'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${
                isActive
                  ? 'bg-[#811816] text-[#f7f4ef] shadow-[0_4px_12px_rgba(129,24,22,0.4)]'
                  : 'text-[#e8d5d5] hover:bg-[#811816]/40 hover:text-[#d2a356]'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#d2a356]' : ''}`} />
              <span className="truncate">{item.name}</span>
              {isActive && <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-[#811816]/30 bg-[#2a0808]/30 shrink-0 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-xl text-[#e8d5d5] hover:bg-[#811816]/40 hover:text-[#d2a356]"
        >
          <Store className="w-5 h-5 shrink-0" />
          <span>Back to Store</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-xl text-[#e8d5d5] hover:bg-red-900/40 hover:text-red-400"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Lock & Exit</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen font-dm bg-[#fcfbf9] text-stone-900">

      {/* ══════════ DESKTOP SIDEBAR (lg+) ══════════ */}
      <aside className="hidden lg:flex w-64 bg-[#1a0504] text-white flex-col fixed h-full shadow-2xl z-20 border-r border-[#811816]/30">
        <SidebarContent onClose={null} />
      </aside>

      {/* ══════════ MOBILE OVERLAY ══════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════ MOBILE DRAWER ══════════ */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[#1a0504] text-white flex flex-col z-50 shadow-2xl border-r border-[#811816]/30 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ══════════ MAIN CONTENT AREA ══════════ */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-[#1a0504] border-b border-[#811816]/30 shadow-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#a0998e] hover:text-[#f7f4ef] hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1">
            <span className="font-garamond text-lg font-bold text-[#f7f4ef]">Fohow</span>
            <span className="font-garamond text-lg text-[#d2a356]">Admin</span>
          </div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${role === 'boss' ? 'bg-[#d2a356]' : 'bg-blue-400'}`} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;