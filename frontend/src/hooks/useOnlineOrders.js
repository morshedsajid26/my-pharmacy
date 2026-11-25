import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isOwner, isStaffOrAdmin } from "@/lib/api";
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
    enabled: isOwner(),
    retry: false,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["online-orders"] });
    queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] });
    queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    queryClient.invalidateQueries({ queryKey: ["staff-assigned-orders"] });
    queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["medicines"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
  };

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.put(`/owner/orders/${orderId}/accept`);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Order accepted & stock reserved!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to accept order");
    },
  });

  const packOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.put(`/owner/orders/${orderId}/pack`);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Order marked as Packed!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark order as packed");
    },
  });

  const assignStaffOrderMutation = useMutation({
    mutationFn: async ({ orderId, staffId }) => {
      const res = await api.put(`/owner/orders/${orderId}/assign`, { staffId });
      return res?.data || res;
    },
    onSuccess: (_, vars) => {
      invalidateAll();
      toast.success(
        vars?.staffId
          ? "Staff assigned & order marked as Shipped!"
          : "Order marked as Shipped!"
      );
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to assign/ship order");
    },
  });

  const deliverOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.put(`/owner/orders/${orderId}/deliver`);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Delivery completed & sale recorded!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark order as delivered");
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const res = await api.put(`/owner/orders/${orderId}/reject`, { reason });
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Order rejected");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to reject order");
    },
  });

  return {
    orders: Array.isArray(fetchOrders.data) ? fetchOrders.data : [],
    isLoading: fetchOrders.isLoading,
    isError: fetchOrders.isError,
    acceptOrder: acceptOrderMutation.mutateAsync,
    approveOrder: acceptOrderMutation.mutateAsync,
    isApproving: acceptOrderMutation.isPending,
    packOrder: packOrderMutation.mutateAsync,
    isPacking: packOrderMutation.isPending,
    assignStaffOrder: assignStaffOrderMutation.mutateAsync,
    isAssigning: assignStaffOrderMutation.isPending,
    deliverOrder: deliverOrderMutation.mutateAsync,
    isDelivering: deliverOrderMutation.isPending,
    rejectOrder: rejectOrderMutation.mutateAsync,
    isRejecting: rejectOrderMutation.isPending,
    refetch: fetchOrders.refetch,
  };
}

export function usePendingOrdersCount() {
  const fetchCount = useQuery({
    queryKey: ["pending-orders-count"],
    queryFn: async () => {
      const res = await api.get("/owner/orders/pending-count");
      return res?.count || 0;
    },
    enabled: isOwner(),
    refetchInterval: 30000,
    retry: false,
  });

  return {
    pendingCount: fetchCount.data || 0,
    count: fetchCount.data || 0,
    isLoading: fetchCount.isLoading,
  };
}

export function useStaffAssignedOrders(status = "SHIPPED") {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["staff-assigned-orders", status],
    queryFn: async () => {
      const res = await api.get("/owner/orders/my-assigned", {
        params: status ? { status } : {},
      });
      return res?.data || res || [];
    },
    enabled: isStaffOrAdmin(),
    refetchInterval: 20000,
    retry: false,
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId) => {
      const res = await api.put(`/owner/orders/${orderId}/deliver`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-assigned-orders"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["online-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Delivery marked as Delivered!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to complete delivery");
    },
  });

  return {
    orders: Array.isArray(ordersQuery.data) ? ordersQuery.data : [],
    isLoading: ordersQuery.isLoading,
    refetch: ordersQuery.refetch,
    completeDelivery: completeDeliveryMutation.mutateAsync,
    isCompleting: completeDeliveryMutation.isPending,
  };
}

export function useStaffDashboard() {
  const dashQuery = useQuery({
    queryKey: ["staff-dashboard"],
    queryFn: async () => {
      const res = await api.get("/owner/orders/staff-dashboard");
      return res?.data || res || {};
    },
    enabled: isStaffOrAdmin(),
    refetchInterval: 25000,
    retry: false,
  });

  return {
    stats: dashQuery.data || {},
    isLoading: dashQuery.isLoading,
    refetch: dashQuery.refetch,
  };
}
