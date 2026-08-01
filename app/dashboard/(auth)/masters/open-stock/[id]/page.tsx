"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSizingStore, PipeItem } from "@/lib/store/use-sizing-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  Package,
  Layers,
  Scissors,
  Building2,
  Scale,
  Calendar,
  Sparkles,
  Warehouse,
  Cylinder
} from "lucide-react";

export default function OpenStockDetailPage({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const routeParams = useParams();
  const { openingStocks, pipes } = useSizingStore();

  const rawId = routeParams?.id || params?.id || "";
  const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);
  const decodedId = decodeURIComponent(id || "");

  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });

  // Flexible matching for ID or Set Number
  const stock =
    openingStocks.find(
      (s) =>
        s.id === decodedId ||
        s.setNumber === decodedId ||
        s.id.toLowerCase() === decodedId.toLowerCase() ||
        s.setNumber.toLowerCase() === decodedId.toLowerCase() ||
        decodedId.replace("OP-STOCK", "OPEN-STOCK") === s.id ||
        s.id.replace("OPEN-STOCK", "OP-STOCK") === decodedId
    ) || openingStocks[0];

  if (!stock) {
    return (
      <PageContainer>
        <div className="text-center py-16 space-y-3">
          <h2 className="text-xl font-bold text-foreground">Open Stock Record Not Found</h2>
          <p className="text-xs text-muted-foreground">
            No set stock matching ID <code className="font-mono text-primary font-bold">{decodedId}</code> was found in Master Data.
          </p>
          <Button asChild className="mt-2 bg-primary">
            <Link href="/dashboard/masters/open-stock">Return to Open Stock Master</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Pipes associated with this set
  const rawSetPipes = pipes.filter((p) => p.setNumber === stock.setNumber);

  // Fallback pipe generator if no pipes found in store for this set
  const displayPipes: PipeItem[] =
    rawSetPipes.length > 0
      ? rawSetPipes
      : Array.from({ length: stock.totalPipes }).map((_, idx) => ({
        id: `PIPE-AUTO-${stock.setNumber}-${idx + 1}`,
        pipeNumber: `PIPE-${stock.setNumber}-${String(idx + 1).padStart(3, "0")}`,
        setNumber: stock.setNumber,
        poNumber: stock.poNumber,
        tanaNumber: stock.tanaNumber,
        itemName: stock.itemName,
        weightKg: stock.weightPerPipeKg,
        status: "Available",
        currentLocation: stock.sizingName,
        date: stock.date
      }));

  const filteredPipes = displayPipes.filter((p) => {
    const ms = p.pipeNumber.toLowerCase().includes(searchValue.toLowerCase()) || p.currentLocation.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || p.status === selectedFilters.status;
    return ms && mst;
  });

  const remainingPercent = Math.round((stock.remainingStockKg / stock.totalWeightKg) * 100);

  const columns: TableColumn<PipeItem>[] = [
    {
      key: "pipeNumber",
      header: "Pipe Number",
      sortable: true,
      render: (item) => (
        <span className="font-bold font-mono text-primary flex items-center gap-1">
          <Cylinder className="h-3.5 w-3.5" /> {item.pipeNumber}
        </span>
      )
    },
    { key: "setNumber", header: "Set Number", render: (item) => <span className="font-semibold font-mono">{item.setNumber}</span> },
    { key: "poNumber", header: "PO Reference", render: (item) => <span className="font-mono text-xs">{item.poNumber}</span> },
    {
      key: "weightKg",
      header: "Weight (KG)",
      sortable: true,
      render: (item) => <span className="font-bold font-mono text-emerald-600">{item.weightKg} KG</span>
    },
    { key: "currentLocation", header: "Storage / Mill Location", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.status === "Available"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
              : item.status === "Mounted on Loom"
                ? "bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold"
          }
        >
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`Set Master File: ${stock.setNumber}`}
        description={`Full administrative detail file for Tana Open Stock Set ${stock.setNumber} located at ${stock.sizingName}.`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Master Data", href: "/dashboard/masters" },
          { title: "Open Stock Master", href: "/dashboard/masters/open-stock" },
          { title: stock.setNumber }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="default" size="sm" onClick={() => window.print()} className="h-9 gap-1.5 bg-primary cursor-pointer font-bold">
              <Printer className="h-4 w-4" /> Print Set File
            </Button>
          </div>
        }
      />

      {/* Main Set Overview Header Card */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2 border-border/40 shadow-xs bg-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-mono text-sm px-2.5 py-0.5">
                  {stock.setNumber}
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                  Sizing Ready Set
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Registered Date: {stock.date}
              </span>
            </div>
            <CardTitle className="text-xl font-bold font-display text-foreground mt-3">
              {stock.itemName}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Tana Number: <span className="font-mono text-foreground font-semibold">{stock.tanaNumber}</span> • PO Reference: <span className="font-mono text-primary font-bold">{stock.poNumber}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl border border-border/40 bg-muted/10">
                <span className="text-muted-foreground block text-[11px] font-bold uppercase">Sizing Mill</span>
                <span className="font-bold text-sm text-foreground mt-0.5 block">{stock.sizingName}</span>
              </div>

              <div className="p-3 rounded-xl border border-border/40 bg-muted/10">
                <span className="text-muted-foreground block text-[11px] font-bold uppercase">Material Owner</span>
                <span className="font-bold text-sm text-foreground mt-0.5 block">{stock.materialOwner}</span>
              </div>

              <div className="p-3 rounded-xl border border-border/40 bg-muted/10">
                <span className="text-muted-foreground block text-[11px] font-bold uppercase">Total Warp Ends</span>
                <span className="font-bold text-sm text-purple-600 mt-0.5 block">{stock.totalTaar} Ends</span>
              </div>

              <div className="p-3 rounded-xl border border-border/40 bg-muted/10">
                <span className="text-muted-foreground block text-[11px] font-bold uppercase">Total Set Weight</span>
                <span className="font-bold text-sm text-emerald-600 mt-0.5 block">{stock.totalWeightKg} kg</span>
              </div>
            </div>

            <Separator />

            {/* Inventory Balance Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Warehouse className="h-4 w-4 text-primary" /> Set Inventory Balance
                </span>
                <span className="font-bold text-emerald-600">
                  {stock.remainingStockKg} kg Available ({remainingPercent}%)
                </span>
              </div>
              <Progress value={remainingPercent} className="h-3 bg-emerald-500/20" />
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                <span>Gross Weight Received: {stock.totalWeightKg} kg</span>
                <span>Material Issued/Used: {stock.materialUsedKg} kg</span>
              </div>
            </div>

            {stock.remarks && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30 text-xs text-muted-foreground">
                <span className="font-bold text-foreground block mb-1">Supervisor Remarks &amp; Notes:</span>
                "{stock.remarks}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side Technical Card */}
        <div className="space-y-6">
          <Card className="border-border/40 shadow-xs bg-card">
            <CardHeader className="p-4 pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Scissors className="h-4 w-4 text-primary" /> Technical Pipe Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-muted-foreground">Total Bags Received:</span>
                <span className="font-bold">{stock.totalBags} Bags</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-muted-foreground">Total Pipes Count:</span>
                <span className="font-bold">{stock.totalPipes} Pipes</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-muted-foreground">Weight per Pipe:</span>
                <span className="font-bold text-emerald-600">{stock.weightPerPipeKg} kg / Pipe</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-muted-foreground">Total Pipe Net Weight:</span>
                <span className="font-bold font-mono">{(stock.totalPipes * stock.weightPerPipeKg).toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Sizing Chemical Added:</span>
                <span className="font-bold text-amber-600">+{stock.sizingChemicalAddedKg || 0} kg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-xs">
            <CardContent className="p-4 space-y-3 text-xs">
              <h4 className="font-bold text-primary flex items-center gap-1.5 text-sm">
                <Sparkles className="h-4 w-4" /> Next Sizing Action
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Issue this warp set for Sizing Production Entry.
              </p>
              <Button asChild className="w-full bg-primary text-primary-foreground font-semibold gap-2 cursor-pointer">
                <Link href={`/dashboard/sizing/new?setNumber=${stock.setNumber}`}>
                  <Scissors className="h-4 w-4" /> Create Sizing Production Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pipes Breakdown Data Table */}
      <Card className="border-border/40 shadow-sm bg-card">
        <CardHeader className="p-4 border-b border-border/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Cylinder className="h-5 w-5 text-primary" /> Registered Beam Pipes Breakdown Data Table
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Paginated Data Table for all beam pipes allocated under Set {stock.setNumber}.
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold font-mono">
            {displayPipes.length} Pipes Total
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <MasterToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            createLabel="Add Pipe"
            onCreateClick={() => router.push("/dashboard/sizing/pipes")}
            exportTitle={`Pipes_Breakdown_${stock.setNumber}`}
            selectedFilters={selectedFilters}
            onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
            onClearFilters={() => {
              setSearchValue("");
              setSelectedFilters({ status: "all" });
            }}
            filters={[
              {
                key: "status",
                placeholder: "Pipe Status",
                options: [
                  { label: "Available", value: "Available" },
                  { label: "Mounted on Loom", value: "Mounted on Loom" },
                  { label: "Empty Pipe", value: "Empty Pipe" },
                  { label: "In Transit", value: "In Transit" }
                ]
              }
            ]}
          />

          <MasterTable
            data={filteredPipes}
            columns={columns}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
