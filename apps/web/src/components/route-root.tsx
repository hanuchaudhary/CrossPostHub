import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { LoadingIndicator } from "./workspace/common";
export function RouteRoot() {
  return (
    <>
      <Suspense
        fallback={
          <div
            className="flex min-h-svh items-center justify-center gap-3 text-sm text-muted-foreground"
            role="status"
          >
            <LoadingIndicator />A little space for your ideas…
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </>
  );
}
