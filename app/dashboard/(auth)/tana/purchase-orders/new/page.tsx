"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Calculator } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { mastersApiService } from "@/lib/services/masters-api";
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

const HSN_RATES = [
  { hsn: "5402", desc: "Synthetic filament yarn (Warp)", cgst: 6, sgst: 6 },
  { hsn: "5205", desc: "Cotton yarn (single combed)", cgst: 6, sgst: 6 },
  { hsn: "5206", desc: "Cotton yarn (multiple ply)", cgst: 6, sgst: 6 },
  { hsn: "5509", desc: "Yarn of synthetic staple fibres", cgst: 6, sgst: 6 },
  { hsn: "5510", desc: "Yarn of artificial staple fibres", cgst: 6, sgst: 6 }
];

const PAYMENT_TERMS = ["Advance Payment", "Cash on Delivery", "15 Days Credit", "30 Days Credit", "45 Days Credit", "60 Days Credit"];

const schema = z.object({
  poDate: z.string().min(1, "PO Date is required"),
  purchaseFromId: z.string().min(1, "Supplier is required"),
  purchaseFromName: z.string(),
  purchaseToId: z.string().min(1, "Buyer is required"),
  purchaseToName: z.string(),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  remarks: z.string().optional(),
  itemName: z.string().min(2, "Item name is required"),
  hsnCode: z.string().min(4, "HSN Code is required"),
  totalBagsOrdered: z.number().min(1, "Bags must be at least 1"),
  perBagWeightKg: z.number().min(0.1, "Per bag weight is required"),
  ratePerKg: z.number().min(0.01, "Rate is required"),
  cgstPercent: z.number(),
  sgstPercent: z.number()
});

type FormValues = z.infer<typeof schema>;

