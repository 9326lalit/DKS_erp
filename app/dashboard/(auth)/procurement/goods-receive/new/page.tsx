"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, FileCheck2, Truck, ClipboardCheck } from "lucide-react";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { GRN, GRNItem, PurchaseOrder } from "@/lib/store/use-procurement-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const grnItemSchema = z.object({
  yarnId: z.string(),
  yarnName: z.string(),
  count: z.string(),
  orderedQty: z.number(),
  receivedQty: z.number().min(0, "Received quantity must be positive"),
  rejectedQty: z.number().min(0, "Rejected quantity must be positive"),
  acceptedQty: z.number().min(0),
  unit: z.string(),
  remarks: z.string().optional()
}).refine(data => data.rejectedQty <= data.receivedQty, {
  message: "Rejected qty cannot exceed received qty",
  path: ["rejectedQty"]
});

const grnFormSchema = z.object({
  poId: z.string().min(1, "Please select reference PO"),
  vehicleNumber: z.string().min(4, "Vehicle plate number is required"),
  transporter: z.string().min(2, "Transporter name is required"),
  invoiceNumber: z.string().optional(),
  receiveDate: z.string().min(1, "Receive date is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  remarks: z.string().optional(),
  items: z.array(grnItemSchema)
});

type GRNFormValues = z.infer<typeof grnFormSchema>;

export default function NewGRNPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => procurementApiService.getPurchaseOrders()
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => mastersApiService.getWarehouses()
  });

  // Filter approved or partially received POs for inward check-in
  const activePOs = purchaseOrders.filter(
    (po) => po.status === "Approved" || po.status === "Partially Received"
  );

  // React Hook Form
  const form = useForm<GRNFormValues>({
    resolver: zodResolver(grnFormSchema),
    defaultValues: {
      poId: "",
      vehicleNumber: "",
      transporter: "",
      invoiceNumber: "",
      receiveDate: new Date().toISOString().split("T")[0],
      warehouseId: "",
      remarks: "",
      items: []
    }
  });

  const { fields, replace } = useFieldArray({
    name: "items",
    control: form.control
  });

  // Watch PO selection change to load items
  const watchPOId = form.watch("poId");
  useEffect(() => {
    const selectedPO = purchaseOrders.find((p) => p.id === watchPOId);
    if (selectedPO) {
      form.setValue("transporter", selectedPO.transporter);
      form.setValue("warehouseId", selectedPO.warehouseId);
      
      const mappedItems = selectedPO.items.map((item) => ({
        yarnId: item.yarnId,
        yarnName: item.yarnName,
        count: item.count,
        orderedQty: item.quantity,
        receivedQty: item.quantity, // default to order size
        rejectedQty: 0,
        acceptedQty: item.quantity,
        unit: item.unit,
        remarks: ""
      }));
      replace(mappedItems);
    } else {
      replace([]);
    }
  }, [watchPOId, purchaseOrders, form, replace]);

  // Dynamic calculations for Accepted quantities
  const watchItems = form.watch("items") || [];
  let totalOrdered = 0;
  let totalReceived = 0;
  let totalRejected = 0;
  let totalAccepted = 0;

  watchItems.forEach((item, index) => {
    const ordered = Number(item.orderedQty) || 0;
    const received = Number(item.receivedQty) || 0;
    const rejected = Number(item.rejectedQty) || 0;
    const accepted = Math.max(0, received - rejected);

    totalOrdered += ordered;
    totalReceived += received;
    totalRejected += rejected;
    totalAccepted += accepted;

    // Prefill acceptedQty in the form model values hiddenly
    if (form.getValues(`items.${index}.acceptedQty`) !== accepted) {
      form.setValue(`items.${index}.acceptedQty`, accepted);
    }
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: (grn: GRN) => procurementApiService.createGRN(grn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Goods Receive Note logged. Yarn inventory counts updated successfully.");
      router.push("/dashboard/procurement/goods-receive");
    }
  });

  // Submit Handler
  const handleFormSubmit = (values: GRNFormValues) => {
    const selectedPO = purchaseOrders.find((p) => p.id === values.poId) as PurchaseOrder;

    // PO Status Mapping Check (completed if total accepted matches total ordered)
    const allCompleted = totalAccepted >= totalOrdered;
    const grnStatus: GRN["status"] = allCompleted ? "Completed" : "Partial";

    const grnPayload: GRN = {
      id: `GRN-${Date.now()}`,
      grnNumber: `GRN-2026-${String(Date.now()).substring(7, 10)}`,
      poId: values.poId,
      poNumber: selectedPO.poNumber,
      supplierId: selectedPO.supplierId,
      supplierName: selectedPO.supplierName,
      vehicleNumber: values.vehicleNumber.toUpperCase(),
      transporter: values.transporter,
      invoiceNumber: values.invoiceNumber,
      receiveDate: values.receiveDate,
      warehouseId: values.warehouseId,
      warehouseName: warehouses.find((w) => w.id === values.warehouseId)?.warehouseName || "Godown Storage",
      remarks: values.remarks,
      items: values.items as GRNItem[],
      status: grnStatus
    };

    createMutation.mutate(grnPayload);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Yarn Goods Receive Note (GRN)"
        description="Verify raw material arrivals. Match yarn counts with Purchase Order tolerances and log transport vehicles."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement", href: "/dashboard/procurement/dashboard" },
          { title: "Goods Receive Notes", href: "/dashboard/procurement/goods-receive" },
          { title: "Process GRN" }
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/procurement/goods-receive")}
            className="h-9 gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Register
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Inward details */}
          <Card className="md:col-span-2 border-border/40 overflow-hidden bg-card">
            <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5 flex flex-row items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold font-display">Inward Gate details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="poId" className="text-xs font-semibold">Reference PO Code *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("poId", val)}
                    value={form.watch("poId")}
                  >
                    <SelectTrigger id="poId">
                      <SelectValue placeholder="Select Purchase Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePOs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.poNumber} — {p.supplierName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.poId && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.poId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="warehouseId" className="text-xs font-semibold">Inward Storage Godown *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("warehouseId", val)}
                    value={form.watch("warehouseId")}
                  >
                    <SelectTrigger id="warehouseId">
                      <SelectValue placeholder="Select Godown" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.warehouseName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.warehouseId && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.warehouseId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="receiveDate" className="text-xs font-semibold">Inward Check-in Date *</Label>
                  <Input id="receiveDate" type="date" {...form.register("receiveDate")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vehicleNumber" className="text-xs font-semibold">Vehicle Plate No. *</Label>
                  <Input id="vehicleNumber" placeholder="e.g. MH-09-AX-1234" {...form.register("vehicleNumber")} />
                  {form.formState.errors.vehicleNumber && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.vehicleNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transporter" className="text-xs font-semibold">Transporter *</Label>
                  <Input id="transporter" placeholder="e.g. Safexpress" {...form.register("transporter")} />
                  {form.formState.errors.transporter && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.transporter.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="invoiceNumber" className="text-xs font-semibold">Supplier Delivery Challan / Invoice No.</Label>
                  <Input id="invoiceNumber" placeholder="e.g. CH-9081" {...form.register("invoiceNumber")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs font-semibold">GRN notes</Label>
                <Textarea id="remarks" rows={2} placeholder="Add unloading logs, lot markings, or broker check details..." {...form.register("remarks")} />
              </div>
            </CardContent>
          </Card>

          {/* Audit totals summary */}
          <div className="space-y-6">
            <Card className="border-border/40 overflow-hidden bg-card">
              <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5 flex items-center gap-1.5">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold font-display">Inward Quantity Audit</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs font-semibold">
                <div className="flex justify-between text-muted-foreground">
                  <span>Ordered Quantity:</span>
                  <span className="text-foreground font-bold">{totalOrdered.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Arrived Quantity:</span>
                  <span className="text-foreground font-bold">{totalReceived.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Rejected Quantity:</span>
                  <span className="font-bold">{totalRejected.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between border-t border-border/20 pt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Accepted Quantity:</span>
                  <span className="text-base">{totalAccepted.toLocaleString()} KG</span>
                </div>

                <div className="border-t border-border/20 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full h-10 gap-1.5 cursor-pointer text-xs"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    Verify Check-in & Post GRN
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quantities item validation grid */}
        <Card className="border-border/40 overflow-hidden bg-card">
          <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5">
            <CardTitle className="text-sm font-bold font-display">Quantity Check-in verification</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {fields.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-semibold">
                Select a reference Purchase Order above to load items.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[800px]">
                  <thead className="bg-muted/10 font-bold border-b border-border/10">
                    <tr>
                      <th className="p-3">Yarn Description</th>
                      <th className="p-3">Count</th>
                      <th className="p-3 text-right">Ordered Qty (KG)</th>
                      <th className="p-3 text-right">Received Qty (KG) *</th>
                      <th className="p-3 text-right">Rejected Qty (KG) *</th>
                      <th className="p-3 text-right">Accepted Qty (KG)</th>
                      <th className="p-3">Rejection notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {fields.map((field, idx) => {
                      const received = form.watch(`items.${idx}.receivedQty`) || 0;
                      const rejected = form.watch(`items.${idx}.rejectedQty`) || 0;
                      const accepted = Math.max(0, received - rejected);

                      return (
                        <tr key={field.id} className="hover:bg-muted/5 align-middle">
                          <td className="p-3 font-bold text-foreground">
                            {field.yarnName}
                          </td>
                          <td className="p-3 font-semibold text-muted-foreground">
                            {field.count}
                          </td>
                          <td className="p-3 text-right font-bold">
                            {field.orderedQty.toLocaleString()} KG
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              className="text-right max-w-[130px] ml-auto"
                              {...form.register(`items.${idx}.receivedQty`, { valueAsNumber: true })}
                            />
                            {form.formState.errors.items?.[idx]?.receivedQty && (
                              <p className="text-[9px] text-destructive text-right mt-1 font-semibold">
                                {form.formState.errors.items[idx]?.receivedQty?.message}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              className="text-right max-w-[130px] ml-auto"
                              {...form.register(`items.${idx}.rejectedQty`, { valueAsNumber: true })}
                            />
                            {form.formState.errors.items?.[idx]?.rejectedQty && (
                              <p className="text-[9px] text-destructive text-right mt-1 font-semibold">
                                {form.formState.errors.items[idx]?.rejectedQty?.message}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {accepted.toLocaleString()} KG
                          </td>
                          <td className="p-3">
                            <Input
                              placeholder="e.g. Cones damaged/wet"
                              {...form.register(`items.${idx}.remarks`)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
