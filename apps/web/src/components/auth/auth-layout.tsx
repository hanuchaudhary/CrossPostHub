import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Brand } from "@/components/ui/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between border-r bg-muted/40 p-10 lg:flex">
        <Brand />
        <div className="max-w-md space-y-7">
          <Badge variant="outline">A LITTLE LESS EVERYWHERE.</Badge>
          <h2 className="text-6xl font-semibold leading-tight tracking-tighter">
            One space.
            <br />
            Endless
            <br />
            <span className="text-muted-foreground">possibilities.</span>
          </h2>
          <div className="flex items-center gap-4">
            <section className="flex min-w-0 flex-col gap-4 p-4">
              <Icon name="twitter" size={32} />
            </section>
            <section className="flex min-w-0 flex-col gap-4 p-6">
              <img src="/logo.svg" width={56} height={56} alt="CrossPostHub" />
            </section>
            <section className="flex min-w-0 flex-col gap-4 p-4">
              <Icon name="linkedin" size={32} />
            </section>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            Let your ideas do the traveling.
            <br />
            You’ve got better things to create.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Made for the beautifully busy creator.
        </p>
      </section>
      <section className="flex min-h-svh flex-col items-center justify-between p-5 sm:p-8">
        <div className="flex w-full items-center justify-between">
          <span className="lg:invisible">
            <Brand />
          </span>
          <Button variant="ghost" nativeButton={false} render={<Link to="/" />}>
            <Icon name="back" />
            Back home
          </Button>
        </div>
        <section className="flex min-w-0 flex-col gap-4 my-10 w-full max-w-sm">
          <header className="flex flex-col gap-3">
            <p className="text-[9px] font-medium tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="font-medium text-2xl tracking-tight">{title}</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </header>
          <div className="min-w-0 space-y-6">{children}</div>
          <div className="flex items-center flex-col gap-5 text-center">
            <div className="text-xs text-muted-foreground">{footer}</div>
            <p className="text-[10px] leading-5 text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link className="underline" to="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="underline" to="/privacy">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
        <p className="text-[10px] text-muted-foreground">
          © {year} CrossPostHub
        </p>
      </section>
    </main>
  );
}
