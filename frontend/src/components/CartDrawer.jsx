import { useState } from 'react';
import { X, Trash2, ShoppingBag, Leaf, Tag, ShieldCheck } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    franchiseId,
    discountRate,
    applyFranchise,
    removeFranchise
  } = useCart();

  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyFranchise = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');
    const result = await applyFranchise(inputId);
    setApplying(false);
    if (result.success) {
      setInputId('');
    } else {
      setError(result.error || 'Invalid Franchise ID.');
    }
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] bg-[#1c1a16]/40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 right-0 z-[130] h-[100dvh] w-full sm:w-[420px] bg-[#f7f4ef] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col will-change-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#e8dfd5] bg-[#f7f4ef] z-10 relative shadow-sm">
          <h2 className="flex items-center font-garamond text-3xl font-light text-[#1c1a16]">
            <ShoppingBag className="w-6 h-6 mr-3 text-[#811816]" strokeWidth={1.5} />
            Wholesale Order
          </h2>
          <button onClick={onClose} className="p-2 transition-colors rounded-full text-[#a0998e] hover:text-[#1c1a16] hover:bg-[#f0ece3]">
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-[#fcf5f5] rounded-full flex items-center justify-center mb-5 border border-[#811816]/10">
                <ShoppingBag className="w-8 h-8 text-[#811816]" strokeWidth={1.5} />
              </div>
              <p className="font-garamond text-2xl font-light text-[#1c1a16] mb-2">Your inventory is empty.</p>
              <p className="font-dm text-[0.9rem] font-light text-[#8a8070] mb-6">Browse the catalog to build your clinic's order.</p>
              <button onClick={onClose} className="font-dm px-8 py-3 bg-[#811816] text-[#f7f4ef] rounded-full text-sm font-medium transition-all duration-300 hover:bg-[#6a1210] hover:drop-shadow-[0_0_8px_rgba(129,24,22,0.4)]">
                Continue Browsing
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 bg-white border border-[#ede8df] rounded-[1.25rem] shadow-sm transition-all hover:shadow-md hover:border-[#d2a356]/30">

                  {/* Item Image */}
                  <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-[#f0ece3] rounded-xl flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={api.getImageUrl(item.image_url)}
                        alt={item.name}
                        className="object-cover w-full h-full mix-blend-multiply"
                      />
                    ) : (
                      <Leaf className="w-8 h-8 text-[#c8b89a]" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col justify-between flex-1 py-0.5">
                    <div>
                      <h3 className="font-garamond text-xl font-normal leading-tight text-[#1c1a16] line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="font-dm text-[0.8rem] text-[#8a8070]">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-dm text-[0.95rem] font-medium text-[#1c1a16]">
                        KES {(Number(item.price_kes) * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-[#c8b89a] transition-colors hover:text-[#811816] hover:bg-[#fcf5f5] rounded-md"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-[#f7f4ef] border-t border-[#e8dfd5] z-10 relative">

            {/* Franchise ID Integration (Phase 2) */}
            <div className="mb-5 border-b border-[#ede8df] pb-5">
              {franchiseId ? (
                <div className="flex items-center justify-between p-3 bg-[#fdf8ef] border border-[#d2a356]/40 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-[#d2a356]" />
                    <div>
                      <p className="font-dm text-[0.75rem] uppercase tracking-widest text-[#d2a356] font-bold">Franchise Applied</p>
                      <p className="font-dm text-[0.85rem] font-medium text-[#811816]">{franchiseId}</p>
                    </div>
                  </div>
                  <button onClick={removeFranchise} className="text-[#a0998e] hover:text-[#811816] transition-colors p-1 bg-white rounded-full shadow-sm">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="font-dm text-[0.8rem] font-medium text-[#5a5648] flex items-center gap-1.5">
                    <Tag size={14} className="text-[#a0998e]" /> Have a Franchise ID?
                  </label>
                  <form onSubmit={handleApplyFranchise} className="flex gap-2">
                    <input
                      type="text"
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      placeholder="Enter ID to unlock wholesale pricing"
                      className="flex-1 px-3.5 py-2.5 bg-[#faf8f4] border border-[#ede8df] rounded-xl font-dm text-[0.85rem] outline-none focus:border-[#d2a356] focus:ring-[3px] focus:ring-[#d2a356]/20 transition-all uppercase"
                    />
                    <button
                      type="submit"
                      disabled={applying || !inputId.trim()}
                      className="px-5 py-2.5 shrink-0 bg-[#f0ece3] text-[#5a5648] hover:bg-[#811816] hover:text-[#f7f4ef] font-dm text-[0.85rem] font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                  {error && <p className="font-dm text-xs text-[#811816] mt-1">{error}</p>}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center justify-between font-dm text-[0.9rem] text-[#5a5648]">
                <span>Retail Subtotal</span>
                <span>KES {cartSubtotal.toLocaleString()}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex items-center justify-between font-dm text-[0.9rem] font-medium text-[#d2a356] animate-in slide-in-from-top-1 fade-in">
                  <span>Total Savings (Discount Applied)</span>
                  <span>- KES {cartDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#ede8df]">
                <span className="font-garamond text-xl text-[#1c1a16] font-medium">Estimated Total</span>
                <span className="font-dm text-2xl font-bold text-[#811816]">
                  KES {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={onClose}
              className="font-dm flex items-center justify-center w-full py-3.5 text-[0.95rem] font-medium tracking-[0.02em] text-[#f7f4ef] transition-all duration-300 rounded-full bg-[#811816] hover:bg-[#6a1210] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(129,24,22,0.3)]"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
