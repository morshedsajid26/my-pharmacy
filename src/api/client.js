import { MEDICINES, SALES_DATA, STATISTICS } from "../mockData/data";

// Mock API Client to bypass backend integration entirely
const apiClient = {
  get: async (url, config = {}) => {
    console.log("Mock GET:", url, config);
    const params = config.params || {};
    
    if (url.includes('/reports/summary')) return { data: { data: STATISTICS } };
    
    if (url.includes('/medicines')) {
      let filteredData = [...MEDICINES];
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredData = filteredData.filter(m => 
          m.name.toLowerCase().includes(search) || 
          m.company.toLowerCase().includes(search)
        );
      }
      return { data: { data: filteredData } };
    }
    
    if (url.includes('/sales')) return { data: { data: SALES_DATA } };
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
