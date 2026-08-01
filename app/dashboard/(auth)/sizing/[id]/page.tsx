"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSizingStore, PipeItem } from "@/lib/store/use-sizing-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  Scissors,
  Building2,
  Scale,
  Calendar,
  Sparkles,
  CheckCircle2,
  Layers,
  Truck,
  DollarSign,
  Cylinder,
  Package,
  FileText
} from "lucide-react";

export default function SizingBatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);

  const { openingStocks, batches, factoryReceivings, pipes, updatePipeStatus } = useSizingStore();

  // Find opening stock entry or batch entry matching ID or setNumber
  const opStock = openingStocks.find(
    (o) =>
      o.id === decodedId ||
      o.setNumber.toLowerCase() === decodedId.toLowerCase() ||
      decodedId.toLowerCase().includes(o.setNumber.toLowerCase())
  );

  const batch = batches.find(
    (b) =>
      b.id === decodedId ||
      b.batchNumber.toLowerCase() === decodedId.toLowerCase() ||
      (opStock && (b as any).setNumber === opStock.setNumber)
  );

  const targetSetNumber = opStock?.setNumber || (batch as any)?.setNumber || decodedId;

  // Filter pipes belonging to this set
  const setPipes = pipes.filter(
    (p) => p.setNumber === targetSetNumber || p.setNumber.toLowerCase().includes(targetSetNumber.toLowerCase())
  );

  const displayPipes = setPipes.length > 0 ? setPipes : pipes;

  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });

  const filteredPipes = displayPipes.filter((p) => {
    const ms = p.pipeNumber.toLowerCase().includes(searchValue.toLowerCase()) || p.setNumber.toLowerCase().includes(searchValue.toLowerCase()) || p.currentLocation.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || p.status === selectedFilters.status;
    return ms && mst;
  });

  const pipeColumns: TableColumn<PipeItem>[] = [
    {
      key: "pipeNumber",
      header: "Pipe Number",
      sortable: true,
      render: (item) => <span className="font-bold font-mono text-primary">{item.pipeNumber}</span>
    },
    {
      key: "setNumber",
      header: "Set Number",
      sortable: true,
      render: (item) => <span className="font-semibold font-mono">{item.setNumber}</span>
    },
    {
      key: "weightKg",
      header: "Weight (KG)",
      sortable: true,
      render: (item) => <span className="font-bold text-emerald-600">{item.weightKg} KG</span>
    },
    {
      key: "currentLocation",
      header: "Current Location",
      sortable: true,
      render: (item) => <span className="text-xs text-foreground font-medium">{item.currentLocation}</span>
    },
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
        title={`Sizing Set & Pipes File: ${targetSetNumber}`}
        description={`Full breakdown of Pipes 1 to N, Opening Stock Specs, and Material Ownership for Set ${targetSetNumber}.`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing Module", href: "/dashboard/sizing" },
          { title: targetSetNumber }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/sizing")} className="h-9 gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back to Sizing Portal
            </Button>
            <Button variant="default" size="sm" onClick={() => window.print()} className="h-9 gap-1.5 bg-primary cursor-pointer font-bold">
              <Printer className="h-4 w-4" /> Print Set File
            </Button>
          </div>
        }
      />

      {/* TOP KPI & SPECS SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Set Reference</p>
              <h3 className="text-xl font-bold font-mono text-primary mt-1">{targetSetNumber}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{opStock?.itemName || batch?.batchNumber || "40s Cotton Warp"}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Cylinder className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Material Owner (Party)</p>
              <h3 className="text-base font-bold text-foreground mt-1">{opStock?.materialOwner || "DKS Textiles"}</h3>
              <p className="text-[11px] text-blue-600 font-bold mt-1">Konacha Maal</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Pipes Count</p>
              <h3 className="text-xl font-bold text-purple-600 mt-1">{opStock?.totalPipes || setPipes.length || 12} Pipes</h3>
              <p className="text-[11px] text-muted-foreground mt-1">~{opStock?.weightPerPipeKg || 33} KG / Pipe</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Stock Balance</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">{(opStock?.remainingStockKg || 350).toLocaleString()} KG</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Available Sized Stock</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DETAILED OPENING STOCK & SET SPECIFICATIONS CARD */}
      {opStock && (
        <Card className="border-primary/20 bg-card shadow-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/30">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Sizing Opening Stock Contract Specs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-4 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Entry Date:</span>
              <strong className="text-foreground text-sm">{opStock.date}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Sizing Mill Name:</span>
              <strong className="text-foreground text-sm">{opStock.sizingName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">PO Reference Number:</span>
              <strong className="text-primary text-sm font-mono">{opStock.poNumber}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Taar Count:</span>
              <strong className="text-foreground text-sm">{opStock.totalTaar} Taar</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Material Used in Sizing:</span>
              <strong className="text-amber-600 text-sm font-mono">{opStock.materialUsedKg} KG</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Remaining Stock Balance:</span>
              <strong className="text-emerald-600 text-sm font-mono">{opStock.remainingStockKg} KG</strong>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PIPES 1 TO N DEDICATED MASTER TABLE */}
      <Card className="border-border/40 shadow-sm bg-card">
        <CardHeader className="p-4 border-b border-border/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Cylinder className="h-5 w-5 text-primary" /> Pipes 1 to N Inventory Directory
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Complete paginated inventory list for all Sizing Pipes registered under Set {targetSetNumber}.
            </CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
            {displayPipes.length} Pipes Total
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <MasterToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            createLabel="Add Pipe"
            onCreateClick={() => router.push("/dashboard/sizing/pipes")}
            exportTitle={`Pipes_Set_${targetSetNumber}`}
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
            columns={pipeColumns}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
