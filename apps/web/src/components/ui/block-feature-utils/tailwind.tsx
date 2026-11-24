import type { SVGProps } from "react";
export default function Tailwind(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
      <path d="M24 0Q8 0 8 16q8-12 16-4 8 8 16 0Q48 0 48 0q-8 12-16 4-4-4-8-4M0 16q8 12 16 4 8-8 16 0 8 8 16-4-4 16-16 16-8 0-16-8-8-8-16 0Z" />
    </svg>
  );
}
