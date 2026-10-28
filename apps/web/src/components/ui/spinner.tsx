import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
function Spinner({
  className,
  ...props
}: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="inline-flex"
      animate={reduced ? {} : { rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <HugeiconsIcon
        icon={Loading03Icon}
        strokeWidth={2}
        data-slot="spinner"
        role="status"
        aria-label="Loading"
        className={cn("size-4", className)}
        {...props}
      />
    </motion.span>
  );
}
export { Spinner };
