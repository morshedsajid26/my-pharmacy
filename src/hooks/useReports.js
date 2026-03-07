import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

export function useReports(params = {}) {
  // Fetch business summary
  const fetchSummary = useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports/summary", { params });
      return data.data || data;
    },
  });

  // Fetch top selling medicines
  const fetchTopSelling = useQuery({
    queryKey: ["reports", "top-selling"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports/top-selling");
      return data.data || data;
    },
  });

  // Fetch category sales
  const fetchCategorySales = useQuery({
    queryKey: ["reports", "category-sales"],
    queryFn: async () => {
      const { data } = await apiClient.get("/reports/category-sales");
      return data.data || data;
    },
  });

  return {
    summary: fetchSummary.data,
    topSelling: fetchTopSelling.data,
    categorySales: fetchCategorySales.data,
    isLoading: fetchSummary.isLoading || fetchTopSelling.isLoading || fetchCategorySales.isLoading,
    isError: fetchSummary.isError || fetchTopSelling.isError || fetchCategorySales.isError,
  };
}
