import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useMedicines(params = {}) {
  const queryClient = useQueryClient();

  const fetchMedicines = useQuery({
    queryKey: ["medicines", params],
    queryFn: async () => {
      const res = await api.get("/owner/medicines", { params });
      return res?.data || res;
    },
  });

  const fetchLowStock = useQuery({
    queryKey: ["medicines", "low-stock"],
    queryFn: async () => {
      const res = await api.get("/owner/medicines/low-stock");
      return res?.data || res;
    },
  });

  const addMedicineMutation = useMutation({
    mutationFn: async (newMedicine) => {
      const res = await api.post("/owner/medicines", newMedicine);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Medicine added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add medicine");
    },
  });

  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/owner/medicines/${id}`, data);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Medicine updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update medicine");
    },
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/owner/medicines/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Medicine deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete medicine");
    },
  });

  return {
    medicines: fetchMedicines.data || [],
    isLoading: fetchMedicines.isLoading,
    isError: fetchMedicines.isError,
    lowStock: fetchLowStock.data || [],
    addMedicine: addMedicineMutation.mutateAsync,
    updateMedicine: updateMedicineMutation.mutateAsync,
    deleteMedicine: deleteMedicineMutation.mutateAsync,
    isAdding: addMedicineMutation.isPending,
    isUpdating: updateMedicineMutation.isPending,
    isDeleting: deleteMedicineMutation.isPending,
    refetch: fetchMedicines.refetch,
  };
}

export function usePublicMedicines(params = {}) {
  const fetchPublic = useQuery({
    queryKey: ["public-medicines", params],
    queryFn: async () => {
      const res = await api.get("/user/medicines", { params });
      return res?.data || res;
    },
  });

  return {
    medicines: fetchPublic.data || [],
    isLoading: fetchPublic.isLoading,
    isError: fetchPublic.isError,
    refetch: fetchPublic.refetch,
  };
}
