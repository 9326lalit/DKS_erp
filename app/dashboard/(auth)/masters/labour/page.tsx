"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Labour } from "@/lib/store/use-masters-store";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const labourSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  labourType: z.enum(["Weaver", "Helper", "Sizing Worker", "Contractor"]),
  linkedFactoryId: z.string().min(1, "Factory is required"),
  linkedFactoryName: z.string(),
  linkedLoomId: z.string().optional(),
  linkedLoomNumber: z.string().optional(),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  aadhaarNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  rateType: z.enum(["Daily", "Per Metre", "Weekly", "Contract"]),
  rate: z.number().min(0, "Rate is required"),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  activeStatus: z.enum(["Active", "Inactive", "Left"])
});

type LabourFormValues = z.infer<typeof labourSchema>;

export default function LabourPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ labourType: "all", linkedFactoryId: "all", activeStatus: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLabour, setEditLabour] = useState<Labour | null>(null);
  const [viewLabour, setViewLabour] = useState<Labour | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Labour | null>(null);

  const { data: labour = [], isLoading } = useQuery({ queryKey: ["labour"], queryFn: () => mastersApiService.getLabour() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });
  const { data: looms = [] } = useQuery({ queryKey: ["looms"], queryFn: () => mastersApiService.getLooms() });

  const defaultValues: LabourFormValues = {
    fullName: "", labourType: "Weaver", linkedFactoryId: "", linkedFactoryName: "",
    linkedLoomId: "", linkedLoomNumber: "", mobileNumber: "", aadhaarNumber: "",
    dateOfBirth: "", address: "", joiningDate: new Date().toISOString().split("T")[0],
    rateType: "Per Metre", rate: 0, bankName: "", accountNumber: "", ifscCode: "", activeStatus: "Active"
  };

  const form = useForm<LabourFormValues>({ resolver: zodResolver(labourSchema), defaultValues });

  const selectedFactoryId = form.watch("linkedFactoryId");
  const filteredLooms = looms.filter(l => l.factoryId === selectedFactoryId);

  const createMutation = useMutation({
    mutationFn: (l: Labour) => mastersApiService.createLabour(l),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["labour"] }); toast.success("Labour registered successfully."); setDialogOpen(false); form.reset(defaultValues); }
  });
  const updateMutation = useMutation({
    mutationFn: (l: Labour) => mastersApiService.updateLabour(l),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["labour"] }); toast.success("Labour record updated."); setDialogOpen(false); setEditLabour(null); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteLabour(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["labour"] }); toast.success("Labour record deleted."); setDeleteConfirmOpen(false); setDeleteTarget(null); }
  });

  const handleEditClick = (l: Labour) => {
    setEditLabour(l); setViewLabour(null);
    form.reset({ fullName: l.fullName, labourType: l.labourType, linkedFactoryId: l.linkedFactoryId, linkedFactoryName: l.linkedFactoryName, linkedLoomId: l.linkedLoomId || "", linkedLoomNumber: l.linkedLoomNumber || "", mobileNumber: l.mobileNumber, aadhaarNumber: l.aadhaarNumber || "", dateOfBirth: l.dateOfBirth || "", address: l.address || "", joiningDate: l.joiningDate, rateType: l.rateType, rate: l.rate, bankName: l.bankName || "", accountNumber: l.accountNumber || "", ifscCode: l.ifscCode || "", activeStatus: l.activeStatus });
    setDialogOpen(true);
  };
  const handleViewClick = (l: Labour) => { setViewLabour(l); setEditLabour(null); setDialogOpen(true); };
  const handleDeleteClick = (l: Labour) => { setDeleteTarget(l); setDeleteConfirmOpen(true); };

  const handleFormSubmit = (values: LabourFormValues) => {
    const factory = factories.find(f => f.id === values.linkedFactoryId);
    const loom = looms.find(l => l.id === values.linkedLoomId);
    const data = { ...values, linkedFactoryName: factory?.factoryName || values.linkedFactoryName, linkedLoomNumber: loom?.loomNumber || values.linkedLoomNumber };
    // Mask Aadhaar if entered
    if (data.aadhaarNumber && data.aadhaarNumber.replace(/\D/g, "").length === 12) {
      const digits = data.aadhaarNumber.replace(/\D/g, "");
      data.aadhaarNumber = `XXXX-XXXX-${digits.slice(8)}`;
    }
    if (editLabour) {
      updateMutation.mutate({ ...editLabour, ...data });
    } else {
      const seq = labour.length + 1;
      createMutation.mutate({ id: `LAB-ID-${String(seq).padStart(3, "0")}-${Date.now()}`, labourId: `LAB-${String(seq).padStart(3, "0")}`, ...data });
    }
  };

  const filtered = labour.filter(l => {
    const ms = l.fullName.toLowerCase().includes(searchValue.toLowerCase()) || l.labourId.toLowerCase().includes(searchValue.toLowerCase()) || l.mobileNumber.includes(searchValue);
    const mf = selectedFilters.linkedFactoryId === "all" || l.linkedFactoryId === selectedFilters.linkedFactoryId;
    const mlt = selectedFilters.labourType === "all" || l.labourType === selectedFilters.labourType;
    const mst = selectedFilters.activeStatus === "all" || l.activeStatus === selectedFilters.activeStatus;
    return ms && mf && mlt && mst;
  });

  const labourTypeColors: Record<string, string> = {
    "Weaver": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Helper": "bg-violet-500/10 text-violet-600 border-violet-500/20",
    "Sizing Worker": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Contractor": "bg-teal-500/10 text-teal-600 border-teal-500/20"
  };

  const activeStatusColors: Record<string, string> = {
    "Active": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Inactive": "bg-muted text-muted-foreground border-border",
    "Left": "bg-red-500/10 text-red-600 border-red-500/20"
  };

  const columns: TableColumn<Labour>[] = [
    { key: "labourId", header: "Labour ID", sortable: true },
    { key: "fullName", header: "Full Name", sortable: true },
    { key: "labourType", header: "Type", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${labourTypeColors[item.labourType] || ""}`}>{item.labourType}</Badge>, sortable: true },
    { key: "linkedFactoryName", header: "Factory", render: (item) => <span className="text-xs text-muted-foreground">{item.linkedFactoryName}</span>, sortable: true },
    { key: "linkedLoomNumber", header: "Loom", render: (item) => <span className="text-xs">{item.linkedLoomNumber || "—"}</span> },
    { key: "mobileNumber", header: "Mobile" },
    { key: "rateType", header: "Rate Type", render: (item) => <span className="text-xs">{item.rateType}</span> },
    { key: "rate", header: "Rate (₹)", render: (item) => <span className="font-semibold">₹{item.rate.toLocaleString()}</span> },
    { key: "activeStatus", header: "Status", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${activeStatusColors[item.activeStatus] || ""}`}>{item.activeStatus}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Labour Master"
        description="Register weavers, helpers, sizing workers, and contractors. Link to specific factories and looms."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Masters" }, { title: "Labour Master" }]}
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Register Labour"
        onCreateClick={() => { setEditLabour(null); setViewLabour(null); form.reset(defaultValues); setDialogOpen(true); }}
        exportTitle="Labour"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ labourType: "all", linkedFactoryId: "all", activeStatus: "all" }); }}
        filters={[
          { key: "labourType", placeholder: "Labour Type", options: [{ label: "Weaver", value: "Weaver" }, { label: "Helper", value: "Helper" }, { label: "Sizing Worker", value: "Sizing Worker" }, { label: "Contractor", value: "Contractor" }] },
          { key: "linkedFactoryId", placeholder: "Factory", options: factories.map(f => ({ label: f.factoryName, value: f.id })) },
          { key: "activeStatus", placeholder: "Status", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Left", value: "Left" }] }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onStatusToggle={(item) => updateMutation.mutate({ ...item, activeStatus: item.activeStatus === "Active" ? "Inactive" : "Active" })}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditLabour(null); setViewLabour(null); }}
        title={viewLabour ? `Labour: ${viewLabour.fullName}` : editLabour ? `Edit: ${editLabour.fullName}` : "Register New Labour"}
        description={viewLabour ? `Labour ID: ${viewLabour.labourId} | Type: ${viewLabour.labourType}` : "Register worker details. Aadhaar number will be automatically masked on save."}
      >
        {viewLabour ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Full Name</span><span className="text-sm font-bold">{viewLabour.fullName}</span></div>
              <div><span className="text-muted-foreground block font-medium">Labour Type</span><Badge variant="outline" className={`font-bold ${labourTypeColors[viewLabour.labourType] || ""}`}>{viewLabour.labourType}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Factory</span><span className="font-semibold">{viewLabour.linkedFactoryName}</span></div>
              <div><span className="text-muted-foreground block font-medium">Linked Loom</span><span className="font-semibold">{viewLabour.linkedLoomNumber || "Not assigned"}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Mobile</span><span className="font-semibold">{viewLabour.mobileNumber}</span></div>
              <div><span className="text-muted-foreground block font-medium">Aadhaar</span><span className="font-semibold">{viewLabour.aadhaarNumber || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Date of Birth</span><span className="font-semibold">{viewLabour.dateOfBirth || "N/A"}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-4 border-border/10">
              <div><span className="text-muted-foreground block font-medium">Joining Date</span><span className="font-semibold">{viewLabour.joiningDate}</span></div>
              <div><span className="text-muted-foreground block font-medium">Rate Type</span><span className="font-semibold">{viewLabour.rateType}</span></div>
              <div><span className="text-muted-foreground block font-medium">Rate</span><span className="font-bold text-foreground">₹{viewLabour.rate.toLocaleString()}</span></div>
            </div>
            {(viewLabour.bankName || viewLabour.accountNumber) && (
              <div className="grid grid-cols-3 gap-4 border-b pb-4 border-border/10">
                <div><span className="text-muted-foreground block font-medium">Bank</span><span className="font-semibold">{viewLabour.bankName || "—"}</span></div>
                <div><span className="text-muted-foreground block font-medium">A/C No.</span><span className="font-semibold">{viewLabour.accountNumber || "—"}</span></div>
                <div><span className="text-muted-foreground block font-medium">IFSC</span><span className="font-semibold">{viewLabour.ifscCode || "—"}</span></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted-foreground block font-medium">Address</span><span className="font-semibold">{viewLabour.address || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Status</span><Badge variant="outline" className={`font-bold ${activeStatusColors[viewLabour.activeStatus] || ""}`}>{viewLabour.activeStatus}</Badge></div>
            </div>
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button></div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input {...form.register("fullName")} placeholder="Worker's full name" />
                {form.formState.errors.fullName && <p className="text-[10px] text-destructive">{form.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Labour Type *</Label>
                <Select onValueChange={(v) => form.setValue("labourType", v as any)} value={form.watch("labourType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weaver">Weaver</SelectItem>
                    <SelectItem value="Helper">Helper</SelectItem>
                    <SelectItem value="Sizing Worker">Sizing Worker</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Linked Factory *</Label>
                <Select onValueChange={(v) => { form.setValue("linkedFactoryId", v); form.setValue("linkedFactoryName", factories.find(f => f.id === v)?.factoryName || ""); form.setValue("linkedLoomId", ""); form.setValue("linkedLoomNumber", ""); }} value={form.watch("linkedFactoryId")}>
                  <SelectTrigger><SelectValue placeholder="Select factory" /></SelectTrigger>
                  <SelectContent>{factories.map(f => <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.linkedFactoryId && <p className="text-[10px] text-destructive">{form.formState.errors.linkedFactoryId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Linked Loom (optional)</Label>
                <Select onValueChange={(v) => { form.setValue("linkedLoomId", v); form.setValue("linkedLoomNumber", looms.find(l => l.id === v)?.loomNumber || ""); }} value={form.watch("linkedLoomId") || ""} disabled={!selectedFactoryId}>
                  <SelectTrigger><SelectValue placeholder="Select loom" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No loom assigned</SelectItem>
                    {filteredLooms.map(l => <SelectItem key={l.id} value={l.id}>{l.loomNumber} ({l.loomType})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input {...form.register("mobileNumber")} placeholder="+91 98765 43210" />
                {form.formState.errors.mobileNumber && <p className="text-[10px] text-destructive">{form.formState.errors.mobileNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Aadhaar Number</Label>
                <Input {...form.register("aadhaarNumber")} placeholder="12-digit Aadhaar (masked on save)" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date of Birth</Label>
                <Input type="date" {...form.register("dateOfBirth")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Residential Address</Label>
              <Textarea rows={2} {...form.register("address")} placeholder="Full residential address" />
            </div>
            <div className="border-t border-border/10 pt-3 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Joining Date *</Label>
                <Input type="date" {...form.register("joiningDate")} />
                {form.formState.errors.joiningDate && <p className="text-[10px] text-destructive">{form.formState.errors.joiningDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate Type *</Label>
                <Select onValueChange={(v) => form.setValue("rateType", v as any)} value={form.watch("rateType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Per Metre">Per Metre</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate (₹) *</Label>
                <Input type="number" step="0.01" {...form.register("rate", { valueAsNumber: true })} placeholder="e.g. 8.5 / 450" />
                {form.formState.errors.rate && <p className="text-[10px] text-destructive">{form.formState.errors.rate.message}</p>}
              </div>
            </div>
            <div className="border-t border-border/10 pt-3 space-y-3">
              <h4 className="text-xs font-bold">Bank Details (for wage transfer)</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bank Name</Label>
                  <Input {...form.register("bankName")} placeholder="e.g. SBI" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Number</Label>
                  <Input {...form.register("accountNumber")} placeholder="Account number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">IFSC Code</Label>
                  <Input {...form.register("ifscCode")} placeholder="SBIN0001234" className="uppercase" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Active Status *</Label>
              <Select onValueChange={(v) => form.setValue("activeStatus", v as any)} value={form.watch("activeStatus")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editLabour ? "Update Labour" : "Register Labour"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" />Delete Labour Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">Permanently delete <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.labourId})? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>Delete Record</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
