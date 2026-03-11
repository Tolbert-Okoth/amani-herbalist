import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data - later this comes from your PostgreSQL DB!
  const stats = [
    { title: "Total Revenue", value: "KES 124,500", icon: DollarSign, trend: "+12.5%" },
    { title: "Active Orders", value: "18", icon: ShoppingBag, trend: "+4.2%" },
    { title: "Total Products", value: "32", icon: Package, trend: "0%" },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Wanjiku N.", date: "Today, 10:24 AM", amount: "KES 8,500", status: "Processing" },
    { id: "ORD-002", customer: "Ochieng M.", date: "Today, 09:12 AM", amount: "KES 4,200", status: "Shipped" },
    { id: "ORD-003", customer: "Fatuma A.", date: "Yesterday", amount: "KES 12,000", status: "Delivered" },
  ];

  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-stone-500">Welcome back. Here is what's happening today.</p>
        </div>
        <button className="px-5 py-2.5 text-sm font-medium text-white transition-all bg-[#2c4c3b] rounded-lg hover:bg-[#1f362a] shadow-md flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-6 bg-white border shadow-sm border-stone-100 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#4a7c59]/10">
                  <Icon className="w-6 h-6 text-[#4a7c59]" />
                </div>
                <span className="text-sm font-medium text-[#4a7c59] bg-[#4a7c59]/10 px-2.5 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-medium text-stone-500">{stat.title}</h3>
              <p className="mt-1 text-2xl font-semibold text-stone-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border shadow-sm border-stone-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100">
          <h2 className="text-lg font-medium text-stone-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900">{order.id}</td>
                  <td className="px-6 py-4 text-stone-600">{order.customer}</td>
                  <td className="px-6 py-4 text-stone-500">{order.date}</td>
                  <td className="px-6 py-4 font-medium text-stone-900">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;