"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileCheck2,
  Plus,
  Eye,
  ArrowLeft,
  Calendar,
  Building,
  Scale,
  Truck,
  Warehouse
} from "lucide-react";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { GRN } from "@/lib/store/use-procurement-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GRNPage() {
  const router = useRouter();

  // Search & Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    status: "all",
    supplierId: "all"
  });

  // Modal controls
  const [viewGRN, setViewGRN] = useState<GRN | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: grns = [], isLoading } = useQuery({
    queryKey: ["grns"],
    queryFn: () => procurementApiService.getGRNs()
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const parties = await mastersApiService.getParties();
      return parties.filter((p) => p.partyType === "Supplier");
    }
  });

  // Filter Logic
  const filteredGRNs = grns.filter((grn) => {
    const matchesSearch =
      grn.grnNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchValue.toLowerCase()) ||
      grn.vehicleNumber.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      selectedFilters.status === "all" || grn.status === selectedFilters.status;

    const matchesSupplier =
      selectedFilters.supplierId === "all" || grn.supplierId === selectedFilters.supplierId;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const columns: TableColumn<GRN>[] = [
    { key: "grnNumber", header: "GRN Number", render: (item) => <span className="font-bold text-foreground">{item.grnNumber}</span>, sortable: true },
    { key: "poNumber", header: "Ref. PO Code", render: (item) => <span className="font-semibold text-primary">{item.poNumber}</span>, sortable: true },
    { key: "supplierName", header: "Yarn Supplier", render: (item) => <div className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-semibold">{item.supplierName}</span></div>, sortable: true },
    { key: "receiveDate", header: "Receive Date", sortable: true },
    { key: "vehicleNumber", header: "Vehicle No.", render: (item) => <Badge variant="secondary" className="font-bold text-[10px] tracking-wider">{item.vehicleNumber}</Badge> },
    { key: "warehouseName", header: "Godown Location", render: (item) => <span>{item.warehouseName}</span>, sortable: true },
    {
      key: "status",
      header: "Check-in Status",
      render: (item) => <StatusBadge status={item.status} type="lot" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Goods Receive Notes (GRN)"
        description="Verify incoming yarn bag consignments. Check vehicle logs, inspect counts, and run accepted vs rejected audits."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement Control", href: "/dashboard/procurement/dashboard" },
          { title: "Goods Receive Notes" }
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
        createLabel="Process Inward GRN"
        onCreateClick={() => router.push("/dashboard/procurement/goods-receive/new")}
        exportTitle="GRNs"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ status: "all", supplierId: "all" });
        }}
        filters={[
          {
            key: "status",
            placeholder: "Check-in Status",
            options: [
              { label: "Pending", value: "Pending" },
              { label: "Partial Check-in", value: "Partial" },
              { label: "Completed", value: "Completed" }
            ]
          },
          {
            key: "supplierId",
            placeholder: "Supplier Mill",
            options: suppliers.map((s) => ({ label: s.partyName, value: s.id }))
          }
        ]}
      />

      {/* GRN Table */}
      <MasterTable
        data={filteredGRNs}
        columns={columns}
        isLoading={isLoading}
        onView={(grn) => {
          setViewGRN(grn);
          setDialogOpen(true);
        }}
        onBulkDelete={(items) => {
          toast.info("Bulk deletion not supported on transactional GRN records to maintain audit logs.");
        }}
      />

      {/* GRN View Audit Slide-out Drawer */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setViewGRN(null);
        }}
        title={`Inward Receipt Audit: ${viewGRN?.grnNumber}`}
        description="Verification details of incoming logistics vehicle and yarn count quantities."
      >
        {viewGRN && (
          <div className="space-y-6 text-xs leading-relaxed">
            {/* Header properties */}
            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Yarn Supplier Mill</span>
                <span className="text-sm font-bold text-foreground">{viewGRN.supplierName}</span>
                <span className="block text-[10px] text-primary font-semibold mt-0.5">Reference PO: {viewGRN.poNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Warehouse className="h-3.5 w-3.5" /> Godown Location</span>
                <span className="text-sm font-semibold text-foreground">{viewGRN.warehouseName}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Inward Check-in Date</span>
                <span className="font-semibold text-foreground">{viewGRN.receiveDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Logistics Vehicle No.</span>
                <span className="font-semibold text-foreground">{viewGRN.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Arrival Status</span>
                <StatusBadge status={viewGRN.status} type="lot" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Logistics Transporter</span>
                <span className="font-semibold text-foreground">{viewGRN.transporter}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Delivery Challan / Supplier Invoice No.</span>
                <span className="font-semibold text-foreground">{viewGRN.invoiceNumber || "N/A"}</span>
              </div>
            </div>

            {/* Line items quantity breakdown */}
            <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted/10 p-3 font-bold border-b border-border/10 text-foreground flex items-center gap-1"><Scale className="h-4 w-4" /> Received Quantity Audit Grid</div>
              <div className="divide-y divide-border/10">
                {viewGRN.items.map((item, idx) => {
                  const progress = item.orderedQty > 0 ? (item.acceptedQty / item.orderedQty) * 100 : 0;
                  
                  return (
                    <div key={idx} className="p-3 hover:bg-muted/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-foreground">{item.yarnName}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold">Count Size: {item.count}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground">{item.acceptedQty.toLocaleString()} KG Accepted</span>
                          <span className="block text-[10px] text-muted-foreground font-semibold">Ordered: {item.orderedQty.toLocaleString()} KG</span>
                        </div>
                      </div>
                      
                      {/* Progress bar visual indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                          <span>Delivery Progress: {progress.toFixed(0)}%</span>
                          {item.rejectedQty > 0 && <span className="text-rose-500">{item.rejectedQty.toLocaleString()} KG Rejected</span>}
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                          {item.rejectedQty > 0 && (
                            <div className="h-full bg-rose-500" style={{ width: `${Math.min((item.rejectedQty / item.orderedQty) * 100, 100)}%` }} />
                          )}
                        </div>
                      </div>
                      
                      {item.remarks && (
                        <div className="text-[10px] bg-rose-500/5 text-rose-600 dark:text-rose-400 p-2 rounded border border-rose-500/10 font-medium">
                          Note: {item.remarks}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {viewGRN.remarks && (
              <div>
                <span className="text-muted-foreground block font-medium">Remarks Note</span>
                <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewGRN.remarks}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border/10 pt-4">
              <Button variant="default" size="sm" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Audit Panel
              </Button>
            </div>
          </div>
        )}
      </MasterDialog>
    </PageContainer>
  );
}
