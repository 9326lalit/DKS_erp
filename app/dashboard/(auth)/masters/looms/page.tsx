"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Loom, useMastersStore } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const loomSchema = z.object({
  factoryId: z.string().min(1, "Factory is required"),
  factoryName: z.string(),
  loomNumber: z.string().min(1, "Loom number is required"),
  loomType: z.enum(["Power Loom", "Handloom", "Rapier", "Shuttle"]),
  reedCount: z.number().optional(),
  widthInches: z.number().optional(),
  rpmSpeed: z.number().optional(),
  makeBrand: z.string().optional(),
  yearOfPurchase: z.number().optional(),
  status: z.enum(["Active", "Idle", "Under Repair"]),
  assignedLabourId: z.string().optional(),
  assignedLabourName: z.string().optional(),
  remarks: z.string().optional()
});

type LoomFormValues = z.infer<typeof loomSchema>;

export default function LoomsPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ factoryId: "all", status: "all", loomType: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLoom, setEditLoom] = useState<Loom | null>(null);
  const [viewLoom, setViewLoom] = useState<Loom | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Loom | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          processCSV(text);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }
  };

  const processCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) {
      toast.error("CSV file is empty or missing headers.");
      return;
    }
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
    
    const getIndex = (aliases: string[]) => {
      return headers.findIndex(h => aliases.includes(h));
    };

    const factoryIdx = getIndex(["factory", "factoryname", "factory id", "factory_name", "factory_id"]);
    const loomNumIdx = getIndex(["loom number", "loom_number", "loom no", "loom_no", "loomnumber", "loomno"]);
    const loomTypeIdx = getIndex(["loom type", "loom_type", "type", "loomtype"]);
    const reedCountIdx = getIndex(["reed count", "reed_count", "reed", "reedcount"]);
    const widthIdx = getIndex(["width", "width inches", "width_inches", "widthinches", "loom width", "loom_width"]);
    const speedIdx = getIndex(["speed", "rpm", "rpm speed", "rpm_speed", "rpmspeed"]);
    const makeIdx = getIndex(["make", "brand", "make/brand", "make_brand", "manufacturer"]);
    const yearIdx = getIndex(["year", "purchase year", "year of purchase", "year_of_purchase", "purchase_year"]);
    const statusIdx = getIndex(["status", "active status", "active_status"]);
    const remarksIdx = getIndex(["remarks", "remark", "notes", "note"]);

    if (loomNumIdx === -1) {
      toast.error("CSV must contain a 'Loom Number' column.");
      return;
    }

    const newLooms: Loom[] = [];
    const skippedRows: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ""));
      
      const getValue = (idx: number) => {
        return idx !== -1 && idx < values.length ? values[idx] : "";
      };

      const rawLoomNum = getValue(loomNumIdx);
      if (!rawLoomNum) {
        skippedRows.push(`Row ${i + 1}: Missing Loom Number`);
        continue;
      }

      const rawFactory = getValue(factoryIdx);
      let matchedFactory = factories[0];
      if (rawFactory) {
        const found = factories.find(f => 
          f.factoryName.toLowerCase().includes(rawFactory.toLowerCase()) || 
          f.id.toLowerCase() === rawFactory.toLowerCase()
        );
        if (found) {
          matchedFactory = found;
        }
      }

      if (!matchedFactory) {
        skippedRows.push(`Row ${i + 1}: No factory matched`);
        continue;
      }

      const rawType = getValue(loomTypeIdx).toLowerCase();
      let loomType: "Power Loom" | "Handloom" | "Rapier" | "Shuttle" = "Power Loom";
      if (rawType.includes("hand")) loomType = "Handloom";
      else if (rawType.includes("rapier")) loomType = "Rapier";
      else if (rawType.includes("shuttle")) loomType = "Shuttle";

      const rawStatus = getValue(statusIdx).toLowerCase();
      let status: "Active" | "Idle" | "Under Repair" = "Active";
      if (rawStatus.includes("idle")) status = "Idle";
      else if (rawStatus.includes("repair") || rawStatus.includes("under")) status = "Under Repair";

      const parseNum = (val: string) => {
        const n = parseFloat(val);
        return isNaN(n) ? undefined : n;
      };

      const reedCount = parseNum(getValue(reedCountIdx));
      const widthInches = parseNum(getValue(widthIdx));
      const rpmSpeed = parseNum(getValue(speedIdx));
      const yearOfPurchase = parseNum(getValue(yearIdx));

      const seq = looms.length + newLooms.length + 1;

      const loomItem: Loom = {
        id: `LOM-ID-${String(seq).padStart(3, "0")}-${Date.now()}-${i}`,
        loomId: `LOM-${String(seq).padStart(3, "0")}`,
        factoryId: matchedFactory.id,
        factoryName: matchedFactory.factoryName,
        loomNumber: rawLoomNum,
        loomType,
        reedCount,
        widthInches,
        rpmSpeed,
        makeBrand: getValue(makeIdx) || undefined,
        yearOfPurchase,
        status,
        remarks: getValue(remarksIdx) || undefined
      };

      newLooms.push(loomItem);
    }

    if (newLooms.length === 0) {
      toast.error("No valid loom records found in CSV.");
      return;
    }

    useMastersStore.setState((state) => ({
      looms: [...newLooms, ...state.looms]
    }));

    queryClient.invalidateQueries({ queryKey: ["looms"] });
    toast.success(`Successfully imported ${newLooms.length} looms.`);
    if (skippedRows.length > 0) {
      toast.warning(`Skipped ${skippedRows.length} rows:\n${skippedRows.slice(0, 3).join("\n")}${skippedRows.length > 3 ? "\n..." : ""}`);
    }
  };

  const { data: looms = [], isLoading } = useQuery({ queryKey: ["looms"], queryFn: () => mastersApiService.getLooms() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });
  const { data: labour = [] } = useQuery({ queryKey: ["labour"], queryFn: () => mastersApiService.getLabour() });

  const defaultValues: LoomFormValues = { factoryId: "", factoryName: "", loomNumber: "", loomType: "Power Loom", status: "Active", makeBrand: "", remarks: "" };

  const form = useForm<LoomFormValues>({ resolver: zodResolver(loomSchema), defaultValues });

  const createMutation = useMutation({
    mutationFn: (l: Loom) => mastersApiService.createLoom(l),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["looms"] }); toast.success("Loom registered successfully."); setDialogOpen(false); form.reset(defaultValues); }
  });
  const updateMutation = useMutation({
    mutationFn: (l: Loom) => mastersApiService.updateLoom(l),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["looms"] }); toast.success("Loom updated."); setDialogOpen(false); setEditLoom(null); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteLoom(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["looms"] }); toast.success("Loom deleted."); setDeleteConfirmOpen(false); setDeleteTarget(null); }
  });

  const handleEditClick = (loom: Loom) => {
    setEditLoom(loom); setViewLoom(null);
    form.reset({ factoryId: loom.factoryId, factoryName: loom.factoryName, loomNumber: loom.loomNumber, loomType: loom.loomType, reedCount: loom.reedCount, widthInches: loom.widthInches, rpmSpeed: loom.rpmSpeed, makeBrand: loom.makeBrand || "", yearOfPurchase: loom.yearOfPurchase, status: loom.status, assignedLabourId: loom.assignedLabourId || "", assignedLabourName: loom.assignedLabourName || "", remarks: loom.remarks || "" });
    setDialogOpen(true);
  };
  const handleViewClick = (loom: Loom) => { setViewLoom(loom); setEditLoom(null); setDialogOpen(true); };
  const handleDeleteClick = (loom: Loom) => { setDeleteTarget(loom); setDeleteConfirmOpen(true); };

  const handleFormSubmit = (values: LoomFormValues) => {
    const factory = factories.find(f => f.id === values.factoryId);
    const selectedLabour = labour.find(l => l.id === values.assignedLabourId);
    const data = { ...values, factoryName: factory?.factoryName || values.factoryName, assignedLabourName: selectedLabour?.fullName || values.assignedLabourName };
    if (editLoom) {
      updateMutation.mutate({ ...editLoom, ...data });
    } else {
      const seq = looms.length + 1;
      createMutation.mutate({ id: `LOM-ID-${String(seq).padStart(3, "0")}-${Date.now()}`, loomId: `LOM-${String(seq).padStart(3, "0")}`, ...data });
    }
  };

  // Summary counters per factory
  const factorySummary = factories.map(f => {
    const factoryLooms = looms.filter(l => l.factoryId === f.id);
    return { factoryName: f.factoryName, total: factoryLooms.length, active: factoryLooms.filter(l => l.status === "Active").length, idle: factoryLooms.filter(l => l.status === "Idle").length, underRepair: factoryLooms.filter(l => l.status === "Under Repair").length };
  }).filter(f => f.total > 0);

  const filtered = looms.filter(l => {
    const ms = l.loomNumber.toLowerCase().includes(searchValue.toLowerCase()) || l.factoryName.toLowerCase().includes(searchValue.toLowerCase()) || l.loomId.toLowerCase().includes(searchValue.toLowerCase()) || (l.makeBrand || "").toLowerCase().includes(searchValue.toLowerCase());
    const mf = selectedFilters.factoryId === "all" || l.factoryId === selectedFilters.factoryId;
    const mst = selectedFilters.status === "all" || l.status === selectedFilters.status;
    const mlt = selectedFilters.loomType === "all" || l.loomType === selectedFilters.loomType;
    return ms && mf && mst && mlt;
  });

  const statusColors: Record<string, string> = { "Active": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", "Idle": "bg-amber-500/10 text-amber-600 border-amber-500/20", "Under Repair": "bg-red-500/10 text-red-600 border-red-500/20" };

  const columns: TableColumn<Loom>[] = [
    { key: "createdDate", header: "Created Date", render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.createdDate || "25 Jul 2026"}</span>, sortable: true },
    { key: "loomId", header: "Loom ID", sortable: true },
    { key: "factoryName", header: "Factory", sortable: true },
    { key: "loomNumber", header: "Loom No.", sortable: true },
    { key: "loomType", header: "Type", render: (item) => <Badge variant="outline" className="text-[10px] font-semibold">{item.loomType}</Badge>, sortable: true },
    { key: "reedCount", header: "Reed Count", render: (item) => <span>{item.reedCount ?? "—"}</span> },
    { key: "widthInches", header: "Width (in)", render: (item) => <span>{item.widthInches ? `${item.widthInches}"` : "—"}</span> },
    { key: "makeBrand", header: "Make/Brand", render: (item) => <span className="text-muted-foreground">{item.makeBrand || "—"}</span> },
    { key: "status", header: "Status", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${statusColors[item.status] || ""}`}>{item.status}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Loom Master"
        description="Register and manage looms linked to factories. Track status — Active, Idle, Under Repair."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Masters" }, { title: "Loom Master" }]}
      />

      {/* Factory Summary Cards */}
      {factorySummary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-2">
          {factorySummary.map((f, i) => (
            <Card key={i} className="border-border/40 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-foreground truncate">{f.factoryName}</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">Total: <strong className="text-foreground">{f.total}</strong></span>
                  <span className="text-emerald-600">Active: <strong>{f.active}</strong></span>
                  <span className="text-amber-600">Idle: <strong>{f.idle}</strong></span>
                  <span className="text-red-600">Repair: <strong>{f.underRepair}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Register New Loom"
        onCreateClick={() => { setEditLoom(null); setViewLoom(null); form.reset(defaultValues); setDialogOpen(true); }}
        exportTitle="Looms"
        onImportClick={handleImportClick}
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ factoryId: "all", status: "all", loomType: "all" }); }}
        filters={[
          { key: "factoryId", placeholder: "Factory", options: factories.map(f => ({ label: f.factoryName, value: f.id })) },
          { key: "status", placeholder: "Status", options: [{ label: "Active", value: "Active" }, { label: "Idle", value: "Idle" }, { label: "Under Repair", value: "Under Repair" }] },
          { key: "loomType", placeholder: "Loom Type", options: [{ label: "Power Loom", value: "Power Loom" }, { label: "Handloom", value: "Handloom" }, { label: "Rapier", value: "Rapier" }, { label: "Shuttle", value: "Shuttle" }] }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onStatusToggle={(item) => updateMutation.mutate({ ...item, status: item.status === "Active" ? "Idle" : "Active" })}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditLoom(null); setViewLoom(null); }}
        title={viewLoom ? `Loom: ${viewLoom.loomId} — ${viewLoom.loomNumber}` : editLoom ? `Edit Loom: ${editLoom.loomNumber}` : "Register New Loom"}
        description={viewLoom ? `Factory: ${viewLoom.factoryName} | Type: ${viewLoom.loomType}` : "Register a loom and link it to a factory. All fields marked * are required."}
      >
        {viewLoom ? (
          <DetailViewCard
            title={`Loom #${viewLoom.loomNumber}`}
            subtitle={`Loom ID: ${viewLoom.loomId} • Factory: ${viewLoom.factoryName}`}
            statusBadge={
              <Badge variant="outline" className={`text-[10px] font-bold ${statusColors[viewLoom.status] || ""}`}>
                {viewLoom.status}
              </Badge>
            }
            sections={[
              {
                title: "Loom Identity & Location",
                fields: [
                  { label: "Loom Number", value: viewLoom.loomNumber, highlight: true },
                  { label: "Loom Type", value: viewLoom.loomType, badge: true },
                  { label: "Factory Unit", value: viewLoom.factoryName, highlight: true },
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
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Factory *</Label>
                <Select onValueChange={(v) => { form.setValue("factoryId", v); form.setValue("factoryName", factories.find(f => f.id === v)?.factoryName || ""); }} value={form.watch("factoryId")}>
                  <SelectTrigger><SelectValue placeholder="Select factory" /></SelectTrigger>
                  <SelectContent>{[...factories].sort((a, b) => a.factoryName.localeCompare(b.factoryName)).map(f => <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.factoryId && <p className="text-[10px] text-destructive">{form.formState.errors.factoryId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loom Number *</Label>
                <Input {...form.register("loomNumber")} placeholder="e.g. L-001" />
                {form.formState.errors.loomNumber && <p className="text-[10px] text-destructive">{form.formState.errors.loomNumber.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loom Type *</Label>
                <Select onValueChange={(v) => form.setValue("loomType", v as any)} value={form.watch("loomType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Power Loom">Power Loom</SelectItem>
                    <SelectItem value="Handloom">Handloom</SelectItem>
                    <SelectItem value="Rapier">Rapier</SelectItem>
                    <SelectItem value="Shuttle">Shuttle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status *</Label>
                <Select onValueChange={(v) => form.setValue("status", v as any)} value={form.watch("status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Idle">Idle</SelectItem>
                    <SelectItem value="Under Repair">Under Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reed Count (dents/inch)</Label>
                <Input type="number" {...form.register("reedCount", { valueAsNumber: true })} placeholder="e.g. 120" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Width (inches)</Label>
                <Input type="number" step="0.1" {...form.register("widthInches", { valueAsNumber: true })} placeholder="e.g. 60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">RPM / Speed</Label>
                <Input type="number" {...form.register("rpmSpeed", { valueAsNumber: true })} placeholder="e.g. 680" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Make / Brand</Label>
                <Input {...form.register("makeBrand")} placeholder="e.g. Picanol, Toyota" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Year of Purchase</Label>
                <Input type="number" {...form.register("yearOfPurchase", { valueAsNumber: true })} placeholder="e.g. 2022" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Labour</Label>
              <Select onValueChange={(v) => { const actualVal = v === "none" ? "" : v; form.setValue("assignedLabourId", actualVal); form.setValue("assignedLabourName", labour.find(l => l.id === actualVal)?.fullName || ""); }} value={form.watch("assignedLabourId") || "none"}>
                <SelectTrigger><SelectValue placeholder="Select labour (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {labour.filter(l => l.activeStatus === "Active" && (l.labourType === "Weaver" || l.labourType === "Helper")).map(l => <SelectItem key={l.id} value={l.id}>{l.fullName} ({l.labourType})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks</Label>
              <Textarea rows={2} {...form.register("remarks")} placeholder="Any notes about this loom..." />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editLoom ? "Update Loom" : "Register Loom"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" />Delete Loom?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">Permanently delete <strong>{deleteTarget?.loomId} — {deleteTarget?.loomNumber}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>Delete Loom</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
