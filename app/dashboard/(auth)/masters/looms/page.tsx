"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Loom } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
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

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Register New Loom"
        onCreateClick={() => { setEditLoom(null); setViewLoom(null); form.reset(defaultValues); setDialogOpen(true); }}
        exportTitle="Looms"
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
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Loom ID</span><span className="font-bold">{viewLoom.loomId}</span></div>
              <div><span className="text-muted-foreground block font-medium">Loom Number</span><span className="font-bold">{viewLoom.loomNumber}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Factory</span><span className="font-semibold">{viewLoom.factoryName}</span></div>
              <div><span className="text-muted-foreground block font-medium">Loom Type</span><Badge variant="outline" className="font-semibold">{viewLoom.loomType}</Badge></div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Reed Count</span><span className="font-semibold">{viewLoom.reedCount ?? "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Width</span><span className="font-semibold">{viewLoom.widthInches ? `${viewLoom.widthInches}"` : "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">RPM / Speed</span><span className="font-semibold">{viewLoom.rpmSpeed ?? "N/A"}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Make / Brand</span><span className="font-semibold">{viewLoom.makeBrand || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Year of Purchase</span><span className="font-semibold">{viewLoom.yearOfPurchase ?? "N/A"}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted-foreground block font-medium">Status</span><Badge variant="outline" className={`font-bold ${statusColors[viewLoom.status] || ""}`}>{viewLoom.status}</Badge></div>
              <div><span className="text-muted-foreground block font-medium">Assigned Labour</span><span className="font-semibold">{viewLoom.assignedLabourName || "Unassigned"}</span></div>
            </div>
            {viewLoom.remarks && <div><span className="text-muted-foreground block font-medium">Remarks</span><p className="bg-muted/20 p-3 rounded-lg border border-border/10 font-medium mt-1">{viewLoom.remarks}</p></div>}
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button></div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Factory *</Label>
                <Select onValueChange={(v) => { form.setValue("factoryId", v); form.setValue("factoryName", factories.find(f => f.id === v)?.factoryName || ""); }} value={form.watch("factoryId")}>
                  <SelectTrigger><SelectValue placeholder="Select factory" /></SelectTrigger>
                  <SelectContent>{factories.map(f => <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>)}</SelectContent>
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
              <Select onValueChange={(v) => { form.setValue("assignedLabourId", v); form.setValue("assignedLabourName", labour.find(l => l.id === v)?.fullName || ""); }} value={form.watch("assignedLabourId") || ""}>
                <SelectTrigger><SelectValue placeholder="Select labour (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
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
