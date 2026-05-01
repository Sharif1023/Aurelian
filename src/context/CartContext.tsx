import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { toast } from 'react-hot-toast';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    const existingItemIndex = cartItems.findIndex(item =>
      item.id === product.id &&
      item.selectedSize === size &&
      item.selectedColor === color
    );

    let newCart;
    if (existingItemIndex > -1) {
      newCart = cartItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cartItems, { ...product, quantity, selectedSize: size, selectedColor: color }];
    }

    setCartItems(newCart);
    const totalItems = newCart.reduce((acc, item) => acc + item.quantity, 0);

    toast.success(`Added to cart! (${totalItems} items in cart)`, {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        borderRadius: '12px',
        padding: '16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#1a1a1a',
      },
    });
  };

  const removeFromCart = (
    productId: string,
    size?: string,
    color?: string
  ) => {
    setCartItems(prev => prev.filter(item =>
      item.id !== productId || item.selectedSize !== size || item.selectedColor !== color
    ));
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    setCartItems(prev => prev.map(item =>
      item.id === productId && item.selectedSize === size && item.selectedColor === color
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = cartItems.length > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      total,
      cartCount
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
