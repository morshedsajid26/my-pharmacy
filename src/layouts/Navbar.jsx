import { Bell, Search, Settings, Menu, X } from "lucide-react";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/cn";

export function Navbar() {
  const { toggleSidebar, isSidebarOpen } = useUI();

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

      {/* Search Bar - Desktop */}
      <div className="relative w-96 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search for medicines, sales, reports..."
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-medical-blue-500/20 transition-all font-medium"
        />
      </div>

      {/* Notifications and Settings */}
      <div className="flex items-center gap-1 md:gap-2">
        <button className="hidden sm:flex p-2 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-all">
          <Settings size={20} />
        </button>
        
        <div className="flex items-center gap-3 ml-2 pl-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">John Doe</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs ring-2 ring-transparent hover:ring-medical-blue-100 transition-all cursor-pointer">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
