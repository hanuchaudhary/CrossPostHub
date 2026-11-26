import { type ExternalToast, toast as sonner } from "sonner";

export const TOAST_EVENT = "kobra:toast";
export type ToastState = "success" | "error" | "warning" | "info";

const sound = (state: ToastState) =>
  window.dispatchEvent(
    new CustomEvent<{ state: ToastState }>(TOAST_EVENT, { detail: { state } })
  );

type Message<T> = string | ((value: T) => string);

const text = <T>(message: Message<T>, value: T) =>
  typeof message === "function" ? message(value) : message;

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    sound("success");
    return sonner.success(message, options);
  },
  error: (message: string, options?: ExternalToast) => {
    sound("error");
    return sonner.error(message, options);
  },
  info: (message: string, options?: ExternalToast) => {
    sound("info");
    return sonner.info(message, options);
  },
  warning: (message: string, options?: ExternalToast) => {
    sound("warning");
    return sonner.warning(message, options);
  },
  loading: (message: string, options?: ExternalToast) =>
    sonner.loading(message, options),
  dismiss: (id?: string | number) => sonner.dismiss(id),
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: Message<T>;
      error: Message<unknown>;
    },
    options?: ExternalToast
  ) {
    const id = sonner.loading(messages.loading, options);
    promise.then(
      (value) => {
        sound("success");
        sonner.success(text(messages.success, value), { ...options, id });
      },
      (error: unknown) => {
        sound("error");
        sonner.error(text(messages.error, error), { ...options, id });
      }
    );
    return promise;
  },
};
