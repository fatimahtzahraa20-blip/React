import { useQuery } from "@tanstack/react-query";

import { getDashboardAnalytics } from "../services/dashboardService";

export default function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: getDashboardAnalytics,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
