"use client";

import { PanelLeftIcon, ChevronDown, Check, Building2, Crown, Factory } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Notifications from "@/components/layout/header/notifications";
import Search from "@/components/layout/header/search";
import LanguageSwitch from "@/components/layout/header/language-switch";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import UserMenu from "@/components/layout/header/user-menu";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTenantStore } from "@/lib/store/use-tenant-store";
import { toast } from "sonner";
import Link from "next/link";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { tenants, activeTenantId, activeUnitId, setActiveUnit, isGlobalSuperAdmin } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const activeUnit = activeTenant.units.find((u) => u.id === activeUnitId) || activeTenant.units[0];

  const handleUnitSwitch = (id: string) => {
    setActiveUnit(id);
    const target = activeTenant.units.find((u) => u.id === id);
    toast.success(`Switched Active Shed Unit: ${target?.name}`);
  };

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost">
          <PanelLeftIcon />
        </Button>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

        {/* Header Title Badge */}
        {isGlobalSuperAdmin ? (
          <Link href="/dashboard/super-admin" className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors">
              <Crown className="h-3.5 w-3.5" /> Global SaaS Control Center
            </div>
          </Link>
        ) : activeTenant.units.length > 1 ? (
          /* Shed Unit Switcher for active mill's internal units only */
          <DropdownMenu>

          </DropdownMenu>
        ) : (
          /* Static Company Header Badge for Mill */
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-background/80 text-xs font-semibold">
            <span className="text-base">{activeTenant.logo}</span>
            <span className="text-foreground font-bold">{activeTenant.name}</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {activeTenant.cluster.split(",")[0]}
            </Badge>
          </div>
        )}

        {/* <Separator orientation="vertical" className="mx-2 hidden sm:block data-[orientation=vertical]:h-4" /> */}
        <Search />

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitch />
          <Notifications />
          <ThemeSwitch />
          <ThemeCustomizerPanel />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
