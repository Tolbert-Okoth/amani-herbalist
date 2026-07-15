import { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';
import api from '../api';

// Create the Context
const CartContext = createContext();

// Create a custom hook so we can easily use the cart anywhere
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();
  // 1. Initialize cart and franchise data from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('fohow_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [franchiseId, setFranchiseId] = useState(() => {
    return localStorage.getItem('fohow_franchise') || '';
  });

  const [discountRate, setDiscountRate] = useState(() => {
    return Number(localStorage.getItem('fohow_discount')) || 0;
  });

  const { globalDiscount, deliveryFees } = useSettings();

  const globalSettings = {
    home_delivery_fee: deliveryFees?.home ?? 500,
    pickup_delivery_fee: deliveryFees?.pickup ?? 200,
    franchise_discount_rate: globalDiscount ?? 20
  };

  // 3. Sync cart/franchise to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fohow_cart', JSON.stringify(cartItems));
    localStorage.setItem('fohow_franchise', franchiseId);
    localStorage.setItem('fohow_discount', discountRate.toString());
  }, [cartItems, franchiseId, discountRate]);

  // 3b. Auto-refresh franchise discount rate from backend on mount/franchise change
  useEffect(() => {
    if (franchiseId) {
      api.get(`/franchises/validate/${franchiseId}`).then((response) => {
        const body = response.raw || response.data || {};
        if (body.valid && body.franchise) {
          setDiscountRate(Number(body.franchise.discount_rate));
        }
      }).catch((err) => console.error("Failed to refresh franchise discount:", err));
    }
  }, [franchiseId]);

  // 3. Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (product.stock_quantity === 0) return; // Completely sold out

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        const newTotalQuantity = existingItem.quantity + quantity;
        const cappedQuantity = Math.min(newTotalQuantity, product.stock_quantity);

        if (newTotalQuantity > product.stock_quantity) {
          showToast(`You can only add up to ${product.stock_quantity} units of ${product.name}`, 'error');
        }

        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: cappedQuantity }
            : item
        );
      }
      
      const cappedQuantity = Math.min(quantity, product.stock_quantity);
      if (quantity > product.stock_quantity) {
         showToast(`You can only add up to ${product.stock_quantity} units of ${product.name}`, 'error');
      }
      
      return [...prevItems, { ...product, quantity: cappedQuantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Fixed: Added updateQuantity so the +/- buttons on Checkout/Product Detail work!
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent going below 1 via this function
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
           const cappedQuantity = Math.min(newQuantity, item.stock_quantity);
           if (newQuantity > item.stock_quantity) {
             showToast(`Maximum stock reached for ${item.name}`, 'info');
           }
           return { ...item, quantity: cappedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // 4. Franchise Discount Logic — validates code against the database
  const applyFranchise = async (id) => {
    if (!id || id.trim().length < 4) {
      return { success: false, error: 'Must be at least 4 characters.' };
    }
    try {
      const response = await api.get(`/franchises/validate/${id.trim().toUpperCase()}`);
      // Use response.raw for the full body (api.get normalizes .data which strips top-level fields)
      const body = response.raw || response.data || {};
      if (body.valid && body.franchise) {
        setFranchiseId(id.trim().toUpperCase());
        // Use the per-franchise discount_rate directly from the DB (stored as decimal, e.g. 0.20)
        setDiscountRate(Number(body.franchise.discount_rate));
        return { success: true };
      } else {
        return { success: false, error: body.error || 'Invalid or inactive Franchise ID.' };
      }
    } catch (err) {
      return { success: false, error: 'Could not validate Franchise ID. Check your connection.' };
    }
  };

  const removeFranchise = () => {
    setFranchiseId('');
    setDiscountRate(0); // Reset back to retail price
  };

  // 5. Calculate Advanced Totals
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  // Retail Total (MSRP)
  const cartSubtotal = cartItems.reduce((total, item) => total + (Number(item.price_kes) * item.quantity), 0);
  
  // Global B2B discount as decimal fallback (e.g. 30 -> 0.30)
  const globalDiscountDecimal = (globalDiscount || 0) / 100;
  
  // The effective discount rate: best of franchise rate or global B2B rate
  const effectiveDiscountRate = Math.max(discountRate, globalDiscountDecimal);
  
  // Per-Item Discount Logic: custom discount overrides all others
  const cartDiscount = cartItems.reduce((total, item) => {
    let applicableRate = 0;
    // We check for '' because formData from the frontend might pass it as empty string
    if (item.custom_discount !== null && item.custom_discount !== undefined && item.custom_discount !== '') {
      // Explicit override on product level (even 0% strict retail)
      applicableRate = Number(item.custom_discount) / 100;
    } else {
      // Otherwise, use best of franchise rate or global B2B rate
      applicableRate = effectiveDiscountRate;
    }
    
    return total + (Number(item.price_kes) * item.quantity * applicableRate);
  }, 0);
  
  // No VAT (Removed by user request)
  const cartTax = 0;
  
  // Final Charge
  const cartTotal = cartSubtotal - cartDiscount;

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTax,      // ← Exposed for VAT breakdown
        cartTotal,
        franchiseId,

        discountRate: effectiveDiscountRate,
        applyFranchise,
        removeFranchise,
        globalSettings,   // ← exposed for Checkout & elsewhere
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
