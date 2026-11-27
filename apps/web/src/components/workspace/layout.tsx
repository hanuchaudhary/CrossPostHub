import { useRef } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";

import { useConfirm } from "@/components/confirm-dialog";
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
        <h1 className="heading md:w-70">We couldn’t reach your account.</h1>
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
  const confirm = useConfirm();
  const profileTrigger = useRef<HTMLButtonElement>(null);
  async function logout() {
    try {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message);
      queryClient.clear();
      navigate("/signin", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
      throw e;
    }
  }
  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader className="gap-5 px-4 py-5">
          <Brand />
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setOpenMobile(false);
              openComposer();
            }}
          >
            <Icon name="plus" />
            Post
          </Button>
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
                  finalFocus={profileTrigger}
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
                    onClick={() =>
                      void confirm({
                        title: "Sign out of CrossPostHub?",
                        description:
                          "You’ll need to sign in again to access your workspace.",
                        confirmLabel: "Sign out",
                        destructive: true,
                        onConfirm: logout,
                      })
                    }
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
      <SidebarInset className="h-[calc(100dvh-1rem)] overflow-y-auto scrollbar-none dark:bg-neutral-900/90!">
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
