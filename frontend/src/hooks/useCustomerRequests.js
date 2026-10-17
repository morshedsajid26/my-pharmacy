import { useQuery } from "@tanstack/react-query";
import api, { isStaffOrAdmin } from "@/lib/api";

export function useCustomerRequests() {
  const fetchRequests = useQuery({
    queryKey: ["customer-requests"],
    queryFn: async () => {
      const res = await api.get("/owner/requests");
      return res?.data || res;
    },
    enabled: isStaffOrAdmin(),
    retry: false,
  });

  return {
    requests: fetchRequests.data || [],
    isLoading: fetchRequests.isLoading,
    isError: fetchRequests.isError,
    refetch: fetchRequests.refetch,
  };
}
