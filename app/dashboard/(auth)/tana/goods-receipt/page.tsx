"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { TanaGRN } from "@/lib/store/use-tana-store";
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

const grnStatusColors: Record<string, string> = {
  "Pending": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Partial": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Completed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

const conditionColors: Record<string, string> = {
  "Good": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Damaged": "bg-red-500/10 text-red-600 border-red-500/20",
  "Rejected": "bg-red-700/10 text-red-700 border-red-700/20"
};

export default function TanaGRNListPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all", conditionCheck: "all" });
  const [viewGRN, setViewGRN] = useState<TanaGRN | null>(null);

  const { data: grns = [], isLoading } = useQuery({ queryKey: ["tana-grns"], queryFn: () => tanaApiService.getGRNs() });

  const filtered = grns.filter(g => {
    const ms = g.grnNumber.toLowerCase().includes(searchValue.toLowerCase()) || g.linkedPONumber.toLowerCase().includes(searchValue.toLowerCase()) || g.supplierName.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || g.status === selectedFilters.status;
    const mc = selectedFilters.conditionCheck === "all" || g.conditionCheck === selectedFilters.conditionCheck;
    return ms && mst && mc;
  });

  const columns: TableColumn<TanaGRN>[] = [
    { key: "grnNumber", header: "GRN Number", sortable: true, render: (item) => <span className="font-bold text-primary">{item.grnNumber}</span> },
    { key: "grnDate", header: "GRN Date", sortable: true },
    { key: "linkedPONumber", header: "Linked PO", render: (item) => <span className="font-semibold text-xs">{item.linkedPONumber}</span> },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "bagsReceivedThisGRN", header: "Bags Recv.", render: (item) => <span className="font-bold">{item.bagsReceivedThisGRN}</span> },
    { key: "totalWeightReceived", header: "Weight (KG)", render: (item) => <span className="font-semibold">{item.totalWeightReceived.toLocaleString()}</span> },
    { key: "conditionCheck", header: "Condition", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${conditionColors[item.conditionCheck] || ""}`}>{item.conditionCheck}</Badge> },
    { key: "status", header: "Status", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${grnStatusColors[item.status] || ""}`}>{item.status}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tana Goods Receipt Notes (GRN)"
        description="Record receipt of Tana (Warp Yarn) bags against open Purchase Orders. Supports partial deliveries. Series: TANA-GRN-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Tana (Warp)" }, { title: "GRN" }]}
        actions={
          <Link href="/dashboard/tana/goods-receipt/new">
            <Button size="sm" className="h-9 gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> Create Tana GRN
            </Button>
          </Link>
        }
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Create GRN"
        onCreateClick={() => window.location.href = "/dashboard/tana/goods-receipt/new"}
        exportTitle="Tana GRNs"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ status: "all", conditionCheck: "all" }); }}
        filters={[
          { key: "status", placeholder: "Status", options: [{ label: "Pending", value: "Pending" }, { label: "Partial", value: "Partial" }, { label: "Completed", value: "Completed" }] },
          { key: "conditionCheck", placeholder: "Condition", options: [{ label: "Good", value: "Good" }, { label: "Damaged", value: "Damaged" }, { label: "Rejected", value: "Rejected" }] }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onView={(item) => setViewGRN(item)}
        onBulkDelete={() => {}}
      />

      {/* View GRN Dialog */}
      <MasterDialog
        isOpen={!!viewGRN}
        onClose={() => setViewGRN(null)}
        title={`GRN: ${viewGRN?.grnNumber}`}
        description={`Linked PO: ${viewGRN?.linkedPONumber} | Supplier: ${viewGRN?.supplierName}`}
      >
        {viewGRN && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-muted/20 rounded-lg p-3 border border-border/10">
              <div><span className="text-muted-foreground block">GRN Number</span><span className="font-bold text-primary">{viewGRN.grnNumber}</span></div>
              <div><span className="text-muted-foreground block">GRN Date</span><span className="font-semibold">{viewGRN.grnDate}</span></div>
              <div><span className="text-muted-foreground block">Status</span><Badge variant="outline" className={`text-[10px] font-bold ${grnStatusColors[viewGRN.status] || ""}`}>{viewGRN.status}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Linked PO</span><span className="font-bold">{viewGRN.linkedPONumber}</span></div>
              <div><span className="text-muted-foreground block">Supplier</span><span className="font-semibold">{viewGRN.supplierName}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Vehicle No.</span><span className="font-semibold">{viewGRN.vehicleNo || "—"}</span></div>
              <div><span className="text-muted-foreground block">LR No.</span><span className="font-semibold">{viewGRN.lrNo || "—"}</span></div>
            </div>
            <div className="bg-muted/10 rounded-lg border border-border/10 p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Delivery Tracking</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Bags Ordered (PO)</span><span className="font-semibold">{viewGRN.bagsOrdered}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Previously Received</span><span className="font-semibold">{viewGRN.bagsPreviouslyReceived}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bags Pending (before)</span><span className="font-semibold text-amber-600">{viewGRN.bagsPending}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bags This GRN</span><span className="font-bold text-emerald-600">{viewGRN.bagsReceivedThisGRN}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Per Bag Wt.</span><span className="font-semibold">{viewGRN.perBagWeightKg} KG</span></div>
              <div><span className="text-muted-foreground block">Total Weight</span><span className="font-bold">{viewGRN.totalWeightReceived.toLocaleString()} KG</span></div>
              <div><span className="text-muted-foreground block">Condition</span><Badge variant="outline" className={`text-[10px] font-bold ${conditionColors[viewGRN.conditionCheck] || ""}`}>{viewGRN.conditionCheck}</Badge></div>
            </div>
            <div><span className="text-muted-foreground block">Received By</span><span className="font-semibold">{viewGRN.receivedBy}</span></div>
            {viewGRN.remarks && <div><span className="text-muted-foreground block">Remarks</span><p className="bg-muted/20 p-2 rounded border border-border/10 mt-0.5">{viewGRN.remarks}</p></div>}
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setViewGRN(null)}>Close</Button></div>
          </div>
        )}
      </MasterDialog>
    </PageContainer>
  );
}
