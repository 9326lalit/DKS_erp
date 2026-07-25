"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { SizingMill } from "@/lib/store/use-masters-store";
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
import { Badge } from "@/components/ui/badge";

const millSchema = z.object({
  millName: z.string().min(2, "Mill name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  gstNumber: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  activeStatus: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof millSchema>;

export default function SizingMillsPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ activeStatus: "all" });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMill, setEditMill] = useState<SizingMill | null>(null);
  const [viewMill, setViewMill] = useState<SizingMill | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SizingMill | null>(null);

  const { data: mills = [], isLoading } = useQuery({
    queryKey: ["sizingMills"],
    queryFn: () => mastersApiService.getSizingMills()
  });

  const defaultValues: FormValues = {
    millName: "", contactPerson: "", mobileNumber: "",
    gstNumber: "", address: "", activeStatus: "Active"
  };

  const form = useForm<FormValues>({ resolver: zodResolver(millSchema), defaultValues });

  const createMutation = useMutation({
    mutationFn: (m: SizingMill) => mastersApiService.createSizingMill(m),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sizingMills"] }); toast.success("Sizing Mill registered."); setDialogOpen(false); form.reset(defaultValues); }
  });
  
  const updateMutation = useMutation({
    mutationFn: (m: SizingMill) => mastersApiService.updateSizingMill(m),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sizingMills"] }); toast.success("Sizing Mill updated."); setDialogOpen(false); setEditMill(null); }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteSizingMill(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sizingMills"] }); toast.success("Sizing Mill deleted."); setDeleteConfirmOpen(false); setDeleteTarget(null); }
  });

  const handleEditClick = (mill: SizingMill) => {
    setEditMill(mill); setViewMill(null);
    form.reset({ millName: mill.millName, contactPerson: mill.contactPerson || "", mobileNumber: mill.mobileNumber, gstNumber: mill.gstNumber || "", address: mill.address, activeStatus: mill.activeStatus });
    setDialogOpen(true);
  };

  const handleViewClick = (mill: SizingMill) => { setViewMill(mill); setEditMill(null); setDialogOpen(true); };
  const handleDeleteClick = (mill: SizingMill) => { setDeleteTarget(mill); setDeleteConfirmOpen(true); };

  const handleFormSubmit = (values: FormValues) => {
    if (editMill) {
      updateMutation.mutate({ ...editMill, ...values });
    } else {
      const year = new Date().getFullYear();
      const seq = Date.now() % 10000;
      createMutation.mutate({
        id: `SZM-ID-${Date.now()}`,
        millCode: `SZM-${year}-${String(seq).padStart(4, "0")}`,
        ...values
      });
    }
  };

  const filteredData = mills.filter((m) => {
    const matchesSearch = m.millName.toLowerCase().includes(searchValue.toLowerCase()) || m.millCode.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = selectedFilters.activeStatus === "all" || m.activeStatus === selectedFilters.activeStatus;
    return matchesSearch && matchesStatus;
  });

  const columns: TableColumn<SizingMill>[] = [
    { key: "createdDate", header: "Created Date", render: (m) => <span className="font-mono text-xs text-muted-foreground">{m.createdDate || "25 Jul 2026"}</span>, sortable: true },
    { key: "millCode", header: "Mill Code", sortable: true, render: (m) => <span className="font-bold text-primary">{m.millCode}</span> },
    { key: "millName", header: "Mill Name", sortable: true, render: (m) => <span className="font-bold">{m.millName}</span> },
    { key: "contactPerson", header: "Contact Person" },
    { key: "mobileNumber", header: "Mobile No." },
    { key: "activeStatus", header: "Status", sortable: true, render: (m) => <StatusBadge status={m.activeStatus} /> }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Sizing Master"
        description="Manage Warping and Sizing Job-Work agencies and mills."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Master Data" }, { title: "Sizing Master" }]}
      />

      <MasterToolbar
        searchValue={searchValue} onSearchChange={setSearchValue}
        createLabel="Add Sizing Mill" onCreateClick={() => { setEditMill(null); setViewMill(null); form.reset(defaultValues); setDialogOpen(true); }}
        exportTitle="Sizing_Mills_Master" selectedFilters={selectedFilters}
        onFilterChange={(k, v) => setSelectedFilters(p => ({ ...p, [k]: v }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ activeStatus: "all" }); }}
        filters={[{ key: "activeStatus", placeholder: "Status", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] }]}
      />

      <MasterTable
        data={filteredData} columns={columns} isLoading={isLoading}
        onEdit={handleEditClick} onView={handleViewClick} onDelete={handleDeleteClick}
        onBulkDelete={() => {}}
      />

      {/* Form Dialog */}
      <MasterDialog isOpen={dialogOpen && !viewMill} onClose={() => setDialogOpen(false)} title={editMill ? "Edit Sizing Mill" : "Add New Sizing Mill"} description={editMill ? "Update existing sizing agency details." : "Register a new sizing mill or agency."}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Mill Name *</Label><Input {...form.register("millName")} placeholder="e.g. D.K. Warping & Sizing" />{form.formState.errors.millName && <p className="text-[10px] text-destructive">{form.formState.errors.millName.message}</p>}</div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status *</Label>
              <Select onValueChange={(v) => form.setValue("activeStatus", v as any)} value={form.watch("activeStatus")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Contact Person</Label><Input {...form.register("contactPerson")} placeholder="e.g. Ramesh Bhai" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Mobile Number *</Label><Input {...form.register("mobileNumber")} placeholder="e.g. 9876543210" />{form.formState.errors.mobileNumber && <p className="text-[10px] text-destructive">{form.formState.errors.mobileNumber.message}</p>}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">GST Number</Label><Input {...form.register("gstNumber")} placeholder="e.g. 27AAIBP1234S1Z2" /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Address *</Label><Textarea rows={3} {...form.register("address")} placeholder="Full address details" />{form.formState.errors.address && <p className="text-[10px] text-destructive">{form.formState.errors.address.message}</p>}</div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editMill ? "Update Mill" : "Save Mill"}</Button>
          </div>
        </form>
      </MasterDialog>

      {/* View Dialog */}
      <MasterDialog isOpen={dialogOpen && !!viewMill} onClose={() => setDialogOpen(false)} title="Sizing Mill Details" description="View complete details of this sizing mill.">
        {viewMill && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-y-3 bg-muted/20 p-3 rounded-lg border border-border/10">
              <div><span className="text-muted-foreground block">Mill Code</span><span className="font-bold text-primary">{viewMill.millCode}</span></div>
              <div><span className="text-muted-foreground block">Mill Name</span><span className="font-bold">{viewMill.millName}</span></div>
              <div><span className="text-muted-foreground block">Status</span><StatusBadge status={viewMill.activeStatus} /></div>
              <div><span className="text-muted-foreground block">Contact Person</span><span className="font-semibold">{viewMill.contactPerson || "—"}</span></div>
              <div><span className="text-muted-foreground block">Mobile Number</span><span className="font-semibold">{viewMill.mobileNumber}</span></div>
              <div><span className="text-muted-foreground block">GST Number</span><span className="font-semibold">{viewMill.gstNumber || "—"}</span></div>
            </div>
            <div><span className="text-muted-foreground block">Address</span><p className="font-semibold">{viewMill.address}</p></div>
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button></div>
          </div>
        )}
      </MasterDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-destructive" /> Delete Sizing Mill</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete <strong>{deleteTarget?.millName}</strong>? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMutation.isPending ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
