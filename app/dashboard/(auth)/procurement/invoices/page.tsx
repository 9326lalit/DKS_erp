"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  ArrowLeft,
  Building,
  Calendar,
  Hash,
  Scale,
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { PurchaseInvoice, GRN, PurchaseOrder } from "@/lib/store/use-procurement-store";
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

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const invoiceFormSchema = z.object({
  grnId: z.string().min(1, "Please select reference GRN"),
  invoiceNumber: z.string().min(2, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  freight: z.number().min(0, "Freight charges must be positive"),
  otherCharges: z.number().min(0, "Other charges must be positive"),
  status: z.enum(["Paid", "Pending", "Partial"])
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function InvoicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all",
    supplierId: "all"
  });

  // Modal controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<PurchaseInvoice | null>(null);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  // Queries
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => procurementApiService.getInvoices()
  });

  const { data: grns = [] } = useQuery({
    queryKey: ["grns"],
    queryFn: () => procurementApiService.getGRNs()
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => procurementApiService.getPurchaseOrders()
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const parties = await mastersApiService.getParties();
      return parties.filter((p) => p.partyType === "Supplier");
    }
  });

  // Exclude GRNs that already have a posted invoice
  const uninvoicedGRNs = grns.filter(
    (grn) => !invoices.some((inv) => inv.grnId === grn.id)
  );

  // React Hook Form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      grnId: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      freight: 1500,
      otherCharges: 0,
      status: "Pending"
    }
  });

  // Prefill rates/details when GRN selection updates
  const watchGRNId = form.watch("grnId");
  const [activeGRN, setActiveGRN] = useState<GRN | null>(null);
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const selectedGRN = grns.find((g) => g.id === watchGRNId);
    if (selectedGRN) {
      setActiveGRN(selectedGRN);
      const linkedPO = purchaseOrders.find((p) => p.id === selectedGRN.poId);
      if (linkedPO) {
        setActivePO(linkedPO);
      }
    } else {
      setActiveGRN(null);
      setActivePO(null);
    }
  }, [watchGRNId, grns, purchaseOrders]);

  // Invoice calculations
  let subtotal = 0;
  let gstTotal = 0;

  if (activeGRN && activePO) {
    activeGRN.items.forEach((item) => {
      const poItem = activePO.items.find((x) => x.yarnId === item.yarnId) || activePO.items[0];
      const itemSubtotal = item.acceptedQty * poItem.rate;
      const discountAmount = itemSubtotal * (poItem.discount / 100);
      const netSub = itemSubtotal - discountAmount;
      const itemGst = netSub * (poItem.gst / 100);
      
      subtotal += netSub;
      gstTotal += itemGst;
    });
  }

  const watchFreight = Number(form.watch("freight")) || 0;
  const watchOtherCharges = Number(form.watch("otherCharges")) || 0;
  const grandTotal = subtotal + gstTotal + watchFreight + watchOtherCharges;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  // Mutation
  const createMutation = useMutation({
    mutationFn: (inv: PurchaseInvoice) => procurementApiService.createInvoice(inv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["procurementDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["supplierLedger"] });
      toast.success("Purchase Invoice posted. Supplier credit balance increased.");
      setCreateInvoiceOpen(false);
      form.reset();
    }
  });

  // Submit Handler
  const handleFormSubmit = (values: InvoiceFormValues) => {
    if (!activeGRN || !activePO) return;

    const invoicePayload: PurchaseInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: values.invoiceNumber.toUpperCase(),
      invoiceDate: values.invoiceDate,
      supplierId: activeGRN.supplierId,
      supplierName: activeGRN.supplierName,
      poId: activeGRN.poId,
      poNumber: activeGRN.poNumber,
      grnId: values.grnId,
      grnNumber: activeGRN.grnNumber,
      invoiceAmount: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gstTotal.toFixed(2)),
      freight: values.freight,
      otherCharges: values.otherCharges,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      status: values.status
    };

    createMutation.mutate(invoicePayload);
  };

  // Filter Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      inv.grnNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      selectedFilters.status === "all" || inv.status === selectedFilters.status;

    const matchesSupplier =
      selectedFilters.supplierId === "all" || inv.supplierId === selectedFilters.supplierId;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns: TableColumn<PurchaseInvoice>[] = [
    { key: "invoiceNumber", header: "Invoice No.", render: (item) => <span className="font-bold text-foreground">{item.invoiceNumber}</span>, sortable: true },
    { key: "invoiceDate", header: "Invoice Date", sortable: true },
    { key: "supplierName", header: "Supplier Mill", render: (item) => <div className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-semibold">{item.supplierName}</span></div>, sortable: true },
    { key: "poNumber", header: "Ref. PO", render: (item) => <span className="font-semibold text-primary">{item.poNumber}</span>, sortable: true },
    { key: "grnNumber", header: "Ref. GRN", render: (item) => <span className="font-semibold text-sky-600 dark:text-sky-400">{item.grnNumber}</span>, sortable: true },
    { key: "grandTotal", header: "Invoice Total", render: (item) => <span className="font-bold text-foreground">{formatCurrency(item.grandTotal)}</span>, sortable: true },
    {
      key: "status",
      header: "Billing Status",
      render: (item) => <StatusBadge status={item.status} type="invoice" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Invoices register"
        description="Verify supplier bills. Log invoices against raw goods checks-in (GRN) to post corresponding credits to accounting ledgers."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement Control", href: "/dashboard/procurement/dashboard" },
          { title: "Purchase Invoices" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/procurement/dashboard")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      {/* Toolbar */}
      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Post Supplier Invoice"
        onCreateClick={() => {
          form.reset();
          setCreateInvoiceOpen(true);
        }}
        exportTitle="Invoices"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ status: "all", supplierId: "all" });
        }}
        filters={[
          {
            key: "status",
            placeholder: "Billing Status",
            options: [
              { label: "Pending outstanding", value: "Pending" },
              { label: "Partially Cleared", value: "Partial" },
              { label: "Fully Paid", value: "Paid" }
            ]
          },
          {
            key: "supplierId",
            placeholder: "Supplier Mill",
            options: suppliers.map((s) => ({ label: s.partyName, value: s.id }))
          }
        ]}
      />

      {/* Invoices Table */}
      <MasterTable
        data={filteredInvoices}
        columns={columns}
        isLoading={isLoading}
        onView={(inv) => {
          setViewInvoice(inv);
          setDialogOpen(true);
        }}
        onBulkDelete={(items) => {
          toast.info("Deletion not supported on posted invoices to protect ledger integrity.");
        }}
      />

      {/* Invoice View Dialog */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setViewInvoice(null);
        }}
        title={`Audit Purchase Invoice: ${viewInvoice?.invoiceNumber}`}
        description="Verify ledger allocations, tax splits, and delivery document links."
      >
        {viewInvoice && (
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Yarn Supplier Mill</span>
                <span className="text-sm font-bold text-foreground">{viewInvoice.supplierName}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">Reference PO: {viewInvoice.poNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Reference GRN Code</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{viewInvoice.grnNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Billing Issue Date</span>
                <span className="font-semibold text-foreground">{viewInvoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Supplier Invoice No.</span>
                <span className="font-semibold text-foreground uppercase">{viewInvoice.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Billing Status</span>
                <StatusBadge status={viewInvoice.status} type="invoice" />
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted/10 p-3 font-bold border-b border-border/10 text-foreground flex items-center gap-1"><Scale className="h-4 w-4" /> Billing Summary Breakdown</div>
              <div className="p-4 space-y-2 font-semibold">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Invoice Amount (acceptedQty * rate):</span>
                  <span className="text-foreground">{formatCurrency(viewInvoice.invoiceAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (GST Credit):</span>
                  <span className="text-foreground">{formatCurrency(viewInvoice.gst)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Freight charges:</span>
                  <span className="text-foreground">{formatCurrency(viewInvoice.freight)}</span>
                </div>
                {viewInvoice.otherCharges > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Other handling charges:</span>
                    <span className="text-foreground">{formatCurrency(viewInvoice.otherCharges)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/20 pt-2 text-sm font-bold text-primary">
                  <span>Grand Total Posted:</span>
                  <span>{formatCurrency(viewInvoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/10 pt-4">
              <Button variant="default" size="sm" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Panel
              </Button>
            </div>
          </div>
        )}
      </MasterDialog>

      {/* Invoice Post Creation Dialog */}
      <MasterDialog
        isOpen={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        title="Post Supplier Purchase Invoice"
        description="Select an inward receipt (GRN) to pull quantity checks, add freight details, and create invoice accounts."
      >
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="grnId" className="text-xs font-semibold">Reference inward check-in (GRN) *</Label>
            <Select
              onValueChange={(val) => form.setValue("grnId", val)}
              value={form.watch("grnId")}
            >
              <SelectTrigger id="grnId">
                <SelectValue placeholder="Select GRN record" />
              </SelectTrigger>
              <SelectContent>
                {uninvoicedGRNs.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.grnNumber} — {g.supplierName} ({g.poNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.grnId && (
              <p className="text-[10px] text-destructive font-medium">{form.formState.errors.grnId.message}</p>
            )}
          </div>

          {activeGRN && activePO ? (
            <div className="space-y-4 border border-border/40 rounded-xl p-4 bg-muted/5 text-[11px] leading-relaxed">
              <div className="flex justify-between border-b border-border/10 pb-2 font-bold text-foreground">
                <span>Supplier: {activeGRN.supplierName}</span>
                <span>Challan Ref: {activeGRN.invoiceNumber || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <strong>Quantity Audit:</strong>
                {activeGRN.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-muted-foreground font-semibold">
                    <span>{item.yarnName} ({item.count})</span>
                    <span>{item.acceptedQty.toLocaleString()} KG accepted</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed border-border/40 rounded-xl text-muted-foreground text-xs font-semibold">
              Select a GRN above to auto-populate billing counts.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invoiceNumber" className="text-xs font-semibold">Supplier Invoice No. *</Label>
              <Input id="invoiceNumber" placeholder="e.g. IN-9871" {...form.register("invoiceNumber")} />
              {form.formState.errors.invoiceNumber && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.invoiceNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoiceDate" className="text-xs font-semibold">Billing date *</Label>
              <Input id="invoiceDate" type="date" {...form.register("invoiceDate")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="freight" className="text-xs font-semibold">Freight charges (INR) *</Label>
              <Input
                id="freight"
                type="number"
                {...form.register("freight", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otherCharges" className="text-xs font-semibold">Other Charges (INR) *</Label>
              <Input
                id="otherCharges"
                type="number"
                {...form.register("otherCharges", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">Billing Status *</Label>
              <Select
                onValueChange={(val) => form.setValue("status", val as any)}
                value={form.watch("status")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending Cleared</SelectItem>
                  <SelectItem value="Partial">Partially Cleared</SelectItem>
                  <SelectItem value="Paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculations totals block */}
          <div className="border-t border-border/10 pt-4 space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross Material Value:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax GST credit (5%):</span>
              <span>{formatCurrency(gstTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-border/20 pt-2 font-bold text-primary text-sm">
              <span>Estimated Invoice grand total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
            <Button type="button" variant="outline" onClick={() => setCreateInvoiceOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !activeGRN} className="cursor-pointer">
              Post Invoice & Ledger Credit
            </Button>
          </div>
        </form>
      </MasterDialog>
    </PageContainer>
  );
}
