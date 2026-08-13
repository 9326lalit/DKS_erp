"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Layers, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Fabric } from "@/lib/store/use-masters-store";
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

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const fabricFormSchema = z.object({
  fabricName: z.string().min(3, "Fabric name must be at least 3 characters"),
  construction: z.string().min(3, "Construction count is required (e.g. 60x60 / 132x72)"),
  width: z.number().min(1, "Width in inches is required"),
  gsm: z.number().min(1, "GSM is required"),
  warp: z.string().min(1, "Warp yarn count is required"),
  weft: z.string().min(1, "Weft yarn count is required"),
  pick: z.number().min(1, "Weft picks ratio is required"),
  ends: z.number().min(1, "Warp ends ratio is required"),
  quality: z.string().min(2, "Fabric quality grade is required"),
  unit: z.string().min(1, "Base measurement unit is required"),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"])
});

type FabricFormValues = z.infer<typeof fabricFormSchema>;

import { useTenantStore } from "@/lib/store/use-tenant-store";

export default function FabricsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenantStore();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all"
  });

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFabric, setEditFabric] = useState<Fabric | null>(null);
  const [viewFabric, setViewFabric] = useState<Fabric | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetFabric, setDeleteTargetFabric] = useState<Fabric | null>(null);

  // TanStack Queries & Mutations
  const { data: fabrics = [], isLoading, refetch } = useQuery({
    queryKey: ["fabrics", activeTenantId],
    queryFn: () => mastersApiService.getFabrics()
  });

  const createMutation = useMutation({
    mutationFn: (newFabric: Fabric) => mastersApiService.createFabric(newFabric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      toast.success("New fabric quality registered.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (fabric: Fabric) => mastersApiService.updateFabric(fabric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      toast.success("Fabric master details updated.");
      setDialogOpen(false);
      setEditFabric(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteFabric(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      toast.success("Fabric deleted from master directory.");
      setDeleteConfirmOpen(false);
      setDeleteTargetFabric(null);
    }
  });

  const statusToggleMutation = useMutation({
    mutationFn: (fabric: Fabric) => {
      const updatedFabric: Fabric = {
        ...fabric,
        status: fabric.status === "Active" ? "Inactive" : "Active"
      };
      return mastersApiService.updateFabric(updatedFabric);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabrics"] });
      toast.success("Fabric operational status updated.");
    }
  });

  // React Hook Form
  const form = useForm<FabricFormValues>({
    resolver: zodResolver(fabricFormSchema),
    defaultValues: {
      fabricName: "",
      construction: "60x60 / 132x72",
      width: 63,
      gsm: 80,
      warp: "60s Cotton",
      weft: "60s Cotton",
      pick: 72,
      ends: 132,
      quality: "Standard Grey",
      unit: "Meter",
      description: "",
      status: "Active"
    }
  });

  const resetForm = () => {
    form.reset({
      fabricName: "",
      construction: "60x60 / 132x72",
      width: 63,
      gsm: 80,
      warp: "60s Cotton",
      weft: "60s Cotton",
      pick: 72,
      ends: 132,
      quality: "Standard Grey",
      unit: "Meter",
      description: "",
      status: "Active"
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (fabric: Fabric) => {
    setEditFabric(fabric);
    setViewFabric(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(fabric).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (fabric: Fabric) => {
    setViewFabric(fabric);
    setEditFabric(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (fabric: Fabric) => {
    setDeleteTargetFabric(fabric);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: FabricFormValues) => {
    if (editFabric) {
      updateMutation.mutate({
        ...editFabric,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `FAB-${Date.now()}`,
        fabricCode: `FAB-${String(fabrics.length + 1).padStart(3, "0")}`,
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch =
      fabric.fabricName.toLowerCase().includes(searchValue.toLowerCase()) ||
      fabric.fabricCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      fabric.construction.toLowerCase().includes(searchValue.toLowerCase()) ||
      fabric.quality.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      selectedFilters.status === "all" ||
      fabric.status === selectedFilters.status;

    return matchesSearch && matchesStatus;
  });

  const columns: TableColumn<Fabric>[] = [
    { key: "createdDate", header: "Created Date", render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.createdDate || "25 Jul 2026"}</span>, sortable: true },
    { key: "fabricCode", header: "Code", sortable: true },
    { key: "fabricName", header: "Fabric Quality", sortable: true },
    { key: "construction", header: "Construction Construction", sortable: true },
    { key: "width", header: "Width (Inches)", render: (item) => <span>{item.width}&quot;</span>, sortable: true },
    { key: "gsm", header: "GSM", render: (item) => <span>{item.gsm} GSM</span>, sortable: true },
    { key: "warp", header: "Warp Yarn" },
    { key: "weft", header: "Weft Yarn" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} type="general" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Fabric Construction Master"
        description="Define grey cloth weaves, reed picks constructions, gsm weight parameters, and quality categories."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Fabric Construction" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/masters")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Masters
          </Button>
        }
      />

      {/* Toolbar & Search */}
      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Add New Fabric"
        onCreateClick={() => {
          setEditFabric(null);
          setViewFabric(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Fabrics"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ status: "all" });
        }}
        filters={[
          {
            key: "status",
            placeholder: "Status",
            options: [
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" }
            ]
          }
        ]}
      />

      {/* Fabrics Table */}
      <MasterTable
        data={filteredFabrics}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onStatusToggle={(item) => statusToggleMutation.mutate(item)}
        onBulkDelete={(items) => {
          items.forEach((item) => deleteMutation.mutate(item.id));
        }}
      />

      {/* Slide-out Panel Drawer (Create/Edit/View) */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditFabric(null);
          setViewFabric(null);
        }}
        title={
          viewFabric
            ? `View Audit: ${viewFabric.fabricName}`
            : editFabric
            ? `Edit Fabric: ${editFabric.fabricName}`
            : "Register New Fabric Construction Quality"
        }
        description={
          viewFabric
            ? `Review technical blueprint parameters for ${viewFabric.fabricCode}`
            : "Define warp ends, weft picks, width, and GSM values carefully. Production logs reference these."
        }
      >
        {viewFabric ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Fabric Quality Name</span>
                <span className="text-sm font-bold text-foreground">{viewFabric.fabricName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Reed Space Width</span>
                <span className="font-semibold text-foreground">{viewFabric.width} Inches</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Construction details</span>
                <span className="font-semibold text-foreground">{viewFabric.construction}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">GSM Weight</span>
                <span className="font-semibold text-foreground">{viewFabric.gsm} GSM</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Quality Rating Category</span>
                <span className="font-semibold text-foreground">{viewFabric.quality}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Warp Count</span>
                <span className="font-semibold text-foreground">{viewFabric.warp}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Weft Count</span>
                <span className="font-semibold text-foreground">{viewFabric.weft}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Ends / Inch (EPI)</span>
                <span className="font-semibold text-foreground">{viewFabric.ends}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Picks / Inch (PPI)</span>
                <span className="font-semibold text-foreground">{viewFabric.pick}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Selling Unit</span>
                <span className="font-semibold text-foreground">{viewFabric.unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Status</span>
                <StatusBadge status={viewFabric.status} />
              </div>
            </div>

            {viewFabric.description && (
              <div>
                <span className="text-muted-foreground block font-medium">Weaving Specification Remarks</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewFabric.description}</p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Panel
              </Button>
            </div>
          </div>
        ) : (
          // Create/Edit Mode Form
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fabricName" className="text-xs font-semibold">Fabric Quality Name *</Label>
                <Input id="fabricName" placeholder="e.g. Cotton Grey Cambric 60x60" {...form.register("fabricName")} />
                {form.formState.errors.fabricName && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.fabricName.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="construction" className="text-xs font-semibold">Construction Code *</Label>
                <Input id="construction" placeholder="e.g. 60x60 / 132x72" {...form.register("construction")} />
                {form.formState.errors.construction && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.construction.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs font-semibold">Finished Width (Inches) *</Label>
                <Input
                  id="width"
                  type="number"
                  {...form.register("width", { valueAsNumber: true })}
                />
                {form.formState.errors.width && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.width.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gsm" className="text-xs font-semibold">GSM Weight (Grams/Sq Meter) *</Label>
                <Input
                  id="gsm"
                  type="number"
                  {...form.register("gsm", { valueAsNumber: true })}
                />
                {form.formState.errors.gsm && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.gsm.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="warp" className="text-xs font-semibold">Warp Yarn Count Used *</Label>
                <Input id="warp" placeholder="e.g. 60s Cotton" {...form.register("warp")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weft" className="text-xs font-semibold">Weft Yarn Count Used *</Label>
                <Input id="weft" placeholder="e.g. 60s Cotton" {...form.register("weft")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="quality" className="text-xs font-semibold">Quality Standard *</Label>
                <Input id="quality" placeholder="e.g. Premium Export Quality" {...form.register("quality")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ends" className="text-xs font-semibold">Ends (EPI) *</Label>
                <Input
                  id="ends"
                  type="number"
                  {...form.register("ends", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pick" className="text-xs font-semibold">Picks (PPI) *</Label>
                <Input
                  id="pick"
                  type="number"
                  {...form.register("pick", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fabricUnit" className="text-xs font-semibold">Base Billing Unit *</Label>
                <Input id="fabricUnit" readOnly {...form.register("unit")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">Status *</Label>
                <Select
                  onValueChange={(val) => form.setValue("status", val as any)}
                  value={form.watch("status")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Weaving Construction Blueprint Notes</Label>
              <Textarea id="description" rows={3} placeholder="Add description..." {...form.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editFabric ? "Update Blueprint" : "Add Fabric Quality"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold font-display flex items-center gap-2 text-destructive">
              <Trash2 className="h-4.5 w-4.5 text-destructive" />
              Delete Fabric Quality Blueprint?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete **{deleteTargetFabric?.fabricName}**? This deletes the specifications table for this construction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetFabric && deleteMutation.mutate(deleteTargetFabric.id)}
            >
              Delete Quality
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
