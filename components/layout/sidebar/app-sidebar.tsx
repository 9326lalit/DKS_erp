"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown, Factory, Building2, Check, Plus, ShieldCheck, Crown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";
import Link from "next/link";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-context";
import { useTenantStore } from "@/lib/store/use-tenant-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();
  const { t } = useLanguage();

  const { tenants, activeTenantId, activeUnitId, setActiveTenant, setActiveUnit, isGlobalSuperAdmin } = useTenantStore();
  const activeTenant = tenants.find((tenant) => tenant.id === activeTenantId) || tenants[0];
  const activeUnit = activeTenant.units.find((unit) => unit.id === activeUnitId) || activeTenant.units[0];

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  const handleTenantSwitch = (tenantId: string) => {
    setActiveTenant(tenantId);
    const tenant = tenants.find((t) => t.id === tenantId);
    toast.success(`Switched Active Mill Tenant to: ${tenant?.name || "Tenant"}`);
  };

  const handleUnitSwitch = (unitId: string) => {
    setActiveUnit(unitId);
    const unit = activeTenant.units.find((u) => u.id === unitId);
    toast.success(`Active Weaving Shed set to: ${unit?.name || "Unit"}`);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isGlobalSuperAdmin ? (
              <SidebarMenuButton
                onClick={() => router.push("/dashboard/super-admin")}
                className="hover:text-foreground h-12 group-data-[collapsible=icon]:px-0! hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
                  <Crown className="h-5 w-5 text-slate-950" />
                </div>
                <div className="flex flex-col text-left truncate leading-tight flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-foreground font-bold text-sm truncate">DKS SaaS Platform</span>
                    <Badge className="bg-amber-500 text-slate-950 text-[9px] px-1 py-0 font-extrabold">SUPER ADMIN</Badge>
                  </div>
                  <span className="text-muted-foreground text-[11px] truncate">
                    Global Control Center
                  </span>
                </div>
              </SidebarMenuButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="hover:text-foreground h-12 group-data-[collapsible=icon]:px-0! hover:bg-emerald-500/10 transition-colors">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shrink-0">
                      <span>{activeTenant?.logo || "🏭"}</span>
                    </div>
                    <div className="flex flex-col text-left truncate leading-tight flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-foreground font-bold text-sm truncate">{activeTenant?.name || "DKS ERP"}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                          {activeTenant?.plan}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-[11px] truncate">
                        {activeUnit?.name || activeTenant?.cluster}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-xl p-2 shadow-xl"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Multi-Tenant Organizations</span>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                    {tenants.length} Mills
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup className="space-y-1 my-1">
                  {tenants.map((tenant) => {
                    const isCurrent = tenant.id === activeTenantId;
                    return (
                      <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => handleTenantSwitch(tenant.id)}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer ${
                          isCurrent ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg">{tenant.logo}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm truncate">{tenant.name}</span>
                            <span className="text-[11px] text-muted-foreground truncate">{tenant.cluster}</span>
                          </div>
                        </div>
                        {isCurrent ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">{tenant.factoryDetails.totalLooms} Looms</span>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>

                {activeTenant.units.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      Active Tenant Sheds / Units ({activeTenant.name})
                    </DropdownMenuLabel>
                    <DropdownMenuGroup className="space-y-1 my-1">
                      {activeTenant.units.map((unit) => {
                        const isUnitCurrent = unit.id === activeUnitId;
                        return (
                          <DropdownMenuItem
                            key={unit.id}
                            onClick={() => handleUnitSwitch(unit.id)}
                            className={`flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer text-xs ${
                              isUnitCurrent ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Factory className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{unit.name}</span>
                            </div>
                            {isUnitCurrent && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/masters/tenants")}
                  className="flex items-center gap-2 p-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register & Manage Tenant Mills</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
