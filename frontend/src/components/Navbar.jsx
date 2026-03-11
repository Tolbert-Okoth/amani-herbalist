import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext'; // <-- Import the hook
import CartDrawer from './CartDrawer';            // <-- Import the drawer

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Controls the drawer
  
  // Pull the live cart count from your Context!
  const { cartCount } = useCart(); 

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#f9f8f6]/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2c4c3b]">Amani</span>
              <span className="font-serif text-2xl tracking-tight text-stone-500">Herbalists</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/shop" className="text-sm font-medium transition-colors text-stone-600 hover:text-[#2c4c3b]">Shop All</Link>
              <Link to="/philosophy" className="text-sm font-medium transition-colors text-stone-600 hover:text-[#2c4c3b]">Our Philosophy</Link>
              <Link to="/contact" className="text-sm font-medium transition-colors text-stone-600 hover:text-[#2c4c3b]">Consultations</Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Click this button to open the cart drawer! */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 transition-colors rounded-full text-stone-600 hover:bg-stone-200/50 hover:text-[#2c4c3b]"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white rounded-full bg-[#4a7c59]">
                    {cartCount}
                  </span>
                )}
              </button>

              <button className="p-2 md:hidden text-stone-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t md:hidden bg-[#f9f8f6] border-stone-200 absolute w-full">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-stone-800">Shop All</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Render the Drawer here! */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;