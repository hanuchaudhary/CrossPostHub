import type { SVGProps } from "react";
export default function BaseUi(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" {...props}>
      <path d="M5 5h14v14H5zM21 5h14v14H21zM5 21h14v14H5zM21 21h14v14H21z" />
      <circle cx="28" cy="28" r="5" fill="var(--card)" />
    </svg>
  );
}
