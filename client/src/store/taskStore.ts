import { create } from "zustand";
import { demoTasks } from "@/lib/demoData";
import type { Task, TaskInput, TaskStatus } from "@/types";

const makeTask = (input: TaskInput): Task => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description ?? "",
    priority: input.priority ?? "Medium",
    status: input.status ?? "pending",
    tags: input.tags ?? [],
    dueDate: input.dueDate,
    category: input.category ?? "General",
    reminder: input.reminder,
    notes: input.notes ?? "",
    order: input.order ?? 0,
    timeSpent: input.timeSpent ?? 0,
    createdAt: now,
    updatedAt: now
  };
};

type TaskState = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (input: TaskInput) => Task;
  upsertTask: (task: Task) => void;
  updateTask: (id: string, update: Partial<Task>) => Task | undefined;
  removeTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: demoTasks,
  setTasks: (tasks) => set({ tasks: tasks.map((task) => ({ ...task, id: task.id ?? task._id ?? crypto.randomUUID() })) }),
  addTask: (input) => {
    const task = makeTask(input);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },
  upsertTask: (task) =>
    set((state) => {
      const id = task.id ?? task._id ?? crypto.randomUUID();
      const normalized = { ...task, id };
      const exists = state.tasks.some((item) => item.id === id || item._id === id);
      return {
        tasks: exists
          ? state.tasks.map((item) => (item.id === id || item._id === id ? normalized : item))
          : [normalized, ...state.tasks]
      };
    }),
  updateTask: (id, update) => {
    const existing = get().tasks.find((task) => task.id === id || task._id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id || task._id === id ? updated : task))
    }));
    return updated;
  },
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id && task._id !== id)
    })),
  setStatus: (id, status) => {
    get().updateTask(id, { status });
  }
}));
