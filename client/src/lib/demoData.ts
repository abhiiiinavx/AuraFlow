import { addDays, formatISO, subDays } from "date-fns";
import type { AnalyticsSummary, NotificationItem, Task, User } from "@/types";

const today = new Date();

export const demoUser: User = {
  id: "demo-user",
  name: "ABHINAV PRATAP SINGH",
  email: "abhinavaps285@gmail.com",
  avatar: "",
  role: "user",
  emailVerified: true,
  preferences: {
    theme: "system",
    compactMode: false,
    reminders: true
  },
  createdAt: formatISO(subDays(today, 42))
};

export const demoTasks: Task[] = [
  {
    id: "task-1",
    title: "Ship onboarding workspace polish",
    description: "Tighten first-run states, empty states, and new user checklist sequencing.",
    priority: "High",
    status: "pending",
    tags: ["product", "launch"],
    dueDate: formatISO(addDays(today, 1), { representation: "date" }),
    category: "Product",
    reminder: formatISO(today),
    notes: "Coordinate copy changes with lifecycle email.",
    order: 1,
    timeSpent: 90,
    createdAt: formatISO(subDays(today, 5)),
    updatedAt: formatISO(subDays(today, 1))
  },
  {
    id: "task-2",
    title: "Review Q3 analytics dashboard",
    description: "Validate productivity score calculations and add chart annotations.",
    priority: "Medium",
    status: "completed",
    tags: ["analytics", "growth"],
    dueDate: formatISO(subDays(today, 1), { representation: "date" }),
    category: "Analytics",
    notes: "Completed with finance assumptions.",
    order: 2,
    timeSpent: 135,
    createdAt: formatISO(subDays(today, 6)),
    updatedAt: formatISO(today)
  },
  {
    id: "task-3",
    title: "Prepare enterprise security follow-up",
    description: "Create a concise response for SSO, audit logs, and data retention.",
    priority: "High",
    status: "pending",
    tags: ["sales", "security"],
    dueDate: formatISO(addDays(today, 2), { representation: "date" }),
    category: "Enterprise",
    notes: "Use latest SOC2 language.",
    order: 3,
    timeSpent: 45,
    createdAt: formatISO(subDays(today, 3)),
    updatedAt: formatISO(today)
  },
  {
    id: "task-4",
    title: "Refine recurring reminder copy",
    description: "Make reminders shorter and less noisy across email and in-app surfaces.",
    priority: "Low",
    status: "pending",
    tags: ["notifications"],
    dueDate: formatISO(addDays(today, 5), { representation: "date" }),
    category: "Messaging",
    notes: "",
    order: 4,
    timeSpent: 20,
    createdAt: formatISO(subDays(today, 8)),
    updatedAt: formatISO(subDays(today, 2))
  },
  {
    id: "task-5",
    title: "Archive stale launch checklist",
    description: "Move old checklist items out of the active workspace.",
    priority: "Low",
    status: "archived",
    tags: ["ops"],
    dueDate: formatISO(subDays(today, 10), { representation: "date" }),
    category: "Operations",
    notes: "",
    order: 5,
    timeSpent: 15,
    createdAt: formatISO(subDays(today, 20)),
    updatedAt: formatISO(subDays(today, 9))
  },
  {
    id: "task-6",
    title: "Design keyboard shortcut overlay",
    description: "Create compact command palette hints for common task actions.",
    priority: "Medium",
    status: "pending",
    tags: ["ux", "accessibility"],
    dueDate: formatISO(addDays(today, 7), { representation: "date" }),
    category: "Design",
    notes: "Keep copy short and scannable.",
    order: 6,
    timeSpent: 55,
    createdAt: formatISO(subDays(today, 2)),
    updatedAt: formatISO(today)
  }
];

export const demoNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    message: "Ship onboarding workspace polish is due tomorrow.",
    type: "deadline",
    read: false,
    taskId: "task-1",
    createdAt: formatISO(today)
  },
  {
    id: "notif-2",
    message: "Review Q3 analytics dashboard was completed.",
    type: "success",
    read: false,
    taskId: "task-2",
    createdAt: formatISO(subDays(today, 1))
  },
  {
    id: "notif-3",
    message: "AI scheduling suggested 3 deadline updates.",
    type: "info",
    read: true,
    createdAt: formatISO(subDays(today, 2))
  }
];

export function buildAnalytics(tasks: Task[] = demoTasks): AnalyticsSummary {
  const completed = tasks.filter((task) => task.status === "completed");
  const pending = tasks.filter((task) => task.status === "pending");
  const archived = tasks.filter((task) => task.status === "archived");
  const total = tasks.length;
  const completionRate = total ? Math.round((completed.length / total) * 100) : 0;
  const overdue = pending.filter((task) => task.dueDate && new Date(task.dueDate) < today).length;
  const categories = [...new Set(tasks.map((task) => task.category))];

  return {
    stats: {
      total,
      completed: completed.length,
      pending: pending.length,
      archived: archived.length,
      overdue,
      completionRate,
      productivityScore: Math.max(0, Math.min(100, completionRate + completed.length * 8 - overdue * 4)),
      weeklyStreak: 4,
      timeSpent: tasks.reduce((sum, task) => sum + task.timeSpent, 0)
    },
    weeklyProgress: [
      { day: "Mon", completed: 2, created: 3 },
      { day: "Tue", completed: 4, created: 2 },
      { day: "Wed", completed: 3, created: 5 },
      { day: "Thu", completed: 5, created: 3 },
      { day: "Fri", completed: 6, created: 4 },
      { day: "Sat", completed: 2, created: 1 },
      { day: "Sun", completed: 3, created: 2 }
    ],
    priorityDistribution: [
      { name: "Low", value: tasks.filter((task) => task.priority === "Low").length },
      { name: "Medium", value: tasks.filter((task) => task.priority === "Medium").length },
      { name: "High", value: tasks.filter((task) => task.priority === "High").length }
    ],
    categoryDistribution: categories.map((category) => ({
      name: category,
      value: tasks.filter((task) => task.category === category).length
    })),
    monthlyReports: [
      { month: "Jan", completed: 18 },
      { month: "Feb", completed: 26 },
      { month: "Mar", completed: 31 },
      { month: "Apr", completed: 28 },
      { month: "May", completed: 37 },
      { month: "Jun", completed: 42 }
    ],
    recentActivity: tasks.slice(0, 5).map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      updatedAt: task.updatedAt
    })),
    upcomingDeadlines: pending.filter((task) => task.dueDate).slice(0, 5),
    aiSummary: `Completed ${completed.length} meaningful tasks while keeping ${pending.length} active items in motion.`
  };
}
