"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { banaApiService } from "@/lib/services/bana-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  grnDate: z.string().min(1), linkedPOId: z.string().min(1),
  vehicleNo: z.string().optional(), lrNo: z.string().optional(),
  bagsReceivedThisGRN: z.number().min(1), conditionCheck: z.enum(["Good", "Damaged", "Rejected"]),
  receivedBy: z.string().min(2), remarks: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function NewBanaGRNPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: pos = [] } = useQuery({ queryKey: ["bana-pos"], queryFn: () => banaApiService.getPOs() });
  const openPOs = pos.filter(p => p.status === "Open" || p.status === "Partially Received");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { grnDate: new Date().toISOString().split("T")[0], linkedPOId: "", vehicleNo: "", lrNo: "", bagsReceivedThisGRN: 0, conditionCheck: "Good", receivedBy: "", remarks: "" }
  });

  const selectedPOId = form.watch("linkedPOId");
  const selectedPO = pos.find(p => p.id === selectedPOId);
  const bagsPending = selectedPO ? selectedPO.totalBagsOrdered - selectedPO.bagsReceivedSoFar : 0;
  const bagsThisGRN = form.watch("bagsReceivedThisGRN") || 0;
  const totalWeightReceived = bagsThisGRN * (selectedPO?.perBagWeightKg || 0);

  const mutation = useMutation({
    mutationFn: (data: any) => banaApiService.createGRN(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bana-grns"] }); queryClient.invalidateQueries({ queryKey: ["bana-pos"] }); toast.success("Bana GRN created! Stock updated."); router.push("/dashboard/bana/goods-receipt"); }
  });

  const onSubmit = (values: FormValues) => {
    if (!selectedPO) return;
    if (bagsThisGRN > bagsPending) { toast.error(`Cannot receive ${bagsThisGRN} bags. Only ${bagsPending} pending.`); return; }
    const year = new Date().getFullYear();
    const seq = Date.now() % 10000;
    const isComplete = (selectedPO.bagsReceivedSoFar + bagsThisGRN) >= selectedPO.totalBagsOrdered;
    const { linkedPOId: _linkedPOId, ...restValues } = values as any;
    mutation.mutate({
      id: `BANA-GRN-ID-${Date.now()}`,
      grnNumber: `BANA-GRN-${year}-${String(seq).padStart(4, "0")}`,
      linkedPOId: selectedPO.id, linkedPONumber: selectedPO.poNumber, supplierName: selectedPO.purchaseFromName,
      bagsOrdered: selectedPO.totalBagsOrdered, bagsPreviouslyReceived: selectedPO.bagsReceivedSoFar, bagsPending,
      perBagWeightKg: selectedPO.perBagWeightKg, totalWeightReceived: parseFloat(totalWeightReceived.toFixed(2)),
      status: isComplete ? "Completed" : bagsThisGRN > 0 ? "Partial" : "Pending",
      ...restValues, bagsReceivedThisGRN: bagsThisGRN
    });
  };

  const poStatusColors: Record<string, string> = { "Open": "bg-blue-500/10 text-blue-600 border-blue-500/20", "Partially Received": "bg-amber-500/10 text-amber-600 border-amber-500/20" };

  return (
    <PageContainer>
      <PageHeader
        title="Create Bana GRN"
        description="Record Bana (Weft Yarn) receipt against an open Purchase Order. Bana stock will be updated. Series: BANA-GRN-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Bana GRN", href: "/dashboard/bana/goods-receipt" }, { title: "New GRN" }]}
        actions={<Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back</Button>}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10"><CardTitle className="text-sm font-bold">GRN Header</CardTitle></CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">GRN Date *</Label><Input type="date" {...form.register("grnDate")} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Linked Bana PO *</Label>
                <Select onValueChange={(v) => form.setValue("linkedPOId", v)} value={form.watch("linkedPOId")}>
                  <SelectTrigger><SelectValue placeholder="Select Open / Partial Bana PO" /></SelectTrigger>
                  <SelectContent>
                    {openPOs.length === 0 && <SelectItem value="" disabled>No open POs</SelectItem>}
                    {openPOs.map(po => <SelectItem key={po.id} value={po.id}>{po.poNumber} — {po.purchaseFromName} ({po.totalBagsOrdered - po.bagsReceivedSoFar} bags pending)</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.linkedPOId && <p className="text-[10px] text-destructive">{form.formState.errors.linkedPOId.message}</p>}
              </div>
            </div>
            {selectedPO && (
              <div className="bg-muted/10 border border-border/20 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground block">Supplier</span><span className="font-semibold">{selectedPO.purchaseFromName}</span></div>
                  <div><span className="text-muted-foreground block">Item</span><span className="font-semibold">{selectedPO.itemName}</span></div>
                  <div><span className="text-muted-foreground block">Ordered</span><span className="font-bold">{selectedPO.totalBagsOrdered}</span></div>
                  <div><span className="text-muted-foreground block">Pending</span><span className="font-bold text-amber-600">{bagsPending}</span></div>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Vehicle No.</Label><Input {...form.register("vehicleNo")} placeholder="e.g. MH-09-AB-1234" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">LR Number</Label><Input {...form.register("lrNo")} placeholder="Lorry Receipt No." /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10"><CardTitle className="text-sm font-bold">Receipt Details</CardTitle></CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bags Received *</Label>
                <Input type="number" {...form.register("bagsReceivedThisGRN", { valueAsNumber: true })} placeholder={`Max: ${bagsPending}`} max={bagsPending} />
                {bagsThisGRN > bagsPending && bagsPending > 0 && <p className="text-[10px] text-destructive">Exceeds pending ({bagsPending})</p>}
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Total Weight (Auto)</Label><div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm font-bold">{totalWeightReceived > 0 ? `${totalWeightReceived.toLocaleString()} KG` : "—"}</div></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Condition *</Label>
                <Select onValueChange={(v) => form.setValue("conditionCheck", v as any)} value={form.watch("conditionCheck")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Good">Good</SelectItem><SelectItem value="Damaged">Damaged</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Received By *</Label><Input {...form.register("receivedBy")} placeholder="Name of person receiving" />{form.formState.errors.receivedBy && <p className="text-[10px] text-destructive">{form.formState.errors.receivedBy.message}</p>}</div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Remarks</Label><Textarea rows={2} {...form.register("remarks")} placeholder="Quality notes..." /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">Cancel</Button>
          <Button type="submit" disabled={mutation.isPending || !selectedPO} className="min-w-[160px] cursor-pointer">{mutation.isPending ? "Creating..." : "Create Bana GRN"}</Button>
        </div>
      </form>
    </PageContainer>
  );
}
