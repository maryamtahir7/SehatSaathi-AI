"use client"
import { API_URL } from '../lib/api';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbService } from '../services/db.service';
import { useAuth } from './AuthContext';
import { useLanguage } from "../context/LanguageContext";

export interface CartItem {
  id: string; // unique virtual id or appwrite doc id
  name: string;
  price: number;
  quantity: number;
  manufacturer: string;
  type: 'medicine' | 'lab';
}

export interface PatientDetails {
  userId?: string;
  name: string;
  phone: string;
  address: string;
  age: string;
  city: string;
  postalCode: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (medicineName: string, silent?: boolean) => Promise<void>;
  addLabToCart: (labName: string, price: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  checkoutCart: (patient: PatientDetails) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  showCheckoutForm: boolean;
  setShowCheckoutForm: (val: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const { user } = useAuth();

  // 1. Load Cart from Appwrite on Login
  useEffect(() => {
    if (user) {
      loadPersistentCart(user.$id);
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadPersistentCart = async (userId: string) => {
    try {
      const data = await dbService.getCart(userId);
      const items: CartItem[] = [];

      for (const doc of data.documents) {
        // We attempt to resolve the item metadata
        // For CSV items, we search the backend, for Appwrite items, we search PRODUCTS
        try {
          let itemDetails: any = null;
          
          if (doc.productId.includes('csv_')) {
             const cleanName = doc.productId.replace('csv_', '');
             const res = await fetch(`${API_URL}/medicines/search?q=${encodeURIComponent(cleanName)}`);
             itemDetails = await res.json();
             itemDetails.type = 'medicine';
          } else if (doc.productId.startsWith('lab_')) {
             itemDetails = { name: doc.productId.replace('lab_', ''), price: doc.quantity > 0 ? doc.itemPrice : 0, type: 'lab' }; // Fallback
          } else {
             // Appwrite Product
             const res = await dbService.getProductById(doc.productId);
             itemDetails = { ...res, type: 'medicine' };
          }

          if (itemDetails) {
            items.push({
              id: doc.$id, // Local ID is the Appwrite Document ID
              name: itemDetails.name || itemDetails.title,
              price: itemDetails.price,
              quantity: doc.quantity,
              manufacturer: itemDetails.manufacturer || 'Verified Store',
              type: itemDetails.type
            });
          }
        } catch (e) {
          console.error("Cart hydration error", e);
        }
      }
      setCartItems(items);
    } catch (e) {
      console.error("Cart load failed", e);
    }
  };

  const addToCart = async (medicineName: string, silent: boolean = false) => {
    try {
      const resp = await fetch(`${API_URL}/medicines/search?q=${encodeURIComponent(medicineName)}`);
      if (!resp.ok) throw new Error("Medicine not found in market");
      const medDetails = await resp.json();

      let appwriteDocId = 'med_' + Date.now();

      // Sync with Cloud
      if (user) {
        const syncRes = await dbService.addToCart({
          userId: user.$id,
          productId: `csv_${medDetails.name}`, // Identifier for CSV items
          quantity: 1
        });
        appwriteDocId = syncRes.$id;
      }
      
      setCartItems(prev => {
        const existing = prev.find(item => item.name === medDetails.name && item.type === 'medicine');
        if (existing) {
          return prev.map(item => item.name === medDetails.name ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { 
          id: appwriteDocId, 
          name: medDetails.name, 
          price: medDetails.price, 
          quantity: 1, 
          manufacturer: medDetails.manufacturer, 
          type: 'medicine' 
        }];
      });

      if (!silent) alert(`Added ${medDetails.name} to cart.`);
    } catch (e) {
      console.error(e)
    }
  };

  const addLabToCart = async (labName: string, price: number) => {
    let appwriteDocId = 'lab_' + Date.now();
    
    if (user) {
       const syncRes = await dbService.addToCart({
          userId: user.$id,
          productId: `lab_${labName}`,
          quantity: 1
       });
       appwriteDocId = syncRes.$id;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.name === labName && item.type === 'lab');
      if (existing) {
        return prev.map(item => item.name === labName ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: appwriteDocId, name: labName, price, quantity: 1, manufacturer: 'Clinical Lab', type: 'lab' }];
    });
    alert(`Booked ${labName} for Rs. ${price}`);
  };

  const removeFromCart = async (id: string) => {
    if (user && !id.startsWith('med_') && !id.startsWith('lab_')) {
      // It's likely a real Appwrite Document ID
      try {
        await dbService.removeFromCart(id);
      } catch (e) {
        console.error("Failed to remove from cloud", e);
      }
    }
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const checkoutCart = async (patient: PatientDetails) => {
    if (cartItems.length === 0) return;
    
    try {
      const totalCost = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemsPayload = cartItems.map(i => ({ name: i.name, type: i.type, qty: i.quantity, price: i.price }));
      
      const payload: any = {
        userId: String(patient.userId || 'guest'),
        items: JSON.stringify(itemsPayload),
        total: Number(totalCost),
        name: String(patient.name),
        phone: String(patient.phone),
        address: String(patient.address),
        city: String(patient.city),
        postalCode: String(patient.postalCode),
        notes: "",
        paymentMethod: "COD",
        status: 'pending'
      };

      await dbService.createOrder(payload);

      // CLEAR APPWRITE CART
      if (user) {
         await dbService.clearCart(user.$id);
      }

      alert("Order successful! Your request has been dispatched to MediStore clinical matrix.");
      setCartItems([]);
      setIsCartOpen(false);
    } catch (e: any) {
      console.error(e);
      alert("Checkout failed: " + e.message);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      addLabToCart, 
      removeFromCart, 
      checkoutCart, 
      isCartOpen, 
      setIsCartOpen,
      showCheckoutForm,
      setShowCheckoutForm
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
