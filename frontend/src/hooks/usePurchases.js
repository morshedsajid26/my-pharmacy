import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function usePurchases(params = {}) {
  const queryClient = useQueryClient();

  const fetchPurchases = useQuery({
    queryKey: ["purchases", params],
    queryFn: async () => {
      const res = await api.get("/owner/purchases");
      return res?.data || res;
    },
  });

  const recordPurchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      const res = await api.post("/owner/purchases", purchaseData);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Purchase recorded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record purchase");
    },
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/owner/purchases/${id}`, data);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Purchase updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update purchase");
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/owner/purchases/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Purchase deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete purchase");
    },
  });

  return {
    purchases: fetchPurchases.data || [],
    isLoading: fetchPurchases.isLoading,
    isError: fetchPurchases.isError,
    recordPurchase: recordPurchaseMutation.mutateAsync,
    isRecording: recordPurchaseMutation.isPending,
    updatePurchase: updatePurchaseMutation.mutateAsync,
    isUpdating: updatePurchaseMutation.isPending,
    deletePurchase: deletePurchaseMutation.mutateAsync,
    isDeleting: deletePurchaseMutation.isPending,
    refetch: fetchPurchases.refetch,
  };
}
