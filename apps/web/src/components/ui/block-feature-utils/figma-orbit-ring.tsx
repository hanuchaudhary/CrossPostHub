import type { SVGProps } from "react";
export default function FigmaOrbitRing(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 229 109" fill="none" {...props}>
      <ellipse
        cx="114.5"
        cy="54.5"
        rx="111"
        ry="37"
        transform="rotate(-14 114.5 54.5)"
        stroke="currentColor"
        strokeOpacity=".2"
      />
      <ellipse
        cx="114.5"
        cy="54.5"
        rx="91"
        ry="27"
        transform="rotate(14 114.5 54.5)"
        stroke="currentColor"
        strokeOpacity=".1"
      />
    </svg>
  );
}
