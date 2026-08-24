import { toast } from "sonner";

export const TOAST_DURATION = {
  success: 4000,
  error: 6000,
} as const;

interface ToastOptions {
  description?: string;
  id?: string | number;
}

export function showSuccessToast(message: string, opts: ToastOptions = {}) {
  return toast.success(message, {
    duration: TOAST_DURATION.success,
    ...opts,
  });
}

export function showErrorToast(message: string, opts: ToastOptions = {}) {
  return toast.error(message, {
    duration: TOAST_DURATION.error,
    ...opts,
  });
}
