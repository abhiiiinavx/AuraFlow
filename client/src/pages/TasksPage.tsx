import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth
} from "date-fns";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  GripVertical,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { cn, formatLongDate, isOverdue, priorityTone, statusTone } from "@/lib/utils";
import { toast } from "@/store/toastStore";
import { useUiStore } from "@/store/uiStore";
import { useTasks } from "@/hooks/useTasks";
import type { Priority, Task, TaskInput, TaskStatus, ViewMode } from "@/types";

const taskSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(3000).optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["pending", "completed", "archived"]),
  tagsText: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().min(1).max(80),
  reminder: z.string().optional(),
  notes: z.string().optional(),
  timeSpent: z.coerce.number().min(0).optional()
});

type TaskForm = z.infer<typeof taskSchema>;

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  archived: "Archived"
};

const viewItems: Array<{ id: ViewMode; label: string; icon: typeof LayoutGrid }> = [
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "timeline", label: "Timeline", icon: FileText }
];

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatus
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
}) {
  return (
    <motion.div layout whileHover={{ y: -2 }} className="rounded-lg border border-border/70 bg-background/[0.78] p-3 shadow-sm backdrop-blur">
      <div className="flex items-start gap-2">
        <div className="pt-1 text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
            <Badge className={priorityTone[task.priority]}>{task.priority}</Badge>
          </div>
          {task.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className={statusTone[task.status]}>{statusLabels[task.status]}</Badge>
            {task.dueDate && (
              <Badge className={cn("border-border bg-muted text-muted-foreground", isOverdue(task) && "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300")}>
                {formatLongDate(task.dueDate)}
              </Badge>
            )}
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} className="border-border bg-background text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        <p className="text-xs text-muted-foreground">{task.category}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="iconSm" onClick={() => onEdit(task)} aria-label="Edit task" title="Edit">
            <Edit3 className="h-4 w-4" />
          </Button>
          {task.status === "completed" ? (
            <Button variant="ghost" size="iconSm" onClick={() => onStatus(task.id, "pending")} aria-label="Mark pending" title="Pending">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="iconSm" onClick={() => onStatus(task.id, "completed")} aria-label="Mark completed" title="Complete">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          {task.status === "archived" ? (
            <Button variant="ghost" size="iconSm" onClick={() => onStatus(task.id, "pending")} aria-label="Restore task" title="Restore">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="iconSm" onClick={() => onStatus(task.id, "archived")} aria-label="Archive task" title="Archive">
              <Archive className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="iconSm" onClick={() => onDelete(task.id)} aria-label="Delete task" title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function DraggableTaskCard(props: Parameters<typeof TaskCard>[0]) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.task.id,
    data: { task: props.task }
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "relative z-20 opacity-70")}
      {...listeners}
      {...attributes}
    >
      <TaskCard {...props} />
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onStatus
}: {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={cn("min-h-[34rem] rounded-lg border border-border/70 bg-muted/38 p-3 transition-colors", isOver && "border-primary bg-primary/10")}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{statusLabels[status]}</h2>
        <Badge className="border-border bg-background text-muted-foreground">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatus={onStatus} />
        ))}
      </div>
    </div>
  );
}

