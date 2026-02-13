import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl",
        className,
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold text-gray-900 dark:text-white",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-end space-x-2 mt-6", className)}>
      {children}
    </div>
  );
}
