"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartStep: 'cart' | 'form' | 'success';
  setCartStep: (step: 'cart' | 'form' | 'success') => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [isLoaded, setIsLoaded] = useState(false);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (loading) return;

    const loadCart = async () => {
      let localCart: CartItem[] = [];
      try {
        const saved = localStorage.getItem('aveon_enquiry_cart');
        if (saved) localCart = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local cart", e);
      }

      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        
        let mergedCart = [...localCart];
        if (cartSnap.exists()) {
          const cloudCart = cartSnap.data().items as CartItem[] || [];
          
          const mergedMap = new Map();
          localCart.forEach(i => mergedMap.set(i.id, i));
          cloudCart.forEach(i => mergedMap.set(i.id, i));
          mergedCart = Array.from(mergedMap.values());
        }

        setItems(mergedCart);
        
        await setDoc(cartRef, { items: mergedCart }, { merge: true });
        localStorage.removeItem('aveon_enquiry_cart');
      } else {
        setItems(localCart);
      }
      setIsLoaded(true);
      isInitialized.current = true;
    };

    loadCart();
  }, [user, loading]);

  useEffect(() => {
    if (!isInitialized.current) return;
    
    if (user) {
      setDoc(doc(db, 'carts', user.uid), { items }, { merge: true }).catch(console.error);
    } else {
      localStorage.setItem('aveon_enquiry_cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id || i.name === product.name);
      if (existing) return prev; 
      return [...prev, {
        id: product.id || product.name,
        name: product.name,
        image: product.image || product.img,
        category: product.category || 'General',
        quantity: 1
      }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateItem, 
      clearCart, 
      itemCount,
      isCartOpen,
      setIsCartOpen,
      cartStep,
      setCartStep,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
