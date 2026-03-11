import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen font-sans bg-stone-50 text-stone-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2e22] text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="flex items-center justify-center h-20 border-b border-white/10">
          <span className="font-serif text-2xl font-bold tracking-tight text-white">Amani</span>
          <span className="font-serif text-2xl tracking-tight text-[#8fa89b]">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-all rounded-xl ${
                  isActive 
                  ? 'bg-[#2c4c3b] text-white shadow-lg' 
                  : 'text-[#8fa89b] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link to="/" className="flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-xl text-[#8fa89b] hover:bg-white/5 hover:text-white">
            <LogOut className="w-5 h-5 mr-3" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* The <Outlet /> is where the specific admin pages will render! */}
        <Outlet />
      </main>
      
    </div>
  );
};

export default AdminLayout;