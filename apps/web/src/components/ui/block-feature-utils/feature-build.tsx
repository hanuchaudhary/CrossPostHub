import { motion, useReducedMotion } from "motion/react";
import { Icon } from "../icon";
import { Badge } from "../badge";
export default function FeatureBuild({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`flex min-h-72 flex-col items-center justify-center gap-5 bg-muted/60 p-7 text-center ${className || ""}`}
    >
      <Badge variant="outline">YOUR CREATIVE TOOLKIT</Badge>
      <h3 className="text-3xl font-semibold tracking-tight">
        Built for the way
        <br />
        you build.
      </h3>
      <div className="flex gap-2 py-3">
        {(["layers", "code", "sparkle"] as const).map((name, i) => (
          <motion.div
            key={name}
            className="flex size-16 items-center justify-center rounded-xl border bg-background shadow-sm"
            animate={
              reduce
                ? {}
                : { y: [0, -8, 0], rotate: [i * 9 - 9, i * 9 - 6, i * 9 - 9] }
            }
            transition={{ duration: 4, delay: i * 0.4, repeat: Infinity }}
          >
            <Icon name={name} size={30} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
