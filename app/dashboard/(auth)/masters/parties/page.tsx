"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Party } from "@/lib/store/use-masters-store";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const partySchema = z.object({
  partyName: z.string().min(2, "Party name must be at least 2 characters"),
  partyType: z.enum(["Supplier", "Buyer", "Labour Contractor"]),
  contactPerson: z.string().optional(),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format (e.g. 27AABCU1234F1Z5)")
    .or(z.literal(""))
    .optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. AABCU1234F)")
    .or(z.literal(""))
    .optional(),
  address: z.string().min(5, "Address is required"),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  openingBalance: z.number(),
  activeStatus: z.enum(["Active", "Inactive"]),
  factoryId: z.string().optional(),
  factoryName: z.string().optional()
});

type PartyFormValues = z.infer<typeof partySchema>;

import { useTenantStore } from "@/lib/store/use-tenant-store";

export default function PartiesPage() {
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenantStore();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ partyType: "all", activeStatus: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editParty, setEditParty] = useState<Party | null>(null);
  const [viewParty, setViewParty] = useState<Party | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["parties", activeTenantId],
    queryFn: () => mastersApiService.getParties()
  });

  const { data: factories = [] } = useQuery({
    queryKey: ["factories", activeTenantId],
    queryFn: () => mastersApiService.getFactories()
  });

  const defaultValues: PartyFormValues = {
    partyName: "", partyType: "Supplier", contactPerson: "", mobileNumber: "",
    gstNumber: "", panNumber: "", address: "", bankName: "", accountNumber: "",
    ifscCode: "", openingBalance: 0, activeStatus: "Active", factoryId: "", factoryName: ""
  };

  const form = useForm<PartyFormValues>({ resolver: zodResolver(partySchema), defaultValues });
  const selectedPartyType = form.watch("partyType");

  const createMutation = useMutation({
    mutationFn: (p: Party) => mastersApiService.createParty(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parties"] }); toast.success("Party registered successfully."); setDialogOpen(false); form.reset(defaultValues); }
  });
  const updateMutation = useMutation({
    mutationFn: (p: Party) => mastersApiService.updateParty(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parties"] }); toast.success("Party updated."); setDialogOpen(false); setEditParty(null); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteParty(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parties"] }); toast.success("Party deleted."); setDeleteConfirmOpen(false); setDeleteTarget(null); }
  });

  const handleEditClick = (party: Party) => {
    setEditParty(party); setViewParty(null);
    form.reset({ partyName: party.partyName, partyType: party.partyType, contactPerson: party.contactPerson || "", mobileNumber: party.mobileNumber, gstNumber: party.gstNumber || "", panNumber: party.panNumber || "", address: party.address, bankName: party.bankName || "", accountNumber: party.accountNumber || "", ifscCode: party.ifscCode || "", openingBalance: party.openingBalance, activeStatus: party.activeStatus, factoryId: party.factoryId || "", factoryName: party.factoryName || "" });
    setDialogOpen(true);
  };

  const handleViewClick = (party: Party) => { setViewParty(party); setEditParty(null); setDialogOpen(true); };
  const handleDeleteClick = (party: Party) => { setDeleteTarget(party); setDeleteConfirmOpen(true); };

  const handleFormSubmit = (values: PartyFormValues) => {
    if (editParty) {
      updateMutation.mutate({ ...editParty, ...values });
    } else {
      const typeCode = values.partyType === "Supplier" ? "S" : values.partyType === "Buyer" ? "B" : "LC";
      const seq = parties.filter(p => p.partyType === values.partyType).length + 1;
      createMutation.mutate({
        id: `PRT-ID-${Date.now()}`,
        partyCode: `PRT-${typeCode}${String(seq).padStart(3, "0")}`,
        ...values
      });
    }
  };

  const filtered = parties.filter((p) => {
    const matchSearch = p.partyName.toLowerCase().includes(searchValue.toLowerCase()) || p.partyCode.toLowerCase().includes(searchValue.toLowerCase()) || (p.mobileNumber || "").includes(searchValue);
    const matchType = selectedFilters.partyType === "all" || p.partyType === selectedFilters.partyType;
    const matchStatus = selectedFilters.activeStatus === "all" || p.activeStatus === selectedFilters.activeStatus;
    return matchSearch && matchType && matchStatus;
  });

  const partyTypeColors: Record<string, string> = {
    "Supplier": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Buyer": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Labour Contractor": "bg-violet-500/10 text-violet-600 border-violet-500/20"
  };

  const columns: TableColumn<Party>[] = [
    { key: "createdDate", header: "Created Date", render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.createdDate || "25 Jul 2026"}</span>, sortable: true },
    {
      key: "partyCode",
      header: "Code",
      sortable: true,
      render: (item) => (
        <button onClick={() => handleViewClick(item)} className="font-mono text-xs font-bold text-primary hover:underline text-left cursor-pointer">
          {item.partyCode}
        </button>
      )
    },
    {
      key: "partyName",
      header: "Party Name",
      sortable: true,
      render: (item) => (
        <button onClick={() => handleViewClick(item)} className="font-bold text-xs text-foreground hover:text-primary hover:underline text-left cursor-pointer">
          {item.partyName}
        </button>
      )
    },
    {
      key: "partyType", header: "Type",
      render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${partyTypeColors[item.partyType] || ""}`}>{item.partyType}</Badge>,
      sortable: true
    },
    { key: "factoryName", header: "Factory", render: (item) => <span className="text-xs font-semibold">{item.factoryName || "—"}</span> },
    { key: "mobileNumber", header: "Mobile" },
    { key: "gstNumber", header: "GST No.", render: (item) => <span className="uppercase text-xs">{item.gstNumber || "—"}</span> },
    { key: "address", header: "Address", render: (item) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{item.address}</span> },
    {
      key: "activeStatus", header: "Status",
      render: (item) => <StatusBadge status={item.activeStatus} type="general" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Party Master"
        description="Manage all external entities — suppliers (Tana/Bana vendors), buyers (own firm / customers), and labour contractors."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Masters" }, { title: "Party Master" }]}
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Add New Party"
        onCreateClick={() => { setEditParty(null); setViewParty(null); form.reset(defaultValues); setDialogOpen(true); }}
        exportTitle="Parties"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ partyType: "all", activeStatus: "all" }); }}
        filters={[
          { key: "partyType", placeholder: "Party Type", options: [{ label: "Supplier", value: "Supplier" }, { label: "Buyer", value: "Buyer" }, { label: "Labour Contractor", value: "Labour Contractor" }] },
          { key: "activeStatus", placeholder: "Status", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] }
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
        onBulkDelete={(items) => items.forEach((i) => deleteMutation.mutate(i.id))}
      />

      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditParty(null); setViewParty(null); }}
        title={viewParty ? `View: ${viewParty.partyName}` : editParty ? `Edit: ${editParty.partyName}` : "Register New Party"}
        description={viewParty ? `Party Code: ${viewParty.partyCode}` : "Fill all required details. GST and PAN are validated for Indian format."}
      >
        {viewParty ? (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div><span className="text-muted-foreground block font-medium">Party Name</span><span className="text-sm font-bold">{viewParty.partyName}</span></div>
              <div><span className="text-muted-foreground block font-medium">Party Type</span><Badge variant="outline" className={`font-bold ${partyTypeColors[viewParty.partyType] || ""}`}>{viewParty.partyType}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div><span className="text-muted-foreground block font-medium">Contact Person</span><span className="font-semibold">{viewParty.contactPerson || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Mobile</span><span className="font-semibold">{viewParty.mobileNumber}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div><span className="text-muted-foreground block font-medium">GST Number</span><span className="font-semibold uppercase">{viewParty.gstNumber || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">PAN Number</span><span className="font-semibold uppercase">{viewParty.panNumber || "N/A"}</span></div>
              <div><span className="text-muted-foreground block font-medium">Associated Factory</span><span className="font-semibold">{viewParty.factoryName || "None / All"}</span></div>
            </div>
            <div className="border-b border-border/10 pb-4"><span className="text-muted-foreground block font-medium">Address</span><p className="font-semibold mt-1">{viewParty.address}</p></div>
            {(viewParty.bankName || viewParty.accountNumber) && (
              <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
                <div><span className="text-muted-foreground block font-medium">Bank</span><span className="font-semibold">{viewParty.bankName || "—"}</span></div>
                <div><span className="text-muted-foreground block font-medium">A/C No.</span><span className="font-semibold">{viewParty.accountNumber || "—"}</span></div>
                <div><span className="text-muted-foreground block font-medium">IFSC</span><span className="font-semibold">{viewParty.ifscCode || "—"}</span></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted-foreground block font-medium">Opening Balance</span><span className="font-bold">₹{viewParty.openingBalance.toLocaleString()}</span></div>
              <div><span className="text-muted-foreground block font-medium">Status</span><StatusBadge status={viewParty.activeStatus} /></div>
            </div>
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button></div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Party Name *</Label>
                <Input {...form.register("partyName")} placeholder="e.g. Yogesh Jakhotya Spinners" />
                {form.formState.errors.partyName && <p className="text-[10px] text-destructive">{form.formState.errors.partyName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Party Type *</Label>
                <Select onValueChange={(v) => form.setValue("partyType", v as any)} value={form.watch("partyType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supplier">Supplier (Yarn Vendor)</SelectItem>
                    <SelectItem value="Buyer">Buyer (Own Firm / Customer)</SelectItem>
                    <SelectItem value="Labour Contractor">Labour Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input {...form.register("contactPerson")} placeholder="Name of key contact" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input {...form.register("mobileNumber")} placeholder="+91 98765 43210" />
                {form.formState.errors.mobileNumber && <p className="text-[10px] text-destructive">{form.formState.errors.mobileNumber.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GST Number</Label>
                <Input {...form.register("gstNumber")} placeholder="27AABCU1234F1Z5" className="uppercase" />
                {form.formState.errors.gstNumber && <p className="text-[10px] text-destructive">{form.formState.errors.gstNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">PAN Number</Label>
                <Input {...form.register("panNumber")} placeholder="AABCU1234F" className="uppercase" />
                {form.formState.errors.panNumber && <p className="text-[10px] text-destructive">{form.formState.errors.panNumber.message}</p>}
              </div>
            </div>
            {(selectedPartyType === "Supplier" || selectedPartyType === "Buyer") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Associated Factory</Label>
                <Select onValueChange={(v) => { const actualVal = v === "none" ? "" : v; form.setValue("factoryId", actualVal); form.setValue("factoryName", factories.find(f => f.id === actualVal)?.factoryName || ""); }} value={form.watch("factoryId") || "none"}>
                  <SelectTrigger><SelectValue placeholder="Select factory (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / All Factories</SelectItem>
                    {factories.map(f => <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Address *</Label>
              <Textarea rows={2} {...form.register("address")} placeholder="Plot No., Area, City, District, State - PIN" />
              {form.formState.errors.address && <p className="text-[10px] text-destructive">{form.formState.errors.address.message}</p>}
            </div>
            <div className="border-t border-border/10 pt-3 space-y-3">
              <h4 className="text-xs font-bold">Bank Details (for payments)</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bank Name</Label>
                  <Input {...form.register("bankName")} placeholder="e.g. Bank of Maharashtra" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Account Number</Label>
                  <Input {...form.register("accountNumber")} placeholder="Account number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">IFSC Code</Label>
                  <Input {...form.register("ifscCode")} placeholder="MAHB0001234" className="uppercase" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Opening Balance (₹)</Label>
                <Input type="number" {...form.register("openingBalance", { valueAsNumber: true })} defaultValue={0} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Active Status *</Label>
                <Select onValueChange={(v) => form.setValue("activeStatus", v as any)} value={form.watch("activeStatus")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editParty ? "Update Party" : "Register Party"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete Party?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Permanently delete <strong>{deleteTarget?.partyName}</strong> ({deleteTarget?.partyCode})? References in POs and invoices will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Delete Party
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
