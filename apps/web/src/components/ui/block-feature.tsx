import { LandingSection } from "../landing/section";
import { Reveal } from "../landing/reveal";
import { Icon, type IconName } from "./icon";

const features: {
  number: string;
  icon: IconName;
  title: string;
  description: string;
  detail: string;
}[] = [
  {
    number: "01",
    icon: "layers",
    title: "One post, more places",
    description:
      "Write once and choose the connected channels you want to publish to.",
    detail: "CROSS-POSTING",
  },
  {
    number: "02",
    icon: "calendar",
    title: "Make time work for you",
    description:
      "Publish now or schedule your post for a future date and time.",
    detail: "SCHEDULING",
  },
  {
    number: "03",
    icon: "image",
    title: "Give your ideas a visual",
    description:
      "Add images to your posts and bring the whole story together in one place.",
    detail: "MEDIA UPLOADS",
  },
  {
    number: "04",
    icon: "dashboard",
    title: "Keep track of every post",
    description:
      "See your published and scheduled posts together from your dashboard.",
    detail: "YOUR WORKSPACE",
  },
];

export default function Feature() {
  return (
    <LandingSection id="features">
        <Reveal className="mb-14 space-y-7">
          <h2 className="heading">
            More creating.
            <br />
            <span className="text-muted-foreground">Less juggling.</span>
          </h2>
          <p className="subheading max-w-md!">
            Everything you need to take a post from an idea to your audience,
            all in one place.
          </p>
        </Reveal>
        <div className="grid gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal
              key={feature.number}
              delay={index * 0.1}
              className="group flex min-w-0 flex-col border-t pt-6 transition-colors duration-300 hover:border-foreground"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
                  <Icon name={feature.icon} size={22} />
                </div>
                <span className="text-3xl font-light tracking-tighter text-muted-foreground/40">
                  {feature.number}
                </span>
              </div>
              <div className="pt-8">
                <p className="mb-3 text-[10px] tracking-[.18em] text-muted-foreground">
                  {feature.detail}
                </p>
                <h3 className="text-lg font-light tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
    </LandingSection>
  );
}
