"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Layers, Warehouse, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck, Edit, ArrowRightLeft, Cylinder, FileDown, Eye
} from "lucide-react";

import { useSizingStore, PipeItem } from "@/lib/store/use-sizing-store";
import { tanaApiService } from "@/lib/services/tana-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const pipeSchema = z.object({
  pipeNumber: z.string().min(1, "Pipe Number required"),
  setNumber: z.string().min(1, "Set Number required"),
  poNumber: z.string().min(1, "PO Number required"),
  tanaNumber: z.string().min(1, "Tana Number required"),
  itemName: z.string().min(1, "Item Name required"),
  weightKg: z.number().min(0.1, "Weight required"),
  status: z.enum(["Available", "Mounted on Loom", "Empty Pipe", "In Transit"]),
  currentLocation: z.string().min(1, "Current Location required"),
  date: z.string().min(1, "Date required")
});

type PipeValues = z.infer<typeof pipeSchema>;

export default function PipesInformationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pipes, createPipeItem, updatePipeStatus } = useSizingStore();
  const { data: pos = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });

  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPipe, setSelectedPipe] = useState<PipeItem | null>(null);

  const [newStatus, setNewStatus] = useState<PipeItem["status"]>("Available");
  const [newLocation, setNewLocation] = useState("");

  const form = useForm<PipeValues>({
    resolver: zodResolver(pipeSchema),
    defaultValues: {
      pipeNumber: `PIPE-2026-${String(pipes.length + 1).padStart(3, "0")}`,
      setNumber: "SET-100",
      poNumber: pos[0]?.poNumber || "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      weightKg: 33,
      status: "Available",
      currentLocation: "Factory Main Store",
      date: new Date().toISOString().split("T")[0]
    }
  });

  const handlePOSelectPipe = (selectedPoNo: string) => {
    form.setValue("poNumber", selectedPoNo);
    const po = pos.find((p) => p.poNumber === selectedPoNo);
    if (po) {
      form.setValue("itemName", po.itemName || "40s Cotton Warp Yarn");
      form.setValue("tanaNumber", `TN-${po.hsnCode || "40S"}-001`);
      toast.info(`Auto-populated Pipe details from PO ${selectedPoNo}`);
    }
  };

  const handleAddSubmit = (values: PipeValues) => {
    const pipe: PipeItem = {
      id: `PIPE-${Date.now()}`,
      ...values
    };
    createPipeItem(pipe);
    toast.success(`Pipe ${values.pipeNumber} added successfully!`);
    setAddModalOpen(false);
    form.reset({
      pipeNumber: `PIPE-2026-${String(pipes.length + 2).padStart(3, "0")}`,
      setNumber: "SET-100",
      poNumber: pos[0]?.poNumber || "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      weightKg: 33,
      status: "Available",
      currentLocation: "Factory Main Store",
      date: new Date().toISOString().split("T")[0]
    });
  };

  const handleOpenStatusModal = (pipe: PipeItem) => {
    setSelectedPipe(pipe);
    setNewStatus(pipe.status);
    setNewLocation(pipe.currentLocation);
    setStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = () => {
    if (!selectedPipe) return;
    updatePipeStatus(selectedPipe.id, newStatus, newLocation);
    toast.success(`Pipe ${selectedPipe.pipeNumber} updated to ${newStatus}!`);
    setStatusModalOpen(false);
    setSelectedPipe(null);
  };

  // Filtered Pipes
  const filteredPipes = pipes.filter((p) => {
    const ms =
      p.pipeNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.setNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.poNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.tanaNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.currentLocation.toLowerCase().includes(searchValue.toLowerCase());

    const mst = selectedFilters.status === "all" || p.status === selectedFilters.status;
    return ms && mst;
  });

  // KPI Metrics
  const totalPipesCount = pipes.length;
  const availableCount = pipes.filter((p) => p.status === "Available").length;
  const mountedCount = pipes.filter((p) => p.status === "Mounted on Loom").length;
  const emptyCount = pipes.filter((p) => p.status === "Empty Pipe").length;

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
    {
      key: "setNumber",
      header: "Set Number",
      sortable: true,
      render: (item) => (
        <Link href={`/dashboard/sizing/${encodeURIComponent(item.setNumber)}`} className="font-bold font-mono text-foreground hover:text-primary hover:underline">
          {item.setNumber}
        </Link>
      )
    },
    { key: "poNumber", header: "PO Reference", render: (item) => <span className="font-mono text-xs">{item.poNumber}</span> },
    { key: "itemName", header: "Item Quality", sortable: true },
    {
      key: "weightKg",
      header: "Weight (KG)",
      sortable: true,
      render: (item) => <span className="font-bold font-mono text-emerald-600">{item.weightKg} KG</span>
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.status === "Mounted on Loom"
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold"
              : item.status === "Available"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
              : item.status === "In Transit"
              ? "bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold"
              : "bg-muted text-muted-foreground font-semibold"
          }
        >
          {item.status}
        </Badge>
      )
    },
    { key: "currentLocation", header: "Current Location", sortable: true },
    { key: "date", header: "Reg Date", sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Pipes Information & Inventory Management"
        description="Real-time tracking of beam pipes, weights, loom mounting status, set numbers, and locations."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing", href: "/dashboard/sizing" },
          { title: "Pipes Information" }
        ]}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-4">
        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-primary/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pipes Inventory</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-foreground">{totalPipesCount}</p>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">All Pipes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-emerald-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Pipes</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-emerald-600">{availableCount}</p>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">Ready to Mount</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-amber-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mounted on Loom</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-amber-600">{mountedCount}</p>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 font-bold">In Weaving</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-muted/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empty Pipes</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-muted-foreground">{emptyCount}</p>
              <Badge variant="outline" className="text-[10px]">Awaiting Sizing</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Add New Pipe"
        onCreateClick={() => setAddModalOpen(true)}
        exportTitle="Pipes_Inventory"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ status: "all" });
        }}
        filters={[
          {
            key: "status",
            placeholder: "Filter Status",
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
        onView={(pipe) => router.push(`/dashboard/sizing/${encodeURIComponent(pipe.setNumber)}`)}
        onEdit={(pipe) => handleOpenStatusModal(pipe)}
      />

      {/* DIALOG 1: ADD NEW PIPE ITEM */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Add New Beam Pipe Item</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new Pipe entry linked to a Sizing Set Number and PO.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleAddSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pipe Number *</Label>
                <Input {...form.register("pipeNumber")} className="h-8 text-xs font-mono font-bold" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number *</Label>
                <Input {...form.register("setNumber")} className="h-8 text-xs font-mono" placeholder="e.g. SET-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Link Purchase Order *</Label>
                <Select onValueChange={handlePOSelectPipe} value={form.watch("poNumber")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>
                        {p.poNumber} ({p.purchaseFromName || (p as any).supplierName || "Supplier"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tana Number</Label>
                <Input {...form.register("tanaNumber")} className="h-8 text-xs font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Item Quality / Name *</Label>
                <Input {...form.register("itemName")} className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pipe Net Weight (KG) *</Label>
                <Input type="number" step="0.1" {...form.register("weightKg", { valueAsNumber: true })} className="h-8 text-xs font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Initial Status</Label>
                <Select onValueChange={(val: any) => form.setValue("status", val)} value={form.watch("status")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available (Store)</SelectItem>
                    <SelectItem value="Mounted on Loom">Mounted on Loom</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Empty Pipe">Empty Pipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Current Storage Location *</Label>
                <Select onValueChange={(val) => form.setValue("currentLocation", val)} value={form.watch("currentLocation")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Factory Main Store">Factory Main Store</SelectItem>
                    <SelectItem value="Loom Shed No. 1">Loom Shed No. 1</SelectItem>
                    <SelectItem value="Loom Shed No. 2">Loom Shed No. 2</SelectItem>
                    <SelectItem value="Sizing Mill Yard">Sizing Mill Yard</SelectItem>
                    {factories.map((f) => (
                      <SelectItem key={f.id} value={f.factoryName}>
                        {f.factoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs font-bold bg-primary text-primary-foreground">
                Add Pipe to Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: UPDATE PIPE STATUS & LOCATION */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Update Pipe Status &amp; Location</DialogTitle>
            <DialogDescription className="text-xs">
              Change status for <strong className="text-foreground">{selectedPipe?.pipeNumber}</strong> ({selectedPipe?.setNumber})
            </DialogDescription>
          </DialogHeader>

          {selectedPipe && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Status</Label>
                <Select onValueChange={(val: any) => setNewStatus(val)} value={newStatus}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available (Store)</SelectItem>
                    <SelectItem value="Mounted on Loom">Mounted on Loom</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Empty Pipe">Empty Pipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Location</Label>
                <Select onValueChange={(val) => setNewLocation(val)} value={newLocation}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Factory Main Store">Factory Main Store</SelectItem>
                    <SelectItem value="Loom Shed No. 1">Loom Shed No. 1</SelectItem>
                    <SelectItem value="Loom Shed No. 2">Loom Shed No. 2</SelectItem>
                    <SelectItem value="Sizing Mill Yard">Sizing Mill Yard</SelectItem>
                    {factories.map((f) => (
                      <SelectItem key={f.id} value={f.factoryName}>
                        {f.factoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdateStatusSubmit} className="h-8 text-xs font-bold bg-primary text-primary-foreground">
                  Update Pipe Details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
