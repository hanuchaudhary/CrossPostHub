import type { SVGProps } from "react";
export default function Shadcn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="m4 20 16-16M12 20l8-8" />
    </svg>
  );
}
