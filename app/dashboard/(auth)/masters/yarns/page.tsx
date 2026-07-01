"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Cpu, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Yarn } from "@/lib/store/use-masters-store";
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

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const yarnFormSchema = z.object({
  yarnName: z.string().min(3, "Yarn name must be at least 3 characters"),
  material: z.enum(["Cotton", "Polyester", "PV", "Viscose"]),
  count: z.string().min(1, "Yarn count is required"),
  denier: z.string().optional(),
  brand: z.string().min(2, "Brand name is required"),
  color: z.string().min(2, "Color is required"),
  unit: z.string().min(1, "Measurement unit is required"),
  coneWeight: z.number().optional().or(z.nan()),
  rate: z.number().min(1, "Rate per KG must be positive"),
  gst: z.number().min(0).max(100),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"])
});

type YarnFormValues = z.infer<typeof yarnFormSchema>;

export default function YarnsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    material: "all",
    status: "all"
  });

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editYarn, setEditYarn] = useState<Yarn | null>(null);
  const [viewYarn, setViewYarn] = useState<Yarn | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetYarn, setDeleteTargetYarn] = useState<Yarn | null>(null);

  // TanStack Queries & Mutations
  const { data: yarns = [], isLoading, refetch } = useQuery({
    queryKey: ["yarns"],
    queryFn: () => mastersApiService.getYarns()
  });

  const createMutation = useMutation({
    mutationFn: (newYarn: Yarn) => mastersApiService.createYarn(newYarn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yarns"] });
      toast.success("New yarn count added to masters.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (yarn: Yarn) => mastersApiService.updateYarn(yarn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yarns"] });
      toast.success("Yarn master updated successfully.");
      setDialogOpen(false);
      setEditYarn(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteYarn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yarns"] });
      toast.success("Yarn deleted from master register.");
      setDeleteConfirmOpen(false);
      setDeleteTargetYarn(null);
    }
  });

  const statusToggleMutation = useMutation({
    mutationFn: (yarn: Yarn) => {
      const updatedYarn: Yarn = {
        ...yarn,
        status: yarn.status === "Active" ? "Inactive" : "Active"
      };
      return mastersApiService.updateYarn(updatedYarn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yarns"] });
      toast.success("Yarn status updated.");
    }
  });

  // React Hook Form
  const form = useForm<YarnFormValues>({
    resolver: zodResolver(yarnFormSchema),
    defaultValues: {
      yarnName: "",
      material: "Cotton",
      count: "40s",
      denier: "",
      brand: "",
      color: "Raw White",
      unit: "KG",
      coneWeight: 1.8,
      rate: 240,
      gst: 5,
      description: "",
      status: "Active"
    }
  });

  const resetForm = () => {
    form.reset({
      yarnName: "",
      material: "Cotton",
      count: "40s",
      denier: "",
      brand: "",
      color: "Raw White",
      unit: "KG",
      coneWeight: 1.8,
      rate: 240,
      gst: 5,
      description: "",
      status: "Active"
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (yarn: Yarn) => {
    setEditYarn(yarn);
    setViewYarn(null);
    setDialogOpen(true);

    // Set form values
    Object.entries(yarn).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (yarn: Yarn) => {
    setViewYarn(yarn);
    setEditYarn(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (yarn: Yarn) => {
    setDeleteTargetYarn(yarn);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: YarnFormValues) => {
    if (editYarn) {
      updateMutation.mutate({
        ...editYarn,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `YRN-${Date.now()}`,
        yarnCode: `YRN-${String(yarns.length + 1).padStart(3, "0")}`,
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredYarns = yarns.filter((yarn) => {
    const matchesSearch =
      yarn.yarnName.toLowerCase().includes(searchValue.toLowerCase()) ||
      yarn.yarnCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      yarn.count.toLowerCase().includes(searchValue.toLowerCase()) ||
      yarn.brand.toLowerCase().includes(searchValue.toLowerCase());

    const matchesMaterial =
      selectedFilters.material === "all" ||
      yarn.material === selectedFilters.material;

    const matchesStatus =
      selectedFilters.status === "all" ||
      yarn.status === selectedFilters.status;

    return matchesSearch && matchesMaterial && matchesStatus;
  });

  const columns: TableColumn<Yarn>[] = [
    { key: "yarnCode", header: "Code", sortable: true },
    { key: "yarnName", header: "Yarn Count", sortable: true },
    { key: "material", header: "Material", sortable: true },
    { key: "brand", header: "Spinning Mill / Brand", sortable: true },
    { key: "rate", header: "Base Rate / KG", render: (item) => <span>₹{item.rate}/KG</span>, sortable: true },
    { key: "gst", header: "GST Rate", render: (item) => <span>{item.gst}%</span> },
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
        title="Yarn Master Registries"
        description="Configure standard warp and weft counts, blends, spinning mill brands, and purchase rates."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Yarn Specifications" }
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
        createLabel="Add New Yarn"
        onCreateClick={() => {
          setEditYarn(null);
          setViewYarn(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Yarns"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ material: "all", status: "all" });
        }}
        filters={[
          {
            key: "material",
            placeholder: "Material",
            options: [
              { label: "Cotton", value: "Cotton" },
              { label: "Polyester", value: "Polyester" },
              { label: "PV", value: "PV" },
              { label: "Viscose", value: "Viscose" }
            ]
          },
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

      {/* Yarns Table */}
      <MasterTable
        data={filteredYarns}
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
          setEditYarn(null);
          setViewYarn(null);
        }}
        title={
          viewYarn
            ? `View Audit: ${viewYarn.yarnName}`
            : editYarn
              ? `Edit Yarn: ${editYarn.yarnName}`
              : "Register New Yarn Count Specification"
        }
        description={
          viewYarn
            ? `Review inventory parameters for ${viewYarn.yarnCode}`
            : "Define yarn count values correctly to ensure sizing beams calculate warp weight accurately."
        }
      >
        {viewYarn ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Yarn Name</span>
                <span className="text-sm font-bold text-foreground">{viewYarn.yarnName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Material Blend</span>
                <Badge variant="secondary" className="font-bold">{viewYarn.material}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Yarn Count</span>
                <span className="font-semibold text-foreground uppercase">{viewYarn.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Denier Size</span>
                <span className="font-semibold text-foreground">{viewYarn.denier || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Spinning Mill / Brand</span>
                <span className="font-semibold text-foreground">{viewYarn.brand}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Color shade</span>
                <span className="font-semibold text-foreground">{viewYarn.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Base Unit</span>
                <span className="font-semibold text-foreground">{viewYarn.unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Average Cone Weight</span>
                <span className="font-semibold text-foreground">{viewYarn.coneWeight ? `${viewYarn.coneWeight} KG` : "N/A"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Standard Purchase Rate</span>
                <span className="font-bold text-foreground">₹{viewYarn.rate} / KG</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">GST Bracket</span>
                <span className="font-semibold text-foreground">{viewYarn.gst}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Status</span>
                <StatusBadge status={viewYarn.status} />
              </div>
            </div>

            {viewYarn.description && (
              <div>
                <span className="text-muted-foreground block font-medium">Description</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewYarn.description}</p>
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
                <Label htmlFor="yarnName" className="text-xs font-semibold">Yarn Count Name *</Label>
                <Input id="yarnName" placeholder="e.g. 40s Cotton Warp" {...form.register("yarnName")} />
                {form.formState.errors.yarnName && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.yarnName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="material" className="text-xs font-semibold">Material *</Label>
                <Select
                  onValueChange={(val) => form.setValue("material", val as any)}
                  value={form.watch("material")}
                >
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Polyester">Polyester</SelectItem>
                    <SelectItem value="PV">PV (Poly-Viscose)</SelectItem>
                    <SelectItem value="Viscose">Viscose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="count" className="text-xs font-semibold">Yarn Count Size *</Label>
                <Input id="count" placeholder="e.g. 40s Ne, 2/40s" {...form.register("count")} />
                {form.formState.errors.count && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.count.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="denier" className="text-xs font-semibold">Denier Size</Label>
                <Input id="denier" placeholder="e.g. 150D" {...form.register("denier")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold">Spinning Mill / Brand *</Label>
                <Input id="brand" placeholder="e.g. Vardhman Mills" {...form.register("brand")} />
                {form.formState.errors.brand && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.brand.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs font-semibold">Color shade *</Label>
                <Input id="color" {...form.register("color")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-semibold">Base Inventory Unit *</Label>
                <Input id="unit" readOnly {...form.register("unit")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coneWeight" className="text-xs font-semibold">Cone Weight (KG)</Label>
                <Input
                  id="coneWeight"
                  type="number"
                  step="0.01"
                  {...form.register("coneWeight", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="rate" className="text-xs font-semibold">Purchase Rate / KG *</Label>
                <Input
                  id="rate"
                  type="number"
                  {...form.register("rate", { valueAsNumber: true })}
                />
                {form.formState.errors.rate && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.rate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gst" className="text-xs font-semibold">GST Rate (%)</Label>
                <Input
                  id="gst"
                  type="number"
                  {...form.register("gst", { valueAsNumber: true })}
                />
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
              <Label htmlFor="description" className="text-xs font-semibold">Material Specifications Notes</Label>
              <Textarea id="description" rows={3} placeholder="Add description..." {...form.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editYarn ? "Update Yarn Spec" : "Add Yarn Spec"}
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
              Delete Yarn Specification?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete **{deleteTargetYarn?.yarnName}**? Deleting this count spec will disrupt inventory records of yarn bags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetYarn && deleteMutation.mutate(deleteTargetYarn.id)}
            >
              Delete Specification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
