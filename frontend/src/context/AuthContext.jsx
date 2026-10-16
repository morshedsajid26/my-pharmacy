"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  const clearAuthTokens = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("customer_token");
    }
    Cookies.remove("token");
    Cookies.remove("session");
    Cookies.remove("customer_session");
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const token =
          (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("customer_token"))) ||
          Cookies.get("token") ||
          Cookies.get("customer_token") ||
          Cookies.get("session") ||
          Cookies.get("customer_session");

        if (token) {
          try {
            const profileRes = await api.get("/auth/me");
            const userData = profileRes?.user || profileRes?.data || profileRes;
            if (userData) {
              if (userData.type === "customer" || userData.role === "customer") {
                setCustomer(userData);
              } else {
                setUser(userData);
              }
            }
          } catch (profileErr) {
            clearAuthTokens();
            setUser(null);
            setCustomer(null);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Staff / Owner Login
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.token || res.data?.token;
      const staffUser = res.user || res.data?.user;

      if (token) {
        localStorage.setItem("token", token);
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("session", token, { expires: 7 });
      }

      setUser(staffUser);
      toast.success("Login successful!");
      queryClient.invalidateQueries();
      return true;
    } catch (error) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  // Staff / Owner Signup
  const signup = async (name, email, password, role = "PHARMACIST") => {
    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      const token = res.token || res.data?.token;
      const staffUser = res.user || res.data?.user;

      if (token) {
        localStorage.setItem("token", token);
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("session", token, { expires: 7 });
        setUser(staffUser);
      }
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error(error.message || "Signup failed");
      return false;
    }
  };

  // Staff Logout
  const logout = async () => {
    try {
      clearAuthTokens();
      setUser(null);
      setCustomer(null);
      queryClient.clear();
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Customer Login
  const loginCustomer = async (emailOrPhone, password) => {
    try {
      const res = await api.post("/auth/customer/login", { emailOrPhone, password });
      const token = res.token || res.data?.token;
      const cust = res.customer || res.data?.customer || res.user;

      if (token) {
        localStorage.setItem("customer_token", token);
        Cookies.set("customer_token", token, { expires: 7 });
        Cookies.set("customer_session", token, { expires: 7 });
      }

      setCustomer(cust);
      toast.success("Welcome back!");
      queryClient.invalidateQueries();
      return { success: true, customer: cust };
    } catch (error) {
      throw error;
    }
  };

  // Customer Register
  const registerCustomer = async (customerData) => {
    try {
      const res = await api.post("/auth/customer/register", customerData);
      const token = res.token || res.data?.token;
      const cust = res.customer || res.data?.customer || res.user;

      if (token) {
        localStorage.setItem("customer_token", token);
        Cookies.set("customer_token", token, { expires: 7 });
        Cookies.set("customer_session", token, { expires: 7 });
      }

      setCustomer(cust);
      toast.success("Registration successful!");
      queryClient.invalidateQueries();
      return { success: true, customer: cust };
    } catch (error) {
      throw error;
    }
  };

  // Customer Logout
  const logoutCustomer = async () => {
    try {
      clearAuthTokens();
      setCustomer(null);
      queryClient.clear();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Customer logout error:", error);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/auth/profile", profileData);
      const updatedUser = res.user || res.data?.user || res.customer || res.data?.customer;
      if (updatedUser) {
        if (customer) setCustomer(updatedUser);
        else setUser(updatedUser);
      }
      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        customer,
        setCustomer,
        login,
        signup,
        logout,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateProfile,
        loading,
        isLoggingIn: false,
        isSigningUp: false,
      }}
    >
      {!loading && children}
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
