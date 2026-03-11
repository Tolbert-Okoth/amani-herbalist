import { Store, Bell, Lock } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-medium text-stone-900">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">Manage your store preferences and integrations.</p>
      </div>

      <div className="space-y-8">
        
        {/* Store Details Card */}
        <div className="bg-white border shadow-sm border-stone-100 rounded-2xl overflow-hidden">
          <div className="flex items-center px-6 py-5 border-b border-stone-100 bg-stone-50/50">
            <Store className="w-5 h-5 mr-3 text-stone-400" />
            <h2 className="text-lg font-medium text-stone-900">Store Details</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-stone-700">Store Name</label>
                <input type="text" defaultValue="Amani Herbalists" className="w-full px-4 py-2 border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-stone-700">Contact Email</label>
                <input type="email" defaultValue="admin@amaniherbalists.co.ke" className="w-full px-4 py-2 border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-stone-700">Store Description</label>
              <textarea rows="3" defaultValue="Traditional Chinese Medicine · Kenyan Wellness" className="w-full px-4 py-2 border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] resize-none"></textarea>
            </div>
            <button className="px-5 py-2.5 text-sm font-medium text-white transition-all bg-[#2c4c3b] rounded-lg hover:bg-[#1f362a]">Save Changes</button>
          </div>
        </div>

        {/* Payment & Security Card */}
        <div className="bg-white border shadow-sm border-stone-100 rounded-2xl overflow-hidden">
          <div className="flex items-center px-6 py-5 border-b border-stone-100 bg-stone-50/50">
            <Lock className="w-5 h-5 mr-3 text-stone-400" />
            <h2 className="text-lg font-medium text-stone-900">Payment Integrations</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-xl border-stone-200 bg-stone-50">
              <div>
                <h3 className="font-medium text-stone-900">M-Pesa Daraja API</h3>
                <p className="text-sm text-stone-500">Accept Lipa na M-Pesa payments natively.</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-xl border-stone-200 bg-stone-50">
              <div>
                <h3 className="font-medium text-stone-900">Stripe Integration</h3>
                <p className="text-sm text-stone-500">Accept international credit and debit cards.</p>
              </div>
              <button className="px-4 py-1.5 text-sm font-medium transition-all bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700">Configure</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;