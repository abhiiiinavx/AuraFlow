import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isPast, isToday, parseISO } from "date-fns";
import type { Priority, Task, TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function taskId(task: Pick<Task, "id" | "_id">) {
  return task.id ?? task._id ?? crypto.randomUUID();
}

export function formatDate(date?: string, fallback = "No date") {
  if (!date) return fallback;
  return format(parseISO(date), "MMM d");
}

export function formatLongDate(date?: string) {
  if (!date) return "No deadline";
  return format(parseISO(date), "MMM d, yyyy");
}

export function isOverdue(task: Task) {
  return task.status === "pending" && Boolean(task.dueDate) && isPast(parseISO(task.dueDate as string)) && !isToday(parseISO(task.dueDate as string));
}

export const priorityTone: Record<Priority, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
  Medium: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300",
  High: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
};

export const statusTone: Record<TaskStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
  archived: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-300"
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function toCsv(tasks: Task[]) {
  const headers = ["Title", "Description", "Priority", "Status", "Tags", "Due Date", "Category", "Time Spent"];
  const rows = tasks.map((task) => [
    task.title,
    task.description,
    task.priority,
    task.status,
    task.tags.join(", "),
    task.dueDate ?? "",
    task.category,
    task.timeSpent
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

const escapePdf = (text: string) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const byteLength = (value: string) => new TextEncoder().encode(value).length;

export function tasksToPdfBlob(tasks: Task[]) {
  const lines = [
    "Aura Task Suite Export",
    `Generated tasks: ${tasks.length}`,
    "",
    ...tasks.slice(0, 42).map((task, index) => {
      const due = task.dueDate ? task.dueDate.slice(0, 10) : "No due date";
      return `${index + 1}. [${task.priority}] ${task.title} - ${task.status} - ${due}`;
    })
  ];

  const content = [
    "BT",
    "/F1 16 Tf",
    "50 790 Td",
    `(${escapePdf(lines[0] ?? "Aura Task Suite Export")}) Tj`,
    "/F1 10 Tf",
    ...lines.slice(1).flatMap((line) => ["0 -18 Td", `(${escapePdf(line)}) Tj`]),
    "ET"
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
