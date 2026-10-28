import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Icon } from "@/components/ui/icon";
const items = [
  { title: "Account", to: "/profile" },
  { title: "Billing", to: "/billing" },
  { title: "Channels", to: "/connections" },
  { title: "Preferences", to: "/settings" },
];
export function SettingsNavigation() {
  const location = useLocation();
  return <SettingsMenu key={location.key} pathname={location.pathname} />;
}

function SettingsMenu({ pathname }: { pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const active = items.some((item) => item.to === pathname);
  const [open, setOpen] = useState(active);
  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger render={<SidebarMenuButton isActive={active} />}>
          <Icon name="settings" />
          <span>Settings</span>
          <motion.span
            className="ml-auto inline-flex"
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.18 }}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              aria-hidden="true"
            />
          </motion.span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.to}>
                <SidebarMenuSubButton
                  render={<Link to={item.to} />}
                  isActive={pathname === item.to}
                  aria-current={pathname === item.to ? "page" : undefined}
                  onClick={() => setOpenMobile(false)}
                >
                  {item.title}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
