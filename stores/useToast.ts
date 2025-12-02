import { create } from "zustand";

export interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "warning" | "info";
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
    removeToast: (id: number) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
    toasts: [],
    addToast: (message, type) => {
        const toastId = Date.now();
        set((state) => ({
            toasts: [...state.toasts, { id: toastId, message, type }],
        }));

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((toast) => toast.id !== toastId),
            }));
        }, 3000);
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
}));