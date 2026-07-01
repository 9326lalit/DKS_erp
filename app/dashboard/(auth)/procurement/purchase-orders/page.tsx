"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Printer,
  Eye,
  Pencil,
  ArrowLeft,
  Calendar,
  Building,
  Scale,
  Hash,
  Activity
} from "lucide-react";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { PurchaseOrder } from "@/lib/store/use-procurement-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { Button } from "@/components/ui/button";
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
import {
  Table as PrintTable,
  TableBody as PrintTableBody,
  TableCell as PrintTableCell,
  TableHead as PrintTableHead,
  TableHeader as PrintTableHeader,
  TableRow as PrintTableRow
} from "@/components/ui/table";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter & Search states
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all",
    supplierId: "all"
  });

  // Modal/Drawer controls
  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null);
  const [printPO, setPrintPO] = useState<PurchaseOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [printDialogActive, setPrintDialogActive] = useState(false);

  // Delete Confirm controls
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetPO, setDeleteTargetPO] = useState<PurchaseOrder | null>(null);

  // Queries
  const { data: purchaseOrders = [], isLoading } = useQuery({
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (po: PurchaseOrder) => procurementApiService.createPurchaseOrder(po),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase Order duplicated successfully.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => procurementApiService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase Order deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTargetPO(null);
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  // Actions
  const handleEdit = (po: PurchaseOrder) => {
    router.push(`/dashboard/procurement/purchase-orders/new?id=${po.id}`);
  };

  const handleDuplicate = (po: PurchaseOrder) => {
    const duplicatedNumber = `PO-2026-${String(purchaseOrders.length + 1).padStart(3, "0")}`;
    const duplicatedPO: PurchaseOrder = {
      ...po,
      id: `PO-${Date.now()}`,
      poNumber: duplicatedNumber,
      orderDate: new Date().toISOString().split("T")[0],
      status: "Draft" // Reset to draft
    };
    createMutation.mutate(duplicatedPO);
  };

  const handlePrint = (po: PurchaseOrder) => {
    setPrintPO(po);
    setPrintDialogActive(true);
  };

  const handlePrintTrigger = () => {
    toast.success("Preparing document for printing...");
    // Mock triggering browser print
    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print PO - ${printPO?.poNumber}</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #3b82f6; }
                .details { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 30px; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; }
                th { bg-color: #f8fafc; font-weight: bold; }
                .totals { margin-top: 30px; text-align: right; font-size: 14px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="title">D.K.S. TEXTILES FACTORY</div>
                  <div style="font-size:12px;color:#64748b;">MIDC Ichalkaranji, Maharashtra</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:18px;font-weight:bold;">PURCHASE ORDER</div>
                  <div style="font-size:12px;color:#64748b;">PO Code: ${printPO?.poNumber}</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px;">
                <div>
                  <strong>Supplier Address:</strong><br/>
                  ${printPO?.supplierName}<br/>
                  Contact person: ${printPO?.supplierContact}
                </div>
                <div style="text-align:right;">
                  <strong>PO Details:</strong><br/>
                  Order Date: ${printPO?.orderDate}<br/>
                  Expected Date: ${printPO?.expectedDelivery}<br/>
                  Payment Terms: ${printPO?.paymentTerms}
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Item Specification</th>
                    <th>Count</th>
                    <th>Brand</th>
                    <th>Color</th>
                    <th style="text-align:right;">Qty (KG)</th>
                    <th style="text-align:right;">Rate / KG</th>
                    <th style="text-align:right;">GST (%)</th>
                    <th style="text-align:right;">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  ${printPO?.items.map(item => `
                    <tr>
                      <td>${item.yarnName}</td>
                      <td>${item.count}</td>
                      <td>${item.brand}</td>
                      <td>${item.color}</td>
                      <td style="text-align:right;">${item.quantity.toLocaleString()}</td>
                      <td style="text-align:right;">₹${item.rate}</td>
                      <td style="text-align:right;">${item.gst}%</td>
                      <td style="text-align:right;">₹${item.total.toLocaleString()}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <div class="totals">
                Subtotal: ₹${printPO?.subtotal.toLocaleString()}<br/>
                Tax GST: ₹${printPO?.gstTotal.toLocaleString()}<br/>
                Discount: ₹${printPO?.discountTotal.toLocaleString()}<br/>
                Grand Total: ₹${printPO?.grandTotal.toLocaleString()}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Filter Logic
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchValue.toLowerCase()) ||
      po.warehouseName.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      selectedFilters.status === "all" || po.status === selectedFilters.status;

    const matchesSupplier =
      selectedFilters.supplierId === "all" || po.supplierId === selectedFilters.supplierId;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns: TableColumn<PurchaseOrder>[] = [
    { key: "poNumber", header: "PO Number", render: (item) => <span className="font-bold text-foreground">{item.poNumber}</span>, sortable: true },
    { key: "supplierName", header: "Yarn Supplier", render: (item) => <div className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-semibold">{item.supplierName}</span></div>, sortable: true },
    { key: "orderDate", header: "Order Date", sortable: true },
    { key: "expectedDelivery", header: "Expected Arrival", sortable: true },
    {
      key: "grandTotal",
      header: "Grand Total",
      render: (item) => <span className="font-bold text-foreground">{formatCurrency(item.grandTotal)}</span>,
      sortable: true
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} type="invoice" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders Register"
        description="Oversee raw yarn buying contracts. Issue new supply orders, duplicate historical logs, or trigger print requests."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement Control", href: "/dashboard/procurement/dashboard" },
          { title: "Purchase Orders" }
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
        createLabel="Issue PO Contract"
        onCreateClick={() => router.push("/dashboard/procurement/purchase-orders/new")}
        exportTitle="PurchaseOrders"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ status: "all", supplierId: "all" });
        }}
        filters={[
          {
            key: "status",
            placeholder: "Fulfillment Status",
            options: [
              { label: "Draft PO", value: "Draft" },
              { label: "Pending Sign-off", value: "Pending" },
              { label: "Approved Contract", value: "Approved" },
              { label: "Partially Received", value: "Partially Received" },
              { label: "Completed Delivery", value: "Completed" },
              { label: "Cancelled PO", value: "Cancelled" }
            ]
          },
          {
            key: "supplierId",
            placeholder: "Supplier Mill",
            options: suppliers.map((s) => ({ label: s.partyName, value: s.id }))
          }
        ]}
      />

      {/* Purchase Orders Table */}
      <MasterTable
        data={filteredPOs}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={(po) => {
          setViewPO(po);
          setDialogOpen(true);
        }}
        onDelete={(po) => {
          setDeleteTargetPO(po);
          setDeleteConfirmOpen(true);
        }}
        onBulkDelete={(items) => {
          items.forEach((item) => deleteMutation.mutate(item.id));
        }}
      />

      {/* PO View Detail Dialog */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setViewPO(null);
        }}
        title={`Audit PO Contract: ${viewPO?.poNumber}`}
        description="Detailed review of raw material yarn specifications, delivery terms, and billing summaries."
      >
        {viewPO && (
          <div className="space-y-6 text-xs leading-relaxed">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Yarn Supplier Mill</span>
                <span className="text-sm font-bold text-foreground">{viewPO.supplierName}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">Contact: {viewPO.supplierContact}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Delivery Warehouse godown</span>
                <span className="text-sm font-semibold text-foreground">{viewPO.warehouseName}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Order Issue Date</span>
                <span className="font-semibold text-foreground">{viewPO.orderDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Expected Arrival</span>
                <span className="font-semibold text-foreground">{viewPO.expectedDelivery}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Fulfillment Status</span>
                <StatusBadge status={viewPO.status} type="invoice" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Payment Credit Terms</span>
                <span className="font-semibold text-foreground">{viewPO.paymentTerms}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Logistics Transporter</span>
                <span className="font-semibold text-foreground">{viewPO.transporter}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Assigned Broker Ledger</span>
                <span className="font-semibold text-foreground">{viewPO.broker}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted/10 p-3 font-bold border-b border-border/10 text-foreground flex items-center gap-1"><Scale className="h-4 w-4" /> Item Specifications Grid</div>
              <div className="divide-y divide-border/10">
                {viewPO.items.map((item, idx) => (
                  <div key={idx} className="p-3 hover:bg-muted/5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-foreground">{item.yarnName}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                        <span>Count: {item.count}</span>
                        <span className="h-1 w-1 bg-border rounded-full" />
                        <span>Brand: {item.brand}</span>
                        <span className="h-1 w-1 bg-border rounded-full" />
                        <span>Color: {item.color}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{item.quantity.toLocaleString()} KG</div>
                      <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">₹{item.rate}/KG • GST {item.gst}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 bg-muted/10 p-4 rounded-xl border border-border/10 self-end max-w-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Subtotal:</span>
                <span className="font-bold text-foreground">{formatCurrency(viewPO.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Tax GST Value:</span>
                <span className="font-bold text-foreground">{formatCurrency(viewPO.gstTotal)}</span>
              </div>
              {viewPO.discountTotal > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span className="font-semibold">Discount deductions:</span>
                  <span className="font-bold">-{formatCurrency(viewPO.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/20 pt-2 text-sm font-bold">
                <span>Grand Total (INR):</span>
                <span className="text-primary">{formatCurrency(viewPO.grandTotal)}</span>
              </div>
            </div>

            {viewPO.remarks && (
              <div>
                <span className="text-muted-foreground block font-medium">Remarks Note</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewPO.remarks}</p>
              </div>
            )}

            {/* Quick Actions Drawer Footer */}
            <div className="flex justify-end gap-2 border-t border-border/10 pt-4">
              <Button variant="outline" size="sm" onClick={() => handleDuplicate(viewPO)} className="gap-1 cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
                Duplicate PO
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePrint(viewPO)} className="gap-1 cursor-pointer">
                <Printer className="h-3.5 w-3.5" />
                Print PO Layout
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(viewPO)} className="gap-1 cursor-pointer">
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </Button>
              <Button variant="default" size="sm" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Panel
              </Button>
            </div>
          </div>
        )}
      </MasterDialog>

      {/* PO Print Dialog Mockup */}
      <AlertDialog open={printDialogActive} onOpenChange={setPrintDialogActive}>
        <AlertDialogContent className="max-w-2xl text-xs font-semibold leading-relaxed">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold font-display flex items-center gap-2 border-b border-border/10 pb-3">
              <Printer className="h-4.5 w-4.5 text-primary" />
              Document Print Preview: {printPO?.poNumber}
            </AlertDialogTitle>
            <div className="border border-border/40 p-6 rounded-xl bg-card text-[11px] space-y-4 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between border-b border-border/10 pb-3">
                <div>
                  <div className="text-base font-bold font-display text-primary">D.K.S. TEXTILES FACTORY</div>
                  <div className="text-muted-foreground">MIDC Ichalkaranji, Maharashtra</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">PURCHASE ORDER</div>
                  <div className="text-muted-foreground">PO Code: {printPO?.poNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Supplier Address Details:</strong>
                  <div>{printPO?.supplierName}</div>
                  <div>Contact mobile: {printPO?.supplierContact}</div>
                </div>
                <div className="text-right">
                  <strong>Order specifications:</strong>
                  <div>Order Date: {printPO?.orderDate}</div>
                  <div>Expected Arrival Date: {printPO?.expectedDelivery}</div>
                  <div>Payment terms: {printPO?.paymentTerms}</div>
                </div>
              </div>

              <PrintTable className="border border-border/20 mt-3 text-[10px]">
                <PrintTableHeader className="bg-muted/10 font-bold">
                  <PrintTableRow>
                    <PrintTableHead className="font-bold">Yarn Specification</PrintTableHead>
                    <PrintTableHead className="font-bold">Count</PrintTableHead>
                    <PrintTableHead className="font-bold">Brand</PrintTableHead>
                    <PrintTableHead className="font-bold text-right">Quantity</PrintTableHead>
                    <PrintTableHead className="font-bold text-right">Rate</PrintTableHead>
                    <PrintTableHead className="font-bold text-right">Total (INR)</PrintTableHead>
                  </PrintTableRow>
                </PrintTableHeader>
                <PrintTableBody>
                  {printPO?.items.map((item, idx) => (
                    <PrintTableRow key={idx}>
                      <PrintTableCell>{item.yarnName}</PrintTableCell>
                      <PrintTableCell>{item.count}</PrintTableCell>
                      <PrintTableCell>{item.brand}</PrintTableCell>
                      <PrintTableCell className="text-right">{item.quantity.toLocaleString()} KG</PrintTableCell>
                      <PrintTableCell className="text-right">₹{item.rate}</PrintTableCell>
                      <PrintTableCell className="text-right">₹{item.total.toLocaleString()}</PrintTableCell>
                    </PrintTableRow>
                  ))}
                </PrintTableBody>
              </PrintTable>

              <div className="space-y-1 text-right max-w-[200px] ml-auto">
                <div>Subtotal: ₹{printPO?.subtotal.toLocaleString()}</div>
                <div>GST taxes: ₹{printPO?.gstTotal.toLocaleString()}</div>
                {printPO && printPO.discountTotal > 0 && <div>Discount: -₹{printPO.discountTotal.toLocaleString()}</div>}
                <div className="border-t border-border/20 pt-1.5 font-bold text-foreground">Grand Total: ₹{printPO?.grandTotal.toLocaleString()}</div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold cursor-pointer"
              onClick={handlePrintTrigger}
            >
              Trigger Print Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold font-display flex items-center gap-2 text-destructive">
              <Trash2 className="h-4.5 w-4.5 text-destructive" />
              Delete Purchase Order Contract?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete **{deleteTargetPO?.poNumber}**? This action will clear references to this order and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetPO && deleteMutation.mutate(deleteTargetPO.id)}
            >
              Delete PO Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
