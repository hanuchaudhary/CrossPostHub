import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { Icon, type IconName } from "../ui/icon";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarGroup } from "../ui/avatar";
import { Separator } from "../ui/separator";
const platforms: { name: IconName; x: number; y: number; position: string }[] =
  [
    { name: "twitter", x: -190, y: -100, position: "left-[5%] top-[20%]" },
    { name: "linkedin", x: 190, y: -100, position: "right-[5%] top-[20%]" },
    { name: "instagram", x: -185, y: 120, position: "bottom-[18%] left-[6%]" },
  ];
export function PostAnimation() {
  const reduced = useReducedMotion();
  return (
    <div
      className="relative mx-auto h-[450px] w-full max-w-[540px] overflow-hidden sm:h-[520px]"
      role="img"
      aria-label="One post travels from your phone to X, LinkedIn, and Instagram simultaneously"
    >
      <div className="absolute inset-12 rounded-full border border-dashed" />
      <div className="absolute inset-24 rounded-full border" />
      <svg
        viewBox="0 0 540 520"
        className="absolute inset-0 size-full text-border"
        aria-hidden
      >
        {platforms.map((p) => (
          <path
            key={p.name}
            d={`M270 260 Q${270 + p.x * 0.6} 260 ${270 + p.x} ${260 + p.y}`}
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 7"
          />
        ))}
      </svg>
      {platforms.map((p) => (
        <div key={p.name}>
          <section
            className={cn(
              "flex min-w-0 flex-col gap-4",
              `absolute z-20 flex size-14 items-center justify-center p-0 sm:size-16 ${p.position}`,
            )}
          >
            <Icon name={p.name} size={30} />
          </section>
          {!reduced && (
            <motion.div
              className="absolute left-1/2 top-1/2 z-10 -ml-6 -mt-8"
              initial={{ opacity: 0 }}
              animate={{
                x: [0, 0, p.x, p.x],
                y: [0, 0, p.y, p.y],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 0.8, 0.7, 0.7],
              }}
              transition={{
                duration: 5,
                times: [0, 0.25, 0.8, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <section className="flex min-w-0 flex-col w-12 gap-1 p-2">
                <Icon name="image" size={28} />
                <Separator />
                <Separator className="w-2/3" />
              </section>
            </motion.div>
          )}
        </div>
      ))}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 -ml-[100px] -mt-[195px]"
        animate={reduced ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <section className="flex min-w-0 flex-col relative w-[200px] gap-3 rounded-[30px] border-[5px] border-foreground bg-background p-3 pb-4 shadow-xl">
          <div className="mx-auto h-3 w-16 rounded-full bg-foreground" />
          <div className="flex items-center gap-1.5 py-1">
            <img src="/logo.svg" width={15} height={15} alt="" />
            <span className="text-[9px] font-medium">Your next big idea.</span>
            <Icon name="more" size={13} className="ml-auto" />
          </div>
          <div className="min-w-0 relative h-44 overflow-hidden rounded-lg bg-muted p-4">
            <span className="relative z-10 text-4xl font-semibold leading-[.95] tracking-tighter">
              make
              <br />
              <span className="font-serif italic font-normal">some</span>
              <br />
              waves.
            </span>
            <img
              src="/logo.svg"
              width={100}
              height={100}
              alt=""
              className="absolute -bottom-5 -right-4 opacity-50"
            />
            <span className="absolute bottom-3 left-4 text-[6px] tracking-widest">
              THE EVERYDAY CREATIVE
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-medium">
              A little inspiration for your feed.
            </p>
            <p className="text-[7px] text-muted-foreground">
              Create something that feels like you.
            </p>
          </div>
          <div className="flex gap-1.5">
            {platforms.map((p) => (
              <Badge key={p.name} variant="outline" className="gap-1 px-1.5">
                <Icon name={p.name} size={11} />
                <Icon name="check" size={9} />
              </Badge>
            ))}
          </div>
          <Button
            className="pointer-events-none w-full text-[9px]"
            tabIndex={-1}
          >
            Ready for the world <Icon name="send" size={12} />
          </Button>
          <div className="mx-auto h-1 w-16 rounded-full bg-foreground" />
        </section>
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-2 z-30 sm:bottom-16 sm:right-0"
        animate={
          reduced ? {} : { opacity: [0, 0, 1, 1, 0], y: [8, 8, 0, 0, 8] }
        }
        transition={{ duration: 5, repeat: Infinity }}
      >
        <section className="min-w-0 flex flex-row items-center gap-2 p-3 shadow-sm">
          <Icon name="check" size={22} />
          <div>
            <p className="text-[10px] font-medium">And… you’re everywhere.</p>
            <p className="mt-1 text-[8px] text-muted-foreground">
              One post. All your people.
            </p>
          </div>
        </section>
      </motion.div>
      <p className="absolute inset-x-0 bottom-0 text-center text-[8px] tracking-[.2em] text-muted-foreground">
        ONE IDEA. EVERY PLATFORM.
      </p>
    </div>
  );
}
export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden px-5 py-14 md:grid-cols-2 md:px-8 md:py-24">
      <div className="space-y-7">
        <Badge
          variant="outline"
          className="h-auto gap-2 rounded-md px-2.5 py-1.5"
        >
          <Icon name="sparkle" size={12} />
          Your ideas deserve a bigger stage
        </Badge>
        <h1 className="text-5xl font-semibold leading-[1.06] tracking-tighter sm:text-6xl lg:text-7xl">
          Create once.
          <br />
          Connect
          <br />
          <span className="text-muted-foreground">everywhere.</span>
        </h1>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          Your voice, on every platform. Write, plan, and publish your social
          posts from one happy little place.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="h-10 px-4"
            nativeButton={false}
            render={<Link to="/register" />}
          >
            Start creating for free <Icon name="arrow" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            nativeButton={false}
            render={<a href="#how-it-works" />}
          >
            See how it works <Icon name="external" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <AvatarGroup>
            {["AK", "JL", "M", "SK"].map((n) => (
              <Avatar key={n} size="sm">
                <AvatarFallback>{n}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <p className="text-[10px] text-muted-foreground">
            Made for creators with a lot to say.
          </p>
        </div>
      </div>
      <PostAnimation />
    </section>
  );
}
