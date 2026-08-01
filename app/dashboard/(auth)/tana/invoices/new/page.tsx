"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  DollarSign,
  ShieldCheck,
  Percent,
  Layers
} from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
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
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  materialType: z.enum(["Tana", "Bana"]),
  piDate: z.string().min(1, "PI Date required"),
  linkedGRNId: z.string().min(1, "Linked GRN is required"),
  supplierInvoiceNo: z.string().min(1, "Supplier invoice number is required"),
  supplierInvoiceDate: z.string().min(1, "Supplier invoice date required"),
  itemDescription: z.string().min(3, "Item description required"),
  hsnCode: z.string(),
  totalWeightKg: z.number().min(0.1, "Weight required"),
  ratePerKg: z.number().min(0.01, "Rate required"),
  taxType: z.enum(["IntraState", "InterState"]),
  cgstPercent: z.number(),
  sgstPercent: z.number(),
  igstPercent: z.number(),
  roundOff: z.number(),
  paymentTermsDays: z.number().min(0),
  paymentStatus: z.enum(["Pending", "Partially Paid", "Paid"]),
  sanctionRemarks: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function NewYarnPIPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [materialType, setMaterialType] = useState<"Tana" | "Bana">("Tana");

  // Queries for Tana & Bana GRNs, POs, and existing PIs
  const { data: tanaGRNs = [] } = useQuery({ queryKey: ["tana-grns"], queryFn: () => tanaApiService.getGRNs() });
  const { data: banaGRNs = [] } = useQuery({ queryKey: ["bana-grns"], queryFn: () => banaApiService.getGRNs() });
  const { data: tanaPOs = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });
  const { data: banaPOs = [] } = useQuery({ queryKey: ["bana-pos"], queryFn: () => banaApiService.getPOs() });
  const { data: tanaPIs = [] } = useQuery({ queryKey: ["tana-pis"], queryFn: () => tanaApiService.getPIs() });
  const { data: banaPIs = [] } = useQuery({ queryKey: ["bana-pis"], queryFn: () => banaApiService.getPIs() });

  const grns = materialType === "Tana" ? tanaGRNs : banaGRNs;
  const pos = materialType === "Tana" ? tanaPOs : banaPOs;
  const existingPIs = materialType === "Tana" ? tanaPIs : banaPIs;

  const [selectedPOId, setSelectedPOId] = useState("");

  const linkedGRNIds = existingPIs.map((pi) => pi.linkedGRNId);
  const availableGRNs = grns.filter((g) => !linkedGRNIds.includes(g.id));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      materialType: "Tana",
      piDate: new Date().toISOString().split("T")[0],
      linkedGRNId: "",
      supplierInvoiceNo: "",
      supplierInvoiceDate: new Date().toISOString().split("T")[0],
      itemDescription: "",
      hsnCode: "5205",
      totalWeightKg: 0,
      ratePerKg: 0,
      taxType: "IntraState",
      cgstPercent: 6,
      sgstPercent: 6,
      igstPercent: 12,
      roundOff: 0,
      paymentTermsDays: 30,
      paymentStatus: "Pending",
      sanctionRemarks: "Sanctioned & verified against physical GRN receipt"
    }
  });

  const handleMaterialTypeChange = (type: "Tana" | "Bana") => {
    setMaterialType(type);
    form.setValue("materialType", type);
    form.setValue("linkedGRNId", "");
    form.setValue("totalWeightKg", 0);
    form.setValue("ratePerKg", 0);
    form.setValue("itemDescription", "");
    setSelectedPOId("");
  };

  const selectedGRNId = form.watch("linkedGRNId");
  const selectedGRN = grns.find((g) => g.id === selectedGRNId);
  const taxType = form.watch("taxType");

  useEffect(() => {
    if (selectedGRN) {
      setSelectedPOId(selectedGRN.linkedPOId);
    }
  }, [selectedGRN]);

  useEffect(() => {
    if (selectedGRN) {
      form.setValue("totalWeightKg", selectedGRN.totalWeightReceived);
      form.setValue(
        "itemDescription",
        `${materialType} (${materialType === "Tana" ? "Warp Yarn" : "Weft Yarn"}) — ${selectedGRN.totalWeightReceived} KG (${selectedGRN.bagsReceivedThisGRN} Bags)`
      );

      const po = pos.find((p) => p.id === selectedGRN.linkedPOId);
      if (po) {
        form.setValue("ratePerKg", po.ratePerKg);
        if (po.hsnCode) form.setValue("hsnCode", po.hsnCode);
      }
    }
  }, [selectedGRNId, pos, selectedGRN, form, materialType]);

  const wt = form.watch("totalWeightKg") || 0;
  const rate = form.watch("ratePerKg") || 0;
  const cgst = form.watch("cgstPercent") || 0;
  const sgst = form.watch("sgstPercent") || 0;
  const igst = form.watch("igstPercent") || 0;
  const roundOff = form.watch("roundOff") || 0;
  const paymentDays = form.watch("paymentTermsDays") || 30;
  const piDate = form.watch("piDate");

  // Multi-Tax calculations
  const taxableAmount = wt * rate;
  const cgstAmount = taxType === "IntraState" ? taxableAmount * (cgst / 100) : 0;
  const sgstAmount = taxType === "IntraState" ? taxableAmount * (sgst / 100) : 0;
  const igstAmount = taxType === "InterState" ? taxableAmount * (igst / 100) : 0;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const netPayable = taxableAmount + totalTax + roundOff;

  const dueDate = piDate
    ? new Date(new Date(piDate).getTime() + paymentDays * 86400000).toISOString().split("T")[0]
    : "";

  const nextSeq = materialType === "Tana" ? tanaPIs.length + 1 : banaPIs.length + 1;
  const autoPINumber = generateDocNumber(materialType === "Tana" ? "TANA-PI" : "BANA-PI", nextSeq);

  const tanaMutation = useMutation({
    mutationFn: (data: any) => tanaApiService.createPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tana-pis"] });
      toast.success(`Tana Purchase Invoice ${autoPINumber} created successfully!`);
      router.push("/dashboard/tana/invoices");
    }
  });

  const banaMutation = useMutation({
    mutationFn: (data: any) => banaApiService.createPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bana-pis"] });
      toast.success(`Bana Purchase Invoice ${autoPINumber} created successfully!`);
      router.push("/dashboard/tana/invoices");
    }
  });

  const onSubmit = (values: FormValues) => {
    const grn = grns.find((g) => g.id === values.linkedGRNId);
    if (!grn) {
      toast.error("Linked GRN not found!");
      return;
    }

    // Duplicate Supplier Invoice Number Check
    const isDuplicateInvoice = existingPIs.some(
      (pi) =>
        pi.supplierName.trim().toLowerCase() === grn.supplierName.trim().toLowerCase() &&
        pi.supplierInvoiceNo.trim().toLowerCase() === values.supplierInvoiceNo.trim().toLowerCase()
    );

    if (isDuplicateInvoice) {
      toast.error(`Duplicate Invoice Error: Invoice '${values.supplierInvoiceNo}' from ${grn.supplierName} already exists!`);
      form.setError("supplierInvoiceNo", {
        type: "manual",
        message: `Supplier Invoice '${values.supplierInvoiceNo}' is already registered for ${grn.supplierName}.`
      });
      return;
    }

    const payload = {
      id: `${values.materialType.toUpperCase()}-PI-ID-${Date.now()}`,
      piNumber: autoPINumber,
      piDate: values.piDate,
      linkedGRNId: grn.id,
      linkedGRNNumber: grn.grnNumber,
      linkedPOId: grn.linkedPOId,
      linkedPONumber: grn.linkedPONumber,
      supplierId: (grn as any).supplierId || "SUP-001",
      supplierName: grn.supplierName,
      supplierInvoiceNo: values.supplierInvoiceNo,
      supplierInvoiceDate: values.supplierInvoiceDate,
      itemDescription: values.itemDescription,
      hsnCode: values.hsnCode,
      totalBags: grn.bagsReceivedThisGRN,
      totalWeightKg: values.totalWeightKg,
      ratePerKg: values.ratePerKg,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgstPercent: values.cgstPercent,
      sgstPercent: values.sgstPercent,
      igstPercent: values.igstPercent,
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      igstAmount: parseFloat(igstAmount.toFixed(2)),
      totalTaxAmount: parseFloat(totalTax.toFixed(2)),
      roundOff: values.roundOff,
      netPayable: parseFloat(netPayable.toFixed(2)),
      amountInWords: numberToWords(Math.round(netPayable)),
      dueDate,
      paymentTermsDays: values.paymentTermsDays,
      paymentStatus: values.paymentStatus,
      sanctionRemarks: values.sanctionRemarks
    };

    if (values.materialType === "Tana") {
      tanaMutation.mutate(payload as any);
    } else {
      banaMutation.mutate(payload as any);
    }
  };

  const isSubmitting = tanaMutation.isPending || banaMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title="Create New Purchase Invoice"
        description="Verify physical GRN receipts and issue official Purchase Invoices for Tana (Warp) or Bana (Weft) Yarn."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Yarn Invoices", href: "/dashboard/tana/invoices" },
          { title: "New Purchase Invoice" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto">
        {/* Section 1: Series & GRN Linking */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">1</Badge>
                  <CardTitle className="text-sm font-bold">Series &amp; Linked GRN Verification</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select Tana (Warp) or Bana (Weft) and choose unbilled physical GRN receipt.
                </p>
              </div>

              {/* Material Type Toggle */}
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
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Unbilled Physical GRN *</Label>
                <Select
                  onValueChange={(val) => form.setValue("linkedGRNId", val)}
                  value={selectedGRNId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={`Select ${materialType} GRN receipt`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGRNs.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.grnNumber} — {g.supplierName} ({g.totalWeightReceived} KG)
                      </SelectItem>
                    ))}
                    {availableGRNs.length === 0 && (
                      <SelectItem value="none" disabled>
                        No unbilled {materialType} GRNs available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.linkedGRNId && (
                  <p className="text-[11px] text-red-500">{form.formState.errors.linkedGRNId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">PI Billing Date *</Label>
                <Input type="date" {...form.register("piDate")} className="h-9 text-xs" />
              </div>
            </div>

            {selectedGRN && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1">
                <span className="font-bold text-primary block">Linked GRN Audit Details:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground pt-1">
                  <div>
                    <span className="block text-[10px]">Supplier:</span>
                    <strong className="text-foreground">{selectedGRN.supplierName}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">PO Reference:</span>
                    <strong className="text-foreground">{selectedGRN.linkedPONumber}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">Bags Received:</span>
                    <strong className="text-foreground">{selectedGRN.bagsReceivedThisGRN} Bags</strong>
                  </div>
                  <div>
                    <span className="block text-[10px]">Net Weight:</span>
                    <strong className="text-emerald-600 font-mono">{selectedGRN.totalWeightReceived} KG</strong>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Supplier Bill Info */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">2</Badge>
              <CardTitle className="text-sm font-bold">Supplier Invoice &amp; Tax Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Supplier Invoice No. *</Label>
                <Input {...form.register("supplierInvoiceNo")} className="h-9 text-xs" placeholder="e.g. INV-99823" />
                {form.formState.errors.supplierInvoiceNo && (
                  <p className="text-[11px] text-red-500">{form.formState.errors.supplierInvoiceNo.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Supplier Invoice Date *</Label>
                <Input type="date" {...form.register("supplierInvoiceDate")} className="h-9 text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GST Tax Structure *</Label>
                <Select
                  onValueChange={(val) => form.setValue("taxType", val as any)}
                  value={taxType}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IntraState">Intra-State (CGST 6% + SGST 6%)</SelectItem>
                    <SelectItem value="InterState">Inter-State (IGST 12%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Weight, Rate & GST Breakdown */}
        <Card className="border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">3</Badge>
                <CardTitle className="text-sm font-bold">Item Details &amp; GST Tax Breakdown</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-primary">
                CGST &amp; SGST Rate Calculator
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Item Description / Yarn Quality *</Label>
                <Input {...form.register("itemDescription")} className="h-9 text-xs font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">HSN / SAC Code</Label>
                <Input {...form.register("hsnCode")} className="h-9 text-xs font-mono" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Net Weight (KG) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("totalWeightKg", { valueAsNumber: true })}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rate (₹ / KG) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("ratePerKg", { valueAsNumber: true })}
                  className="h-9 text-xs font-mono font-bold text-primary"
                  placeholder="280.00"
                />
              </div>

              {taxType === "IntraState" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">CGST Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("cgstPercent", { valueAsNumber: true })}
                      className="h-9 text-xs font-mono text-blue-600 bg-blue-50/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">SGST Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("sgstPercent", { valueAsNumber: true })}
                      className="h-9 text-xs font-mono text-emerald-600 bg-emerald-50/20 font-bold"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold">IGST Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    {...form.register("igstPercent", { valueAsNumber: true })}
                    className="h-9 text-xs font-mono font-bold text-purple-600 bg-purple-50/20"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Calculations Summary Card */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Taxable Gross Amount (Weight × Rate):</span>
                <span className="font-semibold font-mono">₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {taxType === "IntraState" ? (
                <>
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>CGST Amount ({cgst}%):</span>
                    <span className="font-semibold font-mono">₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-emerald-600">
                    <span>SGST Amount ({sgst}%):</span>
                    <span className="font-semibold font-mono">₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-xs text-purple-600">
                  <span>IGST Amount ({igst}%):</span>
                  <span className="font-semibold font-mono">₹{igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Round Off Adjustments:</span>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("roundOff", { valueAsNumber: true })}
                  className="h-7 w-28 text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-primary pt-2 border-t border-border/30">
                <span>Grand Total Net Payable:</span>
                <span className="text-base font-mono font-bold">₹{netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic text-right">
                {numberToWords(Math.round(netPayable))}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Payment Terms & Verification */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-4 bg-muted/5 border-b border-border/10">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">4</Badge>
              <CardTitle className="text-sm font-bold">Payment Due Date &amp; Sanction Remarks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Terms (Days) *</Label>
                <Input
                  type="number"
                  {...form.register("paymentTermsDays", { valueAsNumber: true })}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Calculated Due Date</Label>
                <Input value={dueDate} disabled className="h-9 text-xs font-mono font-bold bg-muted" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Payment Status</Label>
                <Select
                  onValueChange={(val) => form.setValue("paymentStatus", val as any)}
                  value={form.watch("paymentStatus")}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending (Unpaid)</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid in Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sanction Remarks &amp; Internal Directives</Label>
              <Textarea
                {...form.register("sanctionRemarks")}
                placeholder="Enter sanction notes, discount approvals, or quality verification directives..."
                className="h-20 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-9 cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-9 px-8 cursor-pointer font-bold text-sm bg-primary">
            {isSubmitting ? "Generating Purchase Invoice..." : "Submit Purchase Invoice"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
