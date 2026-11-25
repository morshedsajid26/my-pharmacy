"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { parseLocationFromAddress, calculateDistanceKm } from "@/lib/locationUtils";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState({
    minOrderForFreeDelivery: 500,
    deliveryCharge: 20,
    deliveryChargePerKm: 5,
    storeAddress: null,
    storeLat: null,
    storeLng: null,
    discountTiers: [],
  });

  // Load cart from localStorage and settings upon mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("pharmacy_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            // Filter out any corrupted/invalid items from previous runs
            const validItems = parsed.filter(
              (item) => item && item.id && Number(item.quantity) > 0 && typeof item.sellingPrice === "number"
            );
            setCart(validItems);
            if (validItems.length !== parsed.length) {
              localStorage.setItem("pharmacy_cart", JSON.stringify(validItems));
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        try {
          localStorage.removeItem("pharmacy_cart");
        } catch (_) {}
      }
    }

    async function loadSettings() {
      try {
        const res = await api.get("/owner/settings/storefront");
        const fresh = res?.data || res;
        if (fresh && !fresh.error) setSettings(fresh);
      } catch (e) {
        console.error("Failed to load storefront settings:", e);
      }
    }
    loadSettings();
  }, []);

  // Sync cart to localStorage whenever it changes
  const saveCart = (newCart) => {
    const sanitizedCart = Array.isArray(newCart)
      ? newCart.filter((item) => item && item.id && Number(item.quantity) > 0)
      : [];
    setCart(sanitizedCart);

    if (typeof window !== "undefined") {
      try {
        if (sanitizedCart.length === 0) {
          localStorage.removeItem("pharmacy_cart");
        } else {
          localStorage.setItem("pharmacy_cart", JSON.stringify(sanitizedCart));
        }
      } catch (err) {
        console.error("Failed to save cart to localStorage:", err);
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("pharmacy_cart");
      } catch (_) {}
    }
  };

  const addToCart = (med, qty = 1) => {
    if (!med || typeof med !== "object" || !med.id) {
      console.error("Invalid medicine object provided to addToCart:", med);
      return toast.error("Could not add item to cart. Invalid product.");
    }

    const availableStock = Number(med.stock) || 0;
    const addQuantity = Number(qty) > 0 ? Number(qty) : 1;

    if (availableStock <= 0) {
      return toast.error(`${med.name || "Medicine"} is currently out of stock!`);
    }

    const discountPercent = Number(med.onlineDiscountPercent) || 0;
    const baseSellingPrice = Number(med.sellingPrice) || 0;
    const effectivePrice =
      discountPercent > 0
        ? Number((baseSellingPrice * (1 - discountPercent / 100)).toFixed(2))
        : baseSellingPrice;

    // Sanitize medicine item so only serializable plain data fields are stored
    const sanitizedItem = {
      id: String(med.id),
      name: String(med.name || "Medicine"),
      company: String(med.company || ""),
      category: String(med.category || ""),
      sellingPrice: effectivePrice, // Discounted effective price charged online
      originalPrice: baseSellingPrice, // Original MRP
      onlineDiscountPercent: discountPercent,
      purchasePrice: Number(med.purchasePrice) || 0,
      stock: availableStock,
      image: typeof med.image === "string" ? med.image : null,
    };

    const existingIndex = cart.findIndex((item) => item.id === sanitizedItem.id);
    if (existingIndex > -1) {
      const currentQty = Number(cart[existingIndex].quantity) || 0;
      const targetQty = currentQty + addQuantity;
      if (targetQty > availableStock) {
        return toast.error(
          `Cannot add ${addQuantity} more. Only ${availableStock - currentQty} more unit(s) available in stock.`,
        );
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        ...sanitizedItem,
        quantity: targetQty,
      };
      saveCart(updatedCart);
    } else {
      if (addQuantity > availableStock) {
        return toast.error(
          `Cannot add ${addQuantity} unit(s). Only ${availableStock} unit(s) available in stock.`,
        );
      }
      saveCart([...cart, { ...sanitizedItem, quantity: addQuantity }]);
    }
    toast.success(`Added ${addQuantity} unit(s) of ${sanitizedItem.name} to cart!`);
  };

  const updateCartQty = (id, change, maxStock) => {
    const updatedCart = cart
      .map((item) => {
        if (item && item.id === id) {
          const newQty = (Number(item.quantity) || 0) + change;
          const stockLimit = Number(maxStock) || Number(item.stock) || 999;
          if (newQty > stockLimit) {
            toast.error(`Only ${stockLimit} units available in stock.`);
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
    saveCart(cart.filter((item) => item && item.id !== id));
    toast.success("Item removed from cart");
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + (Number(item?.sellingPrice) || 0) * (Number(item?.quantity) || 0),
      0,
    );
  };

  const getCartOriginalTotal = () => {
    return cart.reduce((total, item) => {
      const original = Number(item?.originalPrice) || Number(item?.sellingPrice) || 0;
      return total + original * (Number(item?.quantity) || 0);
    }, 0);
  };

  const getProductSavings = () => {
    return Math.max(0, getCartOriginalTotal() - getCartTotal());
  };

  const getDeliveryDetails = (selectedAddress = null) => {
    const subtotal = getCartTotal();
    const minOrder = Number(settings?.minOrderForFreeDelivery) || 500;
    const flatCharge = Number(settings?.deliveryCharge ?? 20);
    const ratePerKm = Number(settings?.deliveryChargePerKm ?? 5);

    if (subtotal === 0) {
      return { charge: 0, distanceKm: null, isDistanceBased: false, isFree: false, ratePerKm };
    }

    let distanceKm = null;
    if (selectedAddress && settings?.storeLat != null && settings?.storeLng != null) {
      const parsed = parseLocationFromAddress(selectedAddress);
      if (parsed.hasCoordinates) {
        distanceKm = calculateDistanceKm(
          settings.storeLat,
          settings.storeLng,
          parsed.latitude,
          parsed.longitude
        );
      }
    }

    if (subtotal >= minOrder) {
      return { charge: 0, distanceKm, isDistanceBased: false, isFree: true, ratePerKm };
    }

    if (distanceKm !== null && ratePerKm > 0) {
      const computedCharge = Math.max(ratePerKm, Math.round(distanceKm * ratePerKm));
      return {
        charge: computedCharge,
        distanceKm,
        isDistanceBased: true,
        isFree: false,
        ratePerKm,
      };
    }

    return {
      charge: flatCharge,
      distanceKm: null,
      isDistanceBased: false,
      isFree: false,
      ratePerKm,
    };
  };

  const getCartDeliveryCharge = (selectedAddress = null) => {
    return getDeliveryDetails(selectedAddress).charge;
  };

  // Storefront tier discount disabled in favor of per-product online discounts
  const getCartDiscount = () => {
    return 0;
  };

  const getCartGrandTotal = (selectedAddress = null) => {
    const subtotal = getCartTotal();
    if (subtotal === 0) return 0;
    const total = subtotal + getCartDeliveryCharge(selectedAddress) - getCartDiscount();
    return Math.max(0, total);
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
        clearCart,
        getCartTotal,
        getCartOriginalTotal,
        getProductSavings,
        getDeliveryDetails,
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
