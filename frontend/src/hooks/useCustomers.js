import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useCustomers(search = "") {
  const queryClient = useQueryClient();

  const fetchCustomers = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      const res = await api.get("/owner/customers", {
        params: search ? { search } : {},
      });
      return res?.data || res;
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer) => {
      const res = await api.post("/owner/customers", newCustomer);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer registered successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register customer");
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/owner/customers/${id}`, data);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer profile updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const collectDueMutation = useMutation({
    mutationFn: async ({ customerId, amount, waiveAmount = 0 }) => {
      const res = await api.post(`/owner/customers/${customerId}/due-payment`, {
        amount,
        waiveAmount,
      });
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Due payment collected successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process due payment");
    },
  });

  return {
    customers: fetchCustomers.data || [],
    isLoading: fetchCustomers.isLoading,
    isError: fetchCustomers.isError,
    addCustomer: addCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    collectDue: collectDueMutation.mutateAsync,
    isAdding: addCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isCollecting: collectDueMutation.isPending,
    refetch: fetchCustomers.refetch,
  };
}
