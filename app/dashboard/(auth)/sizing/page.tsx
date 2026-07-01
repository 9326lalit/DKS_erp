"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, CheckCircle, PackageCheck, Scissors } from "lucide-react";
import Link from "next/link";

import { sizingApiService } from "@/lib/services/sizing-api";
import { tanaApiService } from "@/lib/services/tana-api";
import { SizingBatch } from "@/lib/store/use-sizing-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const batchStatusColors: Record<string, string> = {
  "Issued": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "In Process": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Completed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

const createSchema = z.object({
  dateIssuedToSizing: z.string().min(1, "Issue date required"),
  bagsIssued: z.number().min(1, "Must issue at least 1 bag"),
  perBagWeightKg: z.number().min(0.1, "Per bag weight required"),
  sizingDoneBy: z.enum(["In-house", "Outsourced"]),
  outsourcedPartyName: z.string().optional(),
  remarks: z.string().optional()
});

const completeSchema = z.object({
  dateReceivedFromSizing: z.string().min(1, "Receipt date required"),
  bagsReceivedBack: z.number().min(0),
  weightReceivedKg: z.number().min(0),
  sizingChargesRs: z.number().min(0)
});

type CreateValues = z.infer<typeof createSchema>;
type CompleteValues = z.infer<typeof completeSchema>;

