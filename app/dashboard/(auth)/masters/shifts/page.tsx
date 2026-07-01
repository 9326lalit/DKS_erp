"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Calendar, Trash2, ArrowLeft, Clock, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Shift } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
const shiftFormSchema = z.object({
  shiftName: z.string().min(3, "Shift name must be at least 3 characters"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  breakTime: z.string().min(1, "Break time duration is required"),
  description: z.string().optional()
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

export default function ShiftsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [viewShift, setViewShift] = useState<Shift | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetShift, setDeleteTargetShift] = useState<Shift | null>(null);

  // TanStack Queries & Mutations
  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => mastersApiService.getShifts()
  });

  const createMutation = useMutation({
    mutationFn: (newShift: Shift) => mastersApiService.createShift(newShift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("New operational shift scheduled.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (shift: Shift) => mastersApiService.updateShift(shift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift timings updated successfully.");
      setDialogOpen(false);
      setEditShift(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift configuration removed.");
      setDeleteConfirmOpen(false);
      setDeleteTargetShift(null);
    }
  });

  // React Hook Form
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      shiftName: "",
      startTime: "07:30 AM",
      endTime: "07:30 PM",
      breakTime: "60 Min",
      description: ""
    }
  });

  const resetForm = () => {
    form.reset({
      shiftName: "",
      startTime: "07:30 AM",
      endTime: "07:30 PM",
      breakTime: "60 Min",
      description: ""
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (shift: Shift) => {
    setEditShift(shift);
    setViewShift(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(shift).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (shift: Shift) => {
    setViewShift(shift);
    setEditShift(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (shift: Shift) => {
    setDeleteTargetShift(shift);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: ShiftFormValues) => {
    if (editShift) {
      updateMutation.mutate({
        ...editShift,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `SHF-${Date.now()}`,
        shiftCode: `SHF-${String(shifts.length + 1).padStart(2, "0")}`,
        status: "Active",
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch =
      shift.shiftName.toLowerCase().includes(searchValue.toLowerCase()) ||
      shift.shiftCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      shift.startTime.toLowerCase().includes(searchValue.toLowerCase()) ||
      shift.endTime.toLowerCase().includes(searchValue.toLowerCase());

    return matchesSearch;
  });

  const columns: TableColumn<Shift>[] = [
    { key: "shiftCode", header: "Code", sortable: true },
    { key: "shiftName", header: "Shift Name", render: (item) => <span className="font-bold text-foreground">{item.shiftName}</span>, sortable: true },
    { key: "startTime", header: "Start Timing", render: (item) => <div className="flex items-center gap-1.5 font-semibold text-foreground"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {item.startTime}</div>, sortable: true },
    { key: "endTime", header: "End Timing", render: (item) => <div className="flex items-center gap-1.5 font-semibold text-foreground"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {item.endTime}</div>, sortable: true },
    { key: "breakTime", header: "Break Allowed", render: (item) => <Badge variant="outline" className="font-bold">{item.breakTime}</Badge> },
    { key: "description", header: "Description / Operation Guidelines", render: (item) => <span className="text-muted-foreground truncate block max-w-sm">{item.description || "N/A"}</span> }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Shift Rosters Setup"
        description="Configure day and night shift timetables. Specify start/end hours and standard meal break limits for weavers."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Shift Schedules" }
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
        createLabel="Add Shift Schedule"
        onCreateClick={() => {
          setEditShift(null);
          setViewShift(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Shifts"
        onClearFilters={() => setSearchValue("")}
      />

      {/* Shifts Table */}
      <MasterTable
        data={filteredShifts}
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
          setEditShift(null);
          setViewShift(null);
        }}
        title={
          viewShift
            ? `Shift Audit: ${viewShift.shiftName}`
            : editShift
            ? `Edit Shift roster configuration`
            : "Define New Shift Timing"
        }
        description={
          viewShift
            ? `Review shift parameters for code ${viewShift.shiftCode}`
            : "Define timing rules correctly to ensure payroll and attendance calculations map correctly."
        }
      >
        {viewShift ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Shift Name</span>
                <span className="text-sm font-bold text-foreground">{viewShift.shiftName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Shift Code</span>
                <span className="font-semibold text-foreground">{viewShift.shiftCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Start Time</span>
                <span className="font-semibold text-foreground">{viewShift.startTime}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">End Time</span>
                <span className="font-semibold text-foreground">{viewShift.endTime}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Meal Break Duration</span>
                <Badge variant="secondary" className="font-bold">{viewShift.breakTime}</Badge>
              </div>
            </div>

            {viewShift.description && (
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Shift Instructions</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewShift.description}</p>
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
                <Label htmlFor="shiftName" className="text-xs font-semibold">Shift Name *</Label>
                <Input id="shiftName" placeholder="e.g. Morning Shift, Night Shift" {...form.register("shiftName")} />
                {form.formState.errors.shiftName && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.shiftName.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="breakTime" className="text-xs font-semibold">Standard Break Allowed *</Label>
                <Input id="breakTime" placeholder="e.g. 60 Min, 45 Min" {...form.register("breakTime")} />
                {form.formState.errors.breakTime && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.breakTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs font-semibold">Start Time (Format e.g. 07:30 AM) *</Label>
                <Input id="startTime" placeholder="07:30 AM" {...form.register("startTime")} />
                {form.formState.errors.startTime && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs font-semibold">End Time (Format e.g. 07:30 PM) *</Label>
                <Input id="endTime" placeholder="07:30 PM" {...form.register("endTime")} />
                {form.formState.errors.endTime && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Shift Description / Operator instructions</Label>
              <Textarea id="description" rows={3} placeholder="Add description note..." {...form.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editShift ? "Update Timings" : "Add Shift Roster"}
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
              Remove Shift roster?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete **{deleteTargetShift?.shiftName}**? Timings associated with this schedule block will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetShift && deleteMutation.mutate(deleteTargetShift.id)}
            >
              Delete Shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
