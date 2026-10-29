import { Link } from "react-router";

import GradientText from "../gradient-text";
import { GlassIconReveal } from "./liquid-glass-logo-reveal";

export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5 text-lg tracking-tight"
      aria-label="CrossPostHub home"
    >
      <GlassIconReveal className="-m-3 size-11" />
      <span>
        Crosspost
        <GradientText
          colors={["#60c5f8", "#77b6f3", "#007ef8"]}
          animationSpeed={11.5}
          variant="flow"
          glow={0}
        >
          Hub
        </GradientText>
      </span>
    </Link>
  );
}
