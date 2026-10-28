import { SiteRule } from "../corners";
import { Badge } from "./badge";
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
    <section id="features" className="relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative  h-[calc(100vh-4rem)] overflow-hidden p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-4">
            <Badge variant="outline">MADE FOR YOUR WORKFLOW</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              More creating.
              <br />
              Less juggling.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Everything you need to take a post from an idea to your audience,
            all in one place.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-2xl border bg-border gap-px sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group flex min-h-64 flex-col bg-background p-6 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon name={feature.icon} size={22} />
                </div>
                <span className="font-mono text-xs text-muted-foreground/60">
                  {feature.number}
                </span>
              </div>
              <div className="mt-auto pt-10">
                <p className="mb-3 text-[10px] font-medium tracking-[.18em] text-emerald-600 dark:text-emerald-400">
                  {feature.detail}
                </p>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
