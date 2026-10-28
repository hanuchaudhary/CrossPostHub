import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Brand } from "../ui/brand";
import { Icon, type IconName } from "../ui/icon";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  SidebarRail,
} from "../ui/sidebar";
import { LoadingIndicator } from "./common";
import { SettingsNavigation } from "./settings-navigation";
import { authClient } from "@/lib/auth-client";
import { signOut, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query";

const links: { to: string; name: string; icon: IconName }[] = [
  { to: "/dashboard", name: "Overview", icon: "dashboard" },
  { to: "/posts", name: "All posts", icon: "layers" },
  { to: "/schedule", name: "Schedule", icon: "calendar" },
];

export function ProtectedLayout() {
  const { data, isPending, error, refetch } = authClient.useSession(),
    location = useLocation();
  if (isPending)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <LoadingIndicator />
        Opening your creative space…
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">
          We couldn’t reach your account.
        </h1>
        <p className="text-sm text-muted-foreground">
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
      <WorkspaceLayout />
    </SidebarProvider>
  );
}
function WorkspaceLayout() {
  const { data } = authClient.useSession(),
    navigate = useNavigate(),
    location = useLocation(),
    { setOpenMobile } = useSidebar();
  async function logout() {
    try {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message);
      queryClient.clear();
      navigate("/signin", { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
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
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      render={<Link to={link.to} />}
                      isActive={location.pathname === link.to}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon name={link.icon} />
                      <span>{link.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SettingsNavigation />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-4 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link to="/profile" />}
                onClick={() => setOpenMobile(false)}
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
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <Icon name="logout" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
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
