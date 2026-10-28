import { HugeiconsIcon } from "@hugeicons/react";
import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import { ThemeSwitch } from "@/components/theme-switch";
export function AppearanceSettings() {
  return (
    <section
      aria-labelledby="appearance-heading"
      className="flex flex-wrap items-center justify-between gap-5"
    >
      <div className="flex items-center gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-secondary">
          <HugeiconsIcon icon={PaintBoardIcon} size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="appearance-heading" className="font-medium">
            Appearance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a light or dark workspace.
          </p>
        </div>
      </div>
      <ThemeSwitch />
    </section>
  );
}
