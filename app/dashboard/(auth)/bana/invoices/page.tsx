"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { banaApiService } from "@/lib/services/bana-api";
import { BanaPI } from "@/lib/store/use-bana-store";
import { numberToWords } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function BanaInvoicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ paymentStatus: "all" });
  const [editPI, setEditPI] = useState<BanaPI | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BanaPI | null>(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ["bana-pis"], queryFn: () => banaApiService.getPIs() });

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
    mutationFn: (pi: BanaPI) => banaApiService.updatePI(pi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pis"] });
      toast.success("Bana Purchase Invoice updated.");
      setEditPI(null);
    },
    onError: () => toast.error("Failed to update invoice.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => banaApiService.deletePI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pis"] });
      toast.success("Bana Purchase Invoice deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete invoice.")
  });

  const handleEditClick = (pi: BanaPI) => {
    setEditPI(pi);
  };

  const handleDeleteClick = (pi: BanaPI) => {
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

  const columns: TableColumn<BanaPI>[] = [
    {
      key: "piNumber",
      header: "PI Number",
      sortable: true,
      render: (item) => (
        <Link href={`/dashboard/bana/invoices/${item.id}`} className="font-bold text-primary hover:underline">
          {item.piNumber}
        </Link>
      )
    },
    { key: "piDate", header: "PI Date", sortable: true },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "supplierInvoiceNo", header: "Supp. Invoice No." },
    { key: "linkedGRNNumber", header: "Linked GRN", render: (item) => <span className="text-xs">{item.linkedGRNNumber}</span> },
    { key: "taxableAmount", header: "Taxable Amt", render: (item) => <span className="font-semibold">₹{item.taxableAmount.toLocaleString()}</span> },
    { key: "netPayable", header: "Net Payable", render: (item) => <span className="font-bold text-emerald-600">₹{item.netPayable.toLocaleString()}</span> },
    { key: "dueDate", header: "Due Date", sortable: true },
    {
      key: "paymentStatus", header: "Payment", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[item.paymentStatus] || ""}`}>{item.paymentStatus}</Badge>, sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Bana Purchase Invoices"
        description="Manage purchase invoices for Bana (Weft Yarn) with full tax breakdown."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Bana (Weft)" }, { title: "Invoices" }]}
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Create Invoice"
        onCreateClick={() => router.push("/dashboard/bana/invoices/new")}
        exportTitle="Bana Invoices"
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
        // Direct navigation to By-ID page (NO popup modal!)
        onView={(item) => router.push(`/dashboard/bana/invoices/${item.id}`)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      {/* Edit Invoice Dialog */}
      <MasterDialog
        isOpen={!!editPI}
        onClose={() => setEditPI(null)}
        title="Edit Bana Purchase Invoice"
        description={`Modify invoice details for ${editPI?.piNumber}`}
      >
        {editPI && (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Supplier Invoice No.</Label>
                <Input {...form.register("supplierInvoiceNo")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Supplier Invoice Date</Label>
                <Input type="date" {...form.register("supplierInvoiceDate")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">PI Date</Label>
                <Input type="date" {...form.register("piDate")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rate per KG (₹)</Label>
                <Input type="number" step="0.01" {...form.register("ratePerKg", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Round Off (₹)</Label>
                <Input type="number" step="0.01" {...form.register("roundOff", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Terms (Days)</Label>
                <Input type="number" {...form.register("paymentTermsDays", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Status</Label>
                <Select onValueChange={(v: any) => form.setValue("paymentStatus", v)} value={form.watch("paymentStatus")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditPI(null)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice <strong className="text-foreground">{deleteTarget?.piNumber}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} className="bg-red-600 hover:bg-red-700">
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
