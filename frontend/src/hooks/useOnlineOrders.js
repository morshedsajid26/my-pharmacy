import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isStaffOrAdmin } from "@/lib/api";
import toast from "react-hot-toast";

export function useOnlineOrders(status = null) {
  const queryClient = useQueryClient();

  const fetchOrders = useQuery({
    queryKey: ["online-orders", status],
    queryFn: async () => {
      const res = await api.get("/owner/orders", {
        params: status ? { status } : {},
      });
      return res?.data || res;
    },
    enabled: isStaffOrAdmin(),
    retry: false,
  });

  const approveOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.patch(`/owner/orders/${orderId}/approve`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["online-orders"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Order approved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve order");
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const res = await api.patch(`/owner/orders/${orderId}/reject`, { reason });
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["online-orders"] });
      toast.success("Order rejected");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject order");
    },
  });

  return {
    orders: fetchOrders.data || [],
    isLoading: fetchOrders.isLoading,
    isError: fetchOrders.isError,
    approveOrder: approveOrderMutation.mutateAsync,
    isApproving: approveOrderMutation.isPending,
    rejectOrder: rejectOrderMutation.mutateAsync,
    isRejecting: rejectOrderMutation.isPending,
    refetch: fetchOrders.refetch,
  };
}

export function usePendingOrdersCount() {
  const fetchCount = useQuery({
    queryKey: ["online-orders", "pending-count"],
    queryFn: async () => {
      const res = await api.get("/owner/orders/pending-count");
      return res?.count ?? (res?.data?.count ?? 0);
    },
    enabled: isStaffOrAdmin(),
    retry: false,
    refetchInterval: 30000,
  });

  return {
    pendingCount:
      typeof fetchCount.data === "number"
        ? fetchCount.data
        : (fetchCount.data?.count ?? 0),
    isLoading: fetchCount.isLoading,
    refetch: fetchCount.refetch,
  };
}
