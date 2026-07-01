"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Printer, Trash2, FileText } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { TanaPO } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const poStatusColors: Record<string, string> = {
  "Open": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Partially Received": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Closed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

export default function TanaPurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });
  const [viewPO, setViewPO] = useState<TanaPO | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TanaPO | null>(null);

  const { data: pos = [], isLoading } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tanaApiService.deletePO(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tana-pos"] }); toast.success("Tana PO deleted."); setDeleteConfirmOpen(false); setDeleteTarget(null); }
  });

  const filtered = pos.filter(p => {
    const ms = p.poNumber.toLowerCase().includes(searchValue.toLowerCase()) || p.purchaseFromName.toLowerCase().includes(searchValue.toLowerCase()) || p.itemName.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || p.status === selectedFilters.status;
    return ms && mst;
  });

  const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const columns: TableColumn<TanaPO>[] = [
    { key: "poNumber", header: "PO Number", sortable: true, render: (item) => <span className="font-bold text-primary">{item.poNumber}</span> },
    { key: "poDate", header: "PO Date", sortable: true },
    { key: "purchaseFromName", header: "Supplier", sortable: true },
    { key: "itemName", header: "Item / Quality", render: (item) => <span className="text-xs">{item.itemName}</span> },
    { key: "totalBagsOrdered", header: "Bags", render: (item) => <span className="font-semibold">{item.totalBagsOrdered}</span> },
    { key: "totalWeightKg", header: "Weight (KG)", render: (item) => <span className="font-semibold">{item.totalWeightKg.toLocaleString()}</span> },
    { key: "netPayable", header: "Net Payable", render: (item) => <span className="font-bold">{formatCurrency(item.netPayable)}</span> },
    { key: "bagsReceivedSoFar", header: "Recv / Ordered", render: (item) => <span className="text-xs">{item.bagsReceivedSoFar} / {item.totalBagsOrdered}</span> },
    { key: "status", header: "Status", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${poStatusColors[item.status] || ""}`}>{item.status}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tana Purchase Orders"
        description="Raise and track Purchase Orders for Tana (Warp Yarn). Document series: TANA-PO-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Tana (Warp)" }, { title: "Purchase Orders" }]}
        actions={
          <Link href="/dashboard/tana/purchase-orders/new">
            <Button size="sm" className="h-9 gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> Create Tana PO
            </Button>
          </Link>
        }
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Create Tana PO"
        onCreateClick={() => window.location.href = "/dashboard/tana/purchase-orders/new"}
        exportTitle="Tana POs"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ status: "all" }); }}
        filters={[
          { key: "status", placeholder: "PO Status", options: [{ label: "Open", value: "Open" }, { label: "Partially Received", value: "Partially Received" }, { label: "Closed", value: "Closed" }] }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onView={(item) => setViewPO(item)}
        onDelete={(item) => { setDeleteTarget(item); setDeleteConfirmOpen(true); }}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      {/* View PO Dialog */}
      <MasterDialog
        isOpen={!!viewPO}
        onClose={() => setViewPO(null)}
        title={`Purchase Order: ${viewPO?.poNumber}`}
        description={`Supplier: ${viewPO?.purchaseFromName} | Date: ${viewPO?.poDate}`}
      >
        {viewPO && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-muted/20 rounded-lg p-3 border border-border/10">
              <div><span className="text-muted-foreground block">PO Number</span><span className="font-bold text-primary">{viewPO.poNumber}</span></div>
              <div><span className="text-muted-foreground block">PO Date</span><span className="font-semibold">{viewPO.poDate}</span></div>
              <div><span className="text-muted-foreground block">Status</span><Badge variant="outline" className={`text-[10px] font-bold ${poStatusColors[viewPO.status] || ""}`}>{viewPO.status}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Purchase From (Supplier)</span><span className="font-bold">{viewPO.purchaseFromName}</span></div>
              <div><span className="text-muted-foreground block">Purchase To (Buyer)</span><span className="font-semibold">{viewPO.purchaseToName}</span></div>
            </div>
            <div className="border-b pb-3 border-border/10">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block">Item Name / Quality</span><span className="font-semibold">{viewPO.itemName}</span></div>
                <div><span className="text-muted-foreground block">HSN Code</span><span className="font-semibold">{viewPO.hsnCode}</span></div>
              </div>
            </div>
            {/* Quantity & Rate */}
            <div className="grid grid-cols-3 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Total Bags Ordered</span><span className="font-bold">{viewPO.totalBagsOrdered}</span></div>
              <div><span className="text-muted-foreground block">Per Bag Weight</span><span className="font-semibold">{viewPO.perBagWeightKg} KG</span></div>
              <div><span className="text-muted-foreground block">Total Weight</span><span className="font-bold">{viewPO.totalWeightKg.toLocaleString()} KG</span></div>
            </div>
            {/* Tax Breakup */}
            <div className="bg-muted/10 rounded-lg border border-border/10 p-3 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GST Calculation</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Rate per KG</span><span className="font-semibold">₹{viewPO.ratePerKg}/KG</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gross Amount</span><span className="font-semibold">₹{viewPO.grossAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CGST @ {viewPO.cgstPercent}%</span><span className="font-semibold">₹{viewPO.cgstAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SGST @ {viewPO.sgstPercent}%</span><span className="font-semibold">₹{viewPO.sgstAmount.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-border/20 pt-2">
                <span>Net Payable</span><span className="text-foreground">₹{viewPO.netPayable.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{viewPO.amountInWords}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground block">Payment Terms</span><span className="font-semibold">{viewPO.paymentTerms}</span></div>
              <div><span className="text-muted-foreground block">Expected Delivery</span><span className="font-semibold">{viewPO.expectedDeliveryDate || "—"}</span></div>
            </div>
            <div><span className="text-muted-foreground block">Delivery Address</span><p className="font-semibold mt-0.5">{viewPO.deliveryAddress}</p></div>
            {viewPO.remarks && <div><span className="text-muted-foreground block">Remarks</span><p className="bg-muted/20 p-2 rounded border border-border/10 mt-0.5">{viewPO.remarks}</p></div>}
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setViewPO(null)}>Close</Button></div>
          </div>
        )}
      </MasterDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" />Delete Tana PO?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">Delete <strong>{deleteTarget?.poNumber}</strong>? POs with linked GRNs should not be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>Delete PO</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
