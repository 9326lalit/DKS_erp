"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Layers,
  Scale
} from "lucide-react";
import { useSizingStore, SizingBatch } from "@/lib/store/use-sizing-store";
import { mastersApiService } from "@/lib/services/masters-api";
import { tanaApiService } from "@/lib/services/tana-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const productionSchema = z.object({
  dateIssuedToSizing: z.string().min(1, "Date required"),
  sizingName: z.string().min(1, "Sizing Mill required"),
  outsourcedPartyName: z.string().optional(),
  poNumber: z.string().min(1, "PO Number required"),
  setNumber: z.string().min(1, "Set Number required"),
  bagsIssued: z.number().min(1, "Bags issued required"),
  weightPerBagKg: z.number().min(1, "Weight per bag required"),
  sizingChemicalAddedKg: z.number().optional(),
  bhimCount: z.number().min(1, "Bhim count required"),
  cutPerBhim: z.number().min(1, "Cut per Bhim required"),
  ratePerKg: z.number().min(0.1, "Rate per kg required"),
  remarks: z.string().optional()
});

type FormValues = z.infer<typeof productionSchema>;

export default function NewSizingProductionEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSet = searchParams?.get("setNumber") || "";

  // Zustand Store
  const { openingStocks, createBatch } = useSizingStore();

  // Queries for Dropdown Data
  const { data: sizingMills = [] } = useQuery({
    queryKey: ["sizingMills"],
    queryFn: () => mastersApiService.getSizingMills()
  });
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: () => mastersApiService.getParties()
  });
  const { data: pos = [] } = useQuery({
    queryKey: ["tana-pos"],
    queryFn: () => tanaApiService.getPOs()
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      dateIssuedToSizing: new Date().toISOString().split("T")[0],
      sizingName: "",
      outsourcedPartyName: "",
      poNumber: "",
      setNumber: preselectedSet || "",
      bagsIssued: 0,
      weightPerBagKg: 0,
      sizingChemicalAddedKg: 0,
      bhimCount: 0,
      cutPerBhim: 0,
      ratePerKg: 0,
      remarks: ""
    }
  });

  // Sync set number details if set changes
  const selectedSetNo = form.watch("setNumber");
  const selectedSetObj = openingStocks.find((s) => s.setNumber === selectedSetNo);

  useEffect(() => {
    if (selectedSetObj) {
      form.setValue("sizingName", selectedSetObj.sizingName);
      form.setValue("poNumber", selectedSetObj.poNumber);
      if (selectedSetObj.totalBags) form.setValue("bagsIssued", selectedSetObj.totalBags);
    }
  }, [selectedSetNo, selectedSetObj, form]);

  // Live calculation variables
  const bagsIssued = form.watch("bagsIssued") || 0;
  const weightPerBag = form.watch("weightPerBagKg") || 0;
  const bhimCount = form.watch("bhimCount") || 0;
  const cutPerBhim = form.watch("cutPerBhim") || 0;
  const ratePerKg = form.watch("ratePerKg") || 0;
  const chemicalKg = form.watch("sizingChemicalAddedKg") || 0;

  const totalYarnIssuedKg = bagsIssued * weightPerBag;
  const totalCuts = bhimCount * cutPerBhim;
  const grossMaterialWithChemical = totalYarnIssuedKg + chemicalKg;
  const sizingChargesRs = totalYarnIssuedKg * ratePerKg;
  const calculatedGainPercent = totalYarnIssuedKg > 0 ? parseFloat(((chemicalKg / totalYarnIssuedKg) * 100).toFixed(1)) : 0;

  const onSubmit = (values: FormValues) => {
    const year = new Date().getFullYear();
    const seq = Date.now() % 10000;
    const batchNumber = `SZ-${year}-${String(seq).padStart(4, "0")}`;

    const newBatch: SizingBatch = {
      id: `BATCH-${Date.now()}`,
      batchNumber,
      dateIssuedToSizing: values.dateIssuedToSizing,
      bagsIssued: values.bagsIssued,
      weightIssuedKg: totalYarnIssuedKg,
      bhimCount: values.bhimCount,
      cutPerBhim: values.cutPerBhim,
      totalCuts,
      totalPipes: values.bhimCount,
      materialUsedKg: totalYarnIssuedKg,
      sizingChemicalAddedKg: values.sizingChemicalAddedKg || 0,
      ratePerKg: values.ratePerKg,
      sizingChargesRs,
      gainPercent: calculatedGainPercent,
      sizingDoneBy: "Outsourced",
      outsourcedPartyName: values.sizingName,
      status: "In Process",
      remarks: values.remarks
    };

    createBatch(newBatch);
    toast.success(`Sizing Production Batch "${batchNumber}" registered successfully!`);
    router.push(`/dashboard/sizing/${newBatch.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="New Sizing Production Entry"
        description="Register a new Sizing Batch, select Sizing Mill & Warp Set Number, calculate beam cuts, chemical gains, and jobwork billing."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing Module", href: "/dashboard/sizing" },
          { title: "New Production Entry" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Production Log
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Mill & Set Selection */}
        <Card className="border-border/40 shadow-xs bg-card">
          <CardHeader className="bg-primary/5 p-4 border-b border-border/30">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              1. Sizing Mill & Warp Set Selection
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select the Sizing Mill agency unit and target Warp Set Number from Open Stock.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Issue Date *</Label>
                <Input type="date" {...form.register("dateIssuedToSizing")} className="h-9 text-xs w-full" />
                {form.formState.errors.dateIssuedToSizing && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.dateIssuedToSizing.message}</p>
                )}
              </div>

              {/* Sizing Mill Dropdown */}
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Sizing Mill / Jobworker *</Label>
                <Select
                  onValueChange={(val) => {
                    form.setValue("sizingName", val);
                    form.setValue("outsourcedPartyName", val);
                  }}
                  value={form.watch("sizingName")}
                >
                  <SelectTrigger className="h-9 text-xs font-semibold w-full min-w-0 truncate">
                    <SelectValue placeholder="Select Sizing Mill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sizingMills.length === 0 ? (
                      <>
                        <SelectItem value="Sumit Sizing Works">Sumit Sizing Works</SelectItem>
                        <SelectItem value="Om Sizing Industries">Om Sizing Industries</SelectItem>
                        <SelectItem value="Vardhman Sizing Works">Vardhman Sizing Works</SelectItem>
                        <SelectItem value="Ichalkaranji Sizing Unit-I">Ichalkaranji Sizing Unit-I</SelectItem>
                      </>
                    ) : (
                      sizingMills.map((mill) => (
                        <SelectItem key={mill.id} value={mill.millName}>
                          {mill.millName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.sizingName && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.sizingName.message}</p>
                )}
              </div>

              {/* Set Number Dropdown */}
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Warp Set Number *</Label>
                <Select
                  onValueChange={(val) => form.setValue("setNumber", val)}
                  value={form.watch("setNumber")}
                >
                  <SelectTrigger className="h-9 text-xs font-mono font-bold text-primary w-full min-w-0 truncate">
                    <SelectValue placeholder="Select Warp Set #..." />
                  </SelectTrigger>
                  <SelectContent>
                    {openingStocks.length === 0 ? (
                      <SelectItem value="SET-100">SET-100 — 40s Cotton Warp</SelectItem>
                    ) : (
                      openingStocks.map((st) => (
                        <SelectItem key={st.id} value={st.setNumber}>
                          {st.setNumber} — {st.itemName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.setNumber && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.setNumber.message}</p>
                )}
              </div>

              {/* Linked PO */}
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Linked PO Number *</Label>
                <Select
                  onValueChange={(val) => form.setValue("poNumber", val)}
                  value={form.watch("poNumber")}
                >
                  <SelectTrigger className="h-9 text-xs font-mono w-full min-w-0 truncate">
                    <SelectValue placeholder="Select Linked PO..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.length === 0 ? (
                      <SelectItem value="TANA/PO/2026/04/05/0001">TANA/PO/2026/04/05/0001</SelectItem>
                    ) : (
                      pos.map((po) => (
                        <SelectItem key={po.id} value={po.poNumber}>
                          {po.poNumber}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.poNumber && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.poNumber.message}</p>
                )}
              </div>
            </div>

            {selectedSetObj && (
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between text-xs gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Selected Set Specs:</span>
                  <span className="font-bold text-foreground">
                    {selectedSetObj.itemName} • {selectedSetObj.totalTaar} Warp Ends (Taar)
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Material Owner:</span>
                    <span className="font-semibold text-foreground">{selectedSetObj.materialOwner}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Available Weight:</span>
                    <span className="font-bold text-emerald-600 font-mono">{selectedSetObj.remainingStockKg} kg</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Yarn Consumption & Bhim Output */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/40 shadow-xs bg-card">
            <CardHeader className="bg-muted/10 p-4 border-b border-border/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                2. Yarn Issue & Bag Weights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bags Issued to Mill *</Label>
                  <Input
                    type="number"
                    placeholder="Enter Bags..."
                    {...form.register("bagsIssued", { valueAsNumber: true })}
                    className="h-9 text-xs font-bold"
                  />
                  {form.formState.errors.bagsIssued && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.bagsIssued.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Weight per Bag (Kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 50"
                    {...form.register("weightPerBagKg", { valueAsNumber: true })}
                    className="h-9 text-xs font-mono font-bold"
                  />
                  {form.formState.errors.weightPerBagKg && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.weightPerBagKg.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sizing Chemical Added (Kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25"
                  {...form.register("sizingChemicalAddedKg", { valueAsNumber: true })}
                  className="h-9 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Added size paste / starch weight for beam sizing strength.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/30 bg-muted/20 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yarn Net Weight:</span>
                  <span className="font-bold font-mono">{totalYarnIssuedKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sizing Chemical Added:</span>
                  <span className="font-bold text-amber-600 font-mono">+{chemicalKg} kg</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-sm text-foreground">
                  <span>Gross Sized Weight:</span>
                  <span className="text-emerald-600 font-mono">{grossMaterialWithChemical} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-xs bg-card">
            <CardHeader className="bg-muted/10 p-4 border-b border-border/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                3. Bhim (Beam) Output & Cut Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bhim (Beam) Count *</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 11"
                    {...form.register("bhimCount", { valueAsNumber: true })}
                    className="h-9 text-xs font-bold"
                  />
                  {form.formState.errors.bhimCount && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.bhimCount.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cuts per Bhim *</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 15"
                    {...form.register("cutPerBhim", { valueAsNumber: true })}
                    className="h-9 text-xs font-bold"
                  />
                  {form.formState.errors.cutPerBhim && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.cutPerBhim.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sizing Rate (₹ / Kg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 5.5"
                  {...form.register("ratePerKg", { valueAsNumber: true })}
                  className="h-9 text-xs font-mono font-bold"
                />
                {form.formState.errors.ratePerKg && (
                  <p className="text-[10px] text-destructive">{form.formState.errors.ratePerKg.message}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cuts Produced:</span>
                  <span className="font-bold text-purple-600 text-sm">{totalCuts} Cuts ({bhimCount} Bhims × {cutPerBhim})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sizing Gain %:</span>
                  <span className="font-bold text-amber-600">+{calculatedGainPercent}% Gain</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-sm text-foreground">
                  <span>Total Sizing Charges:</span>
                  <span className="text-primary text-base font-mono">₹{sizingChargesRs.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 4: Remarks & Submit */}
        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Supervisor Remarks & Sizing Instructions</Label>
              <Textarea
                placeholder="Enter sizing speed, moisture percentage, beam flange instructions..."
                {...form.register("remarks")}
                className="h-20 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold gap-2 cursor-pointer">
                <CheckCircle2 className="h-4 w-4" /> Save Sizing Production Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
