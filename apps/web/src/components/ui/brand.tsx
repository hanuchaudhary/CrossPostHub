import { Link } from "react-router";

import GradientText from "../gradient-text";

export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5 text-lg tracking-tight"
      aria-label="CrossPostHub home"
    >
      <img src="/logo.svg" className="size-5" />
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
