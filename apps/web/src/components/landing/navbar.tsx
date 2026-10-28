import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";
import { useState } from "react";
import { Link } from "react-router";
import { Brand } from "../ui/brand";
import { Icon } from "../ui/icon";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { authClient } from "@/lib/auth-client";
const sections = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data } = authClient.useSession();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Brand />
        <NavigationMenu
          aria-label="Main navigation"
          className="hidden flex-none md:flex"
        >
          <NavigationMenuList>
            {sections.map(([title, href]) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink href={href}>{title}</NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            className="hidden sm:inline-flex"
            render={<Link to={data ? "/dashboard" : "/signin"} />}
          >
            {data ? "Dashboard" : "Log in"}
          </Button>
          <Button
            nativeButton={false}
            render={<Link to={data ? "/dashboard" : "/register"} />}
          >
            Get started <Icon name="arrow" />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Icon name="menu" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Explore CrossPostHub</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 p-4"
                aria-label="Mobile navigation"
              >
                {sections.map(([title, href]) => (
                  <Button
                    key={href}
                    nativeButton={false}
                    variant="ghost"
                    render={<a href={href} />}
                    onClick={() => setOpen(false)}
                  >
                    {title}
                  </Button>
                ))}
                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link to="/signin" />}
                >
                  Sign in
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
