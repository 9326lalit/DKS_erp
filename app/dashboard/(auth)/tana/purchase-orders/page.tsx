"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Layers, ShoppingBag } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { TanaPO } from "@/lib/store/use-tana-store";
import { BanaPO } from "@/lib/store/use-bana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const poStatusColors: Record<string, string> = {
  "Open": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Partially Received": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Closed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

export default function YarnPurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"tana" | "bana">("tana");
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });
  const [viewPO, setViewPO] = useState<TanaPO | BanaPO | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TanaPO | BanaPO | null>(null);

  // Set default active tab based on path
  useEffect(() => {
    if (pathname.includes("/bana")) {
      setActiveTab("bana");
    } else {
      setActiveTab("tana");
    }
  }, [pathname]);

  // Queries
  const { data: tanaPOs = [], isLoading: isTanaLoading } = useQuery({
    queryKey: ["tana-pos"],
    queryFn: () => tanaApiService.getPOs()
  });

  const { data: banaPOs = [], isLoading: isBanaLoading } = useQuery({
    queryKey: ["bana-pos"],
    queryFn: () => banaApiService.getPOs()
  });

  const isLoading = activeTab === "tana" ? isTanaLoading : isBanaLoading;
  const pos = activeTab === "tana" ? tanaPOs : banaPOs;

  // Mutations
  const deleteTanaMutation = useMutation({
    mutationFn: (id: string) => tanaApiService.deletePO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pos"] });
      toast.success("Tana PO deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const deleteBanaMutation = useMutation({
    mutationFn: (id: string) => banaApiService.deletePO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pos"] });
      toast.success("Bana PO deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (activeTab === "tana") {
      deleteTanaMutation.mutate(deleteTarget.id);
    } else {
      deleteBanaMutation.mutate(deleteTarget.id);
    }
  };

  const filtered = pos.filter(p => {
    const ms = p.poNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.purchaseFromName.toLowerCase().includes(searchValue.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || p.status === selectedFilters.status;
    return ms && mst;
  });

  const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const columns: TableColumn<TanaPO | BanaPO>[] = [
    {
      key: "poNumber",
      header: "PO Number",
      sortable: true,
      render: (item) => (
        <Link href={`/dashboard/${activeTab}/purchase-orders/${item.id}`} className="font-bold text-primary hover:underline">
          {item.poNumber}
        </Link>
      )
    },
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
        title="Yarn Purchase Orders"
        description="Unified portal to manage and track Purchase Orders for Tana (Warp Yarn) and Bana (Weft Yarn)."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Procurement" }, { title: "Yarn Purchase Orders" }]}
      />

      {/* Unified Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <Card className="border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10"><Layers className="h-14 w-14 text-primary" /></div>
          <CardContent className="p-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent mb-2">Tana (Warp Yarn)</Badge>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-foreground">{tanaPOs.length} POs</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tanaPOs.filter(p => p.status !== "Closed").length} Open / Pending</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Total Net Value</p>
                <p className="text-base font-bold text-foreground">{formatCurrency(tanaPOs.reduce((acc, p) => acc + p.netPayable, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10"><ShoppingBag className="h-14 w-14 text-emerald-600" /></div>
          <CardContent className="p-4">
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent mb-2">Bana (Weft Yarn)</Badge>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-2xl font-bold text-foreground">{banaPOs.length} POs</p>
                <p className="text-xs text-muted-foreground mt-0.5">{banaPOs.filter(p => p.status !== "Closed").length} Open / Pending</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Total Net Value</p>
                <p className="text-base font-bold text-foreground">{formatCurrency(banaPOs.reduce((acc, p) => acc + p.netPayable, 0))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-border/40 pb-2">
          <TabsList className="grid w-[240px] grid-cols-2">
            <TabsTrigger value="tana" className="cursor-pointer">Tana (Warp)</TabsTrigger>
            <TabsTrigger value="bana" className="cursor-pointer">Bana (Weft)</TabsTrigger>
          </TabsList>
          <span className="text-xs font-semibold text-muted-foreground bg-muted/40 px-2 py-1 rounded">
            Viewing: {activeTab === "tana" ? "Warp Yarn Series" : "Weft Yarn Series"}
          </span>
        </div>

        <TabsContent value="tana" className="m-0 space-y-4">
          {activeTab === "tana" && (
            <>
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
                onBulkDelete={(items) => items.forEach(i => deleteTanaMutation.mutate(i.id))}
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
                createLabel="Create Bana PO"
                onCreateClick={() => window.location.href = "/dashboard/bana/purchase-orders/new"}
                exportTitle="Bana POs"
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
                onBulkDelete={(items) => items.forEach(i => deleteBanaMutation.mutate(i.id))}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* View PO Dialog */}
      <MasterDialog
        isOpen={!!viewPO}
        onClose={() => setViewPO(null)}
        title={`${activeTab === "tana" ? "Tana (Warp)" : "Bana (Weft)"} Purchase Order Details`}
        description={`PO Number: ${viewPO?.poNumber} | Dated: ${viewPO?.poDate}`}
      >
        {viewPO && (
          <DetailViewCard
            title={viewPO.poNumber}
            subtitle={`Supplier: ${viewPO.purchaseFromName} • Buyer: ${viewPO.purchaseToName}`}
            statusBadge={
              <Badge variant="outline" className={`text-[10px] font-bold ${poStatusColors[viewPO.status] || ""}`}>
                {viewPO.status}
              </Badge>
            }
            sections={[
              {
                title: "Vendor & Party Information",
                fields: [
                  { label: "Purchase From (Supplier)", value: viewPO.purchaseFromName, highlight: true },
                  { label: "Purchase To (Buyer)", value: viewPO.purchaseToName },
                  { label: "PO Date", value: viewPO.poDate, mono: true },
                  { label: "Payment Terms", value: viewPO.paymentTerms },
                  { label: "Expected Delivery", value: viewPO.expectedDeliveryDate || "—", mono: true },
                  { label: "Delivery Address", value: viewPO.deliveryAddress, colSpan: 3 }
                ]
              }
            ]}
          >
            {/* Line Items Table */}
            {viewPO.items && viewPO.items.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Ordered Line Items &amp; Tax Breakdown</h4>
                <div className="border border-border/40 rounded-lg overflow-x-auto">
                  <table className="w-full border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/20 text-muted-foreground font-semibold">
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Item Name / Quality</th>
                        <th className="px-3 py-2 text-center">Qty (Bags)</th>
                        <th className="px-3 py-2 text-right">Weight (KG)</th>
                        <th className="px-3 py-2 text-right">Rate (₹/KG)</th>
                        <th className="px-3 py-2 text-right">Gross (₹)</th>
                        <th className="px-3 py-2 text-right">CGST %</th>
                        <th className="px-3 py-2 text-right">SGST %</th>
                        <th className="px-3 py-2 text-right">Net Payable</th>
                        <th className="px-3 py-2 text-left">Line Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPO.items.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="border-b border-border/10 hover:bg-muted/10 last:border-0">
                          <td className="px-3 py-2 font-medium text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-foreground">{item.itemName}</td>
                          <td className="px-3 py-2 text-center font-bold">{item.totalBagsOrdered}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">{item.totalWeightKg.toLocaleString()} KG</td>
                          <td className="px-3 py-2 text-right font-mono">₹{item.ratePerKg}</td>
                          <td className="px-3 py-2 text-right font-mono">₹{(item.grossAmount || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-blue-600 font-bold">{item.cgstPercent || 6}% (₹{item.cgstAmount || 0})</td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-bold">{item.sgstPercent || 6}% (₹{item.sgstAmount || 0})</td>
                          <td className="px-3 py-2 text-right font-bold text-primary font-mono">₹{item.netPayable.toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground italic">{item.itemRemarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-card border border-border/30 rounded-lg space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-[10px] text-muted-foreground block uppercase font-bold">Item Name</span><span className="font-bold text-xs">{viewPO.itemName}</span></div>
                  <div><span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Bags</span><span className="font-bold text-xs">{viewPO.totalBagsOrdered}</span></div>
                  <div><span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Weight</span><span className="font-bold text-xs">{viewPO.totalWeightKg.toLocaleString()} KG</span></div>
                </div>
              </div>
            )}

            {/* Financial Totals Card */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Gross Taxable Amount:</span>
                <span className="font-semibold font-mono">₹{viewPO.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-600 font-medium">CGST Tax Amount:</span>
                <span className="font-semibold font-mono text-blue-600">₹{(viewPO.cgstAmount || (viewPO.totalTaxAmount / 2) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-600 font-medium">SGST Tax Amount:</span>
                <span className="font-semibold font-mono text-emerald-600">₹{(viewPO.sgstAmount || (viewPO.totalTaxAmount / 2) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-primary pt-2 border-t border-border/20">
                <span>Net Total Payable:</span>
                <span className="text-base font-mono font-bold">₹{viewPO.netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {viewPO.amountInWords && (
                <p className="text-[10px] text-muted-foreground italic pt-1">{viewPO.amountInWords}</p>
              )}
            </div>

            {viewPO.remarks && (
              <div className="p-3 bg-card border border-border/30 rounded-lg">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Remarks</span>
                <p className="text-xs mt-1 text-foreground">{viewPO.remarks}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewPO(null)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        )}
      </MasterDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />Delete {activeTab === "tana" ? "Tana" : "Bana"} PO?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Delete <strong>{deleteTarget?.poNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={handleConfirmDelete}>
              Delete PO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
