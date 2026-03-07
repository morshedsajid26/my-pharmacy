import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import toast from "react-hot-toast";

export function useMedicines(params = {}) {
  const queryClient = useQueryClient();

  // Fetch all medicines with search, filters, pagination
  const fetchMedicines = useQuery({
    queryKey: ["medicines", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/medicines", { params });
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  // Fetch low stock medicines
  const fetchLowStock = useQuery({
    queryKey: ["medicines", "low-stock"],
    queryFn: async () => {
      const { data } = await apiClient.get("/medicines/status/low-stock");
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  // Fetch stock out medicines
  const fetchStockOut = useQuery({
    queryKey: ["medicines", "stock-out"],
    queryFn: async () => {
      const { data } = await apiClient.get("/medicines/status/stock-out");
      return Array.isArray(data) ? data : data.data || [];
    },
  });

  // Add new medicine
  const addMedicineMutation = useMutation({
    mutationFn: async (newMedicine) => {
      const { data } = await apiClient.post("/medicines", newMedicine);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add medicine");
    },
  });

  // Update medicine
  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: updatedData } = await apiClient.put(`/medicines/${id}`, data);
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update medicine");
    },
  });

  // Delete medicine
  const deleteMedicineMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/medicines/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete medicine");
    },
  });

  return {
    medicines: fetchMedicines.data,
    isLoading: fetchMedicines.isLoading,
    isError: fetchMedicines.isError,
    lowStock: fetchLowStock.data,
    stockOut: fetchStockOut.data,
    addMedicine: addMedicineMutation.mutateAsync,
    updateMedicine: updateMedicineMutation.mutateAsync,
    deleteMedicine: deleteMedicineMutation.mutateAsync,
    isAdding: addMedicineMutation.isPending,
    isUpdating: updateMedicineMutation.isPending,
    isDeleting: deleteMedicineMutation.isPending,
  };
}
