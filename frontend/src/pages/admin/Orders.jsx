import { Search, Filter, Eye } from 'lucide-react';

const AdminOrders = () => {
  const orders = [
    { id: "ORD-001", customer: "Wanjiku N.", date: "Oct 24, 2026", items: 3, total: 8500, status: "Processing" },
    { id: "ORD-002", customer: "Ochieng M.", date: "Oct 24, 2026", items: 1, total: 4200, status: "Shipped" },
    { id: "ORD-003", customer: "Fatuma A.", date: "Oct 23, 2026", items: 5, total: 12000, status: "Delivered" },
  ];

  return (
    <div className="p-8 lg:p-12">
      <div className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">Orders</h1>
          <p className="mt-1 text-sm text-stone-500">Track and fulfill customer purchases.</p>
        </div>
        <button className="flex items-center px-5 py-2.5 text-sm font-medium text-stone-700 transition-all bg-white border border-stone-200 rounded-lg hover:bg-stone-50 shadow-sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter Orders
        </button>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm border-stone-100 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm bg-stone-50 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total (KES)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-stone-50/50">
                  <td className="px-6 py-4 font-medium text-stone-900">{order.id}</td>
                  <td className="px-6 py-4 text-stone-600">{order.customer}</td>
                  <td className="px-6 py-4 text-stone-500">{order.date}</td>
                  <td className="px-6 py-4 text-stone-600">{order.items} items</td>
                  <td className="px-6 py-4 font-medium text-stone-900">{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 transition-colors rounded-md text-stone-400 hover:text-[#4a7c59] hover:bg-stone-100">
                      <Eye className="w-4 h-4" />
                    </button>
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

export default AdminOrders;