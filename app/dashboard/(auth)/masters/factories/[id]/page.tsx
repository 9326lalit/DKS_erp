"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Scale,
  Sparkles,
  Plus,
  MapPin,
  Phone,
  Zap,
  Scissors,
  Maximize2
} from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Loom, useMastersStore } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function FactoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);

  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    loomType: "all",
    status: "all"
  });
  const [viewLoom, setViewLoom] = useState<Loom | null>(null);

  const { data: factories = [], isLoading: loadingFactories } = useQuery({
    queryKey: ["factories"],
    queryFn: () => mastersApiService.getFactories()
  });

  const { data: looms = [], isLoading: loadingLooms } = useQuery({
    queryKey: ["looms"],
    queryFn: () => mastersApiService.getLooms()
  });

  const updateMutation = useMutation({
    mutationFn: (l: Loom) => mastersApiService.updateLoom(l),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["looms"] });
      toast.success("Loom status updated.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteLoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["looms"] });
      toast.success("Loom removed from unit.");
    }
  });

  // Find factory by ID or Name match
  const factory = factories.find(
    (f) =>
      f.id === decodedId ||
      f.factoryId === decodedId ||
      f.factoryName.toLowerCase() === decodedId.toLowerCase()
  ) || factories[0];

  const factoryLooms = looms.filter(
    (l) =>
      l.factoryId === factory?.id ||
      l.factoryId === factory?.factoryId ||
      (factory?.factoryName && l.factoryName.toLowerCase().includes(factory.factoryName.toLowerCase())) ||
      (factory?.factoryName && factory.factoryName.toLowerCase().includes(l.factoryName.toLowerCase()))
  );

  const filteredLooms = factoryLooms.filter((l) => {
    const matchesSearch =
      l.loomNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      l.loomType.toLowerCase().includes(searchValue.toLowerCase()) ||
      l.loomId.toLowerCase().includes(searchValue.toLowerCase()) ||
      (l.makeBrand || "").toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = selectedFilters.loomType === "all" || l.loomType === selectedFilters.loomType;
    const matchesStatus = selectedFilters.status === "all" || l.status === selectedFilters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = factoryLooms.filter((l) => l.status === "Active").length;
  const idleCount = factoryLooms.filter((l) => l.status === "Idle").length;
  const repairCount = factoryLooms.filter((l) => l.status === "Under Repair").length;
  const activePercent = factoryLooms.length > 0 ? Math.round((activeCount / factoryLooms.length) * 100) : 0;

  if (loadingFactories || loadingLooms) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-xs text-muted-foreground">Loading Weaving Unit File...</div>
      </PageContainer>
    );
  }

  if (!factory) {
    return (
      <PageContainer>
        <div className="py-20 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Weaving Unit / Factory not found.</p>
          <Button onClick={() => router.push("/dashboard/masters/looms")} variant="outline" size="sm">
            Back to Loom Master
          </Button>
        </div>
      </PageContainer>
    );
  }

  const statusColors: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Idle: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Under Repair": "bg-red-500/10 text-red-600 border-red-700/20"
  };

  const columns: TableColumn<Loom>[] = [
    { key: "loomNumber", header: "Loom No.", sortable: true, render: (item) => <span className="font-mono font-bold text-primary text-sm">{item.loomNumber}</span> },
    { key: "loomId", header: "Loom Code", sortable: true, render: (item) => <Badge variant="outline" className="font-mono text-[10px]">{item.loomId}</Badge> },
    { key: "loomType", header: "Loom Type", sortable: true, render: (item) => <Badge variant="secondary" className="text-[10px] font-bold">{item.loomType}</Badge> },
    { key: "rpmSpeed", header: "Speed (RPM)", sortable: true, render: (item) => <span className="font-mono font-bold">{item.rpmSpeed ? `${item.rpmSpeed} RPM` : "—"}</span> },
    { key: "reedCount", header: "Reed / Width", render: (item) => <span className="text-muted-foreground text-xs">{item.reedCount ? `${item.reedCount} R` : "—"} • {item.widthInches ? `${item.widthInches}"` : "—"}</span> },
    { key: "makeBrand", header: "Make/Brand", sortable: true, render: (item) => <span className="text-xs font-medium">{item.makeBrand || "Standard"}</span> },
    { key: "assignedLabourName", header: "Assigned Weaver", render: (item) => <span className="text-xs">{item.assignedLabourName || "Shared Pool"}</span> },
    { key: "status", header: "Status", sortable: true, render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${statusColors[item.status] || ""}`}>{item.status}</Badge> }
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`${factory.factoryName} — Weaving Unit File`}
        description={`Executive unit file, shed capacity specs, and paginated data table for all ${factoryLooms.length} registered looms.`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Loom Master", href: "/dashboard/masters/looms" },
          { title: factory.factoryName }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/masters/looms")} className="h-9 gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back to Loom Master
            </Button>
            <Button asChild size="sm" className="h-9 gap-1.5 bg-primary cursor-pointer font-bold">
              <Link href="/dashboard/masters/looms/new">
                <Plus className="h-4 w-4" /> Register Loom in Unit
              </Link>
            </Button>
          </div>
        }
      />

      {/* EXECUTIVE KPI STATS HEADER CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Looms Installed</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-primary">{factoryLooms.length} Looms</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Shed Installed Capacity</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Operational</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-emerald-600">{activeCount} Looms</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {activePercent}% Efficiency
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Idle / Stopped</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-amber-600">{idleCount} Looms</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Awaiting Beam Loading</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Scale className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Under Repair</p>
              <h3 className="text-2xl font-bold font-display mt-1 text-red-600">{repairCount} Looms</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Maintenance Servicing</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <Scissors className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN LAYOUT GRID: UNIT DETAILS + PAGINATED DATA TABLE */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Unit Technical Specification Card */}
        <Card className="border-primary/20 bg-card shadow-md lg:col-span-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-background">
                {factory.factoryId || "FAC-UNIT"}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                {factory.activeStatus || "Active Weaving Shed"}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold font-display text-foreground mt-2">{factory.factoryName}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Proprietor: {factory.ownerName || "Bhushan Khairnar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 space-y-4 text-xs">
            {/* Visual Operational Efficiency Bar */}
            <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Operational Utilization</span>
                <span className="font-bold text-emerald-600">{activeCount} / {factoryLooms.length} Looms ({activePercent}%)</span>
              </div>
              <Progress value={activePercent} className="h-2 bg-emerald-500/20" />
            </div>

            {/* Address & Contact Info */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block">Weaving Unit Location:</span>
                  <span className="text-muted-foreground">
                    {factory.plotNo ? `${factory.plotNo}, ` : ""}
                    {factory.addressLine1 ? `${factory.addressLine1}, ` : ""}
                    {factory.cityVillage || "Ichalkaranji"} - {factory.pincode || "416115"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Contact Phone:</span>{" "}
                  <span className="text-muted-foreground font-mono">{factory.contactNumber || "+91 98230 11223"}</span>
                </div>
              </div>

              {factory.electricityMeterNo && (
                <div className="flex items-center gap-2 pt-1">
                  <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Electricity Meter:</span>{" "}
                    <span className="font-mono font-bold text-foreground">{factory.electricityMeterNo}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Shed Specifications Breakdown */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-primary" /> Shed Technical Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">Dimensions</span>
                  <span className="font-bold font-mono text-xs">
                    {factory.shedLength || 100} × {factory.shedWidth || 50} ft
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">Total Shed Area</span>
                  <span className="font-bold font-mono text-xs text-primary">
                    {factory.totalArea || 5000} sq.ft
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">Structure Type</span>
                  <span className="font-bold text-xs">{factory.shedType || "RCC"} Shed</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">Floors Count</span>
                  <span className="font-bold font-mono text-xs">{factory.noOfFloors || 1} Floor</span>
                </div>
              </div>
            </div>

            {factory.notes && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground italic mt-2">
                "{factory.notes}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAGINATED DATA TABLE FOR ASSIGNED LOOMS */}
        <div className="lg:col-span-2 space-y-3">
          <MasterToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            createLabel="Register Loom in Unit"
            onCreateClick={() => router.push("/dashboard/masters/looms/new")}
            exportTitle={`Looms-${factory.factoryName}`}
            selectedFilters={selectedFilters}
            onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
            onClearFilters={() => {
              setSearchValue("");
              setSelectedFilters({ loomType: "all", status: "all" });
            }}
            filters={[
              {
                key: "loomType",
                placeholder: "Filter Loom Type",
                options: [
                  { label: "Power Loom", value: "Power Loom" },
                  { label: "Rapier", value: "Rapier" },
                  { label: "Handloom", value: "Handloom" },
                  { label: "Shuttle", value: "Shuttle" }
                ]
              },
              {
                key: "status",
                placeholder: "Status",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Idle", value: "Idle" },
                  { label: "Under Repair", value: "Under Repair" }
                ]
              }
            ]}
          />

          <MasterTable
            data={filteredLooms}
            columns={columns}
            isLoading={loadingLooms}
            onView={(item) => setViewLoom(item)}
            onDelete={(item) => deleteMutation.mutate(item.id)}
            onStatusToggle={(item) =>
              updateMutation.mutate({
                ...item,
                status: item.status === "Active" ? "Idle" : "Active"
              })
            }
            onBulkDelete={(items) => items.forEach((i) => deleteMutation.mutate(i.id))}
          />
        </div>
      </div>

      {/* VIEW LOOM DETAILS MODAL */}
      <MasterDialog
        isOpen={!!viewLoom}
        onClose={() => setViewLoom(null)}
        title={`Loom: ${viewLoom?.loomId} — ${viewLoom?.loomNumber}`}
        description={`Firm / Unit: ${viewLoom?.factoryName} | Type: ${viewLoom?.loomType}`}
      >
        {viewLoom && (
          <DetailViewCard
            title={`Loom #${viewLoom.loomNumber}`}
            subtitle={`Loom ID: ${viewLoom.loomId} • Firm: ${viewLoom.factoryName}`}
            statusBadge={
              <Badge variant="outline" className={`text-[10px] font-bold ${statusColors[viewLoom.status] || ""}`}>
                {viewLoom.status}
              </Badge>
            }
            sections={[
              {
                title: "Loom Identity & Firm Unit",
                fields: [
                  { label: "Loom Number", value: viewLoom.loomNumber, highlight: true },
                  { label: "Loom Type", value: viewLoom.loomType, badge: true },
                  { label: "Factory / Firm", value: viewLoom.factoryName, highlight: true },
                  { label: "Loom ID", value: viewLoom.loomId, mono: true },
                  { label: "Make / Brand", value: viewLoom.makeBrand || "N/A" },
                  { label: "Year of Purchase", value: viewLoom.yearOfPurchase || "N/A", mono: true }
                ]
              },
              {
                title: "Technical Specifications & Labour",
                fields: [
                  { label: "Reed Count", value: viewLoom.reedCount ?? "N/A", mono: true },
                  { label: "Loom Width", value: viewLoom.widthInches ? `${viewLoom.widthInches} Inches` : "N/A", mono: true },
                  { label: "RPM / Speed", value: viewLoom.rpmSpeed ? `${viewLoom.rpmSpeed} RPM` : "N/A", highlight: true, mono: true },
                  { label: "Assigned Weaver / Labour", value: viewLoom.assignedLabourName || "Unassigned (Shared Worker Pool)", colSpan: 3 }
                ]
              }
            ]}
          >
            {viewLoom.remarks && (
              <div className="p-3 bg-card border border-border/30 rounded-lg">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Remarks</span>
                <p className="text-xs mt-1 text-foreground">{viewLoom.remarks}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewLoom(null)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        )}
      </MasterDialog>
    </PageContainer>
  );
}
