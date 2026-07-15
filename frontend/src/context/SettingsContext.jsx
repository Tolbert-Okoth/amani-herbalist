import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [globalDiscount, setGlobalDiscount] = useState(20); // Default to 20%
  const [deliveryFees, setDeliveryFees] = useState({ home: 500, pickup: 200 });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        // Map backend 'franchise_discount_rate' to 'globalDiscount' for the UI
        if (response.data.franchise_discount_rate !== undefined) {
          setGlobalDiscount(response.data.franchise_discount_rate);
        }
        if (response.data.home_delivery_fee !== undefined) {
          setDeliveryFees({
            home: response.data.home_delivery_fee,
            pickup: response.data.pickup_delivery_fee
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch global settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Admin function to update state locally after a successful API call
  const updateLocalDiscount = (newVal) => setGlobalDiscount(newVal);
  const updateLocalDeliveryFees = (newFees) => setDeliveryFees(newFees);

  return (
    <SettingsContext.Provider value={{ 
      globalDiscount, 
      deliveryFees,
      updateLocalDiscount, 
      updateLocalDeliveryFees,
      loading, 
      refreshSettings: fetchSettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
