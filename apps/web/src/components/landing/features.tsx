import { type ReactNode } from "react";

import { FeatureFigure } from "./feature-figure";
import "./features.css";
import { LandingSection } from "./section";

function Copy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative z-10 space-y-3 px-6 pb-7 md:mt-20 md:px-8 md:pb-8">
      <h3 className="heading text-2xl!">{title}</h3>
      <p className="subheading text-lg! md:w-sm text-pretty">{children}</p>
    </div>
  );
}

export function Features() {
  return (
    <LandingSection id="features">
      <div className="mb-14 space-y-7">
        <h2 className="heading">
          More creating.
          <br />
          <span className="text-muted-foreground">Less juggling.</span>
        </h2>
        <p className="subheading max-w-lg!">
          From the first spark to the final post.
          <br />A little less friction, a lot more flow.
        </p>
      </div>
      <div className="feature-scenes space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="publish" />
            <Copy title="Write once. Post everywhere.">
              Write your post once, choose your connected channels, and send
              your story out into the world.
            </Copy>
          </div>
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="workflow" />
            <Copy title="See it before it goes live.">
              Preview exactly how your post will look on X, LinkedIn and
              Instagram before anything goes out.
            </Copy>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="schedule" />
            <Copy title="Pick a time. It posts itself.">
              Post in the moment or choose a future date. Make space for your
              next idea while this one finds its audience.
            </Copy>
          </div>
          <div className="feature-card h-full dark:bg-muted/10 bg-muted/50">
            <FeatureFigure kind="media" />
            <Copy title="Photos and videos, ready to go.">
              Upload your images and pair them with the right words. Keep the
              whole story together, from draft to destination.
            </Copy>
          </div>
        </div>
        <div className="feature-card grid dark:bg-muted/10 md:grid-cols-2 bg-muted/50">
          <FeatureFigure kind="workspace" />
          <div className="flex items-center pt-3 md:pt-8">
            <Copy title="Every post’s status at a glance.">
              Published, scheduled, or still making its way. See where every
              post stands, with a calmer view of your content.
            </Copy>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
