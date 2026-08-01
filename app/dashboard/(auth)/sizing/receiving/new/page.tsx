"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Layers,
  FileText,
  Warehouse,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";

import { useSizingStore, FactoryReceivingEntry } from "@/lib/store/use-sizing-store";
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

const receivingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  sizingName: z.string().min(1, "Sizing Mill is required"),
  poNumber: z.string().min(1, "PO Number is required"),
  setNumber: z.string().min(1, "Set Number is required"),
  bhimReceived: z.number().min(1, "Bhim Received count required"),
  pipesReceived: z.number().min(1, "Pipes Received count required"),
  status: z.enum(["Received", "Partial", "Pending"]),
  challanNumber: z.string().optional(),
  remarks: z.string().optional()
});

type FormValues = z.infer<typeof receivingSchema>;

export default function NewFactoryReceivingEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSet = searchParams?.get("setNumber") || "";

  // Zustand Store
  const { openingStocks, createFactoryReceiving } = useSizingStore();

  // Master Queries
  const { data: sizingMills = [] } = useQuery({
    queryKey: ["sizingMills"],
    queryFn: () => mastersApiService.getSizingMills()
  });
  const { data: pos = [] } = useQuery({
    queryKey: ["tana-pos"],
    queryFn: () => tanaApiService.getPOs()
  });

  const defaultSizingName = sizingMills[0]?.millName || "Sumit Sizing Works";
  const defaultPO = pos[0]?.poNumber || "TANA/PO/2026/04/05/0001";
  const defaultSet = preselectedSet || openingStocks[0]?.setNumber || "SET-100";

  const form = useForm<FormValues>({
    resolver: zodResolver(receivingSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sizingName: defaultSizingName,
      poNumber: defaultPO,
      setNumber: defaultSet,
      bhimReceived: 11,
      pipesReceived: 11,
      status: "Received",
      challanNumber: "CHAL-2026-8841",
      remarks: "Sized beams received at factory in good condition."
    }
  });

  const selectedPONo = form.watch("poNumber");
  const selectedPOObj = pos.find((p) => p.poNumber === selectedPONo);

  const selectedSetNo = form.watch("setNumber");
  const selectedSetObj = openingStocks.find((s) => s.setNumber === selectedSetNo);

  // Sync details when PO changes
  useEffect(() => {
    if (selectedPOObj) {
      const matchSet = openingStocks.find((s) => s.poNumber === selectedPOObj.poNumber);
      if (matchSet) {
        form.setValue("setNumber", matchSet.setNumber);
        form.setValue("sizingName", matchSet.sizingName);
      }
    }
  }, [selectedPONo, selectedPOObj, openingStocks, form]);

  const onSubmit = (values: FormValues) => {
    const newEntry: FactoryReceivingEntry = {
      id: `RCV-${Date.now()}`,
      date: values.date,
      sizingName: values.sizingName,
      poNumber: values.poNumber,
      setNumber: values.setNumber,
      bhimReceived: values.bhimReceived,
      pipesReceived: values.pipesReceived,
      status: values.status,
      remarks: values.challanNumber
        ? `[Challan #${values.challanNumber}] ${values.remarks || ""}`
        : values.remarks
    };

    createFactoryReceiving(newEntry);
    toast.success(`Factory Receiving record for Set "${values.setNumber}" created successfully!`);
    router.push("/dashboard/sizing");
  };

  return (
    <PageContainer>
      <PageHeader
        title="New Factory Receiving Entry"
        description="Record returned Sized Beams & Pipes from Sizing Mill to Factory floor with PO auto-linking, beam counts, and condition notes."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing Module", href: "/dashboard/sizing" },
          { title: "New Factory Receiving" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Sizing Dashboard
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Receiving Info & PO Linking */}
        <Card className="border-border/40 shadow-xs bg-card">
          <CardHeader className="bg-primary/5 p-4 border-b border-border/30">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              1. Receiving Logistics & Linked Purchase Order
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select the receiving date, Sizing Mill agency, and linked PO/Warp Set Number.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Receiving Date *</Label>
                <Input type="date" {...form.register("date")} className="h-9 text-xs" />
                {form.formState.errors.date && <p className="text-[10px] text-destructive">{form.formState.errors.date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sizing Mill / Job-worker *</Label>
                <Select
                  onValueChange={(val) => form.setValue("sizingName", val)}
                  value={form.watch("sizingName")}
                >
                  <SelectTrigger className="h-9 text-xs font-semibold">
                    <SelectValue placeholder="Select Sizing Mill" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizingMills.length === 0 ? (
                      <>
                        <SelectItem value="Sumit Sizing Works">Sumit Sizing Works</SelectItem>
                        <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>
                        <SelectItem value="Om Sizing Industries">Om Sizing Industries</SelectItem>
                      </>
                    ) : (
                      sizingMills.map((m) => (
                        <SelectItem key={m.id} value={m.millName}>{m.millName}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.sizingName && <p className="text-[10px] text-destructive">{form.formState.errors.sizingName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">PO Number (Auto Links Set) *</Label>
                <Select
                  onValueChange={(val) => form.setValue("poNumber", val)}
                  value={form.watch("poNumber")}
                >
                  <SelectTrigger className="h-9 text-xs font-mono font-bold border-primary/40">
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>
                        {p.poNumber} — {p.itemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.poNumber && <p className="text-[10px] text-destructive">{form.formState.errors.poNumber.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Warp Set Number *</Label>
                <Select
                  onValueChange={(val) => form.setValue("setNumber", val)}
                  value={form.watch("setNumber")}
                >
                  <SelectTrigger className="h-9 text-xs font-mono font-bold text-primary bg-muted/20">
                    <SelectValue placeholder="Select Set" />
                  </SelectTrigger>
                  <SelectContent>
                    {openingStocks.length > 0 ? (
                      openingStocks.map((s) => (
                        <SelectItem key={s.id} value={s.setNumber}>
                          {s.setNumber} ({s.poNumber})
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="SET-100">SET-100</SelectItem>
                        <SelectItem value="SET-121">SET-121</SelectItem>
                        <SelectItem value="SET-2026-001">SET-2026-001</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.setNumber && <p className="text-[10px] text-destructive">{form.formState.errors.setNumber.message}</p>}
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
                    <span className="font-semibold">{selectedSetObj.materialOwner}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Initial Stock:</span>
                    <span className="font-bold text-emerald-600">{selectedSetObj.totalWeightKg} kg</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Quantity Received & Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/40 shadow-xs bg-card">
            <CardHeader className="bg-muted/10 p-4 border-b border-border/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                2. Beams & Pipes Count Received
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bhim (Beams) Received *</Label>
                  <Input
                    type="number"
                    {...form.register("bhimReceived", { valueAsNumber: true })}
                    className="h-9 text-xs font-bold"
                  />
                  {form.formState.errors.bhimReceived && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.bhimReceived.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Pipes Received *</Label>
                  <Input
                    type="number"
                    {...form.register("pipesReceived", { valueAsNumber: true })}
                    className="h-9 text-xs font-mono font-bold"
                  />
                  {form.formState.errors.pipesReceived && (
                    <p className="text-[10px] text-destructive">{form.formState.errors.pipesReceived.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Delivery Challan / Gate Pass #</Label>
                  <Input
                    {...form.register("challanNumber")}
                    placeholder="e.g. CHAL-2026-9041"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Receiving Status *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("status", val as any)}
                    value={form.watch("status")}
                  >
                    <SelectTrigger className="h-9 text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Received">Received (Full Batch)</SelectItem>
                      <SelectItem value="Partial">Partial Delivery</SelectItem>
                      <SelectItem value="Pending">Pending Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receiving Summary Card */}
          <Card className="border-border/40 shadow-xs bg-card">
            <CardHeader className="bg-muted/10 p-4 border-b border-border/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" />
                3. Factory Floor Receiving Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sizing Mill:</span>
                  <span className="font-bold text-foreground">{form.watch("sizingName")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Set Number:</span>
                  <span className="font-mono font-bold text-primary">{form.watch("setNumber")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Beams Received:</span>
                  <span className="font-bold text-amber-600 text-sm">{form.watch("bhimReceived") || 0} Bhim</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pipes Count:</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">{form.watch("pipesReceived") || 0} Pipes</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1 font-bold text-sm">
                  <span>Audit Status:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {form.watch("status")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quality Inspector / Driver Remarks</Label>
                <Textarea
                  {...form.register("remarks")}
                  placeholder="Enter condition notes, flange damage check, moisture level..."
                  className="h-20 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Actions */}
        <Card className="border-border/40 shadow-xs bg-card">
          <CardContent className="p-5 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-semibold gap-2 cursor-pointer">
              <CheckCircle2 className="h-4 w-4" /> Save Factory Receiving Record
            </Button>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
