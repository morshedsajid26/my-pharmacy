"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  User,
  ShoppingBag,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function StorefrontHeader({
  customer: propCustomer,
  staffUser: propStaffUser,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
}) {
  const router = useRouter();
  const { customer: authCustomer, user: authUser } = useAuth();
  const { cart, setIsCartOpen } = useCart();

  const customer = propCustomer !== undefined ? propCustomer : authCustomer;
  const staffUser = propStaffUser !== undefined ? propStaffUser : authUser;

  const [localSearch, setLocalSearch] = useState("");
  const currentSearch =
    propSearchQuery !== undefined ? propSearchQuery : localSearch;

  const handleSearchChange = (val) => {
    if (propSetSearchQuery) {
      propSetSearchQuery(val);
    } else {
      setLocalSearch(val);
      if (val.trim()) {
        router.push(`/shop?search=${encodeURIComponent(val.trim())}`);
      } else {
        router.push(`/shop`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-medical-blue-600 flex items-center justify-center text-white group-hover:bg-medical-blue-700 transition-colors">
            <Plus className="w-5 h-5 stroke-[2.75]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
              S&amp;S <span className="text-medical-blue-600">Pharmacy</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 hidden sm:block mt-0.5">
              Online Pharmacy &amp; Healthcare
            </span>
          </div>
        </Link>

        {/* Search Input */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <div className="relative group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-medical-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search medicines by brand, generic name, or category..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 sm:h-10.5 pl-10 pr-9 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 font-normal text-xs sm:text-sm border border-slate-200 focus:border-medical-blue-600 focus:bg-white focus:ring-2 focus:ring-medical-blue-600/15 transition-all outline-none"
            />
            {currentSearch && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <ShoppingBag size={16} className="text-medical-blue-600" />
            <span>All Medicines</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-800 border border-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag size={15} className="text-medical-blue-600" />
            <span className="font-mono font-bold">{cart.length}</span>
          </button>

          {staffUser ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Go to Admin Dashboard"
            >
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold text-xs overflow-hidden">
                {staffUser.profilePicture ? (
                  <img
                    src={staffUser.profilePicture}
                    alt={staffUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : staffUser.name ? (
                  staffUser.name[0].toUpperCase()
                ) : (
                  "A"
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold text-slate-900 max-w-[110px] truncate">
                  {staffUser.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 capitalize mt-0.5">
                  {staffUser.role || "Dashboard"}
                </span>
              </div>
            </Link>
          ) : customer ? (
            <Link
              href="/overview"
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Customer Portal"
            >
              <div className="w-7 h-7 rounded-md bg-medical-blue-600 text-white flex items-center justify-center font-semibold text-xs overflow-hidden">
                {customer.profilePicture ? (
                  <img
                    src={customer.profilePicture}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : customer.name ? (
                  customer.name[0].toUpperCase()
                ) : (
                  "C"
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold text-slate-900 max-w-[110px] truncate">
                  {customer.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                  My Account
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <User size={15} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
