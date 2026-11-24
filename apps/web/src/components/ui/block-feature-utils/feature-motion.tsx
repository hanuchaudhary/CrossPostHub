import { motion, useReducedMotion } from "motion/react";
export default function FeatureMotion({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`flex min-h-66 flex-col items-center justify-center bg-muted/40 px-5 py-6 ${className || ""}`}
    >
      <div className="relative flex h-36 w-40 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-20 w-36 rounded-[50%] border border-foreground/20"
            animate={
              reduce ? { rotate: i * 60 } : { rotate: [i * 60, i * 60 + 360] }
            }
            transition={{
              duration: 14 + i * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute left-3 top-2 size-2 rounded-full bg-foreground/50" />
          </motion.span>
        ))}
        <b className="font-serif text-5xl italic">m</b>
      </div>
      <h3 className="text-center text-xl font-medium tracking-tight">
        Smooth animations
        <br />
        with motion.
      </h3>
    </div>
  );
}
