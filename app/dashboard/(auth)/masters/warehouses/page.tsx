"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Warehouse as WarehouseIcon, Trash2, ArrowLeft, Building, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Warehouse } from "@/lib/store/use-masters-store";
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
const warehouseFormSchema = z.object({
  warehouseName: z.string().min(3, "Godown name must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["Yarn", "Beam", "Grey Fabric", "General"]),
  status: z.enum(["Active", "Inactive"])
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export default function WarehousesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    type: "all",
    status: "all"
  });

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [viewWarehouse, setViewWarehouse] = useState<Warehouse | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetWarehouse, setDeleteTargetWarehouse] = useState<Warehouse | null>(null);

  // TanStack Queries & Mutations
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => mastersApiService.getWarehouses()
  });

  const createMutation = useMutation({
    mutationFn: (newWh: Warehouse) => mastersApiService.createWarehouse(newWh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("New warehouse location added.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (wh: Warehouse) => mastersApiService.updateWarehouse(wh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse register updated successfully.");
      setDialogOpen(false);
      setEditWarehouse(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse location deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTargetWarehouse(null);
    }
  });

  const statusToggleMutation = useMutation({
    mutationFn: (wh: Warehouse) => {
      const updatedWh: Warehouse = {
        ...wh,
        status: wh.status === "Active" ? "Inactive" : "Active"
      };
      return mastersApiService.updateWarehouse(updatedWh);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse status updated.");
    }
  });

  // React Hook Form
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      warehouseName: "",
      location: "",
      type: "Yarn",
      status: "Active"
    }
  });

  const resetForm = () => {
    form.reset({
      warehouseName: "",
      location: "",
      type: "Yarn",
      status: "Active"
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (wh: Warehouse) => {
    setEditWarehouse(wh);
    setViewWarehouse(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(wh).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (wh: Warehouse) => {
    setViewWarehouse(wh);
    setEditWarehouse(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (wh: Warehouse) => {
    setDeleteTargetWarehouse(wh);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: WarehouseFormValues) => {
    if (editWarehouse) {
      updateMutation.mutate({
        ...editWarehouse,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `WH-${Date.now()}`,
        warehouseCode: `WH-${String(warehouses.length + 1).padStart(3, "0")}`,
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredWarehouses = warehouses.filter((wh) => {
    const matchesSearch =
      wh.warehouseName.toLowerCase().includes(searchValue.toLowerCase()) ||
      wh.warehouseCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchValue.toLowerCase());

    const matchesType =
      selectedFilters.type === "all" ||
      wh.type === selectedFilters.type;

    const matchesStatus =
      selectedFilters.status === "all" ||
      wh.status === selectedFilters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: TableColumn<Warehouse>[] = [
    { key: "warehouseCode", header: "Code", sortable: true },
    { key: "warehouseName", header: "Warehouse Godown", render: (item) => <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span className="font-bold text-foreground">{item.warehouseName}</span></div>, sortable: true },
    { key: "type", header: "Stock Type Group", render: (item) => <Badge variant="secondary" className="font-bold">{item.type} Storage</Badge>, sortable: true },
    { key: "location", header: "Internal Location / Shed", sortable: true },
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
        title="Warehouse & Godown Registries"
        description="Configure inventory storage locations for raw yarn cartons, sized warp beams, and grey cloth rolls."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Warehouses Layout" }
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
        createLabel="Add Warehouse"
        onCreateClick={() => {
          setEditWarehouse(null);
          setViewWarehouse(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Warehouses"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ type: "all", status: "all" });
        }}
        filters={[
          {
            key: "type",
            placeholder: "Stock Type",
            options: [
              { label: "Yarn", value: "Yarn" },
              { label: "Beam", value: "Beam" },
              { label: "Grey Fabric", value: "Grey Fabric" },
              { label: "General", value: "General" }
            ]
          },
          {
            key: "status",
            placeholder: "Status",
            options: [
              { label: "Active Location", value: "Active" },
              { label: "Inactive Location", value: "Inactive" }
            ]
          }
        ]}
      />

      {/* Warehouses Table */}
      <MasterTable
        data={filteredWarehouses}
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
          setEditWarehouse(null);
          setViewWarehouse(null);
        }}
        title={
          viewWarehouse
            ? `Warehouse Audit: ${viewWarehouse.warehouseName}`
            : editWarehouse
            ? `Edit Warehouse Details`
            : "Register New Warehouse Storage"
        }
        description={
          viewWarehouse
            ? `Review inventory parameters for godown ${viewWarehouse.warehouseCode}`
            : "Setup warehouse zones correctly to allow precise stock transfer audits."
        }
      >
        {viewWarehouse ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Warehouse Name</span>
                <span className="text-sm font-bold text-foreground">{viewWarehouse.warehouseName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Warehouse Code</span>
                <span className="font-semibold text-foreground">{viewWarehouse.warehouseCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Warehouse Type</span>
                <Badge variant="secondary" className="font-bold">{viewWarehouse.type}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Internal Location</span>
                <span className="font-semibold text-foreground">{viewWarehouse.location}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Operational Status</span>
                <StatusBadge status={viewWarehouse.status} />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Panel
              </Button>
            </div>
          </div>
        ) : (
          // Create/Edit Mode Form
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="warehouseName" className="text-xs font-semibold">Warehouse / Godown Name *</Label>
              <Input id="warehouseName" placeholder="e.g. Shed A Fabric Godown" {...form.register("warehouseName")} />
              {form.formState.errors.warehouseName && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.warehouseName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold">Physical Location / Racks / Row Details *</Label>
              <Input id="location" placeholder="e.g. Shed A, Wing 2, Rows A-D" {...form.register("location")} />
              {form.formState.errors.location && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold">Stock Classification Group *</Label>
                <Select
                  onValueChange={(val) => form.setValue("type", val as any)}
                  value={form.watch("type")}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yarn">Yarn Raw Materials</SelectItem>
                    <SelectItem value="Beam">Mounted/Sized Beams</SelectItem>
                    <SelectItem value="Grey Fabric">Finished Grey Fabrics</SelectItem>
                    <SelectItem value="General">General / Consumables / Spares</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">Status *</Label>
                <Select
                  onValueChange={(val) => form.setValue("status", val as any)}
                  value={form.watch("status")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editWarehouse ? "Update Warehouse" : "Add Warehouse Godown"}
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
              Delete Warehouse location?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete **{deleteTargetWarehouse?.warehouseName}**? Inventory records associated with this godown zone will no longer resolve correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetWarehouse && deleteMutation.mutate(deleteTargetWarehouse.id)}
            >
              Delete Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
