import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBlob, apiFetch } from "@/lib/api";
import { downloadBlob, tasksToPdfBlob, toCsv } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "@/store/toastStore";
import type { PaginatedTasks, Task, TaskInput, TaskStatus } from "@/types";

export function useTasks() {
  const queryClient = useQueryClient();
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const upsertTask = useTaskStore((state) => state.upsertTask);
  const updateLocalTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);

  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => apiFetch<PaginatedTasks>("/tasks"),
    retry: false,
    staleTime: 1000 * 30
  });

  useEffect(() => {
    if (query.data?.tasks) setTasks(query.data.tasks);
  }, [query.data, setTasks]);

  const createMutation = useMutation({
    mutationFn: async (input: TaskInput) => {
      try {
        const data = await apiFetch<{ task: Task }>("/tasks", {
          method: "POST",
          body: JSON.stringify(input)
        });
        return data.task;
      } catch {
        return addTask(input);
      }
    },
    onSuccess: (task) => {
      upsertTask(task);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({ title: "Task created", description: task.title, type: "success" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, update }: { id: string; update: Partial<Task> }) => {
      try {
        const data = await apiFetch<{ task: Task }>(`/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(update)
        });
        return data.task;
      } catch {
        return updateLocalTask(id, update) as Task;
      }
    },
    onSuccess: (task) => {
      if (task) upsertTask(task);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      } catch {
        removeTask(id);
      }
      return id;
    },
    onSuccess: (id) => {
      removeTask(id);
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({ title: "Task deleted", type: "info" });
    }
  });

  const setStatus = (id: string, status: TaskStatus) => {
    updateMutation.mutate({ id, update: { status } });
  };

  const exportCsv = async () => {
    try {
      const blob = await apiBlob("/tasks/export/csv");
      downloadBlob(blob, "aura-tasks.csv");
    } catch {
      downloadBlob(new Blob([toCsv(tasks)], { type: "text/csv" }), "aura-tasks.csv");
    }
    toast({ title: "CSV exported", type: "success" });
  };

  const exportPdf = async () => {
    try {
      const blob = await apiBlob("/tasks/export/pdf");
      downloadBlob(blob, "aura-tasks.pdf");
    } catch {
      downloadBlob(tasksToPdfBlob(tasks), "aura-tasks.pdf");
    }
    toast({ title: "PDF exported", type: "success" });
  };

  return {
    tasks,
    isLoading: query.isLoading,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    setStatus,
    exportCsv,
    exportPdf,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}