function TaskDialog({
  open,
  task,
  onClose,
  onCreate,
  onUpdate
}: {
  open: boolean;
  task?: Task;
  onClose: () => void;
  onCreate: (input: TaskInput) => void;
  onUpdate: (id: string, update: Partial<Task>) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "pending",
      tagsText: "",
      dueDate: "",
      category: "General",
      reminder: "",
      notes: "",
      timeSpent: 0
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        tagsText: task.tags.join(", "),
        dueDate: task.dueDate?.slice(0, 10) ?? "",
        category: task.category,
        reminder: task.reminder?.slice(0, 16) ?? "",
        notes: task.notes,
        timeSpent: task.timeSpent
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "Medium",
        status: "pending",
        tagsText: "",
        dueDate: "",
        category: "General",
        reminder: "",
        notes: "",
        timeSpent: 0
      });
    }
  }, [reset, task, open]);

  if (!open) return null;

  const submit = (values: TaskForm) => {
    const payload: TaskInput = {
      title: values.title,
      description: values.description ?? "",
      priority: values.priority,
      status: values.status,
      tags: values.tagsText
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      dueDate: values.dueDate || undefined,
      category: values.category,
      reminder: values.reminder || undefined,
      notes: values.notes ?? "",
      timeSpent: values.timeSpent ?? 0
    };
    if (task) onUpdate(task.id, payload);
    else onCreate(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel mx-auto mt-8 max-h-[calc(100vh-4rem)] max-w-2xl overflow-auto rounded-lg p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{task ? "Edit task" : "New task"}</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <Input {...register("title")} />
            {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea {...register("description")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Priority</span>
            <select className="h-10 w-full rounded-lg border border-input bg-background/75 px-3 text-sm focus-ring" {...register("priority")}>
              {(["Low", "Medium", "High"] as Priority[]).map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select className="h-10 w-full rounded-lg border border-input bg-background/75 px-3 text-sm focus-ring" {...register("status")}>
              {(["pending", "completed", "archived"] as TaskStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Due date</span>
            <Input type="date" {...register("dueDate")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Reminder</span>
            <Input type="datetime-local" {...register("reminder")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <Input {...register("category")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Tags</span>
            <Input placeholder="design, launch" {...register("tagsText")} />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <Textarea {...register("notes")} />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <CheckCircle2 className="h-4 w-4" />
              Save task
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, setStatus, exportCsv, exportPdf, isSaving } = useTasks();
  const viewMode = useUiStore((state) => state.viewMode);
  const setViewMode = useUiStore((state) => state.setViewMode);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [sort, setSort] = useState("dueDate");
  const [page, setPage] = useState(1);
  const [aiText, setAiText] = useState("Launch customer portal; review analytics; schedule security follow up");
  const pageSize = 8;

  useEffect(() => {
    const open = () => {
      setEditingTask(undefined);
      setDialogOpen(true);
    };
    window.addEventListener("aura:new-task", open);
    return () => window.removeEventListener("aura:new-task", open);
  }, []);

  const filtered = useMemo(() => {
    const result = tasks
      .filter((task) => {
        const matchesSearch = [task.title, task.description, task.category, task.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesPriority = priority === "All" || task.priority === priority;
        const matchesStatus = status === "All" || task.status === status;
        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "priority") return ["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority);
        if (sort === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(a.dueDate ?? "2099-01-01").getTime() - new Date(b.dueDate ?? "2099-01-01").getTime();
      });
    return result;
  }, [priority, search, sort, status, tasks]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const nextStatus = event.over?.id as TaskStatus | undefined;
    const task = event.active.data.current?.task as Task | undefined;
    if (task && nextStatus && task.status !== nextStatus) setStatus(task.id, nextStatus);
  };

  const generateTasks = async () => {
    try {
      const data = await apiFetch<{ tasks: TaskInput[] }>("/ai/generate-tasks", {
        method: "POST",
        body: JSON.stringify({ text: aiText })
      });
      data.tasks.forEach((task) => createTask(task));
      toast({ title: "AI tasks generated", type: "success" });
    } catch {
      aiText
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((title, index) =>
          createTask({
            title,
            description: `Generated from prompt: ${title}`,
            priority: title.toLowerCase().includes("security") ? "High" : "Medium",
            dueDate: addDays(new Date(), index + 1).toISOString().slice(0, 10),
            tags: ["ai"],
            category: "AI Plan"
          })
        );
      toast({ title: "AI draft created", type: "info" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const renderKanban = () => (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-3">
        {(["pending", "completed", "archived"] as TaskStatus[]).map((columnStatus) => (
          <KanbanColumn
            key={columnStatus}
            status={columnStatus}
            tasks={filtered.filter((task) => task.status === columnStatus)}
            onEdit={openEdit}
            onDelete={deleteTask}
            onStatus={setStatus}
          />
        ))}
      </div>
    </DndContext>
  );

  const renderList = () => (
    <Card className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-muted/45 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((task) => (
              <tr key={task.id} className="border-b border-border/70">
                <td className="px-4 py-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={priorityTone[task.priority]}>{task.priority}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusTone[task.status]}>{statusLabels[task.status]}</Badge>
                </td>
                <td className="px-4 py-3">{formatLongDate(task.dueDate)}</td>
                <td className="px-4 py-3">{task.category}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(task)} aria-label="Edit task">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="iconSm" onClick={() => setStatus(task.id, task.status === "completed" ? "pending" : "completed")} aria-label="Toggle completion">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="iconSm" onClick={() => deleteTask(task.id)} aria-label="Delete task">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderCalendar = () => {
    const days = eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
    return (
      <Card className="glass-panel p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const due = filtered.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), day));
            return (
              <div key={day.toISOString()} className="min-h-28 rounded-lg border border-border/70 bg-background/60 p-2">
                <p className="text-xs font-semibold text-muted-foreground">{format(day, "d")}</p>
                <div className="mt-2 space-y-1">
                  {due.slice(0, 3).map((task) => (
                    <button key={task.id} onClick={() => openEdit(task)} className="block w-full truncate rounded-md bg-muted px-2 py-1 text-left text-xs hover:bg-muted/70">
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderTimeline = () => (
    <Card className="glass-panel p-5">
      <div className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border">
        {filtered
          .filter((task) => task.dueDate)
          .map((task) => (
            <div key={task.id} className="relative flex gap-4 pl-10">
              <span className={cn("absolute left-2 top-3 h-4 w-4 rounded-full border-4 border-background", task.priority === "High" ? "bg-rose-500" : task.priority === "Medium" ? "bg-blue-500" : "bg-emerald-500")} />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/[0.65] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{formatLongDate(task.dueDate)}</p>
                </div>
                <Badge className={priorityTone[task.priority]}>{task.priority}</Badge>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="rounded-lg border border-white/50 bg-gradient-to-br from-white/[0.85] via-slate-50/[0.82] to-emerald-50/[0.65] p-5 shadow-panel backdrop-blur-xl dark:border-white/10 dark:from-slate-950/[0.74] dark:via-slate-900/70 dark:to-blue-950/[0.22]">
        <div className="grid gap-4 xl:grid-cols-[1fr_26rem]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold sm:text-3xl">Tasks</h1>
              {isSaving && (
                <Badge className="border-border bg-background text-muted-foreground">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Syncing
                </Badge>
              )}
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search tasks" />
              </div>
              <select className="h-10 rounded-lg border border-input bg-background/75 px-3 text-sm focus-ring" value={priority} onChange={(event) => setPriority(event.target.value as Priority | "All")}>
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select className="h-10 rounded-lg border border-input bg-background/75 px-3 text-sm focus-ring" value={status} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "All")}>
                <option>All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <select className="h-10 rounded-lg border border-input bg-background/75 px-3 text-sm focus-ring" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/[0.65] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI generator
            </div>
            <Textarea value={aiText} onChange={(event) => setAiText(event.target.value)} className="min-h-20" />
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={generateTasks}>
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background/70 p-1">
          {viewItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-all",
                  viewMode === item.id && "bg-secondary text-foreground shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={() => {
              setEditingTask(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>
      </section>

      {viewMode === "kanban" && renderKanban()}
      {viewMode === "list" && renderList()}
      {viewMode === "calendar" && renderCalendar()}
      {viewMode === "timeline" && renderTimeline()}

      {viewMode === "list" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </Button>
            <Button variant="outline" disabled={page === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>
              Next
            </Button>
          </div>
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        onClose={() => setDialogOpen(false)}
        onCreate={createTask}
        onUpdate={(id, update) => updateTask({ id, update })}
      />
    </motion.div>
  );
}
