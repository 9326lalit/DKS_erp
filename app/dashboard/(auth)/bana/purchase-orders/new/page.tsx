"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Calculator, Plus } from "lucide-react";
import { banaApiService } from "@/lib/services/bana-api";
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

const HSN_RATES_BANA = [
  { hsn: "5205", desc: "Cotton yarn single (Weft)", cgst: 6, sgst: 6 },
  { hsn: "5206", desc: "Cotton yarn multiple ply", cgst: 6, sgst: 6 },
  { hsn: "5402", desc: "Synthetic filament yarn", cgst: 6, sgst: 6 },
  { hsn: "5509", desc: "Yarn of synthetic staple fibres", cgst: 6, sgst: 6 }
];

const PAYMENT_TERMS = ["Advance Payment", "Cash on Delivery", "15 Days Credit", "30 Days Credit", "45 Days Credit", "60 Days Credit"];

const schema = z.object({
  poDate: z.string().min(1),
  purchaseFromId: z.string().min(1),
  purchaseFromName: z.string(),
  purchaseToId: z.string().min(1),
  purchaseToName: z.string(),
  deliveryAddress: z.string().min(5),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().min(1),
  remarks: z.string().optional(),
  items: z.array(z.object({
    itemName: z.string().min(2),
    hsnCode: z.string().min(4),
    totalBagsOrdered: z.number().min(1),
    perBagWeightKg: z.number().min(0.1),
    ratePerKg: z.number().min(0.01)
  })).min(1)
});

type FormValues = z.infer<typeof schema>;

