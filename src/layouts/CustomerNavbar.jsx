"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, Menu, X, LogOut, ArrowLeft, ShoppingBag } from "lucide-react";
import { useUI } from "../context/UIContext";
import { logoutCustomerAction } from "@/lib/actions/online-customer.actions";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export function CustomerNavbar({ customer }) {
  const { toggleSidebar, isSidebarOpen } = useUI();
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cart, setIsCartOpen } = useCart();
  const cartCount = cart.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await logoutCustomerAction();
      router.push("/");
      toast.success("Signed out successfully");
    } catch (e) {
      toast.error("Sign out failed");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Brand Logo for Mobile */}
      <div className="lg:hidden flex items-center gap-2 ml-2">
         <div className="w-8 h-8 rounded-lg bg-medical-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
         </div>
         <span className="font-black text-lg text-slate-900 tracking-tight">PHARMA</span>
      </div>

      {/* spacer */}
      <div className="flex-1 hidden lg:flex items-center gap-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Right Controls Container */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        
        {/* Cart Link */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-slate-600 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-xl transition-all cursor-pointer"
        >
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute 2 top-1 right-1 transform translate-x-1/4 -translate-y-1/4 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm">
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-end gap-3 ml-2 pl-2 group focus:outline-none select-none cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-medical-blue-600 transition-colors">
              {customer?.name || "Customer"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
              My Profile
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-medical-blue-50 border border-medical-blue-200 flex items-center justify-center text-medical-blue-600 font-bold text-xs ring-2 ring-transparent group-hover:ring-medical-blue-100 overflow-hidden transition-all cursor-pointer">
             {customer?.name?.charAt(0).toUpperCase() || "C"}
          </div>
        </button>

        {/* Dropdown Menu Popup */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 border-b border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Account Menu
              </p>
            </div>
            
            <Link 
              href="/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-medical-blue-600 font-semibold transition-colors"
            >
              <Settings size={15} className="text-slate-400 group-hover:text-medical-blue-600" />
              <span>Personal Details</span>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors border-t border-slate-50"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
