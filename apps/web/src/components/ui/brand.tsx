import { Link } from "react-router";
export function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5 text-lg tracking-tight"
      aria-label="CrossPostHub home"
    >
      <img src="/logo.svg" className="size-6" />
      <span>
        CrossPost<span className="text-muted-foreground">Hub</span>
      </span>
    </Link>
  );
}
