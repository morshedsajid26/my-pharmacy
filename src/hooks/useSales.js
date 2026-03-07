import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import toast from "react-hot-toast";

export function useSales(params = {}) {
  const queryClient = useQueryClient();

  // Fetch sales history
  const fetchSales = useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/sales", { params });
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  // Record new sale
  const recordSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      const { data } = await apiClient.post("/sales", saleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] }); // Stock changed
      queryClient.invalidateQueries({ queryKey: ["reports"] }); // Stats changed
      toast.success("Sale completed successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete sale");
    },
  });

  return {
    sales: fetchSales.data,
    isLoading: fetchSales.isLoading,
    isError: fetchSales.isError,
    recordSale: recordSaleMutation.mutateAsync,
    isRecording: recordSaleMutation.isPending,
  };
}
