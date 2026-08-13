"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { BellIcon, Building2, CreditCardIcon, LogOutIcon, UserCircle2Icon, ShieldCheck } from "lucide-react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useTenantStore } from "@/lib/store/use-tenant-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { currentUser, tenants, activeTenantId, logout } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const name = currentUser?.name || activeTenant.businessDetails.ownerName || "Mill Manager";
  const email = currentUser?.email || activeTenant.businessDetails.email || "admin@textilerp.com";
  const role = currentUser?.role || "Super Admin";
  const avatar = currentUser?.avatarUrl || "/images/avatars/01.png";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    logout();
    toast.success("Logged out successfully. Session cleared.");
    router.push("/dashboard/login/v2");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-9 w-9 rounded-lg border border-emerald-500/30">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg bg-emerald-600 text-white font-bold">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate font-semibold text-xs">{name}</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {role}
                  </Badge>
                </div>
                <span className="text-muted-foreground truncate text-[11px]">{activeTenant.name}</span>
              </div>
              <DotsVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2 shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-1 font-normal">
              <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg border border-emerald-500/30">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg bg-emerald-600 text-white font-bold">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-sm">{name}</span>
                  </div>
                  <span className="text-muted-foreground truncate text-xs">{email}</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                    {activeTenant.name} • {role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/masters/tenants")} className="cursor-pointer">
                <Building2 className="h-4 w-4 text-emerald-500" />
                <span>Manage Tenant Mill</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/masters")} className="cursor-pointer">
                <ShieldCheck className="h-4 w-4" />
                <span>Mill Organization Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 dark:text-rose-400 cursor-pointer">
              <LogOutIcon className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
