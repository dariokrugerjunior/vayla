import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Store } from '../types';
import { fetchStoreBySlug, getStoreSlug, updateAdminStore } from '../services/storefront';

interface StoreContextType {
  store: Store | null;
  storeSlug: string;
  isLoading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  updateStore: (store: Partial<Store>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeSlug = getStoreSlug();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStore = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStoreBySlug(storeSlug);
      setStore(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  const updateStore = async (updates: Partial<Store>) => {
    if (!store) return;
    const updated = await updateAdminStore(store.id, { ...store, ...updates });
    setStore(updated);
  };

  return (
    <StoreContext.Provider value={{ store, storeSlug, isLoading, error, refreshStore: loadStore, updateStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
