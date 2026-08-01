"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Scale,
  Sparkles,
  Wand2,
  FileText,
  Layers,
  Scissors
} from "lucide-react";

import { useSizingStore, OpeningStockEntry } from "@/lib/store/use-sizing-store";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const openStockSchema = z.object({
  date: z.string().min(1, "Date required"),
  sizingName: z.string().min(1, "Sizing Mill Name required"),
  materialOwner: z.string().min(1, "Material Owner required"),
  poNumber: z.string().min(1, "PO Number required"),
  tanaNumber: z.string().min(1, "Tana Number required"),
  itemName: z.string().min(1, "Item Name required"),
  totalBags: z.number().min(1, "Total Bags must be at least 1"),
  totalWeightKg: z.number().min(1, "Total Weight required"),
  setNumber: z.string().min(1, "Set Number required"),
  totalTaar: z.number().min(1, "Total Taar required"),
  totalPipes: z.number().min(1, "Total Pipes required"),
  weightPerPipeKg: z.number().min(0.1, "Weight per Pipe required"),
  materialUsedKg: z.number().min(0, "Used weight required"),
  sizingChemicalAddedKg: z.number().optional(),
  remarks: z.string().optional()
});

type OpenStockFormValues = z.infer<typeof openStockSchema>;

export default function NewOpenStockEntryPage() {
  const router = useRouter();
  const { createOpeningStock } = useSizingStore();

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

  const defaultSizingName = sizingMills[0]?.millName || "Sumit Sizing Works";
  const defaultOwner = parties[0]?.partyName || "Dhandai Textiles (Own Firm)";
  const defaultPO = pos[0]?.poNumber || "TANA/PO/2026/04/05/0001";

  const form = useForm<OpenStockFormValues>({
    resolver: zodResolver(openStockSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sizingName: defaultSizingName,
      materialOwner: defaultOwner,
      poNumber: defaultPO,
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      totalBags: 10,
      totalWeightKg: 500,
      setNumber: `SET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      totalTaar: 2800,
      totalPipes: 11,
      weightPerPipeKg: 33,
      materialUsedKg: 0,
      sizingChemicalAddedKg: 15,
      remarks: "Opening raw yarn set registered in Master Admin"
    }
  });

  const watchedSetNumber = form.watch("setNumber");
  const watchedSizingName = form.watch("sizingName");
  const watchedOwner = form.watch("materialOwner");
  const watchedItemName = form.watch("itemName");
  const watchedTotalBags = form.watch("totalBags") || 0;
  const watchedTotalWeight = form.watch("totalWeightKg") || 0;
  const watchedTotalTaar = form.watch("totalTaar") || 0;
  const watchedTotalPipes = form.watch("totalPipes") || 0;
  const watchedWeightPerPipe = form.watch("weightPerPipeKg") || 0;
  const watchedPONumber = form.watch("poNumber");

  const handleAutoFillFromPO = (poNo: string) => {
    form.setValue("poNumber", poNo);
    const targetPO = pos.find((p) => p.poNumber === poNo);
    if (targetPO) {
      if (targetPO.itemName) form.setValue("itemName", targetPO.itemName);
      if (targetPO.totalBagsOrdered) form.setValue("totalBags", targetPO.totalBagsOrdered);
      if (targetPO.totalWeightKg) form.setValue("totalWeightKg", targetPO.totalWeightKg);
      if (targetPO.purchaseFromName) form.setValue("materialOwner", targetPO.purchaseFromName);

      const pipesCount = form.getValues("totalPipes") || 11;
      if (targetPO.totalWeightKg && pipesCount) {
        form.setValue("weightPerPipeKg", parseFloat((targetPO.totalWeightKg / pipesCount).toFixed(1)));
      }

      toast.info(`Auto-filled specs from PO ${poNo}: ${targetPO.itemName || ""} (${targetPO.totalWeightKg} kg)`);
    }
  };

  const onSubmit = (values: OpenStockFormValues) => {
    // Strict Duplicate Set Number Validation
    const existingStocks = useSizingStore.getState().openingStocks;
    const isDuplicateSet = existingStocks.some(
      (s) => s.setNumber.trim().toLowerCase() === values.setNumber.trim().toLowerCase()
    );

    if (isDuplicateSet) {
      toast.error(`Duplicate Set Number Error: Set '${values.setNumber}' already exists!`);
      form.setError("setNumber", {
        type: "manual",
        message: `Set Number '${values.setNumber}' is already registered. Duplicate Set Numbers are strictly prohibited.`
      });
      return;
    }

    const totalSetWeight = values.totalPipes * values.weightPerPipeKg;
    const remaining = values.totalWeightKg - values.materialUsedKg;

    const newStock: OpeningStockEntry = {
      id: `OPEN-STOCK-${Date.now()}`,
      date: values.date,
      sizingName: values.sizingName,
      materialOwner: values.materialOwner,
      poNumber: values.poNumber,
      tanaNumber: values.tanaNumber,
      itemName: values.itemName,
      totalBags: values.totalBags,
      totalWeightKg: values.totalWeightKg,
      setNumber: values.setNumber,
      totalTaar: values.totalTaar,
      totalPipes: values.totalPipes,
      weightPerPipeKg: values.weightPerPipeKg,
      totalSetWeightKg: totalSetWeight,
      materialUsedKg: values.materialUsedKg,
      sizingChemicalAddedKg: values.sizingChemicalAddedKg || 0,
      remainingStockKg: remaining,
      remarks: values.remarks
    };

    createOpeningStock(newStock);
    toast.success(`Open Stock Set "${values.setNumber}" registered successfully!`);
    router.push("/dashboard/masters/open-stock");
  };

  return (
    <PageContainer>
      <PageHeader
        title="New Open Stock Registration"
        description="Register a new Tana (Warp) Open Stock Set with Sizing Mill allocation, pipe breakdown, and yarn ends."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Open Stock Master", href: "/dashboard/masters/open-stock" },
          { title: "New Entry" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Master
          </Button>
        }
      />

      <Card className="border-border/40 shadow-sm bg-card max-w-5xl mx-auto">
        <CardHeader className="bg-primary/5 p-5 border-b border-border/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Master Admin Open Stock Registration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Fill in warp specs below. Auto-fill from Purchase Orders is supported.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              Full Page Registration
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Building2 className="h-4 w-4" /> 1. Set Identification & Sizing Mill
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Stock Entry Date *</Label>
                  <Input type="date" {...form.register("date")} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Set Number *</Label>
                  <Input
                    placeholder="e.g. SET-2026-105"
                    {...form.register("setNumber")}
                    className="font-mono font-bold text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Sizing Mill Name *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("sizingName", val)}
                    value={form.watch("sizingName")}
                  >
                    <SelectTrigger className="h-9 truncate">
                      <SelectValue placeholder="Select Sizing Mill" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizingMills.length === 0 ? (
                        <>
                          <SelectItem value="Sumit Sizing Works">Sumit Sizing Works</SelectItem>
                          <SelectItem value="Om Sizing Industries">Om Sizing Industries</SelectItem>
                          <SelectItem value="Vardhman Sizing">Vardhman Sizing</SelectItem>
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
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Material Owner / Party *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("materialOwner", val)}
                    value={form.watch("materialOwner")}
                  >
                    <SelectTrigger className="h-9 truncate">
                      <SelectValue placeholder="Select Owner" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.length === 0 ? (
                        <>
                          <SelectItem value="Dhandai Textiles (Own Firm)">Dhandai Textiles (Own Firm)</SelectItem>
                          <SelectItem value="Surat Yarn Mills">Surat Yarn Mills</SelectItem>
                        </>
                      ) : (
                        parties.map((p) => (
                          <SelectItem key={p.id} value={p.partyName}>
                            {p.partyName} ({p.partyType})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> 2. Linked Purchase Order & Yarn Item Specs
                </h4>
                {watchedPONumber && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoFillFromPO(watchedPONumber)}
                    className="h-7 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Wand2 className="h-3 w-3" /> Auto-Fill Specs from PO
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold">Linked PO Number *</Label>
                  <Select
                    onValueChange={(val) => handleAutoFillFromPO(val)}
                    value={watchedPONumber}
                  >
                    <SelectTrigger className="h-9 font-medium truncate w-full overflow-hidden">
                      <SelectValue placeholder="Select PO" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {pos.length === 0 ? (
                        <SelectItem value="TANA/PO/2026/04/05/0001">TANA/PO/2026/04/05/0001</SelectItem>
                      ) : (
                        pos.map((po) => (
                          <SelectItem key={po.id} value={po.poNumber} className="text-xs">
                            {po.poNumber} — {po.purchaseFromName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tana (Warp) Number *</Label>
                  <Input placeholder="e.g. TN-40S-001" {...form.register("tanaNumber")} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Yarn Item Description *</Label>
                  <Input placeholder="e.g. 40s Cotton Warp Yarn" {...form.register("itemName")} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Taar (Warp Ends) *</Label>
                  <Input
                    type="number"
                    {...form.register("totalTaar", { valueAsNumber: true })}
                    placeholder="e.g. 2800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Scale className="h-4 w-4" /> 3. Weight & Pipe Specifications
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Bags *</Label>
                  <Input type="number" {...form.register("totalBags", { valueAsNumber: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Weight (Kg) *</Label>
                  <Input type="number" {...form.register("totalWeightKg", { valueAsNumber: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Pipes *</Label>
                  <Input type="number" {...form.register("totalPipes", { valueAsNumber: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Weight / Pipe (Kg) *</Label>
                  <Input type="number" step="0.1" {...form.register("weightPerPipeKg", { valueAsNumber: true })} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chemical Added (Kg)</Label>
                  <Input type="number" step="0.1" {...form.register("sizingChemicalAddedKg", { valueAsNumber: true })} />
                </div>
              </div>
            </div>

            {/* Live Computation Box */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Set Computed Specs: {watchedSetNumber || "SET-PREVIEW"}
                </h4>
                <Badge variant="outline" className="bg-background text-foreground text-[10px]">
                  Calculated
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Sizing Mill:</span>
                  <span className="font-semibold">{watchedSizingName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Material Owner:</span>
                  <span className="font-semibold">{watchedOwner}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Warp Item & Ends:</span>
                  <span className="font-semibold">{watchedItemName} ({watchedTotalTaar} Ends)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Pipes Weight:</span>
                  <span className="font-bold text-emerald-600">
                    {(watchedTotalPipes * watchedWeightPerPipe).toFixed(1)} kg ({watchedTotalPipes} Pipes × {watchedWeightPerPipe} kg)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks & Storage Notes</Label>
              <Textarea placeholder="Enter storage notes or sizing specs..." {...form.register("remarks")} className="h-20" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Save Open Stock Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
