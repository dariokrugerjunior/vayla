import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, ProductVariation } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variation: ProductVariation, quantity: number) => void;
  removeFromCart: (productId: number, variationId: number) => void;
  updateQuantity: (productId: number, variationId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, variation: ProductVariation, quantity: number) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === product.id && item.variation.id === variation.id
      );

      if (existingItem) {
        toast.success('Quantidade atualizada no carrinho');
        return prev.map((item) =>
          item.product.id === product.id && item.variation.id === variation.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success('Produto adicionado ao carrinho');
      return [...prev, { product, variation, quantity }];
    });
  };

  const removeFromCart = (productId: number, variationId: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variation.id === variationId)
      )
    );
    toast.success('Produto removido do carrinho');
  };

  const updateQuantity = (productId: number, variationId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variation.id === variationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const override = item.variation.priceOverride || 0;
      const price = override > 0 ? override : item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}
    >
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
