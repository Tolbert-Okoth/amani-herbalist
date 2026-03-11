import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  return (
    <>
      {/* Background Overlay (dims the screen when cart is open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Drawer */}
      <div 
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[400px] bg-[#f9f8f6] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-stone-200">
          <h2 className="flex items-center font-serif text-2xl font-medium text-stone-900">
            <ShoppingBag className="w-6 h-6 mr-3 text-[#4a7c59]" />
            Your Apothecary
          </h2>
          <button onClick={onClose} className="p-2 transition-colors rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
              <ShoppingBag className="w-12 h-12 mb-4 text-stone-300" />
              <p className="text-lg font-medium">Your bag is empty.</p>
              <button onClick={onClose} className="mt-4 text-[#4a7c59] hover:underline">
                Continue browsing remedies
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                  {/* Item Image */}
                  <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-stone-100 rounded-xl">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-stone-200" />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-serif text-lg font-medium leading-tight text-stone-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-[#2c4c3b]">
                        KES {(Number(item.price_kes) * item.quantity).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-stone-400 transition-colors hover:text-red-500 hover:bg-red-50 rounded-md"
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
          <div className="p-6 bg-white border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-stone-600">Subtotal</span>
              <span className="text-xl font-semibold text-stone-900">
                KES {cartTotal.toLocaleString()}
              </span>
            </div>
            <p className="mb-6 text-sm text-stone-500">Shipping and taxes calculated at checkout.</p>
            <Link 
              to="/checkout" 
              onClick={onClose} 
              className="flex items-center justify-center w-full py-4 text-lg font-medium text-white transition-all duration-300 rounded-full shadow-lg bg-[#2c4c3b] hover:bg-[#1f362a] hover:-translate-y-1"
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