import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import toast from "react-hot-toast";

export function usePurchases(params = {}) {
  const queryClient = useQueryClient();

  // Fetch purchase history
  const fetchPurchases = useQuery({
    queryKey: ["purchases", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/purchases", { params });
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  // Record new purchase
  const recordPurchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      const { data } = await apiClient.post("/purchases", purchaseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] }); // Stock changed
      queryClient.invalidateQueries({ queryKey: ["reports"] }); // Stats changed
      toast.success("Purchase recorded successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to record purchase");
    },
  });

  return {
    purchases: fetchPurchases.data,
    isLoading: fetchPurchases.isLoading,
    isError: fetchPurchases.isError,
    recordPurchase: recordPurchaseMutation.mutateAsync,
    isRecording: recordPurchaseMutation.isPending,
  };
}
