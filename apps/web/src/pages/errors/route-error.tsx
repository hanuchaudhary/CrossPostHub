import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function RouteErrorPage() {
  const error = useRouteError();
  return (
    <main className="flex min-h-svh items-center justify-center p-5">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="heading w-full!">
            We hit a little bump.
          </EmptyTitle>
          <EmptyDescription className="subheading text-xl! max-w-[280px]! mt-4">
            {isRouteErrorResponse(error)
              ? error.statusText
              : "Please reload the page and try again."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant={"secondary"} onClick={() => location.reload()}>
            Reload
          </Button>
          <Button variant="link" nativeButton={false} render={<Link to="/" />}>
            Back home
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
