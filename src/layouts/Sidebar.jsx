import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  X,
  LogOut
} from "lucide-react";
import { cn } from "../utils/cn";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Pill, label: "Medicines", path: "/medicines" },
  { icon: ShoppingCart, label: "Sales (POS)", path: "/sales" },
  { icon: Truck, label: "Purchases", path: "/purchases" },
  { icon: AlertTriangle, label: "Low Stock", path: "/low-stock" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, toggleCollapse } = useUI();
  const { user, logout } = useAuth();

  return (
    <>
      {/* ... (Mobile Overlay) */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 transition-all duration-300 z-50 flex flex-col pt-4 shadow-xl lg:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-6 flex items-center justify-between mb-8 overflow-hidden">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-medical-blue-500 flex items-center justify-center shrink-0">
               <PlusCircle className="text-white w-5 h-5" />
             </div>
             {!isSidebarCollapsed && (
               <span className="font-black text-xl text-white tracking-tight whitespace-nowrap">PHARMA<span className="text-medical-blue-400">PRO</span></span>
             )}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-medical-blue-600 text-white shadow-lg shadow-medical-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110")} />
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-medical-blue-600 text-white rounded-full items-center justify-center shadow-lg hover:bg-medical-blue-700 transition-colors z-[60]"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Footer / User Status */}
        <div className="p-4 mt-auto border-t border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 min-w-0">
               <div className="w-8 h-8 rounded-full bg-medical-blue-600 flex-shrink-0 border border-slate-700 flex items-center justify-center text-white text-[10px] font-bold">
                 {user?.name?.charAt(0) || "U"}
               </div>
               {!isSidebarCollapsed && (
                 <div className="min-w-0">
                   <p className="text-sm font-semibold text-white truncate">{user?.name || "Admin User"}</p>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Online</span>
                   </div>
                 </div>
               )}
             </div>
             
             {!isSidebarCollapsed && (
               <button 
                 onClick={logout}
                 className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50/10 rounded-lg transition-colors shrink-0"
                 title="Logout"
               >
                 <LogOut size={18} />
               </button>
             )}
          </div>
          
          {isSidebarCollapsed && (
             <button 
               onClick={logout}
               className="mt-4 w-full flex justify-center p-2 text-slate-500 hover:text-red-500 hover:bg-red-50/10 rounded-lg transition-colors"
               title="Logout"
             >
               <LogOut size={18} />
             </button>
          )}
        </div>
      </aside>
    </>
  );
}
