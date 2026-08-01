"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronRight,
  Component,
  Factory,
  Building2,
  Crown,
  LayoutDashboard,
  Package,
  Settings,
  Layers,
  Users,
  RefreshCw,
  Scissors,
  ShoppingCart,
  FileText,
  Truck,
  type LucideIcon
} from "lucide-react";

import { useERPStore } from "@/lib/store/use-erp-store";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isNew?: boolean;
  items?: NavItem[];
};

export const navItems: NavGroup[] = [
  {
    title: "SaaS Control Center",
    items: [
      {
        title: "Platform Overview",
        href: "/dashboard/super-admin",
        icon: Crown,
        isNew: true
      },
      {
        title: "Tenant Directory",
        href: "/dashboard/super-admin/tenants",
        icon: Building2
      },
      {
        title: "Global Factory Sheds",
        href: "/dashboard/super-admin/factories",
        icon: Factory
      },
      {
        title: "SaaS Subscriptions",
        href: "/dashboard/super-admin/subscriptions",
        icon: ShoppingCart
      },
      {
        title: "Platform Audit Logs",
        href: "/dashboard/super-admin/audit-logs",
        icon: FileText
      }
    ]
  },
  {
    title: "Operations",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/default",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Tenant Organizations",
        href: "/dashboard/masters/tenants",
        icon: Building2,
        isNew: true
      },
      {
        title: "Open Stock Master",
        href: "/dashboard/masters/open-stock",
        icon: Layers
      },
      {
        title: "Factory Master",
        href: "/dashboard/masters/factories",
        icon: Factory
      },
      {
        title: "Loom Master",
        href: "/dashboard/masters/looms",
        icon: Component
      },
      {
        title: "Party Master",
        href: "/dashboard/masters/parties",
        icon: Users
      },
      {
        title: "Labour Master",
        href: "/dashboard/masters/labour",
        icon: Users
      },
      {
        title: "Sizing Master",
        href: "/dashboard/masters/sizing-mills",
        icon: Scissors
      }
    ]
  },
  {
    title: "Yarn (Tana & Bana)",
    items: [
      {
        title: "Purchase Orders",
        href: "/dashboard/tana/purchase-orders",
        icon: ShoppingCart,
        items: [
          { title: "All Purchase Orders", href: "/dashboard/tana/purchase-orders" },
          { title: "New Purchase Order", href: "/dashboard/tana/purchase-orders/new" }
        ]
      },
      {
        title: "Goods Receipt (GRN)",
        href: "/dashboard/tana/goods-receipt",
        icon: Truck,
        items: [
          { title: "All Goods Receipts (GRN)", href: "/dashboard/tana/goods-receipt" },
          { title: "New Goods Receipt", href: "/dashboard/tana/goods-receipt/new" }
        ]
      },
      {
        title: "Purchase Invoices",
        href: "/dashboard/tana/invoices",
        icon: FileText,
        items: [
          { title: "All Purchase Invoices", href: "/dashboard/tana/invoices" },
          { title: "New Purchase Invoice", href: "/dashboard/tana/invoices/new" }
        ]
      }
    ]
  },
  {
    title: "Sizing Module",
    items: [
      {
        title: "Sizing Batches",
        href: "/dashboard/sizing",
        icon: Scissors,
        items: [
          { title: "All Sizing Batches", href: "/dashboard/sizing" },
          { title: "Pipes Information", href: "/dashboard/sizing/pipes" }
        ]
      }
    ]
  },
  {
    title: "Coming in Phase 2",
    items: [
      {
        title: "Inventory / Stock Ledger",
        href: "#",
        icon: Package,
        isComing: true,
        items: [
          { title: "Stock Balance", href: "#" },
          { title: "Stock Ledger Book", href: "#" }
        ]
      },
      {
        title: "Loom Production",
        href: "#",
        icon: Layers,
        isComing: true,
        items: [
          { title: "Loom Allocation", href: "#" },
          { title: "Daily Production Logs", href: "#" }
        ]
      },
      {
        title: "Sales & Dispatch",
        href: "#",
        icon: ShoppingCart,
        isComing: true,
        items: [
          { title: "Sales Orders", href: "#" },
          { title: "Tax Invoices", href: "#" }
        ]
      },
      {
        title: "HR & Payroll",
        href: "#",
        icon: Users,
        isComing: true,
        items: [
          { title: "Attendance", href: "#" },
          { title: "Wages Ledger", href: "#" }
        ]
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "ERP Setup",
        href: "/dashboard/setup/factory",
        icon: Settings
      },
      // {
      //   title: "Reset Onboarding",
      //   href: "#reset-erp",
      //   icon: RefreshCw
      // }
    ]
  }
];

import { useLanguage } from "@/lib/i18n/language-context";

const groupTranslationMap: Record<string, string> = {
  "Operations": "navOperations",
  "Master Data": "navMasterData",
  "Yarn (Tana & Bana)": "navWeavingYarn",
  "Sizing Module": "navSizingYarn",
  "Sales & Logistics": "navSalesLogistics",
  "Finance & Reports": "navFinanceReports",
  "Setup & Tools": "navSetupApps"
};

