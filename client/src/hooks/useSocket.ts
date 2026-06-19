import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "@/store/toastStore";
import type { NotificationItem, Task } from "@/types";

export function useSocket() {
  const upsertTask = useTaskStore((state) => state.upsertTask);
  const removeTask = useTaskStore((state) => state.removeTask);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onTask = (task: Task) => upsertTask(task);
    const onDelete = ({ id }: { id: string }) => removeTask(id);
    const onNotification = (notification: NotificationItem) =>
      toast({ title: "Notification", description: notification.message, type: "info" });

    socket.on("task:created", onTask);
    socket.on("task:updated", onTask);
    socket.on("task:deleted", onDelete);
    socket.on("notification:new", onNotification);

    return () => {
      socket.off("task:created", onTask);
      socket.off("task:updated", onTask);
      socket.off("task:deleted", onDelete);
      socket.off("notification:new", onNotification);
    };
  }, [removeTask, upsertTask]);
}
