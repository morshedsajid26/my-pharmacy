import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <UIContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      isSidebarCollapsed,
      toggleSidebar,
      toggleCollapse
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
