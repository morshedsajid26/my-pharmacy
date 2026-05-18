import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSales, recordSale } from "@/lib/actions/sales.actions";
import toast from "react-hot-toast";

export function useSales(params = {}) {
  const queryClient = useQueryClient();

  const fetchSales = useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      return await getSales();
    },
  });

  const recordSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      return await recordSale(saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete sale");
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
