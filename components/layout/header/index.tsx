"use client";

import { PanelLeftIcon, ChevronDown, Check, Building2, Crown } from "lucide-react";
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
  const { tenants, activeTenantId, setActiveTenant, isGlobalSuperAdmin } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const handleSwitch = (id: string) => {
    setActiveTenant(id);
    const target = tenants.find((t) => t.id === id);
    toast.success(`Switched Tenant Mill: ${target?.name}`);
  };

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost">
          <PanelLeftIcon />
        </Button>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        
        {/* Header Title / Tenant Switcher */}
        {isGlobalSuperAdmin ? (
          <Link href="/dashboard/super-admin" className="hidden sm:flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 gap-1.5 px-3 py-1 text-xs font-bold hover:bg-amber-500/30 transition-colors">
              <Crown className="h-4 w-4" /> Global SaaS Super Admin Control
            </Badge>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex h-8 gap-2 bg-background/80 border-emerald-500/20 hover:border-emerald-500/40 text-xs font-semibold px-2.5 cursor-pointer">
                <span className="text-base">{activeTenant.logo}</span>
                <span className="truncate max-w-[140px] text-foreground">{activeTenant.name}</span>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {activeTenant.cluster.split(",")[0]}
                </Badge>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl p-2 shadow-xl">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Select Tenant Organization
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenants.map((t) => {
                const isSelected = t.id === activeTenantId;
                return (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => handleSwitch(t.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                      isSelected ? "bg-emerald-500/10 font-bold text-emerald-900 dark:text-emerald-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{t.logo}</span>
                      <div className="flex flex-col truncate">
                        <span className="truncate">{t.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{t.cluster}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Separator orientation="vertical" className="mx-2 hidden sm:block data-[orientation=vertical]:h-4" />
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
