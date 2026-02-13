import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  return time;
}

export function isOverdue(
  date: Date | string | null | undefined,
  status: string,
): boolean {
  if (!date || status === "completed") return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date() && status !== "completed";
}
