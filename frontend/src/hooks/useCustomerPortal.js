import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isCustomer } from "@/lib/api";
import toast from "react-hot-toast";

export function useCustomerOrders() {
  const queryClient = useQueryClient();

  const fetchOrders = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const res = await api.get("/user/orders/my-orders");
      const list = res?.data !== undefined ? res.data : res;
      return Array.isArray(list) ? list : [];
    },
    enabled: isCustomer(),
    retry: false,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const res = await api.post("/user/orders", orderData);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-overview-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  return {
    orders: Array.isArray(fetchOrders.data) ? fetchOrders.data : [],
    isLoading: fetchOrders.isLoading,
    isError: fetchOrders.isError,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    refetch: fetchOrders.refetch,
  };
}

export function useCustomerOverview() {
  const fetchStats = useQuery({
    queryKey: ["customer-overview-stats"],
    queryFn: async () => {
      const res = await api.get("/user/orders/stats");
      return (
        res?.data ||
        res || {
          totalOrders: 0,
          totalSpent: 0,
          pendingOrders: 0,
          totalPrescriptions: 0,
        }
      );
    },
    enabled: isCustomer(),
    retry: false,
  });

  return {
    stats: fetchStats.data || {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      totalPrescriptions: 0,
    },
    isLoading: fetchStats.isLoading,
    isError: fetchStats.isError,
    refetch: fetchStats.refetch,
  };
}

export function useCustomerPrescriptions() {
  const queryClient = useQueryClient();

  const fetchPrescriptions = useQuery({
    queryKey: ["customer-prescriptions"],
    queryFn: async () => {
      const res = await api.get("/user/prescriptions/my-prescriptions");
      const list = res?.data !== undefined ? res.data : res;
      return Array.isArray(list) ? list : [];
    },
    enabled: isCustomer(),
    retry: false,
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/user/prescriptions", data);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["customer-overview-stats"] });
      toast.success("Prescription order uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload prescription");
    },
  });

  const deletePrescriptionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/user/prescriptions/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["customer-overview-stats"] });
      toast.success("Prescription deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete prescription");
    },
  });

  return {
    prescriptions: Array.isArray(fetchPrescriptions.data)
      ? fetchPrescriptions.data
      : [],
    isLoading: fetchPrescriptions.isLoading,
    isError: fetchPrescriptions.isError,
    createPrescription: createPrescriptionMutation.mutateAsync,
    isCreating: createPrescriptionMutation.isPending,
    deletePrescription: deletePrescriptionMutation.mutateAsync,
    isDeleting: deletePrescriptionMutation.isPending,
    refetch: fetchPrescriptions.refetch,
  };
}

export function useCustomerWishlist() {
  const queryClient = useQueryClient();

  const fetchWishlist = useQuery({
    queryKey: ["customer-wishlist"],
    queryFn: async () => {
      const res = await api.get("/user/requests/wishlist");
      const list = res?.data !== undefined ? res.data : res;
      return Array.isArray(list) ? list : [];
    },
    enabled: isCustomer(),
    retry: false,
  });

  const addRequestMutation = useMutation({
    mutationFn: async (medicineId) => {
      const res = await api.post("/user/requests", { medicineId });
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-wishlist"] });
      toast.success("Added to medicine requests wishlist!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add request");
    },
  });

  const removeRequestMutation = useMutation({
    mutationFn: async (medicineId) => {
      const res = await api.delete(`/user/requests/${medicineId}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove request");
    },
  });

  return {
    wishlist: Array.isArray(fetchWishlist.data) ? fetchWishlist.data : [],
    isLoading: fetchWishlist.isLoading,
    addRequest: addRequestMutation.mutateAsync,
    removeRequest: removeRequestMutation.mutateAsync,
    refetch: fetchWishlist.refetch,
  };
}

export function useCreateOnlineOrder() {
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async (orderData) => {
      const res = await api.post("/user/orders", orderData);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-overview-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  return {
    createOrder: orderMutation.mutateAsync,
    isPlacingOrder: orderMutation.isPending,
  };
}
