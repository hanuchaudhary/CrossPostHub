import { type ReactNode } from "react";

import { FeatureFigure } from "./feature-figure";
import "./features.css";
import { Reveal } from "./reveal";
import { LandingSection } from "./section";

function Copy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative z-10 space-y-3 px-6 pb-7 mt-20 md:px-8 md:pb-8">
      <h3 className="heading text-2xl!">{title}</h3>
      <p className="subheading text-lg! w-sm text-pretty">{children}</p>
    </div>
  );
}

export function Features() {
  return (
    <LandingSection id="features">
      <Reveal className="mb-14 space-y-7">
        <h2 className="heading">
          More creating.
          <br />
          <span className="text-muted-foreground">Less juggling.</span>
        </h2>
        <p className="subheading max-w-lg!">
          From the first spark to the final post.
          <br />A little less friction, a lot more flow.
        </p>
      </Reveal>
      <div className="feature-scenes space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="publish" />
            <Copy title="One idea. More places to land.">
              Write your post once, choose your connected channels, and send
              your story out into the world.
            </Copy>
          </div>
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="workflow" />
            <Copy title="Keep your focus on the good part.">
              Bring your words, visuals, and publishing together. Give every
              idea a home without the tab hopping.
            </Copy>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="schedule" />
            <Copy title="Make time work for you.">
              Post in the moment or choose a future date. Make space for your
              next idea while this one finds its audience.
            </Copy>
          </div>
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="media" />
            <Copy title="Give your story a little more life.">
              Upload your images and pair them with the right words. Keep the
              whole story together, from draft to destination.
            </Copy>
          </div>
        </div>
        <div className="feature-card grid dark:bg-muted/10 md:grid-cols-2 bg-muted/50">
          <FeatureFigure kind="workspace" />
          <div className="flex items-center pt-3 md:pt-8">
            <Copy title="A home for everything you share.">
              Published, scheduled, or still making its way. See where every
              post stands, with a calmer view of your content.
            </Copy>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
