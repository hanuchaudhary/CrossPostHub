import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export default function RouteErrorPage() {
  const error = useRouteError();
  return (
    <main className="flex min-h-svh items-center justify-center p-5">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>We hit a little bump.</EmptyTitle>
          <EmptyDescription>
            {isRouteErrorResponse(error)
              ? error.statusText
              : "Please reload the page and try again."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => location.reload()}>Reload</Button>
          <Button variant="link" nativeButton={false} render={<Link to="/" />}>
            Back home
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
