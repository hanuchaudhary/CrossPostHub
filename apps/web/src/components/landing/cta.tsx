import { Link } from "react-router";

import { SiteCorners, SiteRule } from "../corners";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";

export const Cta = () => {
  return (
    <section className="relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <SiteCorners />
        <section className="flex min-w-0 flex-col gap-4 py-12 text-center">
          <header className="flex flex-col gap-4">
            <Badge variant="outline" className="mx-auto">
              YOUR NEXT CHAPTER STARTS WITH ONE POST.
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              The world is waiting
              <br />
              for your kind of creative.
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Give your ideas a little more room to grow.
            </p>
          </header>
          <div className="min-w-0 space-y-3">
            <Button
              nativeButton={false}
              size="lg"
              className="h-10 px-4"
              render={<Link to="/register" />}
            >
              Let’s make something <Icon name="arrow" />
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Free to start. Easy to love.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
};
