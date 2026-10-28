import { useState } from "react";

import { cn } from "cn";
import { motion } from "motion/react";

const icons = [
  "bluesky",
  "facebook",
  // "github",
  "instagram",
  "linkedin",
  "pinterest",
  "threads",
  "tiktok",
  "twitter",
  "youtube",
];
const directions = [
  { x: -115, y: -60 },
  { x: -75, y: -130 },
  { x: 0, y: -165 },
  { x: 75, y: -130 },
  { x: 115, y: -60 },
];
function pickIcons() {
  const pool = [...icons];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 5);
}
export function SocialArc() {
  const [burst, setBurst] = useState(() => ({ cycle: 0, icons: pickIcons() }));
  return (
    <div
      key={burst.cycle}
      className="pointer-events-none absolute bottom-40 left-1/2 z-50 h-14 w-14 -translate-x-1/2"
      aria-hidden="true"
    >
      <img
        src="/logo.svg"
        alt=""
        className="absolute inset-0 w-14 opacity-40 blur-lg"
      />
      <motion.img
        src="/logo.svg"
        alt=""
        className="relative z-10 w-14"
        animate={{ scale: [1, 0.72, 1.2, 0.94, 1.04, 1, 1] }}
        onAnimationComplete={() =>
          setBurst((current) => ({
            cycle: current.cycle + 1,
            icons: pickIcons(),
          }))
        }
        transition={{
          duration: 2,
          times: [0, 0.1, 0.18, 0.25, 0.32, 0.4, 1],
          ease: "easeInOut",
        }}
      />
      {burst.icons.map((name, index) => (
        <motion.img
          key={name}
          src={`/icons/${name}-icon.svg`}
          alt=""
          className={cn(
            "absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 object-contain",
            (name == "twitter" || name == "threads") && "bg-primary p-1 rounded-xl"
          )}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            x: [
              0,
              0,
              directions[index].x * 1.08,
              directions[index].x * 0.95,
              directions[index].x,
              directions[index].x * 1.1,
            ],
            y: [
              0,
              0,
              directions[index].y * 1.08,
              directions[index].y * 0.95,
              directions[index].y,
              directions[index].y * 1.1,
            ],
            scale: [0, 0, 1.3, 0.88, 1, 0.7],
            opacity: [0, 0, 1, 1, 1, 0],
            filter: [
              "blur(0px)",
              "blur(0px)",
              "blur(0px)",
              "blur(0px)",
              "blur(0px)",
              "blur(12px)",
            ],
          }}
          transition={{
            duration: 2,
            times: [0, 0.1, 0.3, 0.4, 0.48, 1],
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
