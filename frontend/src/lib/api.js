import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function getAuthToken(configUrl = "") {
  if (typeof window === "undefined") return null;

  // Context-specific token routing
  if (configUrl) {
    if (configUrl.startsWith("/user/") || configUrl.startsWith("/customer/")) {
      return (
        Cookies.get("customer_token") ||
        localStorage.getItem("customer_token") ||
        Cookies.get("customer_session") ||
        null
      );
    }
    if (
      configUrl.startsWith("/owner/") ||
      configUrl.startsWith("/admin/") ||
      configUrl.startsWith("/medicines") ||
      configUrl.startsWith("/sales") ||
      configUrl.startsWith("/purchases") ||
      configUrl.startsWith("/dues")
    ) {
      return (
        Cookies.get("token") ||
        localStorage.getItem("token") ||
        Cookies.get("session") ||
        null
      );
    }
  }

  // Active role-based resolution
  const activeRole = String(
    Cookies.get("role") || localStorage.getItem("role") || ""
  ).toLowerCase();

  if (activeRole === "customer") {
    return (
      Cookies.get("customer_token") ||
      localStorage.getItem("customer_token") ||
      Cookies.get("customer_session") ||
      null
    );
  }

  return (
    Cookies.get("token") ||
    localStorage.getItem("token") ||
    Cookies.get("session") ||
    Cookies.get("customer_token") ||
    localStorage.getItem("customer_token") ||
    null
  );
}

export function isStaffOrAdmin() {
  if (typeof window === "undefined") return false;
  const role = String(
    Cookies.get("role") || localStorage.getItem("role") || ""
  ).toLowerCase();
  const token =
    Cookies.get("token") ||
    localStorage.getItem("token") ||
    Cookies.get("session");
  return (
    !!token && ["admin", "staff", "pharmacist", "owner"].includes(role)
  );
}

export function isCustomer() {
  if (typeof window === "undefined") return false;
  const role = String(
    Cookies.get("role") || localStorage.getItem("role") || ""
  ).toLowerCase();
  const token =
    Cookies.get("customer_token") ||
    localStorage.getItem("customer_token") ||
    Cookies.get("customer_session");
  return !!token && role === "customer";
}

// Attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const isOwnerRoute =
      config.url?.startsWith("/owner/") ||
      config.url?.startsWith("/admin/") ||
      config.url?.startsWith("/medicines") ||
      config.url?.startsWith("/sales") ||
      config.url?.startsWith("/purchases") ||
      config.url?.startsWith("/dues");

    const token = getAuthToken(config.url || "");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isOwnerRoute) {
      // Prevent browser credentials from sending customer_session cookie to owner routes
      config.headers.Authorization = "Bearer no-staff-token";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    const err = new Error(message);
    err.response = error.response;
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;
