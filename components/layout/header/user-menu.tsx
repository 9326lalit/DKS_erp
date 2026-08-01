"use client";

import { BadgeCheck, Building2, ChevronRightIcon, LogOut, ShieldCheck, Sparkles, Factory, UserCheck, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenantStore, UserRole, ROLE_PERMISSIONS } from "@/lib/store/use-tenant-store";
import { toast } from "sonner";

export default function UserMenu() {
  const router = useRouter();
  const { currentUser, tenants, activeTenantId, switchRole, logout, isGlobalSuperAdmin } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const name = currentUser?.name || activeTenant.businessDetails.ownerName || "Mill Owner";
  const email = currentUser?.email || activeTenant.businessDetails.email || "admin@textilerp.com";
  const role = currentUser?.role || "Super Admin";
  const avatar = currentUser?.avatarUrl || "/images/avatars/01.png";

  const rolesList: UserRole[] = [
    "Global Super Admin",
    "Super Admin",
    "Mill Manager",
    "Production Head",
    "Accountant"
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    toast.success(`Switched Active Role to: ${newRole}`);
    if (newRole === "Global Super Admin") {
      router.push("/dashboard/super-admin");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    router.push("/dashboard/login/v2");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer border border-emerald-500/30 hover:border-emerald-500 transition-colors">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-emerald-600 text-white font-bold">
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2 shadow-xl" align="end">
        <DropdownMenuLabel className="p-1 font-normal">
          <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-10 w-10 border border-emerald-500/30">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-emerald-600 text-white font-bold">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold">{name}</span>
              <span className="text-muted-foreground truncate text-xs">{email}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {activeTenant.name}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-semibold">• {role}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer text-xs flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              <span>Switch Testing Role ({role})</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56 p-1 rounded-xl">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-bold px-2 py-1">
                Select Active Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {rolesList.map((r) => {
                const isSelected = r === role;
                return (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`text-xs flex items-center justify-between cursor-pointer ${
                      isSelected ? "bg-emerald-500/10 font-bold text-emerald-900 dark:text-emerald-200" : ""
                    }`}
                  >
                    <span>{r}</span>
                    {r === "Global Super Admin" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {isGlobalSuperAdmin && (
            <DropdownMenuItem onClick={() => router.push("/dashboard/super-admin/tenants")} className="cursor-pointer text-xs">
              <Building2 className="h-4 w-4 text-emerald-500" />
              <span>Manage Tenant Directory ({tenants.length})</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push("/dashboard/masters")} className="cursor-pointer text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Mill Business Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-rose-600 dark:text-rose-400 cursor-pointer text-xs">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
