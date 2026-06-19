import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { buildAnalytics } from "@/lib/demoData";
import { useTaskStore } from "@/store/taskStore";
import type { AnalyticsSummary } from "@/types";

export function useAnalytics() {
  const tasks = useTaskStore((state) => state.tasks);

  return useQuery({
    queryKey: ["analytics", tasks.length, tasks.map((task) => task.updatedAt).join("|")],
    queryFn: async () => {
      try {
        return await apiFetch<AnalyticsSummary>("/analytics/summary");
      } catch {
        return buildAnalytics(tasks);
      }
    },
    staleTime: 1000 * 30
  });
}
