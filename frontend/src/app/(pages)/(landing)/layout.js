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
      {/* FLOATING CART WIDGET */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border-y border-l border-slate-200 group active:scale-95 cursor-pointer"
        aria-label="Open Cart"
      >
        <div className="bg-medical-blue-600 group-hover:bg-medical-blue-700 text-white px-3.5 py-2.5 flex flex-col items-center justify-center gap-1 min-w-[76px] border-b border-white/10 transition-colors">
          <ShoppingCart size={16} className="text-white" />
          <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">
            {totalItems} {totalItems === 1 ? "Item" : "Items"}
          </span>
        </div>
        <div className="bg-slate-900 text-white w-full px-2 py-1.5 flex items-center justify-center transition-colors">
          <span className="text-xs font-mono font-bold tracking-wide whitespace-nowrap">
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
