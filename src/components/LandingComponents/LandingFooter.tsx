export default function LandingFooter() {
  return (
    <div className="relative md:pt-40 py-10 md:pb-10 flex flex-col justify-center max-w-7xl mx-auto items-center">
      <div className="flex relative z-40 items-center justify-between gap-10 w-full rounded-2xl mx-auto bg-primary-foreground md:px-4 px-2 md:py-6 py-3 border border-secondary/60">
        <div>
          <h2 className="font-ClashDisplaySemibold md:text-xl text-lg leading-none dark:text-neutral-300">
            CrossPostHub.
          </h2>
          <p className="leading-none md:block hidden text-xs text-neutral-400">
            Create, Schedule, Share – All in One Place
          </p>
        </div>
        <div className="text-neutral-500 md:text-sm text-xs">
          <h3>
            Build in public at{" "}
            <a
              href="https://x.com/KushChaudharyOg"
              className="text-blue-400 font-ClashDisplayMedium underline"
              target="_blank"
            >
              @KushChaudharyOg
            </a>
          </h3>
          <h4>
            Github{" "}
            <a
              href="https://github.com/hanuchaudhary"
              target="_blank"
              className="text-blue-400 font-ClashDisplayMedium underline"
            >
              @hanuchaudhary
            </a>
          </h4>
        </div>
      </div>
    </div>
  );
}
