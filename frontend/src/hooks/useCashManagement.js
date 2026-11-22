import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { isStaffOrAdmin, getAuthToken } from "@/lib/api";
import toast from "react-hot-toast";

export function useCashSummary(params = {}) {
  const { timeframe = "day", date, year, month } = params;

  const query = useQuery({
    queryKey: ["cash-summary", timeframe, date, year, month],
    queryFn: async () => {
      const res = await api.get("/owner/cash/summary", {
        params: { timeframe, date, year, month },
      });
      // Handles both direct response and nested data
      if (res?.data?.summary !== undefined) {
        return res.data;
      }
      return res?.data || res || {};
    },
    // Enable when running in browser and token is present or is owner
    enabled: typeof window !== "undefined" && (!!getAuthToken("/owner/cash/summary") || isStaffOrAdmin()),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });

  const cashData = query.data?.summary !== undefined
    ? query.data
    : query.data?.data || query.data || {};

  return {
    ...query,
    data: cashData,
    summary: cashData?.summary || {},
    register: cashData?.register || null,
    transactions: cashData?.transactions || [],
    dailyLedger: cashData?.dailyLedger || [],
    monthlyLedger: cashData?.monthlyLedger || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Cash Drawer & Financial Operations Mutations using TanStack Query
 */
export function useCashMutations() {
  const queryClient = useQueryClient();

  const invalidateCashData = () => {
    queryClient.invalidateQueries({ queryKey: ["cash-summary"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["purchases"] });
  };

  // 1. Set Opening Cash Register
  const openRegisterMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/owner/cash/register/open", data);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateCashData();
      toast.success("Opening cash recorded successfully!");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "Failed to set opening cash";
      toast.error(message);
    },
  });

  // 2. Close Register & Audit Variance
  const closeRegisterMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/owner/cash/register/close", data);
      return res?.data || res;
    },
    onSuccess: (resData) => {
      invalidateCashData();
      const register = resData?.data || resData;
      const diff = register?.difference ?? 0;
      if (Math.abs(diff) < 0.01) {
        toast.success("Register closed: Exact balance matched!");
      } else if (diff < 0) {
        toast.error(`Register closed: Shortage of ৳${Math.abs(diff).toFixed(2)}`);
      } else {
        toast.success(`Register closed: Surplus of ৳${diff.toFixed(2)}`);
      }
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "Failed to close register";
      toast.error(message);
    },
  });

  // 3. Add Store Expense
  const addExpenseMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/owner/cash/expenses", data);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateCashData();
      toast.success("Expense recorded successfully!");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "Failed to record expense";
      toast.error(message);
    },
  });

  // 4. Delete Store Expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/owner/cash/expenses/${id}`);
      return res?.data || res;
    },
    onSuccess: () => {
      invalidateCashData();
      toast.success("Expense deleted successfully!");
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete expense";
      toast.error(message);
    },
  });

  // 5. Add Manual Cash In / Out Adjustment
  const addAdjustmentMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/owner/cash/adjustments", data);
      return res?.data || res;
    },
    onSuccess: (_, variables) => {
      invalidateCashData();
      toast.success(
        variables.type === "CASH_IN"
          ? "Cash added to drawer successfully!"
          : "Cash withdrawal recorded successfully!"
      );
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "Failed to record cash adjustment";
      toast.error(message);
    },
  });

  return {
    openRegister: openRegisterMutation.mutateAsync,
    isOpeningRegister: openRegisterMutation.isPending,
    closeRegister: closeRegisterMutation.mutateAsync,
    isClosingRegister: closeRegisterMutation.isPending,
    addExpense: addExpenseMutation.mutateAsync,
    isAddingExpense: addExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isDeletingExpense: deleteExpenseMutation.isPending,
    addAdjustment: addAdjustmentMutation.mutateAsync,
    isAddingAdjustment: addAdjustmentMutation.isPending,
  };
}
