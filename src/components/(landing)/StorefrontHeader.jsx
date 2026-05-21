'use client';

import Link from "next/link";
import { PlusCircle, Clock, User, LogOut, ShoppingBag } from "lucide-react";

export default function StorefrontHeader({ 
  customer, 
  cartCount, 
  onOrdersClick, 
  onLogout, 
  onAuthClick, 
  onCartClick 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-100/80 shadow-sm transition-all duration-300">
      <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-medical-blue-600 to-medical-blue-500 flex items-center justify-center shadow-lg shadow-medical-blue-500/25">
            <PlusCircle className="text-white w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                S&S<span className="text-medical-blue-600">Pharmacy</span>
              </h1>
              <span className="flex h-2 w-2 relative" title="Pharmacy Active Online">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mt-1 block">
              DGDA Approved Model Store
            </span>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {customer ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={onOrdersClick}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Clock size={16} />
                <span>My Orders</span>
              </button>
              <Link 
                href="/profile"
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 py-1.5 px-3 rounded-2xl border border-slate-200/50 transition-all cursor-pointer group"
                title="Edit Profile Settings"
              >
                <div className="w-8 h-8 rounded-full bg-medical-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {customer.name[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-slate-700 max-w-[120px] truncate group-hover:text-medical-blue-600 transition-colors">
                  {customer.name}
                </span>
              </Link>
              <button 
                onClick={onLogout}
                title="Logout"
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 transition-all border border-red-100/40 flex items-center gap-1.5 font-bold text-sm cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-extrabold text-sm transition-all shadow-md shadow-medical-blue-600/10 cursor-pointer"
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}


        </div>
      </div>
    </header>
  );
}
