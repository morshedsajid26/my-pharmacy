import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useSales(params = {}) {
  const queryClient = useQueryClient();

  const fetchSales = useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      const res = await api.get("/owner/sales", { params });
      return res?.data || res;
    },
  });

  const recordSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      const res = await api.post("/owner/sales", saleData);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete sale");
    },
  });

  return {
    sales: fetchSales.data || [],
    isLoading: fetchSales.isLoading,
    isError: fetchSales.isError,
    recordSale: recordSaleMutation.mutateAsync,
    isRecording: recordSaleMutation.isPending,
    refetch: fetchSales.refetch,
  };
}
