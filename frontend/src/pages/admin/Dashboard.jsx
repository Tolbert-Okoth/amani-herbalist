import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingBag, TrendingUp, AlertTriangle, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api';
import AdminDiscountManager from '../../components/AdminDiscountManager';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalRevenue: 0, 
    activeOrders: 0, 
    totalProducts: 0, 
    recentOrders: [], 
    mpesaSuccess: 0,
    revenueTrend: [],
    topProducts: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('fohow_admin_role') || 'manager';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/orders/stats');
        // Check if data is present and has the expected structure
        if (response && response.data) {
          setStats(prev => ({
            ...prev,
            ...response.data
          })); 
        }
      } catch (error) {
        console.error("Dashboard: Error updating stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      title: "Total Revenue (KES)", 
      value: stats.totalRevenue?.toLocaleString() ?? "0", 
      icon: DollarSign, 
      trend: "+12.5%", 
      color: "maroon" 
    },
    { title: "Pending Orders", value: stats.activeOrders ?? 0, icon: ShoppingBag, trend: "Requires Action", color: "gold" },
    { title: "M-Pesa Success Rate", value: `${stats.mpesaSuccess ?? 0}%`, icon: Smartphone, trend: "STK Push", color: "maroon" },
    { title: "Total Catalog", value: stats.totalProducts ?? 0, icon: Package, trend: "Items Active", color: "gold" },
  ];

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/orders');
      const orders = response.data?.data || response.data || [];
      if (!orders.length) { showToast('No orders to export.', 'info'); return; }

      const headers = ['Order Number', 'Customer Name', 'Phone', 'ID Number', 'Products Ordered', 'Total (KES)', 'Status', 'Delivery Method', 'Delivery Address', 'Payment Method', 'M-Pesa Ref', 'Franchise ID', 'Date'];
      const rows = orders.map(o => [
        o.order_number,
        o.customer_name || 'N/A',
        o.customer_phone || 'N/A',
        o.customer_id_number || 'N/A',
        o.product_names || 'N/A',
        o.total_amount,
        o.status,
        o.delivery_method || 'N/A',
        o.delivery_address || 'N/A',
        o.payment_method || 'N/A',
        o.mpesa_receipt || 'N/A',
        o.franchise_id || 'Retail',
        new Date(o.created_at).toLocaleDateString()
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fohow-orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('CSV Export generated successfully.', 'success');
    } catch (error) {
      console.error('CSV export failed:', error);
      showToast('Failed to export CSV. Please try again.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#fcfbf9] min-h-screen font-dm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-[#1c1a16]">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-[#8a8070]">Real-time operational data for Fohow Eden Life.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 text-sm font-medium text-[#f7f4ef] transition-all bg-[#811816] rounded-xl hover:bg-[#6a1210] shadow-sm hover:shadow-md flex items-center w-fit"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* 4-Column Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isMaroon = stat.color === "maroon";
          return (
            <div key={index} className="p-6 bg-white border shadow-sm border-[#ede8df] rounded-2xl hover:shadow-md transition-shadow duration-300 hover:border-[#d2a356]/40 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-colors ${isMaroon ? 'bg-[#fcf5f5] border-[#811816]/10 group-hover:bg-[#811816] group-hover:text-white' : 'bg-[#fdf8ef] border-[#d2a356]/20 group-hover:bg-[#d2a356] group-hover:text-white'}`}>
                  <Icon className={`w-6 h-6 ${isMaroon ? 'text-[#811816] group-hover:text-white' : 'text-[#d2a356] group-hover:text-white'}`} />
                </div>
                <span className={`text-[0.65rem] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${isMaroon ? 'text-[#811816] bg-[#fcf5f5] border-[#811816]/10' : 'text-[#d2a356] bg-[#fdf8ef] border-[#d2a356]/20'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-medium text-[#8a8070]">{stat.title}</h3>
              <p className="mt-1 text-3xl font-bold text-[#1c1a16]">
                {loading ? "..." : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-white border shadow-sm border-[#ede8df] rounded-2xl p-6">
          <h3 className="font-garamond text-xl font-medium text-[#1c1a16] mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d2a356" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d2a356" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede8df" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8a8070', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8a8070', fontSize: 12}} tickFormatter={(value) => `KES ${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0504', border: 'none', borderRadius: '8px', color: '#f7f4ef' }}
                  itemStyle={{ color: '#d2a356' }}
                  formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d2a356" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white border shadow-sm border-[#ede8df] rounded-2xl p-6 flex flex-col">
          <h3 className="font-garamond text-xl font-medium text-[#1c1a16] mb-6">Top Moving Formulas</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ede8df" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1c1a16', fontSize: 13, fontWeight: 500}} width={100} />
                <Tooltip 
                  cursor={{fill: '#fcfbf9'}}
                  contentStyle={{ backgroundColor: '#1a0504', border: 'none', borderRadius: '8px', color: '#f7f4ef' }}
                  formatter={(value) => [`${value} Units`, 'Sold']}
                />
                <Bar dataKey="sales" fill="#811816" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Action Center: Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Left Col: Alerts & Settings */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Low Stock Alerts */}
          <div className="bg-white border shadow-sm border-[#ede8df] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-garamond text-xl font-medium text-[#1c1a16]">Low Stock Alerts</h3>
            </div>
            <div className="flex flex-col gap-3">
              {stats.lowStock.length === 0 ? (
                 <p className="text-sm text-[#8a8070] text-center py-4">No low stock alerts.</p>
              ) : (
                stats.lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] border border-[#ede8df]">
                    <span className="text-sm font-medium text-[#5a5648]">{item.name}</span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{item.stock} left</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Render Discount Manager only for the Boss */}
          {role === 'boss' && <AdminDiscountManager />}
        </div>

        {/* Right Col: Recent Orders Table (Takes up 2/3 of space) */}
        <div className="lg:col-span-2 bg-white border shadow-sm border-[#ede8df] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#ede8df] bg-[#fcfbf9] flex justify-between items-center">
            <h2 className="font-garamond text-xl font-medium text-[#1c1a16]">Recent Transactions</h2>
            <button className="text-[0.75rem] font-bold text-[#811816] hover:text-[#d2a356] uppercase tracking-wider transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#fcfbf9] text-[#8a8070] text-[0.75rem] uppercase tracking-wider border-b border-[#ede8df]">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer Phone</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount (KES)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8df] text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="py-8 text-center text-[#8a8070]">Loading orders...</td></tr>
                ) : stats.recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-[#8a8070]">No recent orders found.</td></tr>
                ) : (
                  stats.recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-[#fdf8ef]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#1c1a16]">{order.order_number}</td>
                      <td className="px-6 py-4 text-[#5a5648]">{order.customer_phone}</td>
                      <td className="px-6 py-4 text-[#8a8070]">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-[#1c1a16]">{Number(order.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[0.7rem] uppercase tracking-wider font-bold border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          order.status === 'Paid' ? 'bg-[#fdf8ef] text-[#d2a356] border-[#d2a356]/30' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
