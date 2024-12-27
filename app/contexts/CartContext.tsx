import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CartContextType {
  selectedDashboards: any[];
  addDashboard: (dashboard: any) => void;
  removeDashboard: (path: string) => void;
  clearCart: () => void;
  isDashboardSelected: (path: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'lmda-dashboard-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedDashboards, setSelectedDashboards] = useState<any[]>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(selectedDashboards));
  }, [selectedDashboards]);

  const addDashboard = (dashboard: any) => {
    setSelectedDashboards(prev => [...prev, dashboard]);
  };

  const removeDashboard = (path: string) => {
    setSelectedDashboards(prev => prev.filter(d => d.path !== path));
  };

  const clearCart = () => {
    setSelectedDashboards([]);
  };

  const isDashboardSelected = (path: string) => {
    return selectedDashboards.some(d => d.path === path);
  };

  return (
    <CartContext.Provider value={{
      selectedDashboards,
      addDashboard,
      removeDashboard,
      clearCart,
      isDashboardSelected
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 