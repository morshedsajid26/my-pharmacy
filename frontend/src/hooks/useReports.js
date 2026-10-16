import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getChartData,
  getTopSellingMedicines,
  getExpiringMedicines,
  getTopProfitableMedicines,
  getUnsoldMedicines,
  getLedgerYears,
  getDailyLedger,
} from "@/lib/actions/report.actions";

export function useReports(params = {}) {
  const fetchSummary = useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: async () => {
      return await getDashboardSummary();
    },
  });

  return {
    summary: fetchSummary.data,
    isLoading: fetchSummary.isLoading,
    isError: fetchSummary.isError,
  };
}

export function useChartData(range = "month") {
  const fetchCharts = useQuery({
    queryKey: ["reports", "charts", range],
    queryFn: async () => {
      return await getChartData(range);
    },
  });

  return {
    charts: fetchCharts.data,
    isLoading: fetchCharts.isLoading,
    isError: fetchCharts.isError,
  };
}

export function useTopSelling() {
  const fetchTop = useQuery({
    queryKey: ["reports", "top-selling"],
    queryFn: async () => {
      return await getTopSellingMedicines();
    },
  });

  return {
    topSelling: fetchTop.data,
    isLoading: fetchTop.isLoading,
    isError: fetchTop.isError,
  };
}

export function useExpiringMedicines() {
  const fetchExpiring = useQuery({
    queryKey: ["reports", "expiring"],
    queryFn: async () => {
      return await getExpiringMedicines();
    },
  });

  return {
    expiring: fetchExpiring.data,
    isLoading: fetchExpiring.isLoading,
    isError: fetchExpiring.isError,
  };
}

export function useTopProfitable() {
  const fetchProfitable = useQuery({
    queryKey: ["reports", "top-profitable"],
    queryFn: async () => {
      return await getTopProfitableMedicines();
    },
  });

  return {
    topProfitable: fetchProfitable.data,
    isLoading: fetchProfitable.isLoading,
    isError: fetchProfitable.isError,
  };
}

export function useUnsoldMedicines() {
  const fetchUnsold = useQuery({
    queryKey: ["reports", "unsold-30-days"],
    queryFn: async () => {
      return await getUnsoldMedicines();
    },
  });

  return {
    unsold: fetchUnsold.data,
    isLoading: fetchUnsold.isLoading,
    isError: fetchUnsold.isError,
  };
}

export function useLedgerYears() {
  const fetchYears = useQuery({
    queryKey: ["reports", "ledger-years"],
    queryFn: async () => {
      return await getLedgerYears();
    },
  });

  return {
    years: fetchYears.data || [new Date().getFullYear()],
    isLoading: fetchYears.isLoading,
    isError: fetchYears.isError,
  };
}

export function useDailyLedger(year, month) {
  const fetchLedger = useQuery({
    queryKey: ["reports", "daily-ledger", year, month],
    queryFn: async () => {
      return await getDailyLedger(year, month);
    },
    enabled: year !== undefined && month !== undefined,
  });

  return {
    ledger: fetchLedger.data,
    isLoading: fetchLedger.isLoading,
    isError: fetchLedger.isError,
    refetch: fetchLedger.refetch,
  };
}

