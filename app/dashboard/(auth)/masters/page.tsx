"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMastersStore } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Cpu,
  Factory,
  Database,
  Layers,
  Scissors,
  ChevronRight,
  TrendingDown,
  Warehouse,
  Calendar,
  Compass,
  FileCheck2,
  DollarSign
} from "lucide-react";

export default function MastersDirectoryPage() {
  const router = useRouter();
  const {
    parties,
    yarns,
    fabrics,
    looms,
    employees,
    shifts,
    warehouses,
    units,
    expenseCategories
  } = useMastersStore();

  const masterModules = [
    {
      title: "Open Stock Master (Admin Master)",
      description: "Unified admin master for Tana Open Stock Sets, Sizing Mill allocations, yarn ends, pipe specs, and live set details.",
      href: "/dashboard/masters/open-stock",
      icon: Database,
      count: "Admin Master",
      color: "text-primary bg-primary/10 border-primary/20"
    },
    {
      title: "Parties (Suppliers/Customers)",
      description: "Manage suppliers, yarn mills, grey cloth customers, sizing jobworkers, and transporters.",
      href: "/dashboard/masters/parties",
      icon: Users,
      count: `${parties.length} Registered`,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Yarn Specifications",
      description: "Define raw yarn counts (e.g., 40s Cotton, 150D Polyester), blends, brands, and base buying rates.",
      href: "/dashboard/masters/yarns",
      icon: Cpu,
      count: `${yarns.length} Yarn Types`,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Fabric Construction",
      description: "Register finished fabric specifications, reed pick constructions, ends, widths, and GSM.",
      href: "/dashboard/masters/fabrics",
      icon: Layers,
      count: `${fabrics.length} Qualities`,
      color: "text-sky-600 bg-sky-500/10 border-sky-500/20"
    },
    {
      title: "Loom Registry",
      description: "Track all 36 airjet and rapier looms, speeds (RPM), width cm, status, and running beams.",
      href: "/dashboard/masters/looms",
      icon: Factory,
      count: `${looms.length} Looms`,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Employees & Operators",
      description: "Maintain mukadams, weavers, mechanics, supervisors, and administrative salaries or wages rates.",
      href: "/dashboard/masters/employees",
      icon: Users,
      count: `${employees.length} Staff`,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Shift Scheduling",
      description: "Configure morning and night continuous shifts, operation hours, and break rules.",
      href: "/dashboard/masters/shifts",
      icon: Calendar,
      count: `${shifts.length} Active Shifts`,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Warehouses (Godowns)",
      description: "Track raw yarn storage sheds, warp beams racks, and fabric roll godowns.",
      href: "/dashboard/masters/warehouses",
      icon: Warehouse,
      count: `${warehouses.length} Godowns`,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "Units of Measurement (UOM)",
      description: "Define base units used in inventory and billing (KG, Meter, Cone, Beam, Roll).",
      href: "/dashboard/masters/units",
      icon: FileCheck2,
      count: `${units.length} Units`,
      color: "text-teal-600 bg-teal-500/10 border-teal-500/20"
    },
    {
      title: "Expense Categories",
      description: "Categorize operational outgoings like electricity, repairs, spares, salaries, and diesel.",
      href: "/dashboard/masters/expense-categories",
      icon: TrendingDown,
      count: `${expenseCategories.length} Categories`,
      color: "text-neutral-600 bg-neutral-500/10 border-neutral-500/20"
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="ERP Master Registries"
        description="Configure your baseline company, loom capacity, staff, and pricing registers prior to recording transactions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {masterModules.map((module, key) => {
          const Icon = module.icon;
          return (
            <Link key={key} href={module.href} className="group">
              <Card className="h-full border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${module.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold tracking-wider">
                      {module.count}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold font-display text-foreground group-hover:text-primary transition-colors mt-4 flex items-center gap-1">
                    {module.title}
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