const itemTranslationMap: Record<string, string> = {
  "Dashboard": "navDashboard",
  "Factory Master": "navFactoryMaster",
  "Loom Master": "navLoomMaster",
  "Party Master": "navPartyMaster",
  "Labour Master": "navLabourMaster",
  "Sizing Master": "navSizingMaster",
  "Tana (Warp) Entry": "navTanaWarp",
  "Bana (Weft) Issue": "navBanaWeft",
  "Party Order": "navSalesOrder",
  "Fabric Delivery": "navDeliveryChallan",
  "Weaver Wage / Payment": "navWeaverCommission",
  "Sizing Bills": "navSizingPayment",
  "Pipes Information": "navPipesInformation"
};

import { useTenantStore, ROLE_PERMISSIONS } from "@/lib/store/use-tenant-store";

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { t } = useLanguage();
  const { currentUser, isGlobalSuperAdmin } = useTenantStore();

  const role = currentUser?.role || "Super Admin";
  const roleConfig = ROLE_PERMISSIONS[role];
  const allowedGroupTitles = roleConfig ? roleConfig.allowedNavGroupTitles : [];

  const filteredNavGroups = navItems
    .filter((group) => allowedGroupTitles.includes(group.title))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === "/dashboard/super-admin" && !isGlobalSuperAdmin) {
          return false;
        }
        return true;
      })
    }));

  const getGroupTitle = (title: string) => {
    const key = groupTranslationMap[title];
    return key ? t(key, title) : title;
  };

  const getItemTitle = (title: string) => {
    const key = itemTranslationMap[title];
    return key ? t(key, title) : title;
  };

  const handleItemClick = (e: React.MouseEvent, href: string) => {
    if (href === "#reset-erp") {
      e.preventDefault();
      useERPStore.getState().resetOnboarding();
      toast.success("ERP Onboarding settings wiped. Redirecting to start wizard...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  };

  return (
    <>
      {filteredNavGroups.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{getGroupTitle(nav.title)}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-0.5">
            <SidebarMenu>
              {nav.items.map((item) => {
                const localizedTitle = getItemTitle(item.title);
                return (
                  <SidebarMenuItem key={item.title}>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <>
                        {/* Mobile icon-only dropdown */}
                        <div className="hidden group-data-[collapsible=icon]:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={localizedTitle} className={item.isComing ? "opacity-50 cursor-not-allowed" : ""}>
                                {item.icon && <item.icon />}
                                <span>{localizedTitle}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-48 rounded-lg"
                            >
                              <DropdownMenuLabel>
                                {localizedTitle}
                                {item.isComing && <span className="text-[10px] font-normal text-muted-foreground ml-1">(Phase 2)</span>}
                              </DropdownMenuLabel>
                              {item.items?.map((sub) => (
                                <DropdownMenuItem
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10! cursor-pointer"
                                  asChild
                                  key={sub.title}
                                >
                                  <Link href={sub.href}>{getItemTitle(sub.title)}</Link>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Desktop collapsible */}
                        <Collapsible
                          className="group/collapsible block group-data-[collapsible=icon]:hidden"
                          defaultOpen={!!item.items.find((s) => pathname.startsWith(s.href.split("/new")[0]))}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={
                                item.isComing
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                              }
                              tooltip={localizedTitle}
                            >
                              {item.icon && <item.icon />}
                              <span className={item.isComing ? "text-muted-foreground/60" : ""}>{localizedTitle}</span>
                              {item.isNew && (
                                <Badge className="ml-1 text-[9px] px-1 py-0 bg-emerald-500/20 text-emerald-600 border-emerald-500/20 font-bold">
                                  NEW
                                </Badge>
                              )}
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/45" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, subKey) => (
                                <SidebarMenuSubItem key={subKey}>
                                  <SidebarMenuSubButton
                                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                    isActive={pathname === subItem.href || pathname.startsWith(subItem.href + "/") && subItem.href !== "#"}
                                    asChild
                                  >
                                    <Link href={subItem.href}>
                                      <span className="text-muted-foreground/70">{getItemTitle(subItem.title)}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <SidebarMenuButton
                        className={
                          item.isComing
                            ? "hover:text-foreground opacity-50 cursor-not-allowed select-none"
                            : "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                        }
                        isActive={pathname === item.href}
                        tooltip={localizedTitle}
                        asChild
                        onClick={(e) => handleItemClick(e, item.href)}
                      >
                        {item.href.startsWith("#") && item.href !== "#reset-erp" ? (
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon />}
                            <span>{localizedTitle}</span>
                          </div>
                        ) : (
                          <Link href={item.href}>
                            {item.icon && <item.icon />}
                            <span>{localizedTitle}</span>
                            {item.isNew && (
                              <Badge className="ml-1 text-[9px] px-1 py-0 bg-emerald-500/20 text-emerald-600 border-emerald-500/20 font-bold">
                                NEW
                              </Badge>
                            )}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    )}
                    {!!item.isComing && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-40 text-[9px] uppercase tracking-wider font-semibold">
                        Ph.2
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
