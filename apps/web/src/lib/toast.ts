import { toast as notify } from "@/components/ui/toast";
import type { ToastInput } from "@/components/ui/toast";

export const toast = {
  success: (
    message: string,
    options: Omit<ToastInput, "message" | "state"> = {}
  ) => notify({ ...options, message, state: "success" }),
  error: (
    message: string,
    options: Omit<ToastInput, "message" | "state"> = {}
  ) => notify({ ...options, message, state: "error" }),
};
