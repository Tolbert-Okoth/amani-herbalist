import { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Package, CreditCard, User, Truck, MapPin, Tag, Smartphone, Trash2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced B2B Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [franchiseFilter, setFranchiseFilter] = useState("All");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [transactionPrompt, setTransactionPrompt] = useState({ isOpen: false, orderId: null });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      if (response.data) setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'Paid') {
      setTransactionPrompt({ isOpen: true, orderId });
      // Reset the dropdown visually by doing nothing; it will update when submitTransactionCode runs
      return;
    }

    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order status updated to ${newStatus}`, 'success');
      } else {
        showToast("Failed to update status: " + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast("Failed to update order status.", "error");
    }
  };

  const submitTransactionCode = async (orderId, code) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { 
        status: 'Paid',
        transactionCode: code.trim() 
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Paid', mpesa_receipt: code.trim() } : o));
        showToast(`Order marked as Paid successfully`, 'success');
        setTransactionPrompt({ isOpen: false, orderId: null });
      } else {
        showToast("Failed to update status: " + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast("Failed to update order status.", "error");
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Permanently delete order ${orderNumber}? This cannot be undone.`)) return;
    try {
      const response = await api.delete(`/orders/${orderId}`);
      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        showToast(`Order ${orderNumber} permanently erased.`, 'success');
      } else {
        showToast('Failed to delete order: ' + (response.data?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast('Failed to delete order.', 'error');
    }
  };

  const handleViewOrder = async (orderId) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    // 1. Search Logic
    const matchesSearch = 
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.mpesa_receipt && o.mpesa_receipt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.franchise_id && o.franchise_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 2. Status Logic (Fulfillment & M-Pesa)
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;

    // 3. Franchise / B2B Logic
    const matchesFranchise = 
      franchiseFilter === "All" || 
      (franchiseFilter === "Franchise" && o.franchise_id) || 
      (franchiseFilter === "Retail" && !o.franchise_id);

    return matchesSearch && matchesStatus && matchesFranchise;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Paid': return 'bg-[#fdf8ef] text-[#d2a356] border-[#d2a356]/30';
      case 'Processing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pending Payment': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const getParsedAddress = (addressData) => {
    if (!addressData) return {};
    if (typeof addressData === 'object') return addressData;
    try { return JSON.parse(addressData); } catch (e) { return {}; }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative bg-[#fcfbf9] min-h-screen font-dm">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-garamond text-3xl font-medium text-[#1c1a16]">Orders & Fulfillment</h1>
          <p className="mt-1 text-sm text-[#8a8070]">Track M-Pesa payments, manage B2B franchises, and fulfill logistics.</p>
        </div>
      </div>

      {/* ════════ TOOLBAR & FILTERS ════════ */}
      <div className="flex flex-col gap-4 p-4 mb-8 bg-white border shadow-sm border-[#ede8df] rounded-2xl">
        
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute w-4 h-4 text-[#a0998e] left-4 top-3.5" />
          <input 
            type="text" 
            placeholder="Search Order, Phone, M-Pesa Ref, or Franchise ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-11 pr-4 text-sm border rounded-xl bg-[#fcfbf9] border-[#ede8df] focus:outline-none focus:border-[#d2a356] focus:ring-1 focus:ring-[#d2a356] transition-colors"
          />
        </div>
        
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Status Filter */}
          <div className="relative w-full sm:w-auto flex items-center">
            <Filter className="absolute w-4 h-4 text-[#d2a356] left-3" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 py-2.5 pl-9 pr-4 text-sm border rounded-xl bg-[#fcfbf9] border-[#ede8df] focus:outline-none focus:border-[#d2a356] cursor-pointer appearance-none font-medium text-[#5a5648]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Payment">STK Pending</option>
              <option value="Paid">Paid (M-Pesa)</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Franchise Filter */}
          <div className="relative w-full sm:w-auto flex items-center">
            <Tag className="absolute w-4 h-4 text-[#d2a356] left-3" />
            <select 
              value={franchiseFilter}
              onChange={(e) => setFranchiseFilter(e.target.value)}
              className="w-full sm:w-48 py-2.5 pl-9 pr-4 text-sm border rounded-xl bg-[#fcfbf9] border-[#ede8df] focus:outline-none focus:border-[#d2a356] cursor-pointer appearance-none font-medium text-[#5a5648]"
            >
              <option value="All">All Buyers</option>
              <option value="Franchise">B2B Franchise</option>
              <option value="Retail">Standard Retail</option>
            </select>
          </div>
        </div>
      </div>

      {/* ════════ MAIN ORDERS TABLE ════════ */}
      <div className="overflow-hidden bg-white border shadow-sm border-[#ede8df] rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[0.75rem] bg-[#fcfbf9] text-[#8a8070] uppercase tracking-wider border-b border-[#ede8df]">
              <tr>
                <th className="px-6 py-4 font-bold">Order Details</th>
                <th className="px-6 py-4 font-bold">Customer & Type</th>
                <th className="px-6 py-4 font-bold">Items Purchased</th>
                <th className="px-6 py-4 font-bold">Total (KES)</th>
                <th className="px-6 py-4 font-bold">Fulfillment</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#ede8df]">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center text-[#8a8070]">Loading Fohow Orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-[#8a8070]">No orders match your filters.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-[#fdf8ef]/40">
                    
                    {/* Column 1: Order Meta */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1c1a16]">{order.order_number}</p>
                      <p className="text-xs text-[#8a8070] mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </td>

                    {/* Column 2: Customer, ID & Franchise */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1c1a16]">{order.customer_name || 'N/A'}</p>
                      <p className="text-xs text-[#5a5648] mt-0.5">{order.customer_phone}</p>
                      
                      {/* 🟢 NEW: ID Number Display */}
                      {order.customer_id_number && (
                        <p className="text-[0.65rem] font-bold text-[#8a8070] mt-0.5 uppercase tracking-wider">
                          ID: {order.customer_id_number}
                        </p>
                      )}

                      {order.franchise_id && (
                        <div className="mt-1.5 flex items-center gap-1 text-[0.65rem] font-bold text-[#d2a356] bg-[#fdf8ef] border border-[#d2a356]/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <Tag size={10} /> {order.franchise_id}
                        </div>
                      )}

                      {/* 🟢 NEW: Location Summary in Table */}
                      {order.delivery_address && (
                        <p className="text-[0.65rem] font-medium text-[#811816] mt-1 italic">
                           Map: {getParsedAddress(order.delivery_address).county}, {getParsedAddress(order.delivery_address).estate}
                        </p>
                      )}
                    </td>

                    {/* Column 3: The Product Names */}
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-sm text-[#1c1a16] font-medium truncate" title={order.product_names || "Products"}>
                        {order.product_names ? order.product_names : `${order.items_count} items`}
                      </p>
                      <p className="text-xs text-[#8a8070] mt-0.5">{order.items_count} Total Quantities</p>
                    </td>

                    {/* Column 4: Revenue & M-Pesa */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1c1a16]">{Number(order.total_amount).toLocaleString()}</p>
                      {order.mpesa_receipt ? (
                        <p className="text-[0.65rem] font-bold text-[#4a7c59] mt-1 uppercase tracking-wider flex items-center gap-1">
                          <Smartphone size={10}/> {order.mpesa_receipt}
                        </p>
                      ) : (
                        <p className="text-[0.65rem] font-bold text-amber-600 mt-1 uppercase tracking-wider">Unpaid / COD</p>
                      )}
                    </td>

                    {/* Column 5: Status Dropdown */}
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[0.7rem] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Paid">Paid (M-Pesa / Bank)</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Column 6: Action */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="p-2 transition-colors rounded-lg text-[#a0998e] hover:text-[#811816] hover:bg-[#fcf5f5]"
                          title="View Order"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id, order.order_number)}
                          className="p-2 transition-colors rounded-lg text-[#a0998e] hover:text-red-600 hover:bg-red-50"
                          title="Delete Order"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════ VIEW ORDER MODAL ════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0504]/70 p-4 animate-in fade-in duration-200">
          <div className="bg-[#fcfbf9] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 will-change-transform">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#ede8df] bg-white">
              <div>
                <h2 className="text-2xl font-garamond font-medium text-[#1c1a16]">Order Summary</h2>
                {!modalLoading && selectedOrder && (
                  <p className="text-sm text-[#8a8070] mt-1 font-dm">ID: {selectedOrder.order_number}</p>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#a0998e] hover:text-[#811816] rounded-full hover:bg-[#fcf5f5] transition">
                <X className="w-6 h-6"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              {modalLoading || !selectedOrder ? (
                <div className="flex justify-center items-center h-48 text-[#d2a356] font-bold animate-pulse">Loading order details...</div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Info Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Customer Card */}
                    <div className="p-4 border border-[#ede8df] bg-white rounded-2xl flex items-start gap-3 shadow-sm">
                      <User className="w-5 h-5 text-[#811816] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[0.65rem] font-bold text-[#a0998e] uppercase tracking-wider mb-1">Customer</p>
                        <p className="font-bold text-[#1c1a16]">{selectedOrder.customer_name || 'N/A'}</p>
                        <p className="text-sm text-[#5a5648] mt-0.5">{selectedOrder.customer_phone}</p>
                        
                        {/* 🟢 NEW: ID Number Display in Modal */}
                        {selectedOrder.customer_id_number && (
                          <p className="text-sm font-bold text-[#1c1a16] mt-1 bg-[#fcfbf9] inline-block px-2 py-0.5 rounded border border-[#ede8df]">
                            ID: {selectedOrder.customer_id_number}
                          </p>
                        )}

                        {selectedOrder.franchise_id && (
                          <p className="text-xs font-bold text-[#d2a356] mt-2 flex items-center gap-1"><Tag size={12}/> {selectedOrder.franchise_id}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment Card */}
                    <div className="p-4 border border-[#ede8df] bg-white rounded-2xl flex items-start gap-3 shadow-sm">
                      <CreditCard className="w-5 h-5 text-[#811816] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[0.65rem] font-bold text-[#a0998e] uppercase tracking-wider mb-1">Payment</p>
                        <p className="font-bold text-[#1c1a16] capitalize">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'M-Pesa STK'}</p>
                        {selectedOrder.mpesa_receipt && <p className="text-xs font-bold text-[#4a7c59] mt-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block">Ref: {selectedOrder.mpesa_receipt}</p>}
                      </div>
                    </div>

                    {/* Delivery Logistics Card */}
                    <div className="p-4 border border-[#d2a356]/20 bg-[#fdf8ef] rounded-2xl flex items-start gap-3 md:col-span-2">
                      {selectedOrder.delivery_method === 'pickup' ? (
                        <MapPin className="w-5 h-5 text-[#d2a356] mt-0.5 shrink-0" />
                      ) : (
                        <Truck className="w-5 h-5 text-[#d2a356] mt-0.5 shrink-0" />
                      )}
                      <div className="w-full">
                        <p className="text-[0.65rem] font-bold text-[#a0998e] uppercase tracking-wider mb-2">
                          Logistics: {selectedOrder.delivery_method === 'pickup' ? 'Office Pickup' : 'Standard Delivery'}
                        </p>
                        
                        {selectedOrder.delivery_method === 'pickup' ? (
                          <p className="font-medium text-[#1c1a16] text-sm bg-white p-3 rounded-xl border border-[#ede8df]">
                            {getParsedAddress(selectedOrder.delivery_address).station || 'Harambee Ave Office'}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-[#1c1a16] bg-white p-4 rounded-xl border border-[#ede8df] shadow-sm">
                            <p><span className="text-[#8a8070] font-medium block text-xs">County</span> <span className="capitalize font-bold">{getParsedAddress(selectedOrder.delivery_address).county || 'N/A'}</span></p>
                            <p><span className="text-[#8a8070] font-medium block text-xs">Estate/Town</span> <span className="font-bold">{getParsedAddress(selectedOrder.delivery_address).estate || 'N/A'}</span></p>
                            <p className="sm:col-span-2 pt-2 border-t border-[#ede8df]"><span className="text-[#8a8070] font-medium block text-xs">Specific Address</span> {getParsedAddress(selectedOrder.delivery_address).building || 'N/A'}</p>
                            {getParsedAddress(selectedOrder.delivery_address).landmarks && (
                              <p className="sm:col-span-2"><span className="text-[#8a8070] font-medium block text-xs">Landmarks</span> {getParsedAddress(selectedOrder.delivery_address).landmarks}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div>
                    <h3 className="font-bold text-[#1c1a16] mb-4 flex items-center gap-2 border-b border-[#ede8df] pb-2">
                      <Package className="w-5 h-5 text-[#8a8070]" /> Order Manifest
                    </h3>
                    <div className="space-y-3 mb-6">
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-transparent hover:border-[#ede8df] hover:bg-white rounded-xl transition shadow-sm bg-white border-[#ede8df]/50">
                          <div>
                            <p className="font-bold text-[#1c1a16]">{item.name}</p>
                            <p className="text-sm text-[#8a8070]">Qty: {item.quantity} × KES {Number(item.price_at_time).toLocaleString()}</p>
                          </div>
                          <p className="font-bold text-[#1c1a16]">KES {(item.quantity * item.price_at_time).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Financial Breakdown */}
                    <div className="space-y-2 border-t border-[#ede8df] pt-4 text-sm">
                      <div className="flex justify-between text-[#8a8070]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#1c1a16]">KES {Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                      </div>
                      
                      {Number(selectedOrder.discount_amount) > 0 && (
                        <div className="flex justify-between text-[#d2a356]">
                          <span>Franchise Discount</span>
                          <span className="font-medium">- KES {Number(selectedOrder.discount_amount).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#8a8070]">
                        <span>VAT (16%)</span>
                        <span className="font-medium text-[#1c1a16]">KES {Number(selectedOrder.tax_amount || 0).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-[#8a8070]">
                        <span>Delivery Fee</span>
                        <span className="font-medium text-[#1c1a16]">KES {(Number(selectedOrder.total_amount) - (Number(selectedOrder.subtotal || 0) - Number(selectedOrder.discount_amount || 0) + Number(selectedOrder.tax_amount || 0))).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Bar */}
                  <div className="pt-6 border-t border-[#ede8df] flex items-center justify-between">
                      <p className="text-lg font-bold text-[#8a8070]">Total Charged</p>
                    <p className="text-3xl font-black text-[#811816]">KES {Number(selectedOrder.total_amount).toLocaleString()}</p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ TRANSACTION CODE PROMPT MODAL ════════ */}
      {transactionPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1a16]/40 backdrop-blur-sm">
          <div className="bg-[#fcfbf9] rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#ede8df] animate-in zoom-in-95 duration-200">
            <h3 className="font-garamond text-2xl font-medium text-[#1c1a16] mb-2">Verify Payment</h3>
            <p className="font-dm text-sm text-[#8a8070] mb-6">Please enter the M-Pesa or Bank Transaction Code (e.g. SFG7H8J9K) for this order.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const code = new FormData(e.target).get('code');
              if (!code || code.trim() === '') {
                showToast("Transaction code is required.", "error");
                return;
              }
              
              const isValidMpesaCode = /^[A-Z0-9]{10}$/.test(code.trim().toUpperCase());
              // We allow explicit "BANK" prefix as an escape hatch for non-Mpesa bank transfers
              if (!isValidMpesaCode && !code.trim().toUpperCase().startsWith('BANK')) {
                showToast("Invalid M-Pesa Code. Must be exactly 10 letters/numbers.", "error");
                return;
              }
              
              submitTransactionCode(transactionPrompt.orderId, code.trim().toUpperCase());
            }}>
              <input 
                name="code"
                autoFocus
                required
                placeholder="Transaction Code"
                className="w-full py-3 px-4 text-sm border rounded-xl bg-white border-[#ede8df] focus:outline-none focus:border-[#d2a356] focus:ring-1 focus:ring-[#d2a356] transition-colors mb-6 font-medium uppercase tracking-wider text-[#1c1a16]"
              />
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setTransactionPrompt({ isOpen: false, orderId: null })}
                  className="px-5 py-2.5 rounded-xl font-dm text-sm font-medium text-[#8a8070] hover:bg-[#ede8df] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl font-dm text-sm font-bold text-[#1c1a16] bg-[#d2a356] hover:bg-[#e0b772] transition-colors shadow-sm"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;