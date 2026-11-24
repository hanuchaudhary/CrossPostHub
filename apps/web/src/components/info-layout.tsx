import type { ReactNode } from "react";
import { Link } from "react-router";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
export function InfoLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-svh max-w-3xl space-y-10 px-5 py-10">
      <Brand />
      <section className="flex min-w-0 flex-col gap-4">
        <header className="flex flex-col gap-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            THE SMALL PRINT
          </p>
          <h2 className="font-medium text-2xl tracking-tight">{title}</h2>
        </header>
        <div className="min-w-0 space-y-6 text-sm leading-7 text-muted-foreground">
          {children}
        </div>
        <div className="flex items-center gap-2">
          <Button nativeButton={false} render={<Link to="/" />}>
            Back to home
          </Button>
        </div>
      </section>
    </main>
  );
}
