import { useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";

import { AlertDialog } from "@base-ui/react/alert-dialog";

import { ComposerProvider, useComposer } from "@/components/posts/composer";
import { errorMessage, signOut } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query";
import { toast } from "@/lib/toast";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Brand } from "../ui/brand";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon, type IconName } from "../ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { LoadingIndicator } from "./common";

type NavLink = { to: string; name: string; icon: IconName; compose?: boolean };

const groups: { label?: string; links: NavLink[] }[] = [
  {
    links: [
      { to: "/dashboard", name: "Overview", icon: "dashboard" },
      { to: "/posts", name: "All posts", icon: "layers" },
    ],
  },
  {
    label: "Social",
    links: [
      { to: "/create", name: "Create", icon: "edit", compose: true },
      { to: "/schedule", name: "Calendar", icon: "calendar" },
      { to: "/connections", name: "Social accounts", icon: "share" },
    ],
  },
  {
    label: "Settings",
    links: [
      { to: "/profile", name: "Account", icon: "user" },
      { to: "/billing", name: "Billing", icon: "billing" },
      { to: "/settings", name: "Preferences", icon: "sliders" },
    ],
  },
];

export function ProtectedLayout() {
  const { data, isPending, error, refetch } = authClient.useSession(),
    location = useLocation();
  if (isPending)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <LoadingIndicator label="Opening your workspace" />
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="heading md:w-70">
          We couldn’t reach your account.
        </h1>
        <p className="subheading md:w-80">
          Please check your connection and try again.
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
        <Button variant="link" nativeButton={false} render={<Link to="/" />}>
          Back home
        </Button>
      </div>
    );
  if (!data?.user)
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  return (
    <SidebarProvider>
      <ComposerProvider>
        <WorkspaceLayout />
      </ComposerProvider>
    </SidebarProvider>
  );
}
function WorkspaceLayout() {
  const { data } = authClient.useSession(),
    navigate = useNavigate(),
    location = useLocation(),
    { setOpenMobile } = useSidebar();
  const openComposer = useComposer();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const profileTrigger = useRef<HTMLButtonElement>(null);
  const cancelSignOut = useRef<HTMLButtonElement>(null);
  const logoutRunning = useRef(false);
  async function logout() {
    if (logoutRunning.current) return;
    logoutRunning.current = true;
    setSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message);
      queryClient.clear();
      navigate("/signin", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      logoutRunning.current = false;
      setSigningOut(false);
    }
  }
  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader className="px-4 py-5">
          <Brand />
        </SidebarHeader>
        <SidebarRail />
        <SidebarContent>
          {groups.map((group, index) => (
            <SidebarGroup key={group.label ?? index}>
              {group.label && (
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.links.map((link) => (
                    <SidebarMenuItem key={link.to}>
                      <SidebarMenuButton
                        render={<Link to={link.to} />}
                        isActive={location.pathname === link.to}
                        onClick={(event) => {
                          setOpenMobile(false);
                          if (!link.compose) return;
                          event.preventDefault();
                          openComposer();
                        }}
                      >
                        <Icon name={link.icon} />
                        <span>{link.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="gap-4 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  ref={profileTrigger}
                  render={<SidebarMenuButton size="lg" />}
                  aria-label={`Account menu for ${data?.user.name || "your account"}`}
                  className="data-popup-open:bg-sidebar-accent"
                >
                  <Avatar>
                    <AvatarImage src={data?.user.image || undefined} />
                    <AvatarFallback>
                      {data?.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 gap-1 text-left">
                    <span className="truncate font-medium">
                      {data?.user.name}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {data?.user.email}
                    </span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="min-w-48"
                  finalFocus={confirmSignOut ? false : profileTrigger}
                >
                  <DropdownMenuItem
                    render={<Link to="/profile" />}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Icon name="user" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setConfirmSignOut(true)}
                  >
                    <Icon name="logout" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AlertDialog.Root
        open={confirmSignOut}
        onOpenChange={(open, details) => {
          if (logoutRunning.current) {
            details.cancel();
            return;
          }
          setConfirmSignOut(open);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <AlertDialog.Popup
            initialFocus={cancelSignOut}
            finalFocus={profileTrigger}
            aria-busy={signingOut}
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-xl"
          >
            <AlertDialog.Title className="text-lg font-medium">
              Sign out of CrossPostHub?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You’ll need to sign in again to access your workspace.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Close
                ref={cancelSignOut}
                disabled={signingOut}
                render={<Button variant="secondary" />}
              >
                Cancel
              </AlertDialog.Close>
              <Button
                variant="destructive"
                disabled={signingOut}
                onClick={logout}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <SidebarInset className="overflow-hidden h-[calc(100dvh-1rem)] overflow-y-scroll">
        <header className="flex h-12 items-center gap-3 border-b px-6 md:hidden">
          <SidebarTrigger />
          <span className="text-xs text-muted-foreground">My workspace</span>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );
}
