"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getStorefrontSettingsAction } from "@/lib/actions/online-admin.actions";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState({
    minOrderForFreeDelivery: 500,
    deliveryCharge: 20,
    discountTiers: [],
  });

  // Load cart from localStorage and settings upon mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pharmacy_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    
    async function loadSettings() {
      try {
        const fresh = await getStorefrontSettingsAction();
        if (fresh) setSettings(fresh);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
    loadSettings();
  }, []);

  // Sync cart to localStorage whenever it changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("pharmacy_cart", JSON.stringify(newCart));
  };

  const addToCart = (med, qty = 1) => {
    if (med.stock < 2) {
      return toast.error(`${med.name} is currently out of stock!`);
    }

    const existingIndex = cart.findIndex((item) => item.id === med.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const targetQty = currentQty + qty;
      if (targetQty > med.stock) {
        return toast.error(
          `Cannot add ${qty} more. Only ${med.stock - currentQty} more units available in stock.`,
        );
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = targetQty;
      saveCart(updatedCart);
    } else {
      if (qty > med.stock) {
        return toast.error(
          `Cannot add ${qty} units. Only ${med.stock} units available in stock.`,
        );
      }
      saveCart([...cart, { ...med, quantity: qty }]);
    }
    toast.success(`Added ${qty} unit(s) of ${med.name} to cart!`);
  };

  const updateCartQty = (id, change, maxStock) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + change;
          if (newQty > maxStock) {
            toast.error(`Only ${maxStock} units available in stock.`);
            return item;
          }
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(Boolean);
    saveCart(updatedCart);
  };

  const removeFromCart = (id) => {
    saveCart(cart.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.sellingPrice * item.quantity,
      0,
    );
  };

  const getCartDeliveryCharge = () => {
    const subtotal = getCartTotal();
    if (subtotal === 0) return 0;
    return subtotal >= settings.minOrderForFreeDelivery
      ? 0
      : settings.deliveryCharge;
  };

  const getCartDiscount = () => {
    const subtotal = getCartTotal();
    if (!settings.discountTiers || settings.discountTiers.length === 0)
      return 0;
    const applicableTiers = settings.discountTiers.filter(
      (t) => subtotal >= t.threshold,
    );
    if (applicableTiers.length === 0) return 0;
    const bestTier = applicableTiers.reduce((prev, curr) =>
      curr.percent > prev.percent ? curr : prev,
    );
    return (subtotal * bestTier.percent) / 100;
  };

  const getCartGrandTotal = () => {
    const subtotal = getCartTotal();
    if (subtotal === 0) return 0;
    return subtotal + getCartDeliveryCharge() - getCartDiscount();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        saveCart,
        isCartOpen,
        setIsCartOpen,
        settings,
        addToCart,
        updateCartQty,
        removeFromCart,
        getCartTotal,
        getCartDeliveryCharge,
        getCartDiscount,
        getCartGrandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
