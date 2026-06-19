import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";
import { demoUser } from "@/lib/demoData";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import type { User } from "@/types";

type Mode = "login" | "signup" | "forgot" | "reset";

const schemaByMode = {
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  signup: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  }),
  forgot: z.object({
    email: z.string().email()
  }),
  reset: z.object({
    token: z.string().min(16),
    password: z.string().min(8)
  })
};

type AuthForm = {
  name?: string;
  email?: string;
  password?: string;
  token?: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const loginDemo = useAuthStore((state) => state.loginDemo);

  const schema = useMemo<z.AnyZodObject>(() => schemaByMode[mode], [mode]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AuthForm>({
    resolver: zodResolver(schema) as Resolver<AuthForm>
  });

  if (token) return <Navigate to="/" replace />;

  const submit = async (values: AuthForm) => {
    try {
      if (mode === "forgot") {
        await apiFetch("/auth/forgot-password", {
          method: "POST",
          auth: false,
          body: JSON.stringify({ email: values.email })
        });
        toast({ title: "Reset email sent", type: "success" });
        setMode("reset");
        reset();
        return;
      }

      const path = mode === "signup" ? "/auth/register" : mode === "reset" ? "/auth/reset-password" : "/auth/login";
      const data = await apiFetch<AuthResponse>(path, {
        method: "POST",
        auth: false,
        body: JSON.stringify(values)
      });
      setSession(data.user, data.token);
      toast({ title: "Welcome back", description: data.user.name, type: "success" });
      navigate("/");
    } catch {
      if (mode === "login" || mode === "signup") {
        setSession(demoUser, "auraflow-admin-token");
        toast({ title: "Demo workspace loaded", type: "info" });
        navigate("/");
        return;
      }
      toast({ title: "Request failed", description: "Check the token or server connection.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fafc,#eef2ff,#ecfdf5)] text-foreground dark:bg-[linear-gradient(135deg,#020617,#111827,#0f172a)]">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 via-blue-500 to-violet-500 text-white shadow-glow">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Aura Task Suite</p>
              <p className="text-sm text-muted-foreground">AI-powered operations workspace</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/70 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-primary" />
              Intelligent planning, execution, and reporting
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-tight text-slate-950 dark:text-white">
              A focused command center for tasks, deadlines, and team momentum.
            </h1>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            {[
              ["Completion", 82],
              ["Focus score", 91],
              ["Weekly streak", 4],
              ["High priority", 7]
            ].map(([label, value]) => (
              <Card key={label} className="glass-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
                <Progress value={Number(value)} className="mt-4" />
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}>
          <Card className="glass-panel mx-auto w-full max-w-md p-6">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 via-blue-500 to-violet-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Aura Task Suite</p>
                <p className="text-xs text-muted-foreground">AI workspace</p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              {(["login", "signup"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    reset();
                  }}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-all",
                    mode === item ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <Input placeholder="ABHINAV PRATAP SINGH" {...register("name")} />
                  {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                </label>
              )}

              {(mode === "login" || mode === "signup" || mode === "forgot") && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Email</span>
                  <Input placeholder="abhinavaps285@gmail.com" type="email" {...register("email")} />
                  {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                </label>
              )}

              {mode === "reset" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Reset token</span>
                  <Input placeholder="Paste token" {...register("token")} />
                  {errors.token && <span className="text-xs text-destructive">{errors.token.message}</span>}
                </label>
              )}

              {mode !== "forgot" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Password</span>
                  <Input placeholder="Minimum 8 characters" type="password" {...register("password")} />
                  {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                </label>
              )}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset email" : mode === "reset" ? "Reset password" : "Login"}
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => {
                  setMode(mode === "forgot" ? "login" : "forgot");
                  reset();
                }}
              >
                <Mail className="h-4 w-4" />
                {mode === "forgot" ? "Back to login" : "Forgot password"}
              </button>
              <button
                className="font-medium text-primary transition-colors hover:text-primary/80"
                onClick={() => {
                  loginDemo();
                  navigate("/");
                }}
              >
                Demo workspace
              </button>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
