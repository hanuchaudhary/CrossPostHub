import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";

import { LoadingIndicator } from "./workspace/common";

export function RouteRoot() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
            <LoadingIndicator label="Loading your workspace" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </>
  );
}