export default function NewTanaPOPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const suppliers = parties.filter(p => p.partyType === "Supplier" && p.activeStatus === "Active");
  const buyers = parties.filter(p => p.partyType === "Buyer" && p.activeStatus === "Active");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      poDate: new Date().toISOString().split("T")[0],
      purchaseFromId: "", purchaseFromName: "",
      purchaseToId: "", purchaseToName: "",
      deliveryAddress: "", expectedDeliveryDate: "",
      paymentTerms: "30 Days Credit", remarks: "",
      itemName: "40s Cotton Warp Yarn", hsnCode: "5402",
      totalBagsOrdered: 0, perBagWeightKg: 50,
      ratePerKg: 0, cgstPercent: 6, sgstPercent: 6
    }
  });

  const bags = form.watch("totalBagsOrdered") || 0;
  const perBagWeight = form.watch("perBagWeightKg") || 0;
  const rate = form.watch("ratePerKg") || 0;
  const cgst = form.watch("cgstPercent") || 0;
  const sgst = form.watch("sgstPercent") || 0;

  const totalWeightKg = bags * perBagWeight;
  const grossAmount = totalWeightKg * rate;
  const cgstAmount = grossAmount * (cgst / 100);
  const sgstAmount = grossAmount * (sgst / 100);
  const totalTax = cgstAmount + sgstAmount;
  const netPayable = grossAmount + totalTax;

  const { data: existingPOs = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });

  const mutation = useMutation({
    mutationFn: (data: any) => tanaApiService.createPO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pos"] });
      toast.success("Tana Purchase Order created successfully!");
      router.push("/dashboard/tana/purchase-orders");
    },
    onError: () => toast.error("Failed to create PO. Please try again.")
  });

  const onSubmit = (values: FormValues) => {
    const seq = existingPOs.length + 1;
    const year = new Date().getFullYear();
    const poNumber = `TANA-PO-${year}-${String(seq).padStart(4, "0")}`;

    mutation.mutate({
      id: `TANA-PO-ID-${Date.now()}`,
      poNumber,
      materialType: "Tana" as const,
      ...values,
      totalWeightKg: parseFloat(totalWeightKg.toFixed(2)),
      grossAmount: parseFloat(grossAmount.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      totalTaxAmount: parseFloat(totalTax.toFixed(2)),
      netPayable: parseFloat(netPayable.toFixed(2)),
      amountInWords: numberToWords(Math.round(netPayable)),
      bagsReceivedSoFar: 0,
      status: "Open" as const
    });
  };

  const handleHSNChange = (hsn: string) => {
    const found = HSN_RATES.find(h => h.hsn === hsn);
    if (found) {
      form.setValue("hsnCode", hsn);
      form.setValue("cgstPercent", found.cgst);
      form.setValue("sgstPercent", found.sgst);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Tana Purchase Order"
        description="Raise a new Purchase Order for Tana (Warp Yarn). Document number will be auto-generated in TANA-PO-YYYY-NNNN format."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Tana POs", href: "/dashboard/tana/purchase-orders" },
          { title: "New PO" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* PO Header */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <CardTitle className="text-sm font-bold">Purchase Order Header</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">PO Date *</Label>
                <Input type="date" {...form.register("poDate")} />
                {form.formState.errors.poDate && <p className="text-[10px] text-destructive">{form.formState.errors.poDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expected Delivery Date</Label>
                <Input type="date" {...form.register("expectedDeliveryDate")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Terms *</Label>
                <Select onValueChange={(v) => form.setValue("paymentTerms", v)} value={form.watch("paymentTerms")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchase From (Supplier) *</Label>
                <Select onValueChange={(v) => { form.setValue("purchaseFromId", v); form.setValue("purchaseFromName", suppliers.find(s => s.id === v)?.partyName || ""); }} value={form.watch("purchaseFromId")}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.partyName}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.purchaseFromId && <p className="text-[10px] text-destructive">{form.formState.errors.purchaseFromId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchase To (Buyer / Own Firm) *</Label>
                <Select onValueChange={(v) => { form.setValue("purchaseToId", v); form.setValue("purchaseToName", buyers.find(b => b.id === v)?.partyName || ""); }} value={form.watch("purchaseToId")}>
                  <SelectTrigger><SelectValue placeholder="Select buyer" /></SelectTrigger>
                  <SelectContent>{buyers.map(b => <SelectItem key={b.id} value={b.id}>{b.partyName}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.purchaseToId && <p className="text-[10px] text-destructive">{form.formState.errors.purchaseToId.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Delivery Address *</Label>
              <Textarea rows={2} {...form.register("deliveryAddress")} placeholder="Full delivery address of the factory / godown" />
              {form.formState.errors.deliveryAddress && <p className="text-[10px] text-destructive">{form.formState.errors.deliveryAddress.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks / Instructions</Label>
              <Textarea rows={2} {...form.register("remarks")} placeholder="Additional notes for supplier..." />
            </div>
          </CardContent>
        </Card>

        {/* Line Items & Tax */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <CardTitle className="text-sm font-bold">Item Details & GST Calculation</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Item Name / Yarn Quality *</Label>
                <Input {...form.register("itemName")} placeholder="e.g. 40s Cotton Warp Yarn" />
                {form.formState.errors.itemName && <p className="text-[10px] text-destructive">{form.formState.errors.itemName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">HSN Code *</Label>
                <Select onValueChange={handleHSNChange} value={form.watch("hsnCode")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HSN_RATES.map(h => <SelectItem key={h.hsn} value={h.hsn}>{h.hsn} — {h.desc}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Bags Ordered *</Label>
                <Input type="number" {...form.register("totalBagsOrdered", { valueAsNumber: true })} placeholder="e.g. 50" />
                {form.formState.errors.totalBagsOrdered && <p className="text-[10px] text-destructive">{form.formState.errors.totalBagsOrdered.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Per Bag Weight (KG) *</Label>
                <Input type="number" step="0.01" {...form.register("perBagWeightKg", { valueAsNumber: true })} placeholder="e.g. 50" />
                {form.formState.errors.perBagWeightKg && <p className="text-[10px] text-destructive">{form.formState.errors.perBagWeightKg.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Weight KG (Auto)</Label>
                <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30 text-sm font-bold">{totalWeightKg > 0 ? `${totalWeightKg.toLocaleString()} KG` : "—"}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate per KG (₹) *</Label>
                <Input type="number" step="0.01" {...form.register("ratePerKg", { valueAsNumber: true })} placeholder="e.g. 245.00" />
                {form.formState.errors.ratePerKg && <p className="text-[10px] text-destructive">{form.formState.errors.ratePerKg.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CGST %</Label>
                <Select onValueChange={(v) => form.setValue("cgstPercent", parseFloat(v))} value={String(form.watch("cgstPercent"))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.5">2.5%</SelectItem>
                    <SelectItem value="6">6%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">SGST % (= CGST intra-state)</Label>
                <Select onValueChange={(v) => form.setValue("sgstPercent", parseFloat(v))} value={String(form.watch("sgstPercent"))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.5">2.5%</SelectItem>
                    <SelectItem value="6">6%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-calculated Summary */}
            {grossAmount > 0 && (
              <div className="bg-muted/10 rounded-lg border border-border/20 p-4 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 mb-3">
                  <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Auto-Computed Tax Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Amount</span><span className="font-semibold">₹{grossAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CGST @ {cgst}%</span><span className="font-semibold">₹{cgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SGST @ {sgst}%</span><span className="font-semibold">₹{sgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Tax</span><span className="font-semibold">₹{totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-bold">
                  <span>Net Payable</span>
                  <span className="text-foreground text-base">₹{netPayable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic mt-1">{numberToWords(Math.round(netPayable))}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">Cancel</Button>
          <Button type="submit" disabled={mutation.isPending} className="min-w-[160px] cursor-pointer">
            {mutation.isPending ? "Creating PO..." : "Create Tana Purchase Order"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
