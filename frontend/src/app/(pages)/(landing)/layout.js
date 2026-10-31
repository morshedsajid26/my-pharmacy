"use client";

import StorefrontHeader from "./StorefrontHeader";
import StorefrontFooter from "./StorefrontFooter";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function LandingLayout({ children }) {
  const { cart, setIsCartOpen, getCartTotal } = useCart();
  const totalItems = cart.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* FLOATING CART TRIGGER */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center rounded-l-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-y border-l border-medical-blue-600/20 group active:scale-95 cursor-pointer"
        aria-label="Open Cart"
      >
        <div className="bg-medical-blue-600 group-hover:bg-medical-blue-700 text-white px-3.5 py-3 flex flex-col items-center justify-center gap-1 min-w-[80px] border-b border-white/15 transition-colors">
          <ShoppingCart size={18} className="text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black tracking-wide whitespace-nowrap">
            {totalItems} {totalItems === 1 ? "Item" : "Items"}
          </span>
        </div>
        <div className="bg-emerald-500 group-hover:bg-emerald-600 text-white w-full px-2 py-2 flex items-center justify-center transition-colors">
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            ৳{getCartTotal()}
          </span>
        </div>
      </button>

      {/* HEADER */}
      <StorefrontHeader />

      {/* PAGE CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <StorefrontFooter />
    </div>
  );
}

