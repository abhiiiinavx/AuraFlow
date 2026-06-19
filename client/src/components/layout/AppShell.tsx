import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare2,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  X
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNotifications } from "@/hooks/useNotifications";
import { useSocket } from "@/hooks/useSocket";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Inbox", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings }
];

function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const navigate = useNavigate();

  const signOut = () => {
    disconnectSocket();
    logout();
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-r border-border/70 bg-background/[0.72] px-3 py-4 backdrop-blur-xl",
        !mobile && "hidden lg:flex"
      )}
    >
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 via-blue-500 to-violet-500 text-white shadow-glow">
          <CheckSquare2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Aura</p>
          <p className="truncate text-xs text-muted-foreground">Task Suite</p>
        </div>
        {mobile && (
          <Button className="ml-auto" variant="ghost" size="iconSm" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                  isActive && "bg-secondary text-foreground shadow-sm"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-border/70 bg-gradient-to-br from-white/80 to-slate-100/70 p-3 dark:from-white/8 dark:to-slate-900/70">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Queue
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md bg-background/70 p-2">
            <p className="font-semibold">8</p>
            <p className="text-muted-foreground">Ideas</p>
          </div>
          <div className="rounded-md bg-background/70 p-2">
            <p className="font-semibold">4</p>
            <p className="text-muted-foreground">Due</p>
          </div>
          <div className="rounded-md bg-background/70 p-2">
            <p className="font-semibold">91</p>
            <p className="text-muted-foreground">Score</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-lg border border-border/70 bg-background/70 p-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold">
          {user?.name.slice(0, 1) ?? "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="ghost" size="iconSm" onClick={signOut} aria-label="Logout" title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

function CommandPalette() {
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const navigate = useNavigate();
  const actions = [
    { label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/") },
    { label: "Task board", icon: CheckSquare2, action: () => navigate("/tasks") },
    { label: "Analytics", icon: BarChart3, action: () => navigate("/analytics") },
    { label: "Create task", icon: Plus, action: () => window.dispatchEvent(new Event("aura:new-task")) }
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-slate-950/30 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -12, scale: 0.98 }}
            className="glass-panel mx-auto mt-20 max-w-xl rounded-lg p-2"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Command className="h-4 w-4 text-muted-foreground" />
              <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" autoFocus placeholder="Search actions" />
            </div>
            <div className="p-2">
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => {
                      item.action();
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);
  const { unread } = useNotifications();
  useKeyboardShortcuts();
  useSocket();

  return (
    <div className="surface-grid min-h-screen bg-[linear-gradient(145deg,rgba(248,250,252,0.96),rgba(238,242,255,0.78),rgba(236,253,245,0.7))] dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.98),rgba(15,23,42,0.92),rgba(17,24,39,0.96))]">
      <div className="flex min-h-screen">
        <Sidebar />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-slate-950/30" onClick={() => setSidebarOpen(false)} />
              <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className="relative h-full w-72">
                <Sidebar mobile />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/[0.68] backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
              <button
                className="hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background/[0.65] px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="truncate">Search tasks, projects, and actions</span>
              </button>
              <Button variant="outline" size="icon" onClick={() => setCommandOpen(true)} className="sm:hidden" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={() => navigate("/notifications")} aria-label="Notifications" className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{unread}</span>}
              </Button>
              <Button
                onClick={() => {
                  if (location.pathname !== "/tasks") navigate("/tasks");
                  window.setTimeout(() => window.dispatchEvent(new Event("aura:new-task")), 80);
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New task</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
