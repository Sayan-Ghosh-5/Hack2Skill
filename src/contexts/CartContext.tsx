import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../utils/localStorage';

export type CartItem = {
  id: string; // unique instance id
  mealId: string;
  name: string;
  image: string;
  macros: { calories: number; protein: number; carbs: number; fats: number };
  customization: { portion: number; proteinBoost: boolean };
  price: number;
};

type CartState = {
  items: CartItem[];
  total: number;
};

interface CartContextType {
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useLocalStorage<CartState>('macroplate_cart', { items: [], total: 0 });

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    const newItems = [...cart.items, newItem];
    const newTotal = newItems.reduce((sum, current) => sum + current.price, 0);
    
    setCart({
      items: newItems,
      total: Number(newTotal.toFixed(2))
    });
  };

  const removeFromCart = (id: string) => {
    const newItems = cart.items.filter((item) => item.id !== id);
    const newTotal = newItems.reduce((sum, current) => sum + current.price, 0);
    
    setCart({
      items: newItems,
      total: Number(newTotal.toFixed(2))
    });
  };

  const clearCart = () => setCart({ items: [], total: 0 });

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
