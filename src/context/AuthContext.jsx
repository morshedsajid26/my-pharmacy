import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("pharma_user");
    const token = Cookies.get("pharma_token");
    return (savedUser && token) ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial loading state check
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const mockUser = { id: '1', name: 'Admin', email: email, role: 'admin' };
    setUser(mockUser);
    localStorage.setItem("pharma_user", JSON.stringify(mockUser));
    Cookies.set("pharma_token", "mock_token", { expires: 7, secure: true, sameSite: 'strict' });
    toast.success("Mock Login successful!");
    return true; // the component expects truthy for success
  };

  const signup = async (name, email, password) => {
    const mockUser = { id: '1', name: name, email: email, role: 'user' };
    setUser(mockUser);
    localStorage.setItem("pharma_user", JSON.stringify(mockUser));
    Cookies.set("pharma_token", "mock_token", { expires: 7, secure: true, sameSite: 'strict' });
    toast.success("Mock Account created successfully!");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pharma_user");
    Cookies.remove("pharma_token");
    queryClient.clear();
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      isLoggingIn: false,
      isSigningUp: false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
