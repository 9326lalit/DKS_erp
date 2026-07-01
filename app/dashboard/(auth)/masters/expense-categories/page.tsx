"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { TrendingDown, Trash2, ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { ExpenseCategory } from "@/lib/store/use-masters-store";
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
const expenseCategoryFormSchema = z.object({
  categoryName: z.string().min(3, "Category name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"])
});

type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all"
  });

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(null);
  const [viewCategory, setViewCategory] = useState<ExpenseCategory | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<ExpenseCategory | null>(null);

  // TanStack Queries & Mutations
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: () => mastersApiService.getExpenseCategories()
  });

  const createMutation = useMutation({
    mutationFn: (newCat: ExpenseCategory) => mastersApiService.createExpenseCategory(newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("New expense category configured.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (cat: ExpenseCategory) => mastersApiService.updateExpenseCategory(cat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Expense category updated successfully.");
      setDialogOpen(false);
      setEditCategory(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Expense category deleted successfully.");
      setDeleteConfirmOpen(false);
      setDeleteTargetCategory(null);
    }
  });

  const statusToggleMutation = useMutation({
    mutationFn: (cat: ExpenseCategory) => {
      const updatedCat: ExpenseCategory = {
        ...cat,
        status: cat.status === "Active" ? "Inactive" : "Active"
      };
      return mastersApiService.updateExpenseCategory(updatedCat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Category status updated.");
    }
  });

  // React Hook Form
  const form = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategoryFormSchema),
    defaultValues: {
      categoryName: "",
      description: "",
      status: "Active"
    }
  });

  const resetForm = () => {
    form.reset({
      categoryName: "",
      description: "",
      status: "Active"
    });
  };

  // Trigger Edit Drawer
  const handleEditClick = (cat: ExpenseCategory) => {
    setEditCategory(cat);
    setViewCategory(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(cat).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (cat: ExpenseCategory) => {
    setViewCategory(cat);
    setEditCategory(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (cat: ExpenseCategory) => {
    setDeleteTargetCategory(cat);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: ExpenseCategoryFormValues) => {
    if (editCategory) {
      updateMutation.mutate({
        ...editCategory,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `EXP-${Date.now()}`,
        categoryCode: `EXP-${values.categoryName.substring(0, 4).toUpperCase()}`,
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.categoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
      cat.categoryCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchValue.toLowerCase()));

    const matchesStatus =
      selectedFilters.status === "all" ||
      cat.status === selectedFilters.status;

    return matchesSearch && matchesStatus;
  });

  const columns: TableColumn<ExpenseCategory>[] = [
    { key: "categoryCode", header: "Category Code", sortable: true },
    { key: "categoryName", header: "Category Name", render: (item) => <span className="font-bold text-foreground">{item.categoryName}</span>, sortable: true },
    { key: "description", header: "Category Ledger Description", render: (item) => <span className="text-muted-foreground block max-w-sm truncate">{item.description || "N/A"}</span> },
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
        title="Expense Categories Master"
        description="Categorize operational overheads like electricity, repair spares, wages, and generator fuel for cost-sheet analysis."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Expense Categories" }
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
        createLabel="Add Expense Category"
        onCreateClick={() => {
          setEditCategory(null);
          setViewCategory(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="ExpenseCategories"
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
              { label: "Active Ledgers", value: "Active" },
              { label: "Inactive Ledgers", value: "Inactive" }
            ]
          }
        ]}
      />

      {/* Categories Table */}
      <MasterTable
        data={filteredCategories}
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
          setEditCategory(null);
          setViewCategory(null);
        }}
        title={
          viewCategory
            ? `Category details: ${viewCategory.categoryName}`
            : editCategory
            ? `Edit Category timngs`
            : "Define New Expense Category"
        }
        description={
          viewCategory
            ? `Review parameters for code ${viewCategory.categoryCode}`
            : "Setup expense categories correctly to allow clean operational balance analysis."
        }
      >
        {viewCategory ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Category Name</span>
                <span className="text-sm font-bold text-foreground">{viewCategory.categoryName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Category Code</span>
                <span className="font-semibold text-foreground">{viewCategory.categoryCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Status</span>
                <StatusBadge status={viewCategory.status} />
              </div>
            </div>

            {viewCategory.description && (
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Operational Scope Guidelines</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewCategory.description}</p>
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
                <Label htmlFor="categoryName" className="text-xs font-semibold">Expense Category Name *</Label>
                <Input id="categoryName" placeholder="e.g. Electric Power Bills" {...form.register("categoryName")} />
                {form.formState.errors.categoryName && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.categoryName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">Ledger Status *</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Operational Scope Guidelines & notes</Label>
              <Textarea id="description" rows={3} placeholder="Describe outgoings under this ledger..." {...form.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editCategory ? "Update Category" : "Add Expense Category"}
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
              Remove Expense category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete **{deleteTargetCategory?.categoryName}**? Categorizing general outgoings to this ledger symbol will no longer resolve correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetCategory && deleteMutation.mutate(deleteTargetCategory.id)}
            >
              Remove Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
