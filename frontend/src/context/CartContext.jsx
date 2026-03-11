import { createContext, useContext, useState, useEffect } from 'react';

// Create the Context
const CartContext = createContext();

// Create a custom hook so we can easily use the cart anywhere
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage so items survive page refreshes
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('amani_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Whenever cartItems changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('amani_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add Item to Cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // If it exists, just update the quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // If it's new, add it to the array
      return [...prevItems, { ...product, quantity }];
    });
  };

  // Remove Item from Cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Calculate Totals
  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price_kes) * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};