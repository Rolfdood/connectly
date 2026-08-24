import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return relativeTime.format(diffSeconds, "second");

  const minutes = Math.round(diffSeconds / 60);
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");

  const hours = Math.round(diffSeconds / 3600);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");

  const days = Math.round(diffSeconds / 86400);
  return relativeTime.format(days, "day");
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
