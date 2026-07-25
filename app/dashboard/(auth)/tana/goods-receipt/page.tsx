"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { TanaGRN } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const schema = z.object({
  grnDate: z.string().min(1, "GRN Date is required"),
  vehicleNo: z.string().optional(),
  lrNo: z.string().optional(),
  bagsReceivedThisGRN: z.number().min(1, "Bags received must be at least 1"),
  conditionCheck: z.enum(["Good", "Damaged", "Rejected"]),
  receivedBy: z.string().min(2, "Received By is required"),
  remarks: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function TanaGRNListPage() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ status: "all", conditionCheck: "all" });
  const [viewGRN, setViewGRN] = useState<TanaGRN | null>(null);
  const [editGRN, setEditGRN] = useState<TanaGRN | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TanaGRN | null>(null);

  const { data: grns = [], isLoading } = useQuery({ queryKey: ["tana-grns"], queryFn: () => tanaApiService.getGRNs() });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      grnDate: "",
      vehicleNo: "",
      lrNo: "",
      bagsReceivedThisGRN: 0,
      conditionCheck: "Good",
      receivedBy: "",
      remarks: ""
    }
  });

  useEffect(() => {
    if (editGRN) {
      form.reset({
        grnDate: editGRN.grnDate,
        vehicleNo: editGRN.vehicleNo || "",
        lrNo: editGRN.lrNo || "",
        bagsReceivedThisGRN: editGRN.bagsReceivedThisGRN,
        conditionCheck: editGRN.conditionCheck,
        receivedBy: editGRN.receivedBy,
        remarks: editGRN.remarks || ""
      });
    }
  }, [editGRN, form]);

  const updateMutation = useMutation({
    mutationFn: (data: TanaGRN) => tanaApiService.updateGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-grns"] });
      queryClient.invalidateQueries({ queryKey: ["tana-pos"] });
      toast.success("Tana GRN updated successfully.");
      setEditGRN(null);
    },
    onError: () => toast.error("Failed to update GRN.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tanaApiService.deleteGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-grns"] });
      queryClient.invalidateQueries({ queryKey: ["tana-pos"] });
      toast.success("Tana GRN deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete GRN.")
  });

  const handleEditClick = (grn: TanaGRN) => {
    setEditGRN(grn);
    setViewGRN(null);
  };

  const handleDeleteClick = (grn: TanaGRN) => {
    setDeleteTarget(grn);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = (values: FormValues) => {
    if (!editGRN) return;
    const maxBags = editGRN.bagsPending;
    if (values.bagsReceivedThisGRN > maxBags) {
      toast.error(`Cannot receive ${values.bagsReceivedThisGRN} bags. Only ${maxBags} bags pending.`);
      return;
    }

    const totalWeight = values.bagsReceivedThisGRN * editGRN.perBagWeightKg;
    const isComplete = (editGRN.bagsPreviouslyReceived + values.bagsReceivedThisGRN) >= editGRN.bagsOrdered;

    updateMutation.mutate({
      ...editGRN,
      ...values,
      totalWeightReceived: parseFloat(totalWeight.toFixed(2)),
      status: isComplete ? "Completed" : values.bagsReceivedThisGRN > 0 ? "Partial" : "Pending"
    });
  };

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
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onBulkDelete={(items) => items.forEach(i => deleteMutation.mutate(i.id))}
      />

      {/* View GRN Dialog */}
      <MasterDialog
        isOpen={!!viewGRN}
        onClose={() => setViewGRN(null)}
        title="Goods Receipt Note Details (Tana)"
        description={`GRN #: ${viewGRN?.grnNumber} | Date: ${viewGRN?.grnDate}`}
      >
        {viewGRN && (
          <DetailViewCard
            title={viewGRN.grnNumber}
            subtitle={`Linked PO: ${viewGRN.linkedPONumber} • Supplier: ${viewGRN.supplierName}`}
            statusBadge={
              <Badge variant="outline" className={`text-[10px] font-bold ${grnStatusColors[viewGRN.status] || ""}`}>
                {viewGRN.status}
              </Badge>
            }
            sections={[
              {
                title: "Receipt & Transport Details",
                fields: [
                  { label: "Linked PO Number", value: viewGRN.linkedPONumber, highlight: true },
                  { label: "Supplier Name", value: viewGRN.supplierName },
                  { label: "GRN Date", value: viewGRN.grnDate, mono: true },
                  { label: "Vehicle Number", value: viewGRN.vehicleNo || "—", mono: true },
                  { label: "LR / Transport No.", value: viewGRN.lrNo || "—", mono: true },
                  { label: "Received By", value: viewGRN.receivedBy }
                ]
              },
              {
                title: "Bags & Weight Breakdown",
                fields: [
                  { label: "Bags Ordered", value: viewGRN.bagsOrdered },
                  { label: "Prev. Received", value: viewGRN.bagsPreviouslyReceived },
                  { label: "Bags This GRN", value: viewGRN.bagsReceivedThisGRN, highlight: true },
                  { label: "Per Bag Weight", value: `${viewGRN.perBagWeightKg} KG` },
                  { label: "Total Weight Received", value: `${viewGRN.totalWeightReceived.toLocaleString()} KG`, highlight: true },
                  { label: "Condition Check", value: viewGRN.conditionCheck, badge: true, badgeClass: conditionColors[viewGRN.conditionCheck] }
                ]
              }
            ]}
          >
            {viewGRN.remarks && (
              <div className="p-3 bg-card border border-border/30 rounded-lg">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Remarks</span>
                <p className="text-xs mt-1 text-foreground">{viewGRN.remarks}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewGRN(null)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        )}
      </MasterDialog>

      {/* Edit GRN Dialog */}
      <MasterDialog
        isOpen={!!editGRN}
        onClose={() => setEditGRN(null)}
        title={`Edit GRN: ${editGRN?.grnNumber}`}
        description={`Linked PO: ${editGRN?.linkedPONumber} | Supplier: ${editGRN?.supplierName}`}
      >
        {editGRN && (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GRN Date *</Label>
                <Input type="date" {...form.register("grnDate")} />
                {form.formState.errors.grnDate && <p className="text-[10px] text-destructive">{form.formState.errors.grnDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Condition Check *</Label>
                <Select onValueChange={(v) => form.setValue("conditionCheck", v as any)} value={form.watch("conditionCheck")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vehicle Number</Label>
                <Input {...form.register("vehicleNo")} placeholder="e.g. MH-09-CD-1234" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">LR Number</Label>
                <Input {...form.register("lrNo")} placeholder="e.g. LR-987654" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bags Received *</Label>
                <Input type="number" {...form.register("bagsReceivedThisGRN", { valueAsNumber: true })} />
                <p className="text-[10px] text-muted-foreground">Max allowed: {editGRN.bagsPending} bags</p>
                {form.formState.errors.bagsReceivedThisGRN && <p className="text-[10px] text-destructive">{form.formState.errors.bagsReceivedThisGRN.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Received By *</Label>
                <Input {...form.register("receivedBy")} placeholder="Enter name" />
                {form.formState.errors.receivedBy && <p className="text-[10px] text-destructive">{form.formState.errors.receivedBy.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Weight (Auto)</Label>
                <div className="h-9 px-3 flex items-center rounded-md border bg-muted/20 text-xs font-bold">
                  {((form.watch("bagsReceivedThisGRN") || 0) * editGRN.perBagWeightKg).toLocaleString()} KG
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks</Label>
              <Textarea rows={2} {...form.register("remarks")} placeholder="Notes or instructions..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditGRN(null)}>Cancel</Button>
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
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />Delete Tana Goods Receipt Note?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Delete GRN <strong>{deleteTarget?.grnNumber}</strong>? This action will restore <strong>{deleteTarget?.bagsReceivedThisGRN}</strong> bags to the pending list of Purchase Order <strong>{deleteTarget?.linkedPONumber}</strong> and deduct the stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90 text-xs cursor-pointer" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Delete GRN
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
