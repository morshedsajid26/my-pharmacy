import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useUI } from "../context/UIContext";
import { cn } from "../utils/cn";

export function MainLayout() {
  const { isSidebarCollapsed } = useUI();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Navbar />
        <main className="p-4 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
