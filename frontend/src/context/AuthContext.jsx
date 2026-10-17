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
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("customer");
    }
    Cookies.remove("token", { path: "/" });
    Cookies.remove("session", { path: "/" });
    Cookies.remove("customer_token", { path: "/" });
    Cookies.remove("customer_session", { path: "/" });
    Cookies.remove("role", { path: "/" });
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const storedRole =
          (typeof window !== "undefined" && localStorage.getItem("role")) ||
          Cookies.get("role");

        // Hydrate from cached localStorage if available to prevent flashing
        if (typeof window !== "undefined") {
          try {
            if (storedRole === "customer") {
              const cachedCustomer = localStorage.getItem("customer");
              if (cachedCustomer) setCustomer(JSON.parse(cachedCustomer));
              setUser(null);
            } else if (storedRole) {
              const cachedUser = localStorage.getItem("user");
              if (cachedUser) setUser(JSON.parse(cachedUser));
              setCustomer(null);
            }
          } catch (e) {}
        }

        let token;
        if (storedRole === "customer") {
          token =
            (typeof window !== "undefined" && localStorage.getItem("customer_token")) ||
            Cookies.get("customer_token") ||
            Cookies.get("customer_session");
        } else {
          token =
            (typeof window !== "undefined" && localStorage.getItem("token")) ||
            Cookies.get("token") ||
            Cookies.get("session") ||
            (typeof window !== "undefined" && localStorage.getItem("customer_token")) ||
            Cookies.get("customer_token");
        }

        if (token) {
          try {
            let profileRes;
            try {
              profileRes = await api.get("/auth/profile");
            } catch (profileErr) {
              profileRes = await api.get("/auth/me");
            }

            const userData =
              profileRes?.user ||
              profileRes?.customer ||
              profileRes?.data?.user ||
              profileRes?.data ||
              profileRes;

            if (userData && (userData.id || userData.email || userData.phone)) {
              const role =
                userData.role ||
                (userData.type === "customer" ? "customer" : "staff");
              Cookies.set("role", role, { expires: 7, path: "/" });
              if (typeof window !== "undefined") {
                localStorage.setItem("role", role);
              }

              if (userData.type === "customer" || userData.role === "customer") {
                setCustomer(userData);
                setUser(null);
                if (typeof window !== "undefined") {
                  localStorage.setItem("customer", JSON.stringify(userData));
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                }
              } else {
                setUser(userData);
                setCustomer(null);
                if (typeof window !== "undefined") {
                  localStorage.setItem("user", JSON.stringify(userData));
                  localStorage.removeItem("customer");
                  localStorage.removeItem("customer_token");
                }
              }
            }
          } catch (profileErr) {
            // ONLY clear tokens if the server explicitly returned 401 (Not Authorized)
            const isUnauthorized =
              profileErr?.status === 401 ||
              profileErr?.response?.status === 401 ||
              profileErr?.message?.toLowerCase().includes("not authorized") ||
              profileErr?.message?.toLowerCase().includes("invalid token") ||
              profileErr?.message?.toLowerCase().includes("token expired");

            if (isUnauthorized) {
              clearAuthTokens();
              setUser(null);
              setCustomer(null);
            }
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
  // Unified Login (handles both Staff/Owner and Customer via single /auth/login route)
  const login = async (identifier, password) => {
    try {
      // Clear previous tokens to prevent cross-account contamination
      clearAuthTokens();
      setUser(null);
      setCustomer(null);

      const res = await api.post("/auth/login", {
        email: identifier,
        emailOrPhone: identifier,
        identifier,
        phone: identifier,
        password,
      });

      const token = res.token || res.data?.token;
      const returnedRole = String(
        res.role ||
        res.user?.role ||
        res.customer?.role ||
        (res.customer || res.user?.type === "customer" ? "customer" : "staff")
      ).toLowerCase();

      if (token) {
        if (returnedRole === "customer") {
          const cust = res.customer || res.user || res.data?.customer;
          localStorage.setItem("customer_token", token);
          localStorage.setItem("role", "customer");
          if (cust) localStorage.setItem("customer", JSON.stringify(cust));

          Cookies.set("customer_token", token, { expires: 7, path: "/" });
          Cookies.set("customer_session", token, { expires: 7, path: "/" });
          Cookies.set("role", "customer", { expires: 7, path: "/" });

          setCustomer(cust);
          setUser(null);
        } else {
          const staffUser = res.user || res.data?.user;
          localStorage.setItem("token", token);
          localStorage.setItem("role", returnedRole);
          if (staffUser) localStorage.setItem("user", JSON.stringify(staffUser));

          Cookies.set("token", token, { expires: 7, path: "/" });
          Cookies.set("session", token, { expires: 7, path: "/" });
          Cookies.set("role", returnedRole, { expires: 7, path: "/" });

          setUser(staffUser);
          setCustomer(null);
        }
      }

      toast.success("Login successful!");
      queryClient.invalidateQueries();
      return {
        success: true,
        role: returnedRole,
        user: res.user,
        customer: res.customer || res.user,
      };
    } catch (error) {
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  // Staff / Owner Signup
  const signup = async (name, email, password, role = "PHARMACIST") => {
    try {
      // Clear any prior customer token/session
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer");
      Cookies.remove("customer_token", { path: "/" });
      Cookies.remove("customer_session", { path: "/" });
      setCustomer(null);

      const res = await api.post("/auth/register", { name, email, password, role });
      const token = res.token || res.data?.token;
      const staffUser = res.user || res.data?.user;

      if (token) {
        const userRole = staffUser?.role || role || "staff";
        localStorage.setItem("token", token);
        localStorage.setItem("role", userRole);
        if (staffUser) localStorage.setItem("user", JSON.stringify(staffUser));

        Cookies.set("token", token, { expires: 7, path: "/" });
        Cookies.set("session", token, { expires: 7, path: "/" });
        Cookies.set("role", userRole, { expires: 7, path: "/" });
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

  // Customer Login (delegates to unified /auth/login route)
  const loginCustomer = async (emailOrPhone, password) => {
    const res = await login(emailOrPhone, password);
    if (!res.success) {
      throw new Error(res.error || "Login failed");
    }
    return res;
  };

  // Customer Register
  const registerCustomer = async (customerData) => {
    try {
      // Clear any prior staff token/session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token", { path: "/" });
      Cookies.remove("session", { path: "/" });
      setUser(null);

      const res = await api.post("/auth/customer/register", customerData);
      const token = res.token || res.data?.token;
      const cust = res.customer || res.data?.customer || res.user;

      if (token) {
        const role = "customer";
        localStorage.setItem("customer_token", token);
        localStorage.setItem("role", role);
        if (cust) localStorage.setItem("customer", JSON.stringify(cust));

        Cookies.set("customer_token", token, { expires: 7, path: "/" });
        Cookies.set("customer_session", token, { expires: 7, path: "/" });
        Cookies.set("role", role, { expires: 7, path: "/" });
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
