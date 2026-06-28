import { useQuery } from "@tanstack/react-query";

import { fetchHealthStatus } from "@/services/health";

export function useHealthStatus() {
  return useQuery({
    queryKey: ["health-status"],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000,
  });
}
