import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { Store } from '../types';
import { fetchStoreByID, fetchStoreBySlug, getDefaultStoreSlug, getStoreID, updateAdminStore } from '../services/storefront';
import { APIError } from '../services/api';

interface StoreContextType {
  store: Store | null;
  storeID: number;
  storeSlug: string;
  storeNotFound: boolean;
  isLoading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  updateStore: (store: Partial<Store>) => Promise<void>;
}

type StoreLocator =
  | { mode: 'id'; storeID: number; storeSlug: '' }
  | { mode: 'slug'; storeID: 0; storeSlug: string };

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function resolveStoreLocatorFromPath(): StoreLocator {
  if (typeof window === 'undefined') {
    return { mode: 'id', storeID: getStoreID(), storeSlug: '' };
  }

  const idMatch = window.location.pathname.match(/\/stores\/id\/(\d+)/);
  if (idMatch) {
    const parsed = Number(idMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      return { mode: 'id', storeID: parsed, storeSlug: '' };
    }
  }

  const slugMatch = window.location.pathname.match(/^\/([^/?#]+)/);
  if (slugMatch) {
    const candidate = decodeURIComponent(slugMatch[1] || '').trim();
    if (candidate && candidate !== 'stores' && candidate !== 'admin') {
      return { mode: 'slug', storeID: 0, storeSlug: candidate };
    }
  }

  return { mode: 'slug', storeID: 0, storeSlug: getDefaultStoreSlug() };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [locator, setLocator] = useState<StoreLocator>(() => resolveStoreLocatorFromPath());
  const [store, setStore] = useState<Store | null>(null);
  const [storeNotFound, setStoreNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateFromPath = () => {
      setLocator(resolveStoreLocatorFromPath());
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
      const data =
        locator.mode === 'id'
          ? await fetchStoreByID(locator.storeID)
          : await fetchStoreBySlug(locator.storeSlug);
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
  }, [locator.mode, locator.storeID, locator.storeSlug]);

  const updateStore = async (updates: Partial<Store>) => {
    if (!store) return;
    const updated = await updateAdminStore(store.id, { ...store, ...updates });
    setStore(updated);
  };

  const storeID = store?.id || (locator.mode === 'id' ? locator.storeID : 0);
  const storeSlug = store?.slug || (locator.mode === 'slug' ? locator.storeSlug : '');

  const value = useMemo(
    () => ({ store, storeID, storeSlug, storeNotFound, isLoading, error, refreshStore: loadStore, updateStore }),
    [store, storeID, storeSlug, storeNotFound, isLoading, error]
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
