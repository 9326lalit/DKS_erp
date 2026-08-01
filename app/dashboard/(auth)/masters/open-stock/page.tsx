"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSizingStore, OpeningStockEntry } from "@/lib/store/use-sizing-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Plus,
  Search,
  Eye,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle2,
  Scale,
  ArrowRight,
  Warehouse
} from "lucide-react";

export default function OpenStockMasterPage() {
  const router = useRouter();
  const { openingStocks } = useSizingStore();

  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ sizingName: "all" });

  // Selected Stock for Live Interactive Details Card
  const [selectedStockForPreview, setSelectedStockForPreview] = useState<OpeningStockEntry | null>(
    openingStocks[0] || null
  );

  // Filtered stocks list
  const filteredStocks = openingStocks.filter((stock) => {
    const matchesSearch =
      stock.setNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      stock.itemName.toLowerCase().includes(searchValue.toLowerCase()) ||
      stock.sizingName.toLowerCase().includes(searchValue.toLowerCase()) ||
      stock.materialOwner.toLowerCase().includes(searchValue.toLowerCase());

    const matchesMill = selectedFilters.sizingName === "all" || stock.sizingName === selectedFilters.sizingName;
    return matchesSearch && matchesMill;
  });

  // Aggregated KPI Stats
  const totalSets = openingStocks.length;
  const totalWeightSum = openingStocks.reduce((acc, curr) => acc + curr.totalWeightKg, 0);
  const totalRemainingSum = openingStocks.reduce((acc, curr) => acc + curr.remainingStockKg, 0);
  const activeWarpEndsAvg =
    openingStocks.length > 0
      ? Math.round(openingStocks.reduce((acc, curr) => acc + curr.totalTaar, 0) / openingStocks.length)
      : 0;

  const millOptions = Array.from(new Set(openingStocks.map((s) => s.sizingName))).map((mill) => ({
    label: mill,
    value: mill
  }));

  const columns: TableColumn<OpeningStockEntry>[] = [
    {
      key: "setNumber",
      header: "Set Number",
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/masters/open-stock/${encodeURIComponent(item.id)}`}
          className="font-bold font-mono text-primary hover:underline flex items-center gap-1"
        >
          <span>{item.setNumber}</span>
        </Link>
      )
    },
    { key: "date", header: "Date", sortable: true },
    { key: "sizingName", header: "Sizing Mill", sortable: true },
    {
      key: "materialOwner",
      header: "Owner / Party",
      sortable: true,
      render: (item) => <Badge variant="outline" className="bg-blue-500/10 text-blue-600 font-bold">{item.materialOwner}</Badge>
    },
    {
      key: "itemName",
      header: "Item & Taar",
      render: (item) => (
        <div>
          <span className="font-semibold block text-xs">{item.itemName}</span>
          <span className="text-[10px] text-purple-600 font-medium">{item.totalTaar} Ends • {item.totalPipes} Pipes</span>
        </div>
      )
    },
    {
      key: "totalWeightKg",
      header: "Gross Wt",
      sortable: true,
      render: (item) => <span className="font-bold font-mono text-xs">{item.totalWeightKg} KG</span>
    },
    {
      key: "remainingStockKg",
      header: "Remaining Stock",
      sortable: true,
      render: (item) => (
        <span className="font-bold font-mono text-xs text-emerald-600">
          {item.remainingStockKg} KG
        </span>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Open Stock Master (Admin Master)"
        description="Comprehensive administrative registry for Tana (Warp) Open Stock Sets, sizing mill allocations, pipe specifications, and raw yarn inventory balances."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Master Registries", href: "/dashboard/masters" },
          { title: "Open Stock Master" }
        ]}
        actions={
          <Button asChild className="gap-2 bg-primary font-semibold shadow-sm cursor-pointer">
            <Link href="/dashboard/masters/open-stock/new">
              <Plus className="h-4 w-4" />
              New Open Stock Entry
            </Link>
          </Button>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Stock Sets</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-foreground">{totalSets}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Registered in Master
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Raw Weight</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-foreground">{totalWeightSum.toLocaleString()} kg</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Gross Yarn Weight Received</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Scale className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Remaining Stock</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-emerald-600">{totalRemainingSum.toLocaleString()} kg</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Available for Sizing</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Warehouse className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Warp Taar (Ends)</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-purple-600">{activeWarpEndsAvg.toLocaleString()} Ends</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Average Ends per Set</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout: MasterTable + Live Set Preview Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Data Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <MasterToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            createLabel="New Open Stock"
            onCreateClick={() => router.push("/dashboard/masters/open-stock/new")}
            exportTitle="Open_Stock_Master"
            selectedFilters={selectedFilters}
            onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
            onClearFilters={() => {
              setSearchValue("");
              setSelectedFilters({ sizingName: "all" });
            }}
            filters={[
              {
                key: "sizingName",
                placeholder: "Sizing Mill",
                options: millOptions
              }
            ]}
          />

          <MasterTable
            data={filteredStocks}
            columns={columns}
            isLoading={false}
            onView={(item) => router.push(`/dashboard/masters/open-stock/${encodeURIComponent(item.id)}`)}
          />
        </div>

        {/* Right Column: Interactive Set Details Live Preview Card */}
        <div className="space-y-4">
          <Card className="border-primary/20 shadow-md bg-card sticky top-20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-background text-primary border-primary/30 font-mono text-xs">
                  {selectedStockForPreview?.setNumber || "SELECT SET"}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                  Sizing Ready Set
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold font-display text-foreground mt-2">
                {selectedStockForPreview ? selectedStockForPreview.itemName : "Select a Set to View Details"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set Preview with complete info, yarn ends, pipe specs, and remaining inventory.
              </CardDescription>
            </CardHeader>

            {selectedStockForPreview ? (
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Visual Progress Bar for Stock */}
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Stock Utilization</span>
                    <span className="font-bold text-emerald-600">
                      {selectedStockForPreview.remainingStockKg} kg / {selectedStockForPreview.totalWeightKg} kg
                    </span>
                  </div>
                  <Progress
                    value={Math.round((selectedStockForPreview.remainingStockKg / selectedStockForPreview.totalWeightKg) * 100)}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Sizing Mill:</span>
                    <span className="font-bold text-foreground">{selectedStockForPreview.sizingName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Material Owner:</span>
                    <span className="font-bold text-blue-600">{selectedStockForPreview.materialOwner}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Taar (Ends):</span>
                    <span className="font-bold text-purple-600 font-mono">{selectedStockForPreview.totalTaar} Ends</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/40 bg-muted/10">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Pipes:</span>
                    <span className="font-bold text-foreground font-mono">{selectedStockForPreview.totalPipes} Pipes</span>
                  </div>
                </div>

                <Button asChild className="w-full font-bold gap-2 cursor-pointer bg-primary">
                  <Link href={`/dashboard/masters/open-stock/${encodeURIComponent(selectedStockForPreview.id)}`}>
                    <Eye className="h-4 w-4" />
                    Open Full Set Master Page (By ID)
                  </Link>
                </Button>
              </CardContent>
            ) : null}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
