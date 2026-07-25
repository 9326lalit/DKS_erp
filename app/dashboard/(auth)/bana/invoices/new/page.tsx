"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { banaApiService } from "@/lib/services/bana-api";
import { numberToWords } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  piDate: z.string().min(1), linkedGRNId: z.string().min(1),
  supplierInvoiceNo: z.string().min(1), supplierInvoiceDate: z.string().min(1),
  itemDescription: z.string().min(3), totalWeightKg: z.number().min(0.1),
  ratePerKg: z.number().min(0.01), cgstPercent: z.number(), sgstPercent: z.number(),
  roundOff: z.number(), paymentTermsDays: z.number().min(0),
  paymentStatus: z.enum(["Pending", "Partially Paid", "Paid"])
});

type FormValues = z.infer<typeof schema>;

export default function NewBanaPIPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: grns = [] } = useQuery({ queryKey: ["bana-grns"], queryFn: () => banaApiService.getGRNs() });
  const { data: pos = [] } = useQuery({ queryKey: ["bana-pos"], queryFn: () => banaApiService.getPOs() });
  const { data: existingPIs = [] } = useQuery({ queryKey: ["bana-pis"], queryFn: () => banaApiService.getPIs() });

  const [selectedPOId, setSelectedPOId] = useState("");

  const linkedGRNIds = existingPIs.map(pi => pi.linkedGRNId);
  const availableGRNs = grns.filter(g => !linkedGRNIds.includes(g.id));

  const availablePOs = pos.filter(po =>
    availableGRNs.some(g => g.linkedPOId === po.id)
  );

  const filteredGRNs = selectedPOId
    ? availableGRNs.filter(g => g.linkedPOId === selectedPOId)
    : availableGRNs;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { piDate: new Date().toISOString().split("T")[0], linkedGRNId: "", supplierInvoiceNo: "", supplierInvoiceDate: new Date().toISOString().split("T")[0], itemDescription: "", totalWeightKg: 0, ratePerKg: 0, cgstPercent: 6, sgstPercent: 6, roundOff: 0, paymentTermsDays: 30, paymentStatus: "Pending" }
  });

  const selectedGRNId = form.watch("linkedGRNId");
  const selectedGRN = grns.find(g => g.id === selectedGRNId);

  useEffect(() => {
    if (selectedGRN) {
      setSelectedPOId(selectedGRN.linkedPOId);
    }
  }, [selectedGRN]);

  useEffect(() => {
    if (selectedPOId) {
      const match = availableGRNs.filter(g => g.linkedPOId === selectedPOId);
      if (match.length > 0) {
        if (!match.some(m => m.id === form.getValues("linkedGRNId"))) {
          form.setValue("linkedGRNId", match[0].id);
        }
      } else {
        form.setValue("linkedGRNId", "");
      }
    }
  }, [selectedPOId]);

  useEffect(() => {
    if (selectedGRN) {
      form.setValue("totalWeightKg", selectedGRN.totalWeightReceived);
      form.setValue("itemDescription", `Bana (Weft Yarn) — ${selectedGRN.totalWeightReceived} KG (${selectedGRN.bagsReceivedThisGRN} Bags)`);
      
      const po = pos.find(p => p.id === selectedGRN.linkedPOId);
      if (po) {
        form.setValue("ratePerKg", po.ratePerKg);
      }
    }
  }, [selectedGRNId, pos, selectedGRN, form]);

  const wt = form.watch("totalWeightKg") || 0;
  const rate = form.watch("ratePerKg") || 0;
  const cgst = form.watch("cgstPercent") || 0;
  const sgst = form.watch("sgstPercent") || 0;
  const roundOff = form.watch("roundOff") || 0;
  const paymentDays = form.watch("paymentTermsDays") || 30;
  const piDate = form.watch("piDate");

  const taxableAmount = wt * rate;
  const cgstAmount = taxableAmount * (cgst / 100);
  const sgstAmount = taxableAmount * (sgst / 100);
  const netPayable = taxableAmount + cgstAmount + sgstAmount + roundOff;
  const dueDate = piDate ? new Date(new Date(piDate).getTime() + paymentDays * 86400000).toISOString().split("T")[0] : "";

  const mutation = useMutation({
    mutationFn: (data: any) => banaApiService.createPI(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bana-pis"] }); toast.success("Bana Invoice created!"); router.push("/dashboard/bana/invoices"); }
  });

  const onSubmit = (values: FormValues) => {
    if (!selectedGRN) return;
    const year = new Date().getFullYear();
    const seq = Date.now() % 10000;
    const { linkedGRNId: _linkedGRNId, ...restValues } = values as any;
    mutation.mutate({
      id: `BANA-PI-ID-${Date.now()}`,
      piNumber: `BANA-PI-${year}-${String(seq).padStart(4, "0")}`,
      linkedGRNId: selectedGRN.id, linkedGRNNumber: selectedGRN.grnNumber,
      linkedPOId: selectedGRN.linkedPOId, linkedPONumber: selectedGRN.linkedPONumber,
      supplierName: selectedGRN.supplierName,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      netPayable: parseFloat(netPayable.toFixed(2)),
      amountInWords: numberToWords(Math.round(netPayable)),
      dueDate, ...restValues
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Bana Purchase Invoice"
        description="Generate a Purchase Invoice for Bana (Weft Yarn) with GST breakup. Series: BANA-PI-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Bana Invoices", href: "/dashboard/bana/invoices" }, { title: "New Invoice" }]}
        actions={<Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back</Button>}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10"><CardTitle className="text-sm font-bold">Invoice Header</CardTitle></CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">PI Date *</Label><Input type="date" {...form.register("piDate")} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Purchase Order (PO)</Label>
                <Select onValueChange={(v) => setSelectedPOId(v)} value={selectedPOId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select PO" /></SelectTrigger>
                  <SelectContent>
                    {availablePOs.length === 0 && <SelectItem value="none" disabled>No POs with pending GRNs</SelectItem>}
                    {availablePOs.map(po => (
                      <SelectItem key={po.id} value={po.id}>{po.poNumber} — {po.purchaseFromName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Linked Bana GRN *</Label>
                <Select onValueChange={(v) => form.setValue("linkedGRNId", v)} value={form.watch("linkedGRNId")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select GRN" /></SelectTrigger>
                  <SelectContent>
                    {filteredGRNs.length === 0 && <SelectItem value="none" disabled>Select PO first or no pending GRNs</SelectItem>}
                    {filteredGRNs.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.grnNumber} ({g.bagsReceivedThisGRN} bags, {g.totalWeightReceived} KG)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.linkedGRNId && <p className="text-[10px] text-destructive">{form.formState.errors.linkedGRNId.message}</p>}
              </div>
            </div>

            {selectedGRN && (
              <div className="grid grid-cols-3 gap-4 bg-muted/10 p-3 rounded-lg border border-border/10 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Linked PO Number</span>
                  <span className="font-bold text-foreground">{selectedGRN.linkedPONumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Supplier</span>
                  <span className="font-semibold text-foreground">{selectedGRN.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Received Status</span>
                  <span className="font-semibold text-foreground">{selectedGRN.bagsReceivedThisGRN} Bags ({selectedGRN.totalWeightReceived} KG)</span>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Supplier Invoice No. *</Label><Input {...form.register("supplierInvoiceNo")} placeholder="e.g. SGY/2026/0018" />{form.formState.errors.supplierInvoiceNo && <p className="text-[10px] text-destructive">{form.formState.errors.supplierInvoiceNo.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Supplier Invoice Date *</Label><Input type="date" {...form.register("supplierInvoiceDate")} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Item Description *</Label><Textarea rows={2} {...form.register("itemDescription")} placeholder="e.g. 30s Cotton Weft Yarn — 2000 KG (40 Bags)" /></div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10"><CardTitle className="text-sm font-bold">Invoice Calculation & GST</CardTitle></CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Total Weight (KG) *</Label><Input type="number" step="0.01" {...form.register("totalWeightKg", { valueAsNumber: true })} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Rate per KG (₹) *</Label><Input type="number" step="0.01" {...form.register("ratePerKg", { valueAsNumber: true })} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Taxable Amount (Auto)</Label><div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm font-bold">{taxableAmount > 0 ? `₹${taxableAmount.toLocaleString("en-IN")}` : "—"}</div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">CGST %</Label><Select onValueChange={(v) => form.setValue("cgstPercent", parseFloat(v))} value={String(form.watch("cgstPercent"))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2.5">2.5%</SelectItem><SelectItem value="6">6%</SelectItem><SelectItem value="9">9%</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">SGST %</Label><Select onValueChange={(v) => form.setValue("sgstPercent", parseFloat(v))} value={String(form.watch("sgstPercent"))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2.5">2.5%</SelectItem><SelectItem value="6">6%</SelectItem><SelectItem value="9">9%</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Round Off (±₹)</Label><Input type="number" step="0.01" {...form.register("roundOff", { valueAsNumber: true })} placeholder="0.00" /></div>
            </div>
            {taxableAmount > 0 && (
              <div className="bg-muted/10 rounded-lg border border-border/20 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Taxable Amount</span><span className="font-semibold">₹{taxableAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CGST @ {cgst}%</span><span className="font-semibold">₹{cgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SGST @ {sgst}%</span><span className="font-semibold">₹{sgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Round Off</span><span className="font-semibold">₹{roundOff.toFixed(2)}</span></div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-sm">
                  <span>Grand Total Net Payable</span><span className="text-base text-primary">₹{netPayable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic">{numberToWords(Math.round(netPayable))}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Payment Terms (Days)</Label><Input type="number" {...form.register("paymentTermsDays", { valueAsNumber: true })} placeholder="30" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Due Date (Auto)</Label><div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm font-bold">{dueDate || "—"}</div></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-9 cursor-pointer">Cancel</Button>
          <Button type="submit" disabled={mutation.isPending} className="h-9 cursor-pointer">{mutation.isPending ? "Creating Invoice..." : "Save Invoice"}</Button>
        </div>
      </form>
    </PageContainer>
  );
}
