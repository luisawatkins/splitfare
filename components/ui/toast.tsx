"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "default" | "success" | "error";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  notify: (options: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

type ToastProviderProps = {
  children: React.ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback(
    ({
      title,
      description,
      variant = "default"
    }: {
      title: string;
      description?: string;
      variant?: ToastVariant;
    }) => {
      setToasts((items) => [
        ...items,
        {
          id: Date.now(),
          title,
          description,
          variant
        }
      ]);
    },
    []
  );

  const removeToast = (id: number) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center space-y-2 pb-6">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <RadixToast.Root
                key={toast.id}
                duration={3500}
                onOpenChange={(open) => {
                  if (!open) removeToast(toast.id);
                }}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "w-full max-w-sm rounded-lg border px-4 py-3 shadow-lg",
                    "bg-card text-card-foreground",
                    toast.variant === "success" &&
                      "border-emerald-500/40 bg-emerald-500/10 text-emerald-50",
                    toast.variant === "error" &&
                      "border-red-500/40 bg-red-500/10 text-red-50"
                  )}
                >
                  <RadixToast.Title className="text-sm font-medium">
                    {toast.title}
                  </RadixToast.Title>
                  {toast.description && (
                    <RadixToast.Description className="mt-1 text-xs text-muted-foreground">
                      {toast.description}
                    </RadixToast.Description>
                  )}
                </motion.div>
              </RadixToast.Root>
            ))}
          </AnimatePresence>
          <RadixToast.Viewport className="pointer-events-none" />
        </div>
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

