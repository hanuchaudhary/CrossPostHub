import { useId, useState } from "react";
import { Link } from "react-router";

import { CircleQuestion, Plus } from "@keyline-icons/react/duotone";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

import { LandingSection } from "./section";

const questions = [
  {
    q: "Is CrossPostHub free?",
    a: "Yes. The Free plan includes 25 posts and 5 scheduled posts a month. Pro and Premium raise those limits when you need more.",
  },
  {
    q: "Which platforms can I post to?",
    a: "X, LinkedIn, Instagram, Threads, Facebook Pages, Bluesky, Mastodon, Pinterest, TikTok and Telegram channels.",
  },
  {
    q: "Can I write a different caption for each platform?",
    a: "Yes. Write one post for everywhere, or switch to per-platform mode and tune the text and media for each account.",
  },
  {
    q: "How far ahead can I schedule?",
    a: "Up to 30 days. Your post goes out at the time you pick, and its status updates once it's live.",
  },
  {
    q: "Why do my TikTok posts show as private?",
    a: "TikTok keeps posts from new apps private until it finishes reviewing them. Once our review is done, you can post publicly.",
  },
  {
    q: "How is my account access kept safe?",
    a: "Platform tokens are encrypted before they're stored, and you can disconnect any account at any time.",
  },
];

function Question({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <span className="text-sm font-medium txt">{q}</span>
        <Plus
          aria-hidden="true"
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
            open && "rotate-45 text-foreground"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
            className="overflow-hidden"
          >
            <p className="max-w-xl px-5 pb-5 text-sm text-muted-foreground txt">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  return (
    <LandingSection id="faq">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-7">
          <h2 className="heading">
            Questions.
            <br />
            <span className="text-muted-foreground">Answered.</span>
          </h2>
          <p className="subheading max-w-sm!">
            Still curious?{" "}
            <Link to="/contact" className="text-foreground underline underline-offset-4">
              Get in touch
            </Link>{" "}
            and we'll help.
          </p>
        </div>
        <section className="rounded-3xl bg-muted/50 p-1">
          <div className="flex items-center gap-2 px-3 py-4">
            <span className="grid size-11 place-items-center rounded-xl bg-background">
              <CircleQuestion className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-medium txt">Frequently asked</h3>
              <p className="mt-0.5 text-sm text-muted-foreground txt">
                The things people ask before they start.
              </p>
            </div>
          </div>
          <ul className="divide-y rounded-3xl border bg-background dark:border-0">
            {questions.map((item) => (
              <Question key={item.q} {...item} />
            ))}
          </ul>
        </section>
      </div>
    </LandingSection>
  );
}
