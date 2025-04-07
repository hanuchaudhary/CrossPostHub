import { cn } from "@/lib/utils";
import {
  IconTerminal2,
  IconAugmentedReality2,
  IconTie,
  IconBrandAsana,
} from "@tabler/icons-react";

export function WhoIsItFor() {
  const audiences = [
    {
      title: "Devs Building in Public",
      description:
        "Push project updates to Twitter, LinkedIn, and more in a single click. Perfect for indie hackers, open-source contributors, or side project builders growing an audience while they code.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Learners & Tech Enthusiasts",
      description:
        "Share your coding journey or tech tips everywhere at once. Stay consistent and connect with the community without the hassle.",
      icon: <IconAugmentedReality2 />,
    },
    {
      title: "Busy Creators & Professionals",
      description:
        "Not a dev? No problem. Post your ideas, updates, or content across platforms effortlessly—more reach, less work.",
      icon: <IconTie />,
    },
    {
      title: "Small Teams & Hustlers",
      description:
        "Manage your socials in seconds. One click sends your message everywhere, leaving you time to focus on what matters.",
      icon: <IconBrandAsana />,
    },
  ];

  return (
    <div className="md:h-screen flex items-center justify-center flex-col">
      <div className="font-ClashDisplaySemibold md:text-4xl text-2xl mt-8 mb-12">
        <h2 className="text-center w-full">
          Who is <span className="text-emerald-500">CrossPostHub</span> For?
        </h2>
        <p className="md:text-base pb-12 max-w-3xl text-sm text-center font-ClashDisplayRegular text-muted-foreground">
          CrossPostHub is designed for anyone who wants to post to multiple
          platforms with one click—whether you're a developer sharing your work
          or just someone looking to simplify social media. Here's who's loving
          it:
        </p>
      </div>
      <div className="border-t border-b border-dashed w-full">
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 mx-auto">
          {audiences.map((data, index) => (
            <AudienceCard key={data.title} {...data} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const AudienceCard = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "md:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-emerald-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
