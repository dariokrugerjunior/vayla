import React, { createContext, useContext, ReactNode } from 'react';
import { Store } from '../types';
import { mockStore } from '../data/mockData';

interface StoreContextType {
  store: Store;
  updateStore: (store: Partial<Store>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = React.useState<Store>(mockStore);

  const updateStore = (updates: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...updates }));
  };

  return (
    <StoreContext.Provider value={{ store, updateStore }}>
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
