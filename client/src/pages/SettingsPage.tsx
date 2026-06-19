import { motion } from "framer-motion";
import { Bell, Database, Download, Laptop, Moon, Save, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";
import type { ThemeMode } from "@/types";

const themeItems: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop }
];

export default function SettingsPage() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { exportCsv, exportPdf } = useTasks();

  const togglePreference = (key: "compactMode" | "reminders") => {
    if (!user) return;
    updateUser({
      preferences: {
        ...user.preferences,
        [key]: !user.preferences[key]
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-lg border border-white/50 bg-white/[0.78] p-5 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.62]">
        <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-sm font-medium">
          <Save className="h-4 w-4 text-primary" />
          Settings
        </p>
        <h1 className="text-2xl font-semibold">Workspace preferences</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {themeItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  className={`rounded-lg border p-4 text-left transition-all ${theme === item.value ? "border-primary bg-primary/10" : "border-border bg-background/[0.65] hover:bg-muted"}`}
                  onClick={() => setTheme(item.value)}
                >
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">{item.label}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => togglePreference("reminders")}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-background/[0.65] p-3 text-left"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <Bell className="h-4 w-4 text-primary" />
                Reminders
              </span>
              <span className={`h-6 w-11 rounded-full p-1 transition-colors ${user?.preferences.reminders ? "bg-primary" : "bg-muted"}`}>
                <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${user?.preferences.reminders ? "translate-x-5" : ""}`} />
              </span>
            </button>
            <button
              onClick={() => togglePreference("compactMode")}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-background/[0.65] p-3 text-left"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <Database className="h-4 w-4 text-primary" />
                Compact density
              </span>
              <span className={`h-6 w-11 rounded-full p-1 transition-colors ${user?.preferences.compactMode ? "bg-primary" : "bg-muted"}`}>
                <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${user?.preferences.compactMode ? "translate-x-5" : ""}`} />
              </span>
            </button>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Exports</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Offline cache refreshed", type: "success" })}>
            <Database className="h-4 w-4" />
            Refresh cache
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
