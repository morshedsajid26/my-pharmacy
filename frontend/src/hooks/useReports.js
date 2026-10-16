import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useReports() {
  const fetchSummary = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/summary");
      return res?.data || res;
    },
  });

  return {
    summary: fetchSummary.data,
    isLoading: fetchSummary.isLoading,
    isError: fetchSummary.isError,
    refetch: fetchSummary.refetch,
  };
}

export function useChartData(range = "month") {
  const fetchCharts = useQuery({
    queryKey: ["reports", "charts", range],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/analytics", {
        params: { range },
      });
      return res?.data || res;
    },
  });

  return {
    charts: fetchCharts.data,
    isLoading: fetchCharts.isLoading,
    isError: fetchCharts.isError,
    refetch: fetchCharts.refetch,
  };
}

export function useTopSelling() {
  const fetchTop = useQuery({
    queryKey: ["reports", "top-selling"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/top-selling");
      return res?.data || res;
    },
  });

  return {
    topSelling: fetchTop.data || [],
    isLoading: fetchTop.isLoading,
    isError: fetchTop.isError,
    refetch: fetchTop.refetch,
  };
}

export function useExpiringMedicines() {
  const fetchExpiring = useQuery({
    queryKey: ["reports", "expiring"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/expiring");
      return res?.data || res;
    },
  });

  return {
    expiring: fetchExpiring.data || [],
    isLoading: fetchExpiring.isLoading,
    isError: fetchExpiring.isError,
    refetch: fetchExpiring.refetch,
  };
}

export function useTopProfitable() {
  const fetchProfitable = useQuery({
    queryKey: ["reports", "top-profitable"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/top-profitable");
      return res?.data || res;
    },
  });

  return {
    topProfitable: fetchProfitable.data || [],
    isLoading: fetchProfitable.isLoading,
    isError: fetchProfitable.isError,
    refetch: fetchProfitable.refetch,
  };
}

export function useUnsoldMedicines() {
  const fetchUnsold = useQuery({
    queryKey: ["reports", "unsold-30-days"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/unsold");
      return res?.data || res;
    },
  });

  return {
    unsold: fetchUnsold.data || [],
    isLoading: fetchUnsold.isLoading,
    isError: fetchUnsold.isError,
    refetch: fetchUnsold.refetch,
  };
}

export function useLedgerYears() {
  const fetchYears = useQuery({
    queryKey: ["reports", "ledger-years"],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/ledger-years");
      return res?.data || res;
    },
  });

  return {
    years: fetchYears.data || [new Date().getFullYear()],
    isLoading: fetchYears.isLoading,
    isError: fetchYears.isError,
    refetch: fetchYears.refetch,
  };
}

export function useDailyLedger(year, month) {
  const fetchLedger = useQuery({
    queryKey: ["reports", "daily-ledger", year, month],
    queryFn: async () => {
      const res = await api.get("/owner/dashboard/daily-ledger", {
        params: { year, month },
      });
      return res?.data || res;
    },
    enabled: year !== undefined && month !== undefined,
  });

  return {
    ledger: fetchLedger.data || [],
    isLoading: fetchLedger.isLoading,
    isError: fetchLedger.isError,
    refetch: fetchLedger.refetch,
  };
}
