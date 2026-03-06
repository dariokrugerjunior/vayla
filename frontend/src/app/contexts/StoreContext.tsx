import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { Store } from '../types';
import { fetchStoreByID, getStoreID, updateAdminStore } from '../services/storefront';
import { APIError } from '../services/api';

interface StoreContextType {
  store: Store | null;
  storeID: number;
  storeNotFound: boolean;
  isLoading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  updateStore: (store: Partial<Store>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function resolveStoreIDFromPath(): number {
  if (typeof window === 'undefined') {
    return getStoreID();
  }

  const match = window.location.pathname.match(/\/stores\/id\/(\d+)/);
  if (!match) {
    return getStoreID();
  }

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return getStoreID();
  }

  return parsed;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storeID, setStoreID] = useState<number>(() => resolveStoreIDFromPath());
  const [store, setStore] = useState<Store | null>(null);
  const [storeNotFound, setStoreNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateFromPath = () => {
      setStoreID(resolveStoreIDFromPath());
    };

    const notify = () => window.dispatchEvent(new Event('locationchange'));

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args as [data: any, unused: string, url?: string | URL | null]);
      notify();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args as [data: any, unused: string, url?: string | URL | null]);
      notify();
    };

    window.addEventListener('popstate', updateFromPath);
    window.addEventListener('locationchange', updateFromPath);

    updateFromPath();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', updateFromPath);
      window.removeEventListener('locationchange', updateFromPath);
    };
  }, []);

  const loadStore = async () => {
    setIsLoading(true);
    setError(null);
    setStoreNotFound(false);
    try {
      const data = await fetchStoreByID(storeID);
      setStore(data);
    } catch (err) {
      setStore(null);
      if (err instanceof APIError && err.status === 404) {
        setStoreNotFound(true);
      }
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [storeID]);

  const updateStore = async (updates: Partial<Store>) => {
    if (!store) return;
    const updated = await updateAdminStore(store.id, { ...store, ...updates });
    setStore(updated);
  };

  const value = useMemo(
    () => ({ store, storeID, storeNotFound, isLoading, error, refreshStore: loadStore, updateStore }),
    [store, storeID, storeNotFound, isLoading, error]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
