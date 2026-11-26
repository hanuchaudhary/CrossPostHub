import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/components/theme-provider";
import { Spinner } from "@/components/ui/spinner";

function Badge({
  tone,
  path,
}: {
  tone: "success" | "error" | "warning" | "info";
  path: string;
}) {
  const fill = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
  }[tone];
  return (
    <span
      className={`grid size-6 place-items-center rounded-full text-white ${fill} animate-[toast-pop_420ms_cubic-bezier(0.3,1.4,0.5,1)_both] motion-reduce:animate-none`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={path}
          pathLength={1}
          className="[stroke-dasharray:1] animate-[toast-draw_360ms_ease-out_160ms_both] motion-reduce:animate-none"
        />
      </svg>
    </span>
  );
}

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="top-center"
      gap={8}
      offset={16}
      icons={{
        loading: <Spinner className="size-5 text-muted-foreground" />,
        success: <Badge tone="success" path="M5 12.5l4.5 4.5L19 7.5" />,
        error: <Badge tone="error" path="M7 7l10 10M17 7L7 17" />,
        warning: <Badge tone="warning" path="M12 7v6M12 17h.01" />,
        info: <Badge tone="info" path="M12 11v6M12 7h.01" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-center gap-3 rounded-2xl bg-popover py-3 pr-4 pl-3 text-sm text-popover-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_12px_32px_-12px_rgb(0_0_0/0.25)] ring-1 ring-foreground/10",
          icon: "relative flex size-6 shrink-0 items-center justify-center",
          loader: "static! inset-auto! translate-none! transform-none!",
          content: "min-w-0 flex-1",
          title: "font-medium leading-snug",
          description: "mt-0.5 text-xs text-muted-foreground",
          actionButton:
            "ml-auto shrink-0 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground",
          cancelButton:
            "shrink-0 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground",
          closeButton: "hidden",
        },
      }}
    />
  );
}