export default function NewBanaPOPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });
  const suppliers = parties.filter(p => p.partyType === "Supplier" && p.activeStatus === "Active");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      poDate: new Date().toISOString().split("T")[0],
      purchaseFromId: "", purchaseFromName: "",
      purchaseToId: "", purchaseToName: "",
      deliveryAddress: "", paymentTerms: "30 Days Credit",
      items: [
        { itemName: "30s Cotton Weft Yarn", hsnCode: "5205", totalBagsOrdered: 10, perBagWeightKg: 50, ratePerKg: 260 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch("items") || [];

  const computedItems = watchedItems.map(item => {
    const bags = item.totalBagsOrdered || 0;
    const perBagWeight = item.perBagWeightKg || 0;
    const rate = item.ratePerKg || 0;

    const totalWeightKg = bags * perBagWeight;
    const grossAmount = totalWeightKg * rate;
    const totalTaxAmount = 0;
    const netPayable = grossAmount;

    return {
      totalWeightKg,
      grossAmount,
      totalTaxAmount,
      netPayable
    };
  });

  const totals = {
    totalBagsOrdered: 0,
    totalWeightKg: 0,
    grossAmount: 0,
    totalTaxAmount: 0,
    netPayable: 0
  };

  computedItems.forEach((item, idx) => {
    totals.totalBagsOrdered += watchedItems[idx]?.totalBagsOrdered || 0;
    totals.totalWeightKg += item.totalWeightKg;
    totals.grossAmount += item.grossAmount;
    totals.totalTaxAmount += item.totalTaxAmount;
    totals.netPayable += item.netPayable;
  });

  const mutation = useMutation({
    mutationFn: (data: any) => banaApiService.createPO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pos"] });
      toast.success("Bana PO created!");
      router.push("/dashboard/bana/purchase-orders");
    }
  });

  const onSubmit = (values: FormValues) => {
    const year = new Date().getFullYear();
    const seq = Date.now() % 10000;

    const finalItems = values.items.map((item, idx) => {
      const computed = computedItems[idx];
      return {
        id: `BANA-PO-ITEM-${Date.now()}-${idx}`,
        ...item,
        totalWeightKg: parseFloat(computed.totalWeightKg.toFixed(2)),
        grossAmount: parseFloat(computed.grossAmount.toFixed(2)),
        cgstPercent: 0,
        sgstPercent: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalTaxAmount: 0,
        netPayable: parseFloat(computed.netPayable.toFixed(2))
      };
    });

    const primaryItem = finalItems[0];
    const itemSummaryName = finalItems.length > 1
      ? `${primaryItem.itemName} (+ ${finalItems.length - 1} more)`
      : primaryItem.itemName;

    mutation.mutate({
      id: `BANA-PO-ID-${Date.now()}`,
      poNumber: `BANA-PO-${year}-${String(seq).padStart(4, "0")}`,
      materialType: "Bana" as const,
      poDate: values.poDate,
      purchaseFromId: values.purchaseFromId,
      purchaseFromName: values.purchaseFromName,
      purchaseToId: values.purchaseToId,
      purchaseToName: values.purchaseToName,
      deliveryAddress: values.deliveryAddress,
      expectedDeliveryDate: values.expectedDeliveryDate,
      paymentTerms: values.paymentTerms,
      remarks: values.remarks,

      itemName: itemSummaryName,
      hsnCode: primaryItem.hsnCode,
      totalBagsOrdered: totals.totalBagsOrdered,
      perBagWeightKg: primaryItem.perBagWeightKg,
      totalWeightKg: parseFloat(totals.totalWeightKg.toFixed(2)),
      ratePerKg: primaryItem.ratePerKg,
      grossAmount: parseFloat(totals.grossAmount.toFixed(2)),
      cgstPercent: 0,
      sgstPercent: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalTaxAmount: 0,
      netPayable: parseFloat(totals.netPayable.toFixed(2)),
      amountInWords: numberToWords(Math.round(totals.netPayable)),
      items: finalItems,
      bagsReceivedSoFar: 0,
      status: "Open" as const
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Create Bana Purchase Order"
        description="Raise a new Purchase Order for Bana (Weft Yarn). Series: BANA-PO-YYYY-NNNN."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard/default" }, { title: "Bana POs", href: "/dashboard/bana/purchase-orders" }, { title: "New PO" }]}
        actions={<Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back</Button>}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10"><CardTitle className="text-sm font-bold">PO Header</CardTitle></CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">PO Date *</Label><Input type="date" {...form.register("poDate")} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Expected Delivery Date</Label><Input type="date" {...form.register("expectedDeliveryDate")} /></div>
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
                <Label className="text-xs font-semibold">Purchase To (Factory) *</Label>
                <Select
                  onValueChange={(v) => {
                    const f = factories.find(fact => fact.id === v);
                    if (f) {
                      form.setValue("purchaseToId", v);
                      form.setValue("purchaseToName", f.factoryName);
                      const addr = [
                        f.plotNo ? `Plot No. ${f.plotNo}` : "",
                        f.addressLine1,
                        f.addressLine2,
                        f.cityVillage,
                        f.district,
                        f.state,
                        f.pincode ? `PIN - ${f.pincode}` : ""
                      ].filter(Boolean).join(", ");
                      form.setValue("deliveryAddress", addr);
                    }
                  }}
                  value={form.watch("purchaseToId")}
                >
                  <SelectTrigger><SelectValue placeholder="Select factory" /></SelectTrigger>
                  <SelectContent>{factories.map(f => <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.purchaseToId && <p className="text-[10px] text-destructive">{form.formState.errors.purchaseToId.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Delivery Address *</Label><Textarea rows={2} {...form.register("deliveryAddress")} placeholder="Factory delivery address" /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Remarks</Label><Textarea rows={2} {...form.register("remarks")} placeholder="Additional notes..." /></div>
          </CardContent>
        </Card>

        {/* Dynamic Line Items */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-bold">Item Details</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemName: "", hsnCode: "5205", totalBagsOrdered: 0, perBagWeightKg: 50, ratePerKg: 0 })}
              className="h-8 gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="h-3 w-3" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {fields.map((field, index) => {
              const item = computedItems[index] || { totalWeightKg: 0, grossAmount: 0, netPayable: 0 };
              return (
                <div key={field.id} className="border border-border/60 rounded-lg p-4 bg-muted/5 space-y-4 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-muted-foreground">Item #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/5 cursor-pointer"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Item Name *</Label>
                      <Input {...form.register(`items.${index}.itemName`)} placeholder="e.g. 30s Cotton Weft Yarn" />
                      {form.formState.errors.items?.[index]?.itemName && (
                        <p className="text-[10px] text-destructive">{form.formState.errors.items[index]?.itemName?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">HSN Code *</Label>
                      <Select
                        onValueChange={(v) => {
                          form.setValue(`items.${index}.hsnCode`, v);
                        }}
                        value={form.watch(`items.${index}.hsnCode`)}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HSN_RATES_BANA.map(h => (
                            <SelectItem key={h.hsn} value={h.hsn}>{h.hsn} — {h.desc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Total Bags Ordered *</Label>
                      <Input type="number" {...form.register(`items.${index}.totalBagsOrdered`, { valueAsNumber: true })} placeholder="e.g. 50" />
                      {form.formState.errors.items?.[index]?.totalBagsOrdered && (
                        <p className="text-[10px] text-destructive">{form.formState.errors.items[index]?.totalBagsOrdered?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Per Bag Weight (KG) *</Label>
                      <Input type="number" step="0.01" {...form.register(`items.${index}.perBagWeightKg`, { valueAsNumber: true })} placeholder="e.g. 50" />
                      {form.formState.errors.items?.[index]?.perBagWeightKg && (
                        <p className="text-[10px] text-destructive">{form.formState.errors.items[index]?.perBagWeightKg?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Rate per KG (₹) *</Label>
                      <Input type="number" step="0.01" {...form.register(`items.${index}.ratePerKg`, { valueAsNumber: true })} placeholder="e.g. 245.00" />
                      {form.formState.errors.items?.[index]?.ratePerKg && (
                        <p className="text-[10px] text-destructive">{form.formState.errors.items[index]?.ratePerKg?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Total Weight (Auto)</Label>
                      <div className="h-9 px-3 flex items-center rounded-md border bg-muted/20 text-xs font-bold">
                        {item.totalWeightKg > 0 ? `${item.totalWeightKg.toLocaleString()} KG` : "—"}
                      </div>
                    </div>
                  </div>

                  {item.grossAmount > 0 && (
                    <div className="flex gap-4 justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground font-medium">
                      <span>Gross Amount: ₹{item.grossAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                      <span className="font-bold text-foreground">Net Value: ₹{item.netPayable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Auto-calculated Combined Summary */}
            {totals.grossAmount > 0 && (
              <div className="bg-muted/10 rounded-lg border border-border/20 p-4 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Total Summary (Auto-Computed)</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Combined Gross Amount</span><span className="font-semibold">₹{totals.grossAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Bags / Weight</span><span className="font-semibold">{totals.totalBagsOrdered} Bags / {totals.totalWeightKg.toLocaleString()} KG</span></div>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-bold text-foreground">
                  <span>Grand Total Net Payable</span>
                  <span className="text-base text-primary">₹{totals.netPayable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic mt-1">{numberToWords(Math.round(totals.netPayable))}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Submission */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-9 cursor-pointer">Cancel</Button>
          <Button type="submit" disabled={mutation.isPending} className="h-9 cursor-pointer">
            {mutation.isPending ? "Creating PO..." : "Save Purchase Order"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
