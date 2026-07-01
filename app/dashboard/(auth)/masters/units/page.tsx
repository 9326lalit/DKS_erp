"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { FileCheck2, Trash2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Unit } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
const unitFormSchema = z.object({
  code: z.string().min(1, "Unit symbol code is required").max(6, "Code must be 6 letters or less"),
  name: z.string().min(2, "Full unit name is required")
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

export default function UnitsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [viewUnit, setViewUnit] = useState<Unit | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetUnit, setDeleteTargetUnit] = useState<Unit | null>(null);

  // TanStack Queries & Mutations
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => mastersApiService.getUnits()
  });

  const createMutation = useMutation({
    mutationFn: (newUnit: Unit) => mastersApiService.createUnit(newUnit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("New UOM registered successfully.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (unit: Unit) => mastersApiService.updateUnit(unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("UOM details updated successfully.");
      setDialogOpen(false);
      setEditUnit(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("UOM deleted successfully.");
      setDeleteConfirmOpen(false);
      setDeleteTargetUnit(null);
    }
  });

  // React Hook Form
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      code: "",
      name: ""
    }
  });

  const resetForm = () => {
    form.reset({
      code: "",
      name: ""
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (unit: Unit) => {
    setEditUnit(unit);
    setViewUnit(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(unit).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (unit: Unit) => {
    setViewUnit(unit);
    setEditUnit(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (unit: Unit) => {
    setDeleteTargetUnit(unit);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: UnitFormValues) => {
    const uppercaseCode = values.code.toUpperCase();
    if (editUnit) {
      updateMutation.mutate({
        ...editUnit,
        code: uppercaseCode,
        name: values.name
      });
    } else {
      createMutation.mutate({
        id: `UNT-${Date.now()}`,
        code: uppercaseCode,
        name: values.name
      });
    }
  };

  // Filter & Search logic
  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      unit.name.toLowerCase().includes(searchValue.toLowerCase());

    return matchesSearch;
  });

  const columns: TableColumn<Unit>[] = [
    { key: "code", header: "UOM Code Symbol", render: (item) => <span className="font-bold text-primary">{item.code}</span>, sortable: true },
    { key: "name", header: "Unit Description Name", render: (item) => <span className="font-semibold text-foreground">{item.name}</span>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Units of Measurement (UOM)"
        description="Configure unit symbols used in stock management, bill of materials (BOM), and ledger invoicing (e.g. KG, Meter, Roll, Cone)."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Measurement Symbols" }
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
        createLabel="Add Measurement Unit"
        onCreateClick={() => {
          setEditUnit(null);
          setViewUnit(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Units"
        onClearFilters={() => setSearchValue("")}
      />

      {/* Units Table */}
      <MasterTable
        data={filteredUnits}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onBulkDelete={(items) => {
          items.forEach((item) => deleteMutation.mutate(item.id));
        }}
      />

      {/* Slide-out Panel Drawer (Create/Edit/View) */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditUnit(null);
          setViewUnit(null);
        }}
        title={
          viewUnit
            ? `UOM details: ${viewUnit.code}`
            : editUnit
            ? `Edit Unit parameters`
            : "Define New Measurement Symbol"
        }
        description={
          viewUnit
            ? `Review parameters for code ${viewUnit.id}`
            : "Specify unique uppercase symbol code and descriptive name."
        }
      >
        {viewUnit ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">UOM Symbol Code</span>
                <span className="text-sm font-bold text-primary">{viewUnit.code}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Unit Description Name</span>
                <span className="font-semibold text-foreground">{viewUnit.name}</span>
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
              <Label htmlFor="code" className="text-xs font-semibold">UOM Symbol Code *</Label>
              <Input id="code" placeholder="e.g. KG, MTR, PCS, BEM" {...form.register("code")} />
              {form.formState.errors.code && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Descriptive Name *</Label>
              <Input id="name" placeholder="e.g. Kilogram, Meter, Pieces, Beams" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editUnit ? "Update Unit" : "Add Unit Symbol"}
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
              Delete Unit symbol?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete **{deleteTargetUnit?.code}**? Items configured in inventory bills with this code will no longer resolve correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetUnit && deleteMutation.mutate(deleteTargetUnit.id)}
            >
              Delete UOM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
