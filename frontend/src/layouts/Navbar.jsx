"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Settings,
  Menu,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
} from "lucide-react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { toggleSidebar, isSidebarOpen, isSidebarCollapsed, toggleCollapse } =
    useUI();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          onClick={toggleCollapse}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>

        {/* Brand Logo for Mobile */}
        <div className="lg:hidden flex items-center gap-2 ml-1">
          <div className="w-7 h-7 rounded-lg bg-medical-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight">
            S&amp;S Pharmacy
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-end gap-2.5 pl-2 group focus:outline-none select-none cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-medical-blue-600 transition-colors">
                {user?.name || "Admin User"}
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 capitalize">
                {user?.role || "Operator"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-medical-blue-50 border border-medical-blue-200/80 flex items-center justify-center text-medical-blue-700 font-bold text-xs overflow-hidden transition-colors cursor-pointer">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : user?.name ? (
                user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              ) : (
                "U"
              )}
            </div>
          </button>

          {/* Dropdown Menu Popup */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-11 mt-1 w-48 bg-white border border-slate-200/90 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Operator Account
                </p>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-medical-blue-600 font-medium transition-colors"
              >
                <Settings size={14} className="text-slate-400" />
                <span>System Settings</span>
              </Link>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors border-t border-slate-100"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
