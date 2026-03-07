import axios from "axios";
import Cookies from "js-cookie";

// Mock API Client to bypass backend integration entirely
const apiClient = {
  get: async (url) => {
    console.log("Mock GET:", url);
    if (url.includes('/reports/summary')) return { data: { data: { totalMedicines: 120, lowStock: 5, todaySales: 25, monthlyRevenue: 15000 } } };
    if (url.includes('/reports/top-selling')) return { data: { data: [] } };
    if (url.includes('/reports/category-sales')) return { data: { data: [] } };
    return { data: { data: [] } }; // Default mock array
  },
  post: async (url, data) => {
    console.log("Mock POST:", url, data);
    return { data: { success: true, user: { id: 1, name: "Admin", email: "admin@example.com", role: "admin" }, token: "mock-token", data: data } };
  },
  put: async (url, data) => {
    console.log("Mock PUT:", url, data);
    return { data: { success: true, data: data } };
  },
  delete: async (url) => {
    console.log("Mock DELETE:", url);
    return { data: { success: true } };
  },
  interceptors: {
    request: { use: () => { } },
    response: { use: () => { } }
  }
};

export default apiClient;
