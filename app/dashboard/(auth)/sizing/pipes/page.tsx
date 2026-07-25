"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus, Search, Filter, Layers, Warehouse, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck, Edit, ArrowRightLeft, Cylinder, FileDown
} from "lucide-react";

import { useSizingStore, PipeItem } from "@/lib/store/use-sizing-store";
import { tanaApiService } from "@/lib/services/tana-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// ----------------------------------------------------
// HELPER: CSV EXPORTER
// ----------------------------------------------------
function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    toast.error("No pipe records available to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = r[h] === undefined || r[h] === null ? "" : String(r[h]).replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(",")
      )
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${filename} successfully!`);
}

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
  const queryClient = useQueryClient();
  const { pipes, createPipeItem, updatePipeStatus } = useSizingStore();
  const { data: pos = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

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

  const handleExportCSV = () => {
    const data = pipes.map((p) => ({
      "Pipe Number": p.pipeNumber,
      "Set Number": p.setNumber,
      "PO Number": p.poNumber,
      "Tana Number": p.tanaNumber,
      "Item Name": p.itemName,
      "Weight (Kg)": p.weightKg,
      "Status": p.status,
      "Current Location": p.currentLocation,
      "Date": p.date
    }));
    downloadCSV("Pipes_Inventory_Records.csv", data);
  };

  // Unique locations for filter
  const locationsList = Array.from(new Set(pipes.map((p) => p.currentLocation)));

  // Filtered Pipes
  const filteredPipes = pipes.filter((p) => {
    const matchesSearch =
      p.pipeNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.setNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.tanaNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.itemName.toLowerCase().includes(search.toLowerCase()) ||
      p.currentLocation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesLocation = locationFilter === "all" || p.currentLocation === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // KPI Metrics
  const totalPipesCount = pipes.length;
  const availableCount = pipes.filter((p) => p.status === "Available").length;
  const mountedCount = pipes.filter((p) => p.status === "Mounted on Loom").length;
  const emptyCount = pipes.filter((p) => p.status === "Empty Pipe").length;

  return (
    <PageContainer>
      <PageHeader
        title="Pipes Information & Inventory Management"
        description="Comprehensive tracking of beam pipes, weights, loom mounting status, set numbers, and locations."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing", href: "/dashboard/sizing" },
          { title: "Pipes Information" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 gap-1.5 cursor-pointer">
              <FileDown className="h-4 w-4" /> Download CSV
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="h-9 gap-1.5 cursor-pointer font-bold">
              <Plus className="h-4 w-4" /> Add New Pipe
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
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
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600">Ready to Mount</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-amber-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mounted on Loom</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-amber-600">{mountedCount}</p>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600">In Weaving</Badge>
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

      {/* Main Table Card */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Pipes Register & Real-Time Tracking</CardTitle>
              <CardDescription className="text-xs">
                Search by Pipe #, Set #, PO #, Tana #, or filter by current location and status.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pipe, set, PO, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Mounted on Loom">Mounted on Loom</SelectItem>
                  <SelectItem value="Empty Pipe">Empty Pipe</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                </SelectContent>
              </Select>

              {locationsList.length > 0 && (
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locationsList.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="text-xs font-bold">
                  <TableHead>Pipe Number</TableHead>
                  <TableHead>Set Number</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Tana Number</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-center">Weight (Kg)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPipes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                      No pipe items match your search or filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPipes.map((pipe) => (
                    <TableRow key={pipe.id} className="text-xs hover:bg-muted/10">
                      <TableCell className="font-mono font-bold text-primary">{pipe.pipeNumber}</TableCell>
                      <TableCell className="font-mono font-semibold">{pipe.setNumber}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{pipe.poNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{pipe.tanaNumber}</TableCell>
                      <TableCell className="font-medium">{pipe.itemName}</TableCell>
                      <TableCell className="text-center font-mono font-bold">{pipe.weightKg} KG</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            pipe.status === "Mounted on Loom"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : pipe.status === "Available"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : pipe.status === "In Transit"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {pipe.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{pipe.currentLocation}</TableCell>
                      <TableCell className="text-muted-foreground">{pipe.date}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenStatusModal(pipe)}
                          className="h-7 text-xs gap-1 cursor-pointer hover:bg-accent font-semibold"
                        >
                          <ArrowRightLeft className="h-3 w-3" /> Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* DIALOG 1: ADD NEW PIPE ITEM */}
      {/* ---------------------------------------------------- */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Add Pipe Information</DialogTitle>
            <DialogDescription className="text-xs">
              Select PO Number to auto-fill Item Name and Tana Number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleAddSubmit)} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pipe Number *</Label>
                <Input {...form.register("pipeNumber")} className="h-8 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number *</Label>
                <Select onValueChange={(v) => form.setValue("setNumber", v)} value={form.watch("setNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SET-100">SET-100</SelectItem>
                    <SelectItem value="SET-121">SET-121</SelectItem>
                    <SelectItem value="SET-2026-001">SET-2026-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-primary">PO Number (Auto-Fill) *</Label>
                <Select onValueChange={handlePOSelectPipe} value={form.watch("poNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select PO #" /></SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>{p.poNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tana Number *</Label>
                <Input {...form.register("tanaNumber")} className="h-8 text-xs font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Item Name *</Label>
                <Input {...form.register("itemName")} className="h-8 text-xs bg-muted/20" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Weight (Kg) *</Label>
                <Input type="number" step="0.1" {...form.register("weightKg", { valueAsNumber: true })} className="h-8 text-xs font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Status *</Label>
                <Select
                  onValueChange={(v: any) => form.setValue("status", v)}
                  value={form.watch("status")}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Mounted on Loom">Mounted on Loom</SelectItem>
                    <SelectItem value="Empty Pipe">Empty Pipe</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Current Location *</Label>
                <Select
                  onValueChange={(v) => form.setValue("currentLocation", v)}
                  value={form.watch("currentLocation")}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Factory Main Store">Factory Main Store</SelectItem>
                    <SelectItem value="Ichalkaranji Unit-I (Loom #3)">Ichalkaranji Unit-I (Loom #3)</SelectItem>
                    <SelectItem value="Ichalkaranji Unit-I (Loom #5)">Ichalkaranji Unit-I (Loom #5)</SelectItem>
                    <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Date *</Label>
              <Input type="date" {...form.register("date")} className="h-8 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="submit" className="h-8 text-xs font-bold">Save Pipe Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------- */}
      {/* DIALOG 2: UPDATE PIPE STATUS / LOCATION */}
      {/* ---------------------------------------------------- */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Update Pipe Location & Status</DialogTitle>
            <DialogDescription className="text-xs">
              Update details for Pipe <span className="font-mono font-bold text-foreground">{selectedPipe?.pipeNumber}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">New Status *</Label>
              <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available (In Store)</SelectItem>
                  <SelectItem value="Mounted on Loom">Mounted on Loom (Weaving Unit)</SelectItem>
                  <SelectItem value="Empty Pipe">Empty Pipe (Returned)</SelectItem>
                  <SelectItem value="In Transit">In Transit (Transport)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Current / Target Location *</Label>
              <Select value={newLocation} onValueChange={setNewLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select target location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Factory Main Store">Factory Main Store</SelectItem>
                  <SelectItem value="Ichalkaranji Unit-I (Loom #1)">Ichalkaranji Unit-I (Loom #1)</SelectItem>
                  <SelectItem value="Ichalkaranji Unit-I (Loom #3)">Ichalkaranji Unit-I (Loom #3)</SelectItem>
                  <SelectItem value="Ichalkaranji Unit-I (Loom #5)">Ichalkaranji Unit-I (Loom #5)</SelectItem>
                  <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="button" onClick={handleUpdateStatusSubmit} className="h-8 text-xs font-bold">Update Pipe</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
