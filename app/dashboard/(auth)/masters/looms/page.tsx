"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Building2,
  Eye,
  ArrowRight,
  Sparkles
} from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";

import { useTenantStore } from "@/lib/store/use-tenant-store";

interface FactoryRowData {
  id: string;
  factoryId: string;
  factoryName: string;
  ownerName: string;
  city: string;
  total: number;
  active: number;
  underRepair: number;
  status?: string;
}

export default function LoomsPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { activeTenantId } = useTenantStore();

  const { data: looms = [], isLoading: loadingLooms } = useQuery({
    queryKey: ["looms", activeTenantId],
    queryFn: () => mastersApiService.getLooms()
  });

  const { data: factories = [], isLoading: loadingFactories } = useQuery({
    queryKey: ["factories", activeTenantId],
    queryFn: () => mastersApiService.getFactories()
  });

  // Directory Row summary per factory
  const factoryDirectory: FactoryRowData[] = factories.map((f) => {
    const factoryLooms = looms.filter(
      (l) =>
        l.factoryId === f.id ||
        l.factoryId === f.factoryId ||
        l.factoryName.toLowerCase().includes(f.factoryName.toLowerCase())
    );
    return {
      id: f.id,
      factoryId: f.factoryId || f.id,
      factoryName: f.factoryName,
      ownerName: f.ownerName || "Bhushan Khairnar",
      city: f.cityVillage || "Ichalkaranji",
      total: factoryLooms.length,
      active: factoryLooms.filter((l) => l.status === "Active").length,
      underRepair: factoryLooms.filter((l) => l.status === "Under Repair").length,
      status: "Active"
    };
  });

  const filteredDirectory = factoryDirectory.filter(
    (f) =>
      f.factoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.city.toLowerCase().includes(searchValue.toLowerCase())
  );

  const columns: TableColumn<FactoryRowData>[] = [
    {
      key: "factoryName",
      header: "Firm / Factory Name",
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/masters/factories/${encodeURIComponent(item.factoryId)}`}
          className="text-primary hover:underline flex items-center gap-2 font-bold text-sm"
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span>{item.factoryName}</span>
        </Link>
      )
    },
    {
      key: "ownerName",
      header: "Proprietor / Owner",
      sortable: true,
      render: (item) => <span className="text-xs font-medium text-muted-foreground">{item.ownerName}</span>
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      render: (item) => <span className="text-xs text-muted-foreground">{item.city}</span>
    },
    {
      key: "total",
      header: "Installed Looms",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="px-2 py-0.5 font-mono text-xs font-bold text-foreground">
          {item.total} Looms
        </Badge>
      )
    },
    {
      key: "active",
      header: "Operational Breakdown",
      render: (item) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-600 font-bold">{item.active} Active</span>
          {item.underRepair > 0 && <span className="text-red-600 font-bold">• {item.underRepair} Maintenance</span>}
        </div>
      )
    },
    { key: "createdDate", header: "Created Date", render: (item) => <span className="font-mono text-xs text-muted-foreground">{"25 Jul 2026"}</span>, sortable: true },

  ];

  return (
    <PageContainer>
      <PageHeader
        title="Loom Master & Weaving Units"
        description="Master administrative registry for Weaving Firms (Dhandai Textiles 36 Looms, Lalit Textiles 12 Looms. Click any firm row to view its complete By-ID loom file."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters" },
          { title: "Loom Master" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-1.5 border-primary/40 text-primary cursor-pointer">
              <Link href="/dashboard/masters/looms/bulk-new">
                <Layers className="h-4 w-4" /> Bulk Add Looms to Firm
              </Link>
            </Button>
            <Button asChild className="gap-1.5 bg-primary cursor-pointer font-semibold">
              <Link href="/dashboard/masters/looms/new">
                <Plus className="h-4 w-4" /> Single Loom Register Page
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        <MasterToolbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          createLabel="Register New Loom Page"
          onCreateClick={() => router.push("/dashboard/masters/looms/new")}
          exportTitle="Weaving-Firms-Directory"
          selectedFilters={{}}
          onFilterChange={() => { }}
          onClearFilters={() => setSearchValue("")}
        />

        <MasterTable
          data={filteredDirectory}
          columns={columns}
          isLoading={loadingFactories || loadingLooms}
        />
      </div>
    </PageContainer>
  );
}
