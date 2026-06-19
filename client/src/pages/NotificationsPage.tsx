import { motion } from "framer-motion";
import { Bell, CheckCheck, Clock, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDate } from "@/lib/utils";

const iconMap = {
  info: Info,
  success: CheckCheck,
  warning: TriangleAlert,
  deadline: Clock
};

export default function NotificationsPage() {
  const { notifications, unread, isLoading, markAllRead } = useNotifications();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/50 bg-white/[0.78] p-5 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.62]">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-sm font-medium">
            <Bell className="h-4 w-4 text-primary" />
            Inbox
          </p>
          <h1 className="text-2xl font-semibold">{unread} unread notifications</h1>
        </div>
        <Button variant="outline" onClick={() => markAllRead()}>
          <CheckCheck className="h-4 w-4" />
          Mark read
        </Button>
      </section>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Activity feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          )}
          {!isLoading && notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type];
            return (
              <div
                key={notification.id}
                className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/[0.65] p-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
