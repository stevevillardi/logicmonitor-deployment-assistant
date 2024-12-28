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

// Helper function to store only essential dashboard data
const getEssentialDashboardData = (dashboard: any) => ({
  path: dashboard.path,
  name: dashboard.name,
  content: {
    name: dashboard.content.name,
    description: dashboard.content.description,
    widgets: dashboard.content.widgets,
    widgetTokens: dashboard.content.widgetTokens,
    widgetsConfigVersion: dashboard.content.widgetsConfigVersion
  }
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedDashboards, setSelectedDashboards] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (err) {
        console.error('Error loading cart:', err);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      // Store only essential data
      const essentialData = selectedDashboards.map(getEssentialDashboardData);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(essentialData));
    } catch (err: any) {
      console.error('Error saving cart:', err);
      // If quota exceeded, try to save with less data
      if (err.name === 'QuotaExceededError') {
        const minimalData = selectedDashboards.map(d => ({ 
          path: d.path, 
          name: d.name 
        }));
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimalData));
        } catch (e: any) {
          console.error('Failed to save even minimal cart data:', e);
        }
      }
    }
  }, [selectedDashboards]);

  const addDashboard = (dashboard: any) => {
    setSelectedDashboards(prev => [...prev, getEssentialDashboardData(dashboard)]);
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