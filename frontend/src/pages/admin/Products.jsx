import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const AdminProducts = () => {
  // Mock data - will be replaced by your PostgreSQL fetch
  const products = [
    { id: 1, name: "Cordyceps Oral Liquid", category: "Vitality", price: 4500, stock: 42, status: "Active" },
    { id: 2, name: "Reishi Mushroom Extract", category: "Immunity", price: 3800, stock: 15, status: "Active" },
    { id: 3, name: "Liver Cleanse Herbal Blend", category: "Detox", price: 4200, stock: 0, status: "Out of Stock" },
  ];

  return (
    <div className="p-8 lg:p-12">
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">Products</h1>
          <p className="mt-1 text-sm text-stone-500">Manage your apothecary inventory and pricing.</p>
        </div>
        <button className="flex items-center px-5 py-2.5 text-sm font-medium text-white transition-all bg-[#2c4c3b] rounded-lg hover:bg-[#1f362a] shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 mb-6 bg-white border shadow-sm border-stone-100 rounded-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute w-4 h-4 text-stone-400 left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden bg-white border shadow-sm border-stone-100 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm bg-stone-50 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price (KES)</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-stone-50/50">
                  <td className="px-6 py-4 font-medium text-stone-900">{product.name}</td>
                  <td className="px-6 py-4 text-stone-600">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-stone-900">{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-stone-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 mr-2 transition-colors rounded-md text-stone-400 hover:text-[#4a7c59] hover:bg-stone-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 transition-colors rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
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

export default AdminProducts;