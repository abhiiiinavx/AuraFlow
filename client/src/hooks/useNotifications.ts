import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { demoNotifications } from "@/lib/demoData";
import type { NotificationItem } from "@/types";

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const data = await apiFetch<{ notifications: NotificationItem[] }>("/notifications");
        return data.notifications;
      } catch {
        return demoNotifications;
      }
    },
    staleTime: 1000 * 30
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      try {
        await apiFetch("/notifications/read-all", { method: "PATCH" });
      } catch {
        return undefined;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  return {
    notifications: query.data ?? [],
    unread: (query.data ?? []).filter((notification) => !notification.read).length,
    isLoading: query.isLoading,
    markAllRead: markAllRead.mutate
  };
}
