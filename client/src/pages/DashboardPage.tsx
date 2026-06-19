import { motion } from "framer-motion";
import { addDays, eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Flame, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTasks } from "@/hooks/useTasks";
import { cn, formatDate, priorityTone, statusTone } from "@/lib/utils";
import type { Task } from "@/types";

const chartColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof CheckCircle2;
  accent: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Card className="glass-panel overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
            <div className={cn("grid h-10 w-10 place-items-center rounded-lg text-white shadow-sm", accent)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CalendarWidget({ tasks }: { tasks: Task[] }) {
  const days = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  return (
    <Card className="glass-panel">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Calendar</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const due = tasks.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), day));
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square rounded-md border border-transparent p-1 text-xs transition-colors",
                  isSameDay(day, new Date()) && "border-primary bg-primary/10",
                  due.length > 0 && "bg-background/70"
                )}
              >
                <span>{format(day, "d")}</span>
                <div className="mt-1 flex gap-0.5">
                  {due.slice(0, 2).map((task) => (
                    <span key={task.id} className={cn("h-1.5 w-1.5 rounded-full", task.priority === "High" ? "bg-rose-500" : task.priority === "Medium" ? "bg-blue-500" : "bg-emerald-500")} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { data, isLoading } = useAnalytics();

  if (isLoading || tasksLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-white/50 bg-gradient-to-br from-white/[0.84] via-indigo-50/[0.74] to-emerald-50/70 p-6 shadow-panel backdrop-blur-xl dark:border-white/10 dark:from-slate-950/70 dark:via-slate-900/[0.72] dark:to-emerald-950/[0.28]">
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI summary
            </div>
            <h1 className="text-balance text-3xl font-semibold sm:text-4xl">Welcome back, ABHINAV.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{data.aiSummary}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Completion</p>
              <p className="text-2xl font-semibold">{data.stats.completionRate}%</p>
            </div>
            <Progress value={data.stats.completionRate} className="mt-4" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted/70 p-2">
                <p className="font-semibold">{data.stats.pending}</p>
                <p className="text-muted-foreground">Open</p>
              </div>
              <div className="rounded-md bg-muted/70 p-2">
                <p className="font-semibold">{data.stats.completed}</p>
                <p className="text-muted-foreground">Done</p>
              </div>
              <div className="rounded-md bg-muted/70 p-2">
                <p className="font-semibold">{data.stats.overdue}</p>
                <p className="text-muted-foreground">Late</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tasks completed" value={data.stats.completed} detail="Closed across active projects" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard label="Productivity score" value={data.stats.productivityScore} detail="Blended from output and risk" icon={Target} accent="bg-blue-500" />
        <StatCard label="Weekly streak" value={`${data.stats.weeklyStreak}d`} detail="Consecutive completion days" icon={Flame} accent="bg-amber-500" />
        <StatCard label="Time spent" value={`${Math.round(data.stats.timeSpent / 60)}h`} detail="Tracked focused work" icon={Clock3} accent="bg-violet-500" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="glass-panel">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly progress</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={data.weeklyProgress}>
                  <defs>
                    <linearGradient id="completed" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="completed" stroke="#3b82f6" fill="url(#completed)" strokeWidth={2} />
                  <Area type="monotone" dataKey="created" stroke="#10b981" fill="#10b98122" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Task distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.priorityDistribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={4}>
                    {data.priorityDistribution.map((_entry, index) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {data.priorityDistribution.map((item, index) => (
                <div key={item.name} className="rounded-md bg-background/60 p-2 text-center text-xs">
                  <span className="mx-auto mb-1 block h-2 w-8 rounded-full" style={{ background: chartColors[index] }} />
                  <p className="font-semibold">{item.value}</p>
                  <p className="text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_22rem]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Monthly reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data.monthlyReports}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingDeadlines.length === 0 && <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
            {data.upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/[0.55] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
                </div>
                <Badge className={priorityTone[task.priority]}>{task.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <CalendarWidget tasks={tasks} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-background/[0.55] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</p>
                </div>
                <Badge className={statusTone[item.status]}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Next seven days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 7 }, (_item, index) => {
              const day = addDays(new Date(), index);
              const due = tasks.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), day));
              return (
                <div key={day.toISOString()} className="flex items-center gap-3 rounded-lg bg-background/[0.55] p-3">
                  <div className="w-14 text-sm font-semibold">{format(day, "EEE")}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{due.length ? due.map((task) => task.title).join(", ") : "Open focus block"}</p>
                  </div>
                  <Badge className="border-border bg-muted text-muted-foreground">{due.length}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
