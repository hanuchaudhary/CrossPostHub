import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type AlertTone = "success" | "error" | "warning" | "info";
export const ALERT_MARKS = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export function StatusBadge({ state }: { state: "loading" | "done" }) {
  const reduced = useReducedMotion();
  const done = state === "done";
  return (
    <svg
      data-slot="spinner"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-(--check-size) shrink-0"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={9} className="opacity-20" />
      <motion.circle
        cx={12}
        cy={12}
        r={9}
        strokeDasharray="42 15"
        style={{ transformOrigin: "center" }}
        animate={{ rotate: done || reduced ? 0 : 360, opacity: done ? 0 : 1 }}
        transition={{
          rotate: {
            duration: 1,
            repeat: done || reduced ? 0 : Infinity,
            ease: "linear",
          },
          opacity: { duration: 0.15 },
        }}
      />
      <motion.path
        d="m7 12 3 3 7-7"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.24 }}
      />
    </svg>
  );
}
