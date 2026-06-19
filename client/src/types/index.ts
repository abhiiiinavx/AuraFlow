export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "pending" | "completed" | "archived";
export type ViewMode = "kanban" | "list" | "calendar" | "timeline";
export type ThemeMode = "light" | "dark" | "system";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  emailVerified: boolean;
  preferences: {
    theme: ThemeMode;
    compactMode: boolean;
    reminders: boolean;
  };
  createdAt: string;
};

export type Task = {
  id: string;
  _id?: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  tags: string[];
  dueDate?: string;
  category: string;
  reminder?: string;
  notes: string;
  order: number;
  timeSpent: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  tags?: string[];
  dueDate?: string;
  category?: string;
  reminder?: string;
  notes?: string;
  order?: number;
  timeSpent?: number;
};

export type NotificationItem = {
  id: string;
  _id?: string;
  message: string;
  type: "info" | "success" | "warning" | "deadline";
  read: boolean;
  taskId?: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  stats: {
    total: number;
    completed: number;
    pending: number;
    archived: number;
    overdue: number;
    completionRate: number;
    productivityScore: number;
    weeklyStreak: number;
    timeSpent: number;
  };
  weeklyProgress: Array<{ day: string; completed: number; created: number }>;
  priorityDistribution: Array<{ name: Priority; value: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  monthlyReports: Array<{ month: string; completed: number }>;
  recentActivity: Array<{ id: string; title: string; status: TaskStatus; updatedAt: string }>;
  upcomingDeadlines: Task[];
  aiSummary: string;
};

export type PaginatedTasks = {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
