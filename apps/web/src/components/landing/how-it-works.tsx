import { LandingSection } from "./section";
import { Reveal } from "./reveal";
import { Icon } from "../ui/icon";

export const HowItWorks = () => {
  return (
    <LandingSection id="how-it-works">
        <Reveal className="mb-14 space-y-7">
          <h2 className="heading">
            From idea to post.
            <br />
            <span className="text-muted-foreground">In three simple steps.</span>
          </h2>
          <p className="subheading max-w-md!">
            Connect your accounts, create your post, and choose when it goes live.
          </p>
        </Reveal>
        <div className="grid gap-10 md:gap-8 md:grid-cols-3">
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
          ].map((step, index) => (
            <Reveal key={step.n} delay={index * 0.12} className="flex min-w-0 flex-col gap-4 border-t pt-6 transition-colors duration-300 hover:border-foreground">
              <header className="flex flex-col gap-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
                    <Icon name={step.icon} />
                  </div>
                  <span className="text-3xl font-light tracking-tighter text-muted-foreground/40">
                    {step.n}
                  </span>
                </div>
                <h3 className="text-lg font-light tracking-tight">{step.title}</h3>
              </header>
              <div className="min-w-0">
                <p className="text-sm font-light leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
    </LandingSection>
  );
};
