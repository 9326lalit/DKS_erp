"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { TanaPI, numberToWords } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const paymentStatusColors: Record<string, string> = {
  "Pending": "bg-red-500/10 text-red-600 border-red-500/20",
  "Partially Paid": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

const schema = z.object({
  supplierInvoiceNo: z.string().min(1, "Supplier Invoice No is required"),
  supplierInvoiceDate: z.string().min(1, "Supplier Invoice Date is required"),
  piDate: z.string().min(1, "PI Date is required"),
  ratePerKg: z.number().min(0.01, "Rate must be positive"),
  roundOff: z.number(),
  paymentTermsDays: z.number().min(0),
  paymentStatus: z.enum(["Pending", "Partially Paid", "Paid"])
});

type FormValues = z.infer<typeof schema>;

export default function TanaInvoicesPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ paymentStatus: "all" });
  const [viewPI, setViewPI] = useState<TanaPI | null>(null);
  const [editPI, setEditPI] = useState<TanaPI | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TanaPI | null>(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ["tana-pis"], queryFn: () => tanaApiService.getPIs() });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierInvoiceNo: "",
      supplierInvoiceDate: "",
      piDate: "",
      ratePerKg: 0,
      roundOff: 0,
      paymentTermsDays: 30,
      paymentStatus: "Pending"
    }
  });

  useEffect(() => {
    if (editPI) {
      form.reset({
        supplierInvoiceNo: editPI.supplierInvoiceNo,
        supplierInvoiceDate: editPI.supplierInvoiceDate,
        piDate: editPI.piDate,
        ratePerKg: editPI.ratePerKg,
        roundOff: editPI.roundOff,
        paymentTermsDays: editPI.paymentTermsDays,
        paymentStatus: editPI.paymentStatus
      });
    }
  }, [editPI, form]);

  const updateMutation = useMutation({
    mutationFn: (pi: TanaPI) => tanaApiService.updatePI(pi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pis"] });
      toast.success("Tana Purchase Invoice updated.");
      setEditPI(null);
    },
    onError: () => toast.error("Failed to update invoice.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tanaApiService.deletePI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pis"] });
      toast.success("Tana Purchase Invoice deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete invoice.")
  });

  const handleEditClick = (pi: TanaPI) => {
    setEditPI(pi);
    setViewPI(null);
  };

  const handleDeleteClick = (pi: TanaPI) => {
    setDeleteTarget(pi);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = (values: FormValues) => {
    if (!editPI) return;

    const taxableAmount = editPI.totalWeightKg * values.ratePerKg;
    const cgstAmount = taxableAmount * (editPI.cgstPercent / 100);
    const sgstAmount = taxableAmount * (editPI.sgstPercent / 100);
    const netPayable = taxableAmount + cgstAmount + sgstAmount + values.roundOff;
    const dueDate = values.piDate
      ? new Date(new Date(values.piDate).getTime() + values.paymentTermsDays * 86400000).toISOString().split("T")[0]
      : "";

    updateMutation.mutate({
      ...editPI,
      ...values,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      netPayable: parseFloat(netPayable.toFixed(2)),
      dueDate,
      amountInWords: numberToWords(Math.round(netPayable))
    });
  };

  const filtered = invoices.filter(i => {
    const ms = i.piNumber.toLowerCase().includes(searchValue.toLowerCase()) || i.supplierName.toLowerCase().includes(searchValue.toLowerCase()) || i.supplierInvoiceNo.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.paymentStatus === "all" || i.paymentStatus === selectedFilters.paymentStatus;
    return ms && mst;
  });

  const columns: TableColumn<TanaPI>[] = [
    { key: "piNumber", header: "PI Number", sortable: true, render: (item) => <span className="font-bold text-primary">{item.piNumber}</span> },
    { key: "piDate", header: "PI Date", sortable: true },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "supplierInvoiceNo", header: "Supp. Invoice No." },
    { key: "linkedGRNNumber", header: "Linked GRN", render: (item) => <span className="text-xs">{item.linkedGRNNumber}</span> },
    { key: "taxableAmount", header: "Taxable Amt", render: (item) => <span className="font-semibold">₹{item.taxableAmount.toLocaleString()}</span> },
    { key: "netPayable", header: "Net Payable", render: (item) => <span className="font-bold">₹{item.netPayable.toLocaleString()}</span> },
    { key: "dueDate", header: "Due Date", sortable: true },
    {
      key: "paymentStatus", header: "Payment", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[item.paymentStatus] || ""}`}>{item.paymentStatus}</Badge>, sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tana Purchase Invoices"
        description="Manage and track purchase invoices for Tana (Warp Yarn) with full GST breakup. Series: TANA-PI-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Tana (Warp)" }, { title: "Invoices" }]}
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Create Invoice"
        onCreateClick={() => window.location.href = "/dashboard/tana/invoices/new"}
        exportTitle="Tana Invoices"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ paymentStatus: "all" }); }}
        filters={[
          { key: "paymentStatus", placeholder: "Payment Status", options: [{ label: "Pending", value: "Pending" }, { label: "Partially Paid", value: "Partially Paid" }, { label: "Paid", value: "Paid" }] }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onView={(item) => setViewPI(item)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      {/* View Invoice Dialog */}
      <MasterDialog
        isOpen={!!viewPI}
        onClose={() => setViewPI(null)}
        title="Purchase Invoice Details (Tana)"
        description={`PI #: ${viewPI?.piNumber} | Supplier Inv #: ${viewPI?.supplierInvoiceNo}`}
      >
        {viewPI && (
          <DetailViewCard
            title={viewPI.piNumber}
            subtitle={`Supplier: ${viewPI.supplierName} • Linked GRN: ${viewPI.linkedGRNNumber}`}
            statusBadge={
              <Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[viewPI.paymentStatus] || ""}`}>
                {viewPI.paymentStatus}
              </Badge>
            }
            sections={[
              {
                title: "Supplier & References",
                fields: [
                  { label: "Supplier Name", value: viewPI.supplierName, highlight: true },
                  { label: "Supplier Inv No.", value: viewPI.supplierInvoiceNo, mono: true },
                  { label: "Supplier Inv Date", value: viewPI.supplierInvoiceDate || "—", mono: true },
                  { label: "Linked GRN", value: viewPI.linkedGRNNumber, mono: true },
                  { label: "Linked PO", value: viewPI.linkedPONumber, mono: true },
                  { label: "Payment Terms", value: `${viewPI.paymentTermsDays || 30} Days Credit` }
                ]
              },
              {
                title: "Item & Quantity Specs",
                fields: [
                  { label: "Item Description", value: viewPI.itemDescription, colSpan: 2 },
                  { label: "Total Weight", value: `${viewPI.totalWeightKg.toLocaleString()} KG`, highlight: true },
                  { label: "Rate per KG", value: `₹${viewPI.ratePerKg}`, mono: true },
                  { label: "Payment Due Date", value: viewPI.dueDate, mono: true, highlight: true }
                ]
              }
            ]}
          >
            {/* Financial Totals Card */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Taxable Amount:</span>
                <span className="font-semibold font-mono">₹{viewPI.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">CGST @ {viewPI.cgstPercent}% + SGST @ {viewPI.sgstPercent}%:</span>
                <span className="font-semibold font-mono">₹{(viewPI.cgstAmount + viewPI.sgstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {viewPI.roundOff !== 0 && (
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Round Off:</span>
                  <span className="font-mono">₹{viewPI.roundOff}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-primary pt-2 border-t border-border/20">
                <span>Net Total Payable:</span>
                <span className="text-base font-mono font-bold">₹{viewPI.netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {viewPI.amountInWords && (
                <p className="text-[10px] text-muted-foreground italic pt-1">{viewPI.amountInWords}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewPI(null)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        )}
      </MasterDialog>

      {/* Edit Invoice Dialog */}
      <MasterDialog
        isOpen={!!editPI}
        onClose={() => setEditPI(null)}
        title={`Edit Invoice: ${editPI?.piNumber}`}
        description={`Supplier: ${editPI?.supplierName}`}
      >
        {editPI && (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">PI Date *</Label>
                <Input type="date" {...form.register("piDate")} />
                {form.formState.errors.piDate && <p className="text-[10px] text-destructive">{form.formState.errors.piDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Status *</Label>
                <Select onValueChange={(v) => form.setValue("paymentStatus", v as any)} value={form.watch("paymentStatus")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Supplier Invoice No *</Label>
                <Input {...form.register("supplierInvoiceNo")} />
                {form.formState.errors.supplierInvoiceNo && <p className="text-[10px] text-destructive">{form.formState.errors.supplierInvoiceNo.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Supplier Invoice Date *</Label>
                <Input type="date" {...form.register("supplierInvoiceDate")} />
                {form.formState.errors.supplierInvoiceDate && <p className="text-[10px] text-destructive">{form.formState.errors.supplierInvoiceDate.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate per KG (₹) *</Label>
                <Input type="number" step="0.01" {...form.register("ratePerKg", { valueAsNumber: true })} />
                {form.formState.errors.ratePerKg && <p className="text-[10px] text-destructive">{form.formState.errors.ratePerKg.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Round Off (₹)</Label>
                <Input type="number" step="0.01" {...form.register("roundOff", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Terms (Days) *</Label>
                <Input type="number" {...form.register("paymentTermsDays", { valueAsNumber: true })} />
              </div>
            </div>

            {/* Calculations Preview */}
            <div className="bg-muted/10 rounded-lg border p-3 text-xs space-y-1">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Calculations Preview</span>
              <div className="flex justify-between"><span>Weight</span><span>{editPI.totalWeightKg.toLocaleString()} KG</span></div>
              <div className="flex justify-between"><span>Computed Taxable</span><span>₹{((form.watch("ratePerKg") || 0) * editPI.totalWeightKg).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between font-bold text-foreground border-t border-border/20 pt-1.5">
                <span>Grand Total Net</span>
                <span>
                  ₹{(
                    ((form.watch("ratePerKg") || 0) * editPI.totalWeightKg) * (1 + (editPI.cgstPercent + editPI.sgstPercent) / 100) + (form.watch("roundOff") || 0)
                  ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditPI(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />Delete Tana Purchase Invoice?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete purchase invoice <strong>{deleteTarget?.piNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
