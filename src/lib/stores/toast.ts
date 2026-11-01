import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, "id" | "variant"> & { variant?: ToastVariant }) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { variant: "success", ...toast, id: crypto.randomUUID() },
      ],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const showToast = (
  toast: Omit<Toast, "id" | "variant"> & { variant?: ToastVariant },
) => useToasts.getState().show(toast);
