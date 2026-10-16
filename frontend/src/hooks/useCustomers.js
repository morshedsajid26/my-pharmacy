import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, createCustomer, updateCustomer, payCustomerDue } from "@/lib/actions/customer.actions";
import toast from "react-hot-toast";

export function useCustomers() {
  const queryClient = useQueryClient();

  const fetchCustomers = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      return await getCustomers();
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer) => {
      return await createCustomer(newCustomer);
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
      return await updateCustomer(id, data);
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
    mutationFn: async ({ customerId, amount, waiveAmount }) => {
      return await payCustomerDue(customerId, amount, waiveAmount);
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
    isCollecting: collectDueMutation.isPending
  };
}
