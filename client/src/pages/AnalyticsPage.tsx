import { motion } from "framer-motion";
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
import { Activity, BarChart3, Clock3, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";

const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const metrics = [
    { label: "Productivity", value: data.stats.productivityScore, icon: Target },
    { label: "Completion", value: data.stats.completionRate, icon: TrendingUp },
    { label: "Streak", value: data.stats.weeklyStreak * 10, icon: Activity },
    { label: "Time", value: Math.min(100, Math.round(data.stats.timeSpent / 6)), icon: Clock3 }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="rounded-lg border border-white/50 bg-gradient-to-br from-white/[0.85] via-blue-50/70 to-emerald-50/[0.65] p-5 shadow-panel backdrop-blur-xl dark:border-white/10 dark:from-slate-950/[0.74] dark:via-slate-900/70 dark:to-emerald-950/[0.18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />
              Analytics
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Productivity command view</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="w-28 rounded-lg border border-border bg-background/[0.65] p-3">
                  <Icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-xl font-semibold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Velocity trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer>
                <AreaChart data={data.weeklyProgress}>
                  <defs>
                    <linearGradient id="createdGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="doneGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area dataKey="created" stroke="#10b981" fill="url(#createdGradient)" strokeWidth={2} />
                  <Area dataKey="completed" stroke="#8b5cf6" fill="url(#doneGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Priority mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.priorityDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={4}>
                    {data.priorityDistribution.map((_entry, index) => (
                      <Cell key={index} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.priorityDistribution.map((item, index) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <Progress value={(item.value / Math.max(1, data.stats.total)) * 100} className="h-2" />
                  <span className="sr-only" style={{ color: colors[index] }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Monthly completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={data.monthlyReports}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Category load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.categoryDistribution.map((item, index) => (
              <div key={item.name} className="rounded-lg border border-border/70 bg-background/60 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / Math.max(1, data.stats.total)) * 100}%`, background: colors[index % colors.length] }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
