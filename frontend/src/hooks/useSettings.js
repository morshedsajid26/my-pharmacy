import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isStaffOrAdmin } from "@/lib/api";
import toast from "react-hot-toast";

export function useOwnerSettings() {
  const queryClient = useQueryClient();

  const fetchSettings = useQuery({
    queryKey: ["owner-settings"],
    queryFn: async () => {
      const res = await api.get("/owner/settings");
      return res?.data || res;
    },
    enabled: isStaffOrAdmin(),
    retry: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData) => {
      const res = await api.put("/owner/settings", settingsData);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-settings"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-settings"] });
      toast.success("Storefront settings updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update storefront settings");
    },
  });

  return {
    settings: fetchSettings.data || {
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      discountTiers: [],
    },
    isLoading: fetchSettings.isLoading,
    isError: fetchSettings.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
    refetch: fetchSettings.refetch,
  };
}

export function useStorefrontSettings() {
  const fetchSettings = useQuery({
    queryKey: ["storefront-settings"],
    queryFn: async () => {
      const res = await api.get("/owner/settings/storefront");
      return res?.data || res;
    },
  });

  return {
    settings: fetchSettings.data || {
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      discountTiers: [],
    },
    isLoading: fetchSettings.isLoading,
    isError: fetchSettings.isError,
    refetch: fetchSettings.refetch,
  };
}
