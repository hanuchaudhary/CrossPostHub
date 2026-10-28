import type { SVGProps } from "react";
export default function FigmaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 90" {...props}>
      <path fill="#f24e1e" d="M15 0h15v30H15a15 15 0 0 1 0-30" />
      <path fill="#ff7262" d="M30 0h15a15 15 0 0 1 0 30H30" />
      <path fill="#a259ff" d="M15 30h15v30H15a15 15 0 0 1 0-30" />
      <circle fill="#1abcfe" cx="45" cy="45" r="15" />
      <path fill="#0acf83" d="M15 60h15v15a15 15 0 1 1-15-15" />
    </svg>
  );
}
