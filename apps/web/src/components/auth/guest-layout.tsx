import { Link, Navigate, Outlet } from "react-router";

import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/workspace/common";
import { authClient } from "@/lib/auth-client";

export function GuestLayout() {
  const { data, isPending, error, refetch } = authClient.useSession();

  if (isPending)
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <LoadingIndicator label="Checking your session" />
      </div>
    );

  if (data?.user) return <Navigate to="/dashboard" replace />;

  if (error)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="heading md:w-70">We couldn’t check your session.</h1>
        <p className="subheading md:w-90">
          Please check your connection and try again.
        </p>
        <Button variant={"primary"} onClick={() => refetch()}>Try again</Button>
        <Button variant="link" nativeButton={false} render={<Link to="/" />}>
          Back home
        </Button>
      </div>
    );

  return <Outlet />;
}
