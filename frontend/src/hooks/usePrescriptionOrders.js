import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isStaffOrAdmin } from "@/lib/api";
import toast from "react-hot-toast";

export function usePrescriptionOrders(status = null) {
  const queryClient = useQueryClient();

  const fetchPrescriptions = useQuery({
    queryKey: ["prescription-orders", status],
    queryFn: async () => {
      const res = await api.get("/owner/prescriptions", {
        params: status ? { status } : {},
      });
      return res?.data || res;
    },
    enabled: isStaffOrAdmin(),
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status: newStatus, notes }) => {
      const res = await api.patch(`/owner/prescriptions/${id}`, {
        status: newStatus,
        notes,
      });
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-orders"] });
      toast.success("Prescription order status updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update prescription status");
    },
  });

  const deletePrescriptionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/owner/prescriptions/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-orders"] });
      toast.success("Prescription record deleted!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete prescription");
    },
  });

  return {
    prescriptions: fetchPrescriptions.data || [],
    isLoading: fetchPrescriptions.isLoading,
    isError: fetchPrescriptions.isError,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deletePrescription: deletePrescriptionMutation.mutateAsync,
    isDeleting: deletePrescriptionMutation.isPending,
    refetch: fetchPrescriptions.refetch,
  };
}
