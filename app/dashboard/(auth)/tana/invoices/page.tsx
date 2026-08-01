"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Eye, FileText, ShoppingBag, Layers } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { TanaPI, numberToWords } from "@/lib/store/use-tana-store";
import { BanaPI } from "@/lib/store/use-bana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

export default function YarnPurchaseInvoicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tana" | "bana">("tana");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ paymentStatus: "all" });
  const [editPI, setEditPI] = useState<TanaPI | BanaPI | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TanaPI | BanaPI | null>(null);

  useEffect(() => {
    if (pathname.includes("/bana")) {
      setActiveTab("bana");
    } else {
      setActiveTab("tana");
    }
  }, [pathname]);

  const { data: tanaPIs = [], isLoading: isTanaLoading } = useQuery({
    queryKey: ["tana-pis"],
    queryFn: () => tanaApiService.getPIs()
  });

  const { data: banaPIs = [], isLoading: isBanaLoading } = useQuery({
    queryKey: ["bana-pis"],
    queryFn: () => banaApiService.getPIs()
  });

  const isLoading = activeTab === "tana" ? isTanaLoading : isBanaLoading;
  const invoices = activeTab === "tana" ? tanaPIs : banaPIs;

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

  const updateTanaMutation = useMutation({
    mutationFn: (pi: TanaPI) => tanaApiService.updatePI(pi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pis"] });
      toast.success("Tana Purchase Invoice updated.");
      setEditPI(null);
    }
  });

  const updateBanaMutation = useMutation({
    mutationFn: (pi: BanaPI) => banaApiService.updatePI(pi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pis"] });
      toast.success("Bana Purchase Invoice updated.");
      setEditPI(null);
    }
  });

  const deleteTanaMutation = useMutation({
    mutationFn: (id: string) => tanaApiService.deletePI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pis"] });
      toast.success("Tana Purchase Invoice deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const deleteBanaMutation = useMutation({
    mutationFn: (id: string) => banaApiService.deletePI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pis"] });
      toast.success("Bana Purchase Invoice deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const handleEditClick = (pi: TanaPI | BanaPI) => {
    setEditPI(pi);
  };

  const handleDeleteClick = (pi: TanaPI | BanaPI) => {
    setDeleteTarget(pi);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (activeTab === "tana") {
      deleteTanaMutation.mutate(deleteTarget.id);
    } else {
      deleteBanaMutation.mutate(deleteTarget.id);
    }
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

    const updated = {
      ...editPI,
      ...values,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      netPayable: parseFloat(netPayable.toFixed(2)),
      dueDate,
      amountInWords: numberToWords(Math.round(netPayable))
    };

    if (activeTab === "tana") {
      updateTanaMutation.mutate(updated as TanaPI);
    } else {
      updateBanaMutation.mutate(updated as BanaPI);
    }
  };

  const filtered = invoices.filter((i) => {
    const ms =
      i.piNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      i.supplierName.toLowerCase().includes(searchValue.toLowerCase()) ||
      i.supplierInvoiceNo.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.paymentStatus === "all" || i.paymentStatus === selectedFilters.paymentStatus;
    return ms && mst;
  });

  const columns: TableColumn<TanaPI | BanaPI>[] = [
    {
      key: "piNumber",
      header: "PI Number",
      sortable: true,
      render: (item) => (
        <Link
          href={`/dashboard/${activeTab}/invoices/${item.id}`}
          className="font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{item.piNumber}</span>
        </Link>
      )
    },
    { key: "piDate", header: "PI Date", sortable: true },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "supplierInvoiceNo", header: "Supp. Invoice No." },
    {
      key: "linkedGRNNumber",
      header: "Linked GRN",
      render: (item) => (
        <Link
          href={`/dashboard/tana/goods-receipt/${encodeURIComponent(item.linkedGRNId || item.linkedGRNNumber)}`}
          className="text-xs text-primary font-mono font-bold hover:underline"
        >
          {item.linkedGRNNumber}
        </Link>
      )
    },
    { key: "taxableAmount", header: "Taxable Amt", render: (item) => <span className="font-semibold">₹{item.taxableAmount.toLocaleString()}</span> },
    { key: "netPayable", header: "Net Payable", render: (item) => <span className="font-bold text-emerald-600">₹{item.netPayable.toLocaleString()}</span> },
    { key: "dueDate", header: "Due Date", sortable: true },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (item) => (
        <Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[item.paymentStatus] || ""}`}>
          {item.paymentStatus}
        </Badge>
      ),
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Yarn Purchase Invoices"
        description="Unified portal to manage and track Purchase Invoices for Tana (Warp) and Bana (Weft) with line-item CGST/SGST breakdown."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement" },
          { title: "Yarn Purchase Invoices" }
        ]}
      />

      {/* Unified Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <Card className="border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Layers className="h-14 w-14 text-primary" />
          </div>
          <CardContent className="p-4">
            <Badge className="bg-primary/10 text-primary border-transparent mb-2">Tana (Warp Invoices)</Badge>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-foreground">{tanaPIs.length} Invoices</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tanaPIs.filter((p) => p.paymentStatus !== "Paid").length} Pending Payment
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Total Net Value</p>
                <p className="text-base font-bold text-foreground">
                  ₹{tanaPIs.reduce((acc, p) => acc + p.netPayable, 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <ShoppingBag className="h-14 w-14 text-emerald-600" />
          </div>
          <CardContent className="p-4">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent mb-2">Bana (Weft Invoices)</Badge>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-foreground">{banaPIs.length} Invoices</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {banaPIs.filter((p) => p.paymentStatus !== "Paid").length} Pending Payment
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Total Net Value</p>
                <p className="text-base font-bold text-foreground">
                  ₹{banaPIs.reduce((acc, p) => acc + p.netPayable, 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-border/40 pb-2">
          <TabsList className="grid w-[240px] grid-cols-2">
            <TabsTrigger value="tana" className="cursor-pointer">
              Tana (Warp)
            </TabsTrigger>
            <TabsTrigger value="bana" className="cursor-pointer">
              Bana (Weft)
            </TabsTrigger>
          </TabsList>
          <span className="text-xs font-semibold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded">
            Viewing: {activeTab === "tana" ? "Warp Invoices Series" : "Weft Invoices Series"}
          </span>
        </div>

        <TabsContent value="tana" className="m-0 space-y-4">
          {activeTab === "tana" && (
            <>
              <MasterToolbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                createLabel="Create Tana Invoice"
                onCreateClick={() => router.push("/dashboard/tana/invoices/new")}
                exportTitle="Tana Invoices"
                selectedFilters={selectedFilters}
                onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
                onClearFilters={() => {
                  setSearchValue("");
                  setSelectedFilters({ paymentStatus: "all" });
                }}
                filters={[
                  {
                    key: "paymentStatus",
                    placeholder: "Payment Status",
                    options: [
                      { label: "Pending", value: "Pending" },
                      { label: "Partially Paid", value: "Partially Paid" },
                      { label: "Paid", value: "Paid" }
                    ]
                  }
                ]}
              />
              <MasterTable
                data={filtered}
                columns={columns}
                isLoading={isLoading}
                onView={(item) => router.push(`/dashboard/tana/invoices/${item.id}`)}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onBulkDelete={(items) => items.forEach((i) => deleteTanaMutation.mutate(i.id))}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="bana" className="m-0 space-y-4">
          {activeTab === "bana" && (
            <>
              <MasterToolbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                createLabel="Create Bana Invoice"
                onCreateClick={() => router.push("/dashboard/tana/invoices/new")}
                exportTitle="Bana Invoices"
                selectedFilters={selectedFilters}
                onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
                onClearFilters={() => {
                  setSearchValue("");
                  setSelectedFilters({ paymentStatus: "all" });
                }}
                filters={[
                  {
                    key: "paymentStatus",
                    placeholder: "Payment Status",
                    options: [
                      { label: "Pending", value: "Pending" },
                      { label: "Partially Paid", value: "Partially Paid" },
                      { label: "Paid", value: "Paid" }
                    ]
                  }
                ]}
              />
              <MasterTable
                data={filtered}
                columns={columns}
                isLoading={isLoading}
                onView={(item) => router.push(`/dashboard/bana/invoices/${item.id}`)}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onBulkDelete={(items) => items.forEach((i) => deleteBanaMutation.mutate(i.id))}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Invoice Dialog */}
      <MasterDialog
        isOpen={!!editPI}
        onClose={() => setEditPI(null)}
        title={`Edit ${activeTab === "tana" ? "Tana" : "Bana"} Purchase Invoice`}
        description={`Modify invoice details for ${editPI?.piNumber}`}
      >
        {editPI && (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Supplier Invoice No.</Label>
                <Input {...form.register("supplierInvoiceNo")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Supplier Invoice Date</Label>
                <Input type="date" {...form.register("supplierInvoiceDate")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">PI Date</Label>
                <Input type="date" {...form.register("piDate")} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Rate per KG (₹)</Label>
                <Input type="number" step="0.01" {...form.register("ratePerKg", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Round Off (₹)</Label>
                <Input type="number" step="0.01" {...form.register("roundOff", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Terms (Days)</Label>
                <Input type="number" {...form.register("paymentTermsDays", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Status</Label>
                <Select onValueChange={(v: any) => form.setValue("paymentStatus", v)} value={form.watch("paymentStatus")}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditPI(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-bold">
                Save Invoice Changes
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete {activeTab === "tana" ? "Tana" : "Bana"} Invoice?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete invoice <strong className="text-foreground">{deleteTarget?.piNumber}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-xs cursor-pointer">
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
