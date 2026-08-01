"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Layers, CheckCircle2, Calculator } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { generateDocNumber, numberToWords } from "@/lib/store/use-tana-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PAYMENT_TERMS = ["Advance Payment", "Cash on Delivery", "15 Days Credit", "30 Days Credit", "45 Days Credit", "60 Days Credit"];

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  totalBagsOrdered: z.number().min(1, "Qty must be at least 1"),
  perBagWeightKg: z.number().min(0.1, "Weight is required"),
  ratePerKg: z.number().min(0.01, "Rate is required"),
  cgstPercent: z.number().min(0, "CGST % cannot be negative"),
  sgstPercent: z.number().min(0, "SGST % cannot be negative"),
  itemRemarks: z.string().optional()
});

const schema = z.object({
  materialType: z.enum(["Tana", "Bana"]),
  poDate: z.string().min(1, "PO Date is required"),
  purchaseFromId: z.string().min(1, "Supplier is required"),
  purchaseFromName: z.string(),
  purchaseToId: z.string().min(1, "Factory is required"),
  purchaseToName: z.string(),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  remarks: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item row is required")
});

type FormValues = z.infer<typeof schema>;

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [materialType, setMaterialType] = useState<"Tana" | "Bana">("Tana");

  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });
  const { data: tanaPOs = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });
  const { data: banaPOs = [] } = useQuery({ queryKey: ["bana-pos"], queryFn: () => banaApiService.getPOs() });

  const suppliers = parties.filter((p) => p.partyType === "Supplier" && p.activeStatus === "Active");

  // Dynamic PO number calculation based on selected Material Type
  const nextSeq = materialType === "Tana" ? tanaPOs.length + 1 : banaPOs.length + 1;
  const docType = materialType === "Tana" ? "TANA-PO" : "BANA-PO";
  const autoPoNumber = generateDocNumber(docType, nextSeq);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      materialType: "Tana",
      poDate: new Date().toISOString().split("T")[0],
      purchaseFromId: "",
      purchaseFromName: "",
      purchaseToId: "",
      purchaseToName: "",
      deliveryAddress: "",
      expectedDeliveryDate: "",
      paymentTerms: "30 Days Credit",
      remarks: "",
      items: [
        {
          itemName: "40s Cotton Warp Yarn",
          totalBagsOrdered: 10,
          perBagWeightKg: 50,
          ratePerKg: 280,
          cgstPercent: 6,
          sgstPercent: 6,
          itemRemarks: "Raw White Warp Yarn Quality"
        }
      ]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Switch default items when materialType changes
  const handleMaterialTypeChange = (type: "Tana" | "Bana") => {
    setMaterialType(type);
    form.setValue("materialType", type);

    if (type === "Tana") {
      replace([
        {
          itemName: "40s Cotton Warp Yarn",
          totalBagsOrdered: 10,
          perBagWeightKg: 50,
          ratePerKg: 280,
          cgstPercent: 6,
          sgstPercent: 6,
          itemRemarks: "Raw White Warp Yarn"
        }
      ]);
    } else {
      replace([
        {
          itemName: "2/40s PC Weft Yarn",
          totalBagsOrdered: 10,
          perBagWeightKg: 50,
          ratePerKg: 240,
          cgstPercent: 6,
          sgstPercent: 6,
          itemRemarks: "Weft Yarn Quality A1"
        }
      ]);
    }
  };

  const watchedItems = form.watch("items") || [];

  // Calculate row-by-row Item details & CGST / SGST breakdown
  const rowCalculations = watchedItems.map((item) => {
    const qty = Number(item.totalBagsOrdered) || 0;
    const bagWeight = Number(item.perBagWeightKg) || 0;
    const totalWeightKg = qty * bagWeight;
    const rate = Number(item.ratePerKg) || 0;
    const grossAmount = totalWeightKg * rate;

    const cgstPercent = Number(item.cgstPercent) || 0;
    const sgstPercent = Number(item.sgstPercent) || 0;
    const totalGstPercent = cgstPercent + sgstPercent;

    const cgstAmount = grossAmount * (cgstPercent / 100);
    const sgstAmount = grossAmount * (sgstPercent / 100);
    const totalTaxAmount = cgstAmount + sgstAmount;
    const netPayable = grossAmount + totalTaxAmount;

    return {
      totalWeightKg,
      grossAmount,
      cgstPercent,
      sgstPercent,
      totalGstPercent,
      cgstAmount,
      sgstAmount,
      totalTaxAmount,
      netPayable
    };
  });

  // Table Grand Totals
  const grandTotals = rowCalculations.reduce(
    (acc, curr, idx) => {
      acc.totalQty += Number(watchedItems[idx]?.totalBagsOrdered) || 0;
      acc.totalWeight += curr.totalWeightKg;
      acc.subtotalAmount += curr.grossAmount;
      acc.totalCgstAmount += curr.cgstAmount;
      acc.totalSgstAmount += curr.sgstAmount;
      acc.totalGstAmount += curr.totalTaxAmount;
      acc.grandTotal += curr.netPayable;
      return acc;
    },
    { totalQty: 0, totalWeight: 0, subtotalAmount: 0, totalCgstAmount: 0, totalSgstAmount: 0, totalGstAmount: 0, grandTotal: 0 }
  );

  const tanaMutation = useMutation({
    mutationFn: (data: any) => tanaApiService.createPO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pos"] });
      toast.success(`Tana Purchase Order ${autoPoNumber} submitted successfully!`);
      router.push("/dashboard/tana/purchase-orders");
    },
    onError: () => toast.error("Failed to submit Tana PO.")
  });

  const banaMutation = useMutation({
    mutationFn: (data: any) => banaApiService.createPO(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pos"] });
      toast.success(`Bana Purchase Order ${autoPoNumber} submitted successfully!`);
      router.push("/dashboard/tana/purchase-orders");
    },
    onError: () => toast.error("Failed to submit Bana PO.")
  });

  const onSubmit = (values: FormValues) => {
    // Duplicate PO Number Check
    const existingOrders = values.materialType === "Tana" ? tanaPOs : banaPOs;
    const isDuplicatePO = existingOrders.some(
      (p) => p.poNumber.trim().toLowerCase() === autoPoNumber.trim().toLowerCase()
    );

    if (isDuplicatePO) {
      toast.error(`Duplicate PO Error: Order '${autoPoNumber}' already exists! System regenerated next sequential number.`);
      return;
    }

    const formattedItems = values.items.map((item, idx) => {
      const calc = rowCalculations[idx];
      return {
        id: `PO-ITEM-${Date.now()}-${idx}`,
        itemName: item.itemName,
        hsnCode: "5402",
        totalBagsOrdered: item.totalBagsOrdered,
        perBagWeightKg: item.perBagWeightKg,
        totalWeightKg: parseFloat(calc.totalWeightKg.toFixed(2)),
        ratePerKg: item.ratePerKg,
        grossAmount: parseFloat(calc.grossAmount.toFixed(2)),
        cgstPercent: item.cgstPercent,
        sgstPercent: item.sgstPercent,
        cgstAmount: parseFloat(calc.cgstAmount.toFixed(2)),
        sgstAmount: parseFloat(calc.sgstAmount.toFixed(2)),
        totalTaxAmount: parseFloat(calc.totalTaxAmount.toFixed(2)),
        netPayable: parseFloat(calc.netPayable.toFixed(2)),
        itemRemarks: item.itemRemarks || ""
      };
    });

    const primaryItem = formattedItems[0];
    const itemSummary =
      formattedItems.length > 1
        ? `${primaryItem.itemName} (+${formattedItems.length - 1} more)`
        : primaryItem.itemName;

    const poPayload = {
      id: `${values.materialType.toUpperCase()}-PO-ID-${Date.now()}`,
      poNumber: autoPoNumber,
      materialType: values.materialType,
      poDate: values.poDate,
      purchaseFromId: values.purchaseFromId,
      purchaseFromName: values.purchaseFromName,
      purchaseToId: values.purchaseToId,
      purchaseToName: values.purchaseToName,
      deliveryAddress: values.deliveryAddress,
      expectedDeliveryDate: values.expectedDeliveryDate,
      paymentTerms: values.paymentTerms,
      remarks: values.remarks,

      itemName: itemSummary,
      hsnCode: "5402",
      totalBagsOrdered: grandTotals.totalQty,
      perBagWeightKg: primaryItem.perBagWeightKg,
      totalWeightKg: parseFloat(grandTotals.totalWeight.toFixed(2)),
      ratePerKg: primaryItem.ratePerKg,
      grossAmount: parseFloat(grandTotals.subtotalAmount.toFixed(2)),
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: parseFloat(grandTotals.totalCgstAmount.toFixed(2)),
      sgstAmount: parseFloat(grandTotals.totalSgstAmount.toFixed(2)),
      totalTaxAmount: parseFloat(grandTotals.totalGstAmount.toFixed(2)),
      netPayable: parseFloat(grandTotals.grandTotal.toFixed(2)),
      amountInWords: numberToWords(Math.round(grandTotals.grandTotal)),
      items: formattedItems,
      bagsReceivedSoFar: 0,
      status: "Open" as const
    };

    if (values.materialType === "Tana") {
      tanaMutation.mutate(poPayload as any);
    } else {
      banaMutation.mutate(poPayload as any);
    }
  };

  const isSubmitting = tanaMutation.isPending || banaMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title="Create New Purchase Order"
        description="Issue official Yarn Purchase Orders for Tana (Warp Yarn) or Bana (Weft Yarn) with line-item CGST / SGST breakdown."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Yarn POs", href: "/dashboard/tana/purchase-orders" },
          { title: "New PO" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Purchase Orders
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-6xl mx-auto">
        {/* Section 1: PO Header & Material Type Selector */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">1</Badge>
                  <CardTitle className="text-sm font-bold">Material Series &amp; PO Reference</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select Tana (Warp) or Bana (Weft) series to auto-generate PO Number.
                </p>
              </div>

              {/* Material Type Selector Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border border-border/40">
                <Button
                  type="button"
                  variant={materialType === "Tana" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMaterialTypeChange("Tana")}
                  className="h-8 text-xs font-bold cursor-pointer gap-1.5 px-3"
                >
                  {materialType === "Tana" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  Tana (Warp Yarn)
                </Button>
                <Button
                  type="button"
                  variant={materialType === "Bana" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMaterialTypeChange("Bana")}
                  className="h-8 text-xs font-bold cursor-pointer gap-1.5 px-3"
                >
                  {materialType === "Bana" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  Bana (Weft Yarn)
                </Button>
              </div>

              {/* PO Number Badge */}
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded border border-primary/20">
                PO #: {autoPoNumber}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">PO Date *</Label>
                <Input type="date" {...form.register("poDate")} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expected Delivery Date</Label>
                <Input type="date" {...form.register("expectedDeliveryDate")} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Terms *</Label>
                <Select
                  onValueChange={(v) => form.setValue("paymentTerms", v)}
                  value={form.watch("paymentTerms")}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Vendor & Delivery Destination */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">2</Badge>
              <CardTitle className="text-sm font-bold">Supplier &amp; Receiving Factory</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select yarn supplier and receiving factory shed.
            </p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchase From (Supplier) *</Label>
                <Select
                  onValueChange={(v) => {
                    form.setValue("purchaseFromId", v);
                    form.setValue(
                      "purchaseFromName",
                      suppliers.find((s) => s.id === v)?.partyName || ""
                    );
                  }}
                  value={form.watch("purchaseFromId")}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.partyName}</SelectItem>
                    ))}
                    {suppliers.length === 0 && <SelectItem value="p1">Surat Yarn Mills Pvt Ltd</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Purchase To (Factory) *</Label>
                <Select
                  onValueChange={(v) => {
                    const f = factories.find((fact) => fact.id === v);
                    if (f) {
                      form.setValue("purchaseToId", v);
                      form.setValue("purchaseToName", f.factoryName);
                      const addr = [
                        f.plotNo ? `Plot No. ${f.plotNo}` : "",
                        f.addressLine1,
                        f.cityVillage,
                        f.district,
                        f.state,
                        f.pincode ? `PIN - ${f.pincode}` : ""
                      ]
                        .filter(Boolean)
                        .join(", ");
                      form.setValue("deliveryAddress", addr);
                    }
                  }}
                  value={form.watch("purchaseToId")}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select factory" /></SelectTrigger>
                  <SelectContent>
                    {factories.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.factoryName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Delivery Address *</Label>
                <Input {...form.register("deliveryAddress")} className="h-9 text-xs" placeholder="Delivery destination..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Item Details & Live GST Table */}
        <Card className="border-border/40 shadow-sm overflow-hidden border-primary/20">
          <CardHeader className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold">3</Badge>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  Item Details &amp; Live GST Tax Engine
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-background">
                    CGST (6%) + SGST (6%)
                  </Badge>
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Enter item yarn quality, bags count, weight, rate, and line remarks with real-time tax calculation.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() =>
                append({
                  itemName: materialType === "Tana" ? "40s Warp Yarn" : "2/40s PC Weft Yarn",
                  totalBagsOrdered: 1,
                  perBagWeightKg: 50,
                  ratePerKg: 0,
                  cgstPercent: 6,
                  sgstPercent: 6,
                  itemRemarks: ""
                })
              }
              className="h-8 gap-1.5 cursor-pointer text-xs font-bold bg-primary text-primary-foreground shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Item Row
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1250px]">
                <TableHeader className="bg-muted/20">
                  <TableRow className="text-xs font-bold">
                    <TableHead className="w-[220px]">Item Name / Quality</TableHead>
                    <TableHead className="w-[90px] text-center">Bags Qty</TableHead>
                    <TableHead className="w-[95px] text-center">Kg / Bag</TableHead>
                    <TableHead className="w-[100px] text-center">Total Net Wt</TableHead>
                    <TableHead className="w-[110px] text-right">Rate (₹/Kg)</TableHead>
                    <TableHead className="w-[120px] text-right">Gross Subtotal (₹)</TableHead>
                    <TableHead className="w-[85px] text-center">CGST %</TableHead>
                    <TableHead className="w-[85px] text-center">SGST %</TableHead>
                    <TableHead className="w-[110px] text-right">Tax (₹)</TableHead>
                    <TableHead className="w-[130px] text-right">Net Payable (₹)</TableHead>
                    <TableHead className="w-[170px]">Line Remarks / Specs</TableHead>
                    <TableHead className="w-[60px] text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const calc = rowCalculations[index] || {
                      totalWeightKg: 0,
                      grossAmount: 0,
                      cgstPercent: 6,
                      sgstPercent: 6,
                      totalGstPercent: 12,
                      cgstAmount: 0,
                      sgstAmount: 0,
                      totalTaxAmount: 0,
                      netPayable: 0
                    };

                    return (
                      <TableRow key={field.id} className="text-xs hover:bg-muted/10 transition-colors">
                        {/* Item Name */}
                        <TableCell className="p-2">
                          <Input
                            {...form.register(`items.${index}.itemName`)}
                            placeholder={materialType === "Tana" ? "e.g. 40s Warp Yarn" : "e.g. 2/40s PC Weft"}
                            className="h-8 text-xs font-semibold bg-background"
                          />
                        </TableCell>

                        {/* Qty Bags */}
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            {...form.register(`items.${index}.totalBagsOrdered`, { valueAsNumber: true })}
                            className="h-8 text-xs text-center font-bold font-mono bg-background"
                          />
                        </TableCell>

                        {/* Weight per Bag */}
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.1"
                            {...form.register(`items.${index}.perBagWeightKg`, { valueAsNumber: true })}
                            className="h-8 text-xs text-center font-mono bg-background"
                            placeholder="50"
                          />
                        </TableCell>

                        {/* Computed Net Weight */}
                        <TableCell className="p-2 text-center">
                          <Badge variant="secondary" className="px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                            {calc.totalWeightKg.toLocaleString()} KG
                          </Badge>
                        </TableCell>

                        {/* Rate */}
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.ratePerKg`, { valueAsNumber: true })}
                            className="h-8 text-xs text-right font-mono font-bold text-primary bg-background"
                            placeholder="280.00"
                          />
                        </TableCell>

                        {/* Gross Subtotal */}
                        <TableCell className="p-2 text-right font-mono font-bold text-foreground">
                          ₹{calc.grossAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* CGST % */}
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.5"
                            {...form.register(`items.${index}.cgstPercent`, { valueAsNumber: true })}
                            className="h-8 text-xs text-center font-mono font-bold text-blue-600 bg-blue-50/30 border-blue-200"
                            placeholder="6"
                          />
                        </TableCell>

                        {/* SGST % */}
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            step="0.5"
                            {...form.register(`items.${index}.sgstPercent`, { valueAsNumber: true })}
                            className="h-8 text-xs text-center font-mono font-bold text-emerald-600 bg-emerald-50/30 border-emerald-200"
                            placeholder="6"
                          />
                        </TableCell>

                        {/* Tax Amount (CGST + SGST) */}
                        <TableCell className="p-2 text-right font-mono">
                          <span className="block text-[11px] font-bold text-foreground">
                            ₹{calc.totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[9px] text-muted-foreground font-sans">
                            ({calc.totalGstPercent}%)
                          </span>
                        </TableCell>

                        {/* Total Net */}
                        <TableCell className="p-2 text-right font-mono font-bold text-sm text-primary">
                          ₹{calc.netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Item Remarks / Notes */}
                        <TableCell className="p-2">
                          <Input
                            {...form.register(`items.${index}.itemRemarks`)}
                            placeholder="e.g. Raw White, Semi-Dull..."
                            className="h-8 text-xs bg-background"
                          />
                        </TableCell>

                        {/* Delete Action */}
                        <TableCell className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            title={fields.length === 1 ? "At least one item row is required" : "Delete Item Row"}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* STRUCTURED TAX & FINANCIAL SUMMARY GRID */}
            <div className="p-4 bg-muted/15 border-t border-border/20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-card rounded-xl border border-border/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Total Bags &amp; Net Weight
                </span>
                <p className="text-base font-bold font-mono mt-1 text-foreground">
                  {grandTotals.totalQty} Bags ({grandTotals.totalWeight.toLocaleString()} KG)
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Physical Goods Total</p>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Gross Taxable Subtotal
                </span>
                <p className="text-base font-bold font-mono mt-1 text-foreground">
                  ₹{grandTotals.subtotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Before GST Taxes</p>
              </div>

              <div className="p-3 bg-card rounded-xl border border-border/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  CGST &amp; SGST Tax Breakdown
                </span>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-blue-600 font-bold">CGST (6%):</span>
                  <span className="font-bold text-foreground">₹{grandTotals.totalCgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-emerald-600 font-bold">SGST (6%):</span>
                  <span className="font-bold text-foreground">₹{grandTotals.totalSgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded-xl border border-primary/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Grand Total Net Payable
                </span>
                <p className="text-lg font-bold font-mono text-primary mt-1">
                  ₹{grandTotals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground italic truncate mt-0.5 font-medium">
                  {numberToWords(Math.round(grandTotals.grandTotal))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remarks Card & Submit */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3 bg-muted/5 border-b border-border/10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Master Order Remarks &amp; Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Textarea
              {...form.register("remarks")}
              placeholder="Enter overall PO terms, transport remarks, or yarn quality directives..."
              className="h-20 text-xs"
            />
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-9 cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-9 px-8 cursor-pointer font-bold text-sm bg-primary">
            {isSubmitting ? "Submitting Purchase Order..." : "Submit Purchase Order"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
