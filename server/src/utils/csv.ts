import type { ITask } from "../models/Task.js";

const escapeCsv = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export function tasksToCsv(tasks: ITask[]) {
  const headers = [
    "Title",
    "Description",
    "Priority",
    "Status",
    "Tags",
    "Due Date",
    "Category",
    "Reminder",
    "Created At"
  ];
  const rows = tasks.map((task) => [
    task.title,
    task.description,
    task.priority,
    task.status,
    task.tags.join(", "),
    task.dueDate?.toISOString() ?? "",
    task.category,
    task.reminder?.toISOString() ?? "",
    task.createdAt.toISOString()
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}
