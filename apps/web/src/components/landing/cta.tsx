import { Link } from "react-router";

import { Reveal } from "./reveal";
import { LandingSection } from "./section";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";

export const Cta = () => {
  return (
    <LandingSection>
        <Reveal className="flex min-w-0 flex-col gap-7 py-4 md:py-12">
          <header className="flex flex-col gap-7">
            <h2 className="heading">
              Your next idea.
              <br />
              <span className="text-muted-foreground">A little further.</span>
            </h2>
            <p className="subheading max-w-md!">
              Bring your accounts together and share your next idea in less time.
            </p>
          </header>
          <div className="min-w-0 space-y-3">
            <Button
              nativeButton={false}
              size="lg"
              className="h-10 px-4"
              render={<Link to="/register" />}
            >
              Start sharing <Icon name="arrow" />
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Free to start. Create your account in minutes.
            </p>
          </div>
        </Reveal>
    </LandingSection>
  );
};