export default function SizingPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all" });
  const [createOpen, setCreateOpen] = useState(false);
  const [viewBatch, setViewBatch] = useState<SizingBatch | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeBatch, setCompleteBatch] = useState<SizingBatch | null>(null);

  const { data: batches = [], isLoading } = useQuery({ queryKey: ["sizing-batches"], queryFn: () => sizingApiService.getBatches() });
  const stock = sizingApiService.getStock();
  const tanaStock = tanaApiService.getStock();

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { dateIssuedToSizing: new Date().toISOString().split("T")[0], bagsIssued: 0, perBagWeightKg: 50, sizingDoneBy: "Outsourced", outsourcedPartyName: "", remarks: "" }
  });

  const completeForm = useForm<CompleteValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { dateReceivedFromSizing: new Date().toISOString().split("T")[0], bagsReceivedBack: 0, weightReceivedKg: 0, sizingChargesRs: 0 }
  });

  const bags = createForm.watch("bagsIssued") || 0;
  const perBag = createForm.watch("perBagWeightKg") || 0;
  const totalIssueWeight = bags * perBag;

  const createMutation = useMutation({
    mutationFn: (data: any) => sizingApiService.createBatch(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sizing-batches"] }); toast.success("Sizing batch created! Tana issued to sizing."); setCreateOpen(false); createForm.reset(); }
  });

  const completeMutation = useMutation({
    mutationFn: (data: any) => sizingApiService.completeBatch(data.batchId, data.bagsBack, data.weightBack, data.charges),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sizing-batches"] }); toast.success("Sizing batch completed! Sized Tana stock updated."); setCompleteOpen(false); setCompleteBatch(null); }
  });

  const handleCreateSubmit = (values: CreateValues) => {
    const year = new Date().getFullYear();
    const seq = Date.now() % 10000;
    createMutation.mutate({
      id: `SZ-ID-${Date.now()}`,
      batchNumber: `SZ-${year}-${String(seq).padStart(4, "0")}`,
      weightIssuedKg: parseFloat(totalIssueWeight.toFixed(2)),
      status: "Issued" as const,
      ...values
    });
  };

  const handleCompleteSubmit = (values: CompleteValues) => {
    if (!completeBatch) return;
    completeMutation.mutate({ batchId: completeBatch.id, bagsBack: values.bagsReceivedBack, weightBack: values.weightReceivedKg, charges: values.sizingChargesRs });
  };

  const filtered = batches.filter(b => {
    const ms = b.batchNumber.toLowerCase().includes(searchValue.toLowerCase()) || (b.outsourcedPartyName || "").toLowerCase().includes(searchValue.toLowerCase());
    const mst = selectedFilters.status === "all" || b.status === selectedFilters.status;
    return ms && mst;
  });

  const columns: TableColumn<SizingBatch>[] = [
    { key: "batchNumber", header: "Batch Number", sortable: true, render: (item) => <span className="font-bold text-primary">{item.batchNumber}</span> },
    { key: "dateIssuedToSizing", header: "Issue Date", sortable: true },
    { key: "bagsIssued", header: "Bags Issued", render: (item) => <span className="font-semibold">{item.bagsIssued}</span> },
    { key: "weightIssuedKg", header: "Wt. Issued (KG)", render: (item) => <span className="font-semibold">{item.weightIssuedKg.toLocaleString()}</span> },
    { key: "weightReceivedKg", header: "Wt. Rcvd (KG)", render: (item) => <span className={item.weightReceivedKg ? "font-semibold" : "text-muted-foreground"}>{item.weightReceivedKg?.toLocaleString() ?? "—"}</span> },
    { key: "lossPercent", header: "Loss %", render: (item) => <span className={item.lossPercent ? (item.lossPercent > 3 ? "text-red-600 font-bold" : "font-semibold text-emerald-700") : "text-muted-foreground"}>{item.lossPercent !== undefined ? `${item.lossPercent}%` : "—"}</span> },
    { key: "sizingDoneBy", header: "Done By", render: (item) => <Badge variant="outline" className="text-[10px] font-semibold">{item.sizingDoneBy}</Badge> },
    { key: "status", header: "Status", render: (item) => <Badge variant="outline" className={`text-[10px] font-bold ${batchStatusColors[item.status] || ""}`}>{item.status}</Badge>, sortable: true }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Sizing Module"
        description="Manage Tana (Warp Yarn) sizing batches. Track raw Tana issued to sizing and sized Tana received back. Loss percentage is auto-calculated."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Sizing Module" }]}
        actions={
          <Button size="sm" className="h-9 gap-1.5 cursor-pointer" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Sizing Issue
          </Button>
        }
      />

      {/* Stock Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3 mb-2">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-xs font-semibold text-muted-foreground">Raw Tana Stock</span></div>
            <p className="text-xl font-bold">{tanaStock.bags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
            <p className="text-xs text-muted-foreground">{tanaStock.weightKg.toLocaleString()} KG available</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><div className="h-2 w-2 rounded-full bg-amber-500" /><span className="text-xs font-semibold text-muted-foreground">In Sizing Process</span></div>
            <p className="text-xl font-bold">{batches.filter(b => b.status === "In Process" || b.status === "Issued").reduce((s, b) => s + b.bagsIssued, 0)} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
            <p className="text-xs text-muted-foreground">{batches.filter(b => b.status !== "Completed").length} active batches</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-muted-foreground">Sized Tana Ready</span></div>
            <p className="text-xl font-bold">{stock.sizedTanaBags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
            <p className="text-xs text-muted-foreground">{stock.sizedTanaWeightKg.toLocaleString()} KG ready for loom</p>
          </CardContent>
        </Card>
      </div>

      <MasterToolbar
        searchValue={searchValue} onSearchChange={setSearchValue}
        createLabel="New Sizing Issue" onCreateClick={() => setCreateOpen(true)}
        exportTitle="Sizing Batches" selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters(p => ({ ...p, [key]: val }))}
        onClearFilters={() => { setSearchValue(""); setSelectedFilters({ status: "all" }); }}
        filters={[{ key: "status", placeholder: "Status", options: [{ label: "Issued", value: "Issued" }, { label: "In Process", value: "In Process" }, { label: "Completed", value: "Completed" }] }]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onView={(item) => setViewBatch(item)}
        customRowActions={(item) => item.status !== "Completed" ? (
          <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 cursor-pointer" onClick={() => { setCompleteBatch(item); completeForm.reset({ dateReceivedFromSizing: new Date().toISOString().split("T")[0], bagsReceivedBack: item.bagsIssued, weightReceivedKg: item.weightIssuedKg, sizingChargesRs: 0 }); setCompleteOpen(true); }}>
            <CheckCircle className="h-3 w-3 mr-1" /> Mark Complete
          </Button>
        ) : null}
        onBulkDelete={() => {}}
      />

      {/* Create Batch Dialog */}
      <MasterDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Issue Tana for Sizing" description="Issue raw Tana bags to the sizing process. A new sizing batch (SZ-YYYY-NNNN) will be created.">
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Issue Date *</Label><Input type="date" {...createForm.register("dateIssuedToSizing")} /></div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sizing Done By *</Label>
              <Select onValueChange={(v) => createForm.setValue("sizingDoneBy", v as any)} value={createForm.watch("sizingDoneBy")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="In-house">In-house</SelectItem><SelectItem value="Outsourced">Outsourced (Job Work)</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {createForm.watch("sizingDoneBy") === "Outsourced" && (
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Outsourced Party Name</Label><Input {...createForm.register("outsourcedPartyName")} placeholder="e.g. D.K. Warping & Sizing" /></div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bags Issued *</Label>
              <Input type="number" {...createForm.register("bagsIssued", { valueAsNumber: true })} placeholder={`Available: ${tanaStock.bags}`} max={tanaStock.bags} />
              {createForm.formState.errors.bagsIssued && <p className="text-[10px] text-destructive">{createForm.formState.errors.bagsIssued.message}</p>}
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Per Bag Weight (KG)</Label><Input type="number" step="0.01" {...createForm.register("perBagWeightKg", { valueAsNumber: true })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Total Weight (Auto)</Label><div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm font-bold">{totalIssueWeight > 0 ? `${totalIssueWeight.toFixed(2)} KG` : "—"}</div></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-semibold">Remarks</Label><Textarea rows={2} {...createForm.register("remarks")} placeholder="Notes about this sizing batch..." /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border/10">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Issue to Sizing"}</Button>
          </div>
        </form>
      </MasterDialog>

      {/* Complete Batch Dialog */}
      <MasterDialog isOpen={completeOpen} onClose={() => { setCompleteOpen(false); setCompleteBatch(null); }} title={`Complete Sizing: ${completeBatch?.batchNumber}`} description="Enter details of sized Tana received back. Loss percentage will be auto-calculated.">
        {completeBatch && (
          <form onSubmit={completeForm.handleSubmit(handleCompleteSubmit)} className="space-y-4">
            <div className="bg-muted/10 rounded-lg border border-border/10 p-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div><span className="text-muted-foreground block">Batch</span><span className="font-bold">{completeBatch.batchNumber}</span></div>
                <div><span className="text-muted-foreground block">Bags Issued</span><span className="font-bold">{completeBatch.bagsIssued}</span></div>
                <div><span className="text-muted-foreground block">Wt. Issued</span><span className="font-bold">{completeBatch.weightIssuedKg} KG</span></div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Receipt Date *</Label><Input type="date" {...completeForm.register("dateReceivedFromSizing")} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Sizing Charges (₹)</Label><Input type="number" step="0.01" {...completeForm.register("sizingChargesRs", { valueAsNumber: true })} placeholder="Job work charges" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Bags Received Back *</Label><Input type="number" {...completeForm.register("bagsReceivedBack", { valueAsNumber: true })} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Weight Received (KG) *</Label><Input type="number" step="0.01" {...completeForm.register("weightReceivedKg", { valueAsNumber: true })} /></div>
            </div>
            {/* Loss preview */}
            {(() => {
              const rcvd = completeForm.watch("weightReceivedKg") || 0;
              const loss = completeBatch.weightIssuedKg - rcvd;
              const lossP = completeBatch.weightIssuedKg > 0 ? ((loss / completeBatch.weightIssuedKg) * 100).toFixed(2) : "0";
              return rcvd > 0 ? (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-xs border ${parseFloat(lossP) > 3 ? "bg-red-500/5 border-red-500/20 text-red-600" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-700"}`}>
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Sizing Loss: <strong>{loss.toFixed(2)} KG ({lossP}%)</strong> {parseFloat(lossP) > 3 ? "— High loss, verify!" : "— Normal range"}</span>
                </div>
              ) : null;
            })()}
            <div className="flex justify-end gap-2 pt-3 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => { setCompleteOpen(false); setCompleteBatch(null); }}>Cancel</Button>
              <Button type="submit" disabled={completeMutation.isPending}>{completeMutation.isPending ? "Completing..." : "Mark as Completed"}</Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* View Batch Dialog */}
      <MasterDialog isOpen={!!viewBatch && !completeOpen} onClose={() => setViewBatch(null)} title={`Sizing Batch: ${viewBatch?.batchNumber}`} description={`Status: ${viewBatch?.status} | Done By: ${viewBatch?.sizingDoneBy}`}>
        {viewBatch && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-muted/20 rounded-lg p-3 border border-border/10">
              <div><span className="text-muted-foreground block">Batch No.</span><span className="font-bold text-primary">{viewBatch.batchNumber}</span></div>
              <div><span className="text-muted-foreground block">Issue Date</span><span className="font-semibold">{viewBatch.dateIssuedToSizing}</span></div>
              <div><span className="text-muted-foreground block">Status</span><Badge variant="outline" className={`text-[10px] font-bold ${batchStatusColors[viewBatch.status] || ""}`}>{viewBatch.status}</Badge></div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-b pb-3 border-border/10">
              <div><span className="text-muted-foreground block">Bags Issued</span><span className="font-bold">{viewBatch.bagsIssued}</span></div>
              <div><span className="text-muted-foreground block">Weight Issued</span><span className="font-bold">{viewBatch.weightIssuedKg} KG</span></div>
              <div><span className="text-muted-foreground block">Done By</span><Badge variant="outline" className="font-semibold">{viewBatch.sizingDoneBy}</Badge></div>
            </div>
            {viewBatch.outsourcedPartyName && <div><span className="text-muted-foreground block">Outsourced To</span><span className="font-semibold">{viewBatch.outsourcedPartyName}</span></div>}
            {viewBatch.status === "Completed" && (
              <div className="bg-muted/10 rounded-lg border border-border/10 p-3 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sizing Results</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt Date</span><span className="font-semibold">{viewBatch.dateReceivedFromSizing}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bags Back</span><span className="font-semibold">{viewBatch.bagsReceivedBack}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Weight Received</span><span className="font-semibold">{viewBatch.weightReceivedKg} KG</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sizing Charges</span><span className="font-semibold">₹{viewBatch.sizingChargesRs?.toLocaleString() ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Loss Weight</span><span className={`font-bold ${(viewBatch.lossPercent || 0) > 3 ? "text-red-600" : "text-emerald-700"}`}>{viewBatch.sizingLossKg} KG ({viewBatch.lossPercent}%)</span></div>
                </div>
              </div>
            )}
            {viewBatch.remarks && <div><span className="text-muted-foreground block">Remarks</span><p className="bg-muted/20 p-2 rounded border border-border/10 mt-0.5">{viewBatch.remarks}</p></div>}
            <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setViewBatch(null)}>Close</Button></div>
          </div>
        )}
      </MasterDialog>
    </PageContainer>
  );
}
