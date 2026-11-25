import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isOwner } from "@/lib/api";
import toast from "react-hot-toast";

export function useStaff() {
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const res = await api.get("/owner/staff");
      return res?.data || res || [];
    },
    enabled: isOwner(),
    retry: false,
  });

  const createStaffMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/owner/staff", payload);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      toast.success("Staff account created successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create staff account");
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/owner/staff/${id}`, data);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      toast.success("Staff account updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update staff account");
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/owner/staff/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      toast.success("Staff account deleted");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete staff account");
    },
  });

  return {
    staffList: Array.isArray(staffQuery.data) ? staffQuery.data : [],
    isLoading: staffQuery.isLoading,
    refetch: staffQuery.refetch,
    createStaff: createStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    updateStaff: updateStaffMutation.mutateAsync,
    isUpdating: updateStaffMutation.isPending,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isDeleting: deleteStaffMutation.isPending,
  };
}
