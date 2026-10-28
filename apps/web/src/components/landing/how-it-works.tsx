import { SiteCorners, SiteRule } from "../corners";
import { Badge } from "../ui/badge";
import { Icon } from "../ui/icon";

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="relative"
    >
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative h-[calc(100vh-4rem)] p-10">
        <SiteCorners />
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <div className="mb-10 space-y-4 text-center">
          <Badge variant="outline">FROM “WHAT IF” TO “IT’S LIVE”</Badge>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Good ideas travel light.
          </h2>
          <p className="text-sm text-muted-foreground">
            Three little steps between you and your next great post.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: "link" as const,
              title: "Bring your people together.",
              text: "Connect your accounts. Give your ideas a home across your favorite platforms.",
            },
            {
              n: "02",
              icon: "sparkle" as const,
              title: "Make something worth sharing.",
              text: "Write your story, add your visuals, and make every post feel like you.",
            },
            {
              n: "03",
              icon: "send" as const,
              title: "Send it out. Or sleep on it.",
              text: "Publish in the moment or pick the right time. Your calendar has it covered.",
            },
          ].map((step) => (
            <section className="flex min-w-0 flex-col gap-4" key={step.n}>
              <header className="flex flex-col gap-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                    <Icon name={step.icon} />
                  </div>
                  <span className="text-xl font-medium tracking-tight text-muted-foreground/40">
                    {step.n}
                  </span>
                </div>
                <h2 className="text-sm font-medium">{step.title}</h2>
              </header>
              <div className="min-w-0">
                <p className="text-xs leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};
