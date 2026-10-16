import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPurchases, recordPurchase, updatePurchase, deletePurchase } from "@/lib/actions/purchase.actions";
import toast from "react-hot-toast";

export function usePurchases(params = {}) {
  const queryClient = useQueryClient();

  const fetchPurchases = useQuery({
    queryKey: ["purchases", params],
    queryFn: async () => {
      return await getPurchases();
    },
  });

  const recordPurchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      return await recordPurchase(purchaseData);
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
      return await updatePurchase(id, data);
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
      return await deletePurchase(id);
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
    purchases: fetchPurchases.data,
    isLoading: fetchPurchases.isLoading,
    isError: fetchPurchases.isError,
    recordPurchase: recordPurchaseMutation.mutateAsync,
    isRecording: recordPurchaseMutation.isPending,
    updatePurchase: updatePurchaseMutation.mutateAsync,
    isUpdating: updatePurchaseMutation.isPending,
    deletePurchase: deletePurchaseMutation.mutateAsync,
    isDeleting: deletePurchaseMutation.isPending,
  };
}
