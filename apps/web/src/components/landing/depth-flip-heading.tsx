import { useEffect, useState } from "react";

import { motion, useReducedMotion } from "motion/react";

import GradientText from "../gradient-text";

const phrases = ["everywhere.", "with ease.", "on your time."];
export function DepthFlipHeading() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      4000
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion]);
  return (
    <span
      className="relative block text-muted-foreground"
      aria-label={phrases[index]}
    >
      <span className="invisible block" aria-hidden="true">
        on your time.
      </span>
      {phrases.map((phrase, phraseIndex) => (
        <span
          key={phrase}
          aria-hidden="true"
          className="absolute inset-0 flex whitespace-nowrap"
          style={{ perspective: 1200 }}
        >
          {Array.from(phrase).map((character, i) => (
            <motion.span
              key={i}
              className="inline-block"
              style={{
                transformOrigin: "50% 50% -0.45em",
                backfaceVisibility: "hidden",
              }}
              initial={false}
              animate={{
                rotateX:
                  phraseIndex === index
                    ? 0
                    : phraseIndex ===
                        (index + phrases.length - 1) % phrases.length
                      ? 90
                      : -90,
                opacity: phraseIndex === index ? 1 : 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.85,
                delay: i * 0.02,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <GradientText
                colors={["#60c5f8", "#77b6f3", "#007ef8"]}
                animationSpeed={11.5}
                variant="flow"
                glow={0}
              >
                {character === " " ? "\u00a0" : character}
              </GradientText>
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
