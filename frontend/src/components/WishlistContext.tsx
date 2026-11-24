"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number | string;
  category: string;
  image: string;
  description?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "aveon_wishlist_items";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read wishlist from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write wishlist to localStorage", e);
    }
  }, [items, isLoaded]);

  const toggleItem = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id || i.name === item.name);
      if (exists) {
        return prev.filter((i) => i.id !== item.id && i.name !== item.name);
      } else {
        return [...prev, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id && i.name !== id));
  };

  const isSaved = (id: string) => {
    return items.some((i) => i.id === id || i.name === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleItem,
        removeItem,
        isSaved,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      items: [],
      toggleItem: () => {},
      removeItem: () => {},
      isSaved: () => false,
      count: 0,
    };
  }
  return context;
}
