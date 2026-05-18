import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedicines, getLowStockMedicines, addMedicine, updateMedicine, deleteMedicine } from "@/lib/actions/medicine.actions";
import toast from "react-hot-toast";

export function useMedicines(params = {}) {
  const queryClient = useQueryClient();

  const fetchMedicines = useQuery({
    queryKey: ["medicines", params],
    queryFn: async () => {
      return await getMedicines(params);
    },
  });

  const fetchLowStock = useQuery({
    queryKey: ["medicines", "low-stock"],
    queryFn: async () => {
      return await getLowStockMedicines();
    },
  });

  const addMedicineMutation = useMutation({
    mutationFn: async (newMedicine) => {
      return await addMedicine(newMedicine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add medicine");
    },
  });

  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await updateMedicine(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update medicine");
    },
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteMedicine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete medicine");
    },
  });

  return {
    medicines: fetchMedicines.data,
    isLoading: fetchMedicines.isLoading,
    isError: fetchMedicines.isError,
    lowStock: fetchLowStock.data,
    addMedicine: addMedicineMutation.mutateAsync,
    updateMedicine: updateMedicineMutation.mutateAsync,
    deleteMedicine: deleteMedicineMutation.mutateAsync,
    isAdding: addMedicineMutation.isPending,
    isUpdating: updateMedicineMutation.isPending,
    isDeleting: deleteMedicineMutation.isPending,
  };
}
