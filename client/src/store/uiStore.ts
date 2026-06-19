import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode, ViewMode } from "@/types";

type UiState = {
  theme: ThemeMode;
  sidebarOpen: boolean;
  viewMode: ViewMode;
  commandOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setCommandOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: false,
      viewMode: "kanban",
      commandOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setViewMode: (viewMode) => set({ viewMode }),
      setCommandOpen: (commandOpen) => set({ commandOpen })
    }),
    {
      name: "aura-ui"
    }
  )
);
