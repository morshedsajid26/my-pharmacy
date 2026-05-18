"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Settings, Menu, X, LogOut } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { toggleSidebar, isSidebarOpen } = useUI();
  const { user, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside handler to dismiss dropdown automatically
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
            <span className="text-white font-black text-xs">P</span>
         </div>
         <span className="font-black text-lg text-slate-900 tracking-tight">PHARMA</span>
      </div>

      {/* spacer to push profile details to the far right */}
      <div className="flex-1"></div>

      {/* Profile Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-end gap-3 ml-2 pl-2 group focus:outline-none select-none cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-medical-blue-600 transition-colors">
              {user?.name || "Admin User"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
              {user?.role || "Staff"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs ring-2 ring-transparent group-hover:ring-medical-blue-100 overflow-hidden transition-all cursor-pointer">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"
            )}
          </div>
        </button>

        {/* Dropdown Menu Popup */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 border-b border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Operator Menu
              </p>
            </div>
            
            <Link 
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-medical-blue-600 font-semibold transition-colors"
            >
              <Settings size={15} className="text-slate-400 group-hover:text-medical-blue-600" />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-colors border-t border-slate-50"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
