import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastState = {
  toasts: ToastMessage[];
  push: (toast: Omit<ToastMessage, "id">) => void;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 4200);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));

export function toast(message: Omit<ToastMessage, "id">) {
  useToastStore.getState().push(message);
}
