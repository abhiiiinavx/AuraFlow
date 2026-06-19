import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, MailCheck, Save, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import type { User } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  verificationToken: z.string().optional()
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? "");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      verificationToken: ""
    }
  });

  const submit = async (values: ProfileForm) => {
    try {
      const data = await apiFetch<{ user: User }>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: values.name })
      });
      updateUser(data.user);
    } catch {
      updateUser({ name: values.name });
    }

    if (values.verificationToken) {
      try {
        const data = await apiFetch<{ user: User; token: string }>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token: values.verificationToken })
        });
        updateUser(data.user);
      } catch {
        toast({ title: "Verification failed", type: "error" });
      }
    }

    toast({ title: "Profile saved", type: "success" });
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    if (!token || token === "auraflow-admin-token") {
      toast({ title: "Avatar preview updated", type: "info" });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (response.ok) {
      const data = (await response.json()) as { user: User };
      updateUser(data.user);
      toast({ title: "Avatar uploaded", type: "success" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-lg border border-white/50 bg-gradient-to-br from-white/[0.85] via-slate-50/80 to-blue-50/70 p-5 shadow-panel backdrop-blur-xl dark:border-white/10 dark:from-slate-950/[0.72] dark:via-slate-900/70 dark:to-blue-950/[0.18]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-lg border border-border bg-muted text-2xl font-semibold"
            onClick={() => inputRef.current?.click()}
          >
            {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : user?.name.slice(0, 1)}
            <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-md bg-background shadow">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Profile
            </p>
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Name</span>
                <Input {...register("name")} />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <Input disabled {...register("email")} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Verification token</span>
                <Input {...register("verificationToken")} />
              </label>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-background/[0.65] p-3">
              {user?.emailVerified ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <MailCheck className="h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">{user?.emailVerified ? "Verified email" : "Email pending"}</p>
                <p className="text-xs text-muted-foreground">Role: {user?.role}</p>
              </div>
            </div>
            <div className="rounded-lg bg-background/[0.65] p-3">
              <p className="text-sm font-medium">Workspace</p>
              <p className="text-xs text-muted-foreground">Personal productivity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
