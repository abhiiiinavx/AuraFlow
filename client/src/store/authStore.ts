import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoUser } from "@/lib/demoData";
import type { User } from "@/types";

type AuthState = {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  loginDemo: () => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      loginDemo: () => set({ user: demoUser, token: "demo-token" }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null
        })),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: "aura-auth"
    }
  )
);
