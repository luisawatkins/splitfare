import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  handle?: ReactNode;
};

const dragThreshold = 80;

export function BottomSheet({
  open,
  onOpenChange,
  children,
  handle
}: BottomSheetProps) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > dragThreshold) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-popover p-4 shadow-lg"
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0, bottom: 200 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-2 flex justify-center">
                  {handle ?? (
                    <div className="h-1.5 w-10 rounded-full bg-muted" />
                  )}
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

