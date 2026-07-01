"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { banaApiService } from "@/lib/services/bana-api";
import { BanaPI } from "@/lib/store/use-bana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const paymentStatusColors: Record<string, string> = {
  "Pending": "bg-red-500/10 text-red-600 border-red-500/20",
  "Partially Paid": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

export default function BanaInvoicesPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ paymentStatus: "all" });
  const [viewPI, setViewPI] = useState<BanaPI | null>(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ["bana-pis"], queryFn: () => banaApiService.getPIs() });

  const updateMutation = useMutation({
    mutationFn: (pi: BanaPI) => banaApiService.updatePI(pi),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bana-pis"] }); toast.success("Payment status updated."); }
  });

  const filtered = invoices.filter(i => {
    const ms = i.piNumber.toLowerCase().includes(searchValue.toLowerCase()) || i.supplierName.toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.paymentStatus === "all" || i.paymentStatus === selectedFilters.paymentStatus;
    return ms && mst;
  });

  const columns: TableColumn<BanaPI>[] = [
    { key: "piNumber", header: "PI Number", sortable: true, render: (item) => <span className="font-bold text-primary">{item.piNumber}</span> },
    { key: "piDate", header: "PI Date", sortable: true },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "supplierInvoiceNo", header: "Supp. Invoice No." },
    { key: "linkedGRNNumber", header: "Linked GRN", render: (item) => <span className="text-xs">{item.linkedGRNNumber}</span> },
    { key: "taxableAmount", header: "Taxable Amt", render: (item) => <span className="font-semibold">₹{item.taxableAmount.toLocaleString()}</span> },
    { key: "netPayable", header: "Net Payable", render: (item) => <span className="font-bold">₹{item.netPayable.toLocaleString()}</span> },
    { key: "dueDate", header: "Due Date", sortable: true },
    { key: "paymentStatus", header: "Payment", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[item.paymentStatus] || ""}`}>{item.paymentStatus}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Bana Purchase Invoices"
        description="Track Bana (Weft Yarn) purchase invoices with GST breakup and payment status. Series: BANA-PI-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Bana (Weft)" }, { title: "Invoices" }]}
        actions={<Link href="/dashboard/bana/invoices/new"><Button size="sm" className="h-9 gap-1.5 cursor-pointer"><Plus className="h-4 w-4" /> Create Bana Invoice</Button></Link>}
      />
      <MasterToolbar searchValue={searchValue} onSearchChange={setSearchValue} createLabel="Create Invoice" onCreateClick={() => window.location.href = "/dashboard/bana/invoices/new"} exportTitle="Bana Invoices" selectedFilters={selectedFilters} onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))} onClearFilters={() => { setSearchValue(""); setSelectedFilters({ paymentStatus: "all" }); }} filters={[{ key: "paymentStatus", placeholder: "Payment", options: [{ label: "Pending", value: "Pending" }, { label: "Partially Paid", value: "Partially Paid" }, { label: "Paid", value: "Paid" }] }]} />
      <MasterTable data={filtered} columns={columns} isLoading={isLoading} onView={(item) => setViewPI(item)} onBulkDelete={() => {}} />

      <MasterDialog isOpen={!!viewPI} onClose={() => setViewPI(null)} title={`Invoice: ${viewPI?.piNumber}`} description={`${viewPI?.supplierName} | Due: ${viewPI?.dueDate}`}>
        {viewPI && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-muted/20 rounded-lg p-3 border border-border/10">
              <div><span className="text-muted-foreground block">PI Number</span><span className="font-bold text-primary">{viewPI.piNumber}</span></div>
              <div><span className="text-muted-foreground block">PI Date</span><span className="font-semibold">{viewPI.piDate}</span></div>
              <div><span className="text-muted-foreground block">Status</span><Badge variant="outline" className={`text-[10px] font-bold ${paymentStatusColors[viewPI.paymentStatus] || ""}`}>{viewPI.paymentStatus}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Supplier</span><span className="font-bold">{viewPI.supplierName}</span></div>
              <div><span className="text-muted-foreground block">Supp. Invoice No.</span><span className="font-semibold">{viewPI.supplierInvoiceNo}</span></div>
            </div>
            <div><span className="text-muted-foreground block">Item Description</span><p className="font-semibold mt-0.5">{viewPI.itemDescription}</p></div>
            <div className="bg-muted/10 rounded-lg border border-border/10 p-3 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice Breakup</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Taxable Amount</span><span className="font-semibold">₹{viewPI.taxableAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CGST @ {viewPI.cgstPercent}%</span><span className="font-semibold">₹{viewPI.cgstAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SGST @ {viewPI.sgstPercent}%</span><span className="font-semibold">₹{viewPI.sgstAmount.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-border/20 pt-2"><span>Net Payable</span><span className="text-base">₹{viewPI.netPayable.toLocaleString()}</span></div>
              <p className="text-[10px] text-muted-foreground italic">{viewPI.amountInWords}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground block">Due Date</span><span className="font-bold">{viewPI.dueDate}</span></div>
              <div><span className="text-muted-foreground block">Payment Terms</span><span className="font-semibold">{viewPI.paymentTermsDays} Days</span></div>
            </div>
            <div className="border-t border-border/10 pt-3 space-y-2">
              <span className="text-xs font-semibold">Update Payment Status</span>
              <div className="flex gap-2">
                {(["Pending", "Partially Paid", "Paid"] as const).map(status => (
                  <Button key={status} size="sm" variant={viewPI.paymentStatus === status ? "default" : "outline"} className="text-xs h-8 cursor-pointer"
                    onClick={() => { updateMutation.mutate({ ...viewPI, paymentStatus: status }); setViewPI({ ...viewPI, paymentStatus: status }); }}>
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setViewPI(null)}>Close</Button></div>
          </div>
        )}
      </MasterDialog>
    </PageContainer>
  );
}
