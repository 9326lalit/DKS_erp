"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Calculator, HelpCircle } from "lucide-react";

import { procurementApiService } from "@/lib/services/procurement-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { PurchaseOrder, PurchaseOrderItem } from "@/lib/store/use-procurement-store";
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
const poItemSchema = z.object({
  yarnId: z.string().min(1, "Please select yarn"),
  yarnName: z.string().min(1),
  count: z.string().min(1),
  color: z.string().min(1),
  brand: z.string().min(1, "Brand/Mill is required"),
  quantity: z.number().min(1, "Qty must be positive"),
  unit: z.string().min(1),
  rate: z.number().min(1, "Rate must be positive"),
  gst: z.number().min(0).max(100),
  discount: z.number().min(0).max(100),
  total: z.number()
});

const poFormSchema = z.object({
  supplierId: z.string().min(1, "Please select supplier"),
  warehouseId: z.string().min(1, "Please select delivery warehouse"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.string().min(1, "Expected delivery date is required"),
  paymentTerms: z.string().min(1, "Payment Terms are required"),
  transporter: z.string().min(2, "Transporter name is required"),
  broker: z.string().min(2, "Broker name is required"),
  remarks: z.string().optional(),
  items: z.array(poItemSchema).min(1, "At least one yarn item is required"),
  status: z.enum(["Draft", "Pending", "Approved", "Partially Received", "Completed", "Cancelled"])
});

type POFormValues = z.infer<typeof poFormSchema>;

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const queryClient = useQueryClient();

  // Queries
  const { data: suppliers = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const parties = await mastersApiService.getParties();
      return parties.filter((p) => p.partyType === "Supplier");
    }
  });

  const { data: yarns = [] } = useQuery({
    queryKey: ["yarns"],
    queryFn: () => mastersApiService.getYarns()
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => mastersApiService.getWarehouses()
  });

  const { data: editPO } = useQuery({
    queryKey: ["purchaseOrder", editId],
    queryFn: () => procurementApiService.getPurchaseOrder(editId || ""),
    enabled: !!editId
  });

  // React Hook Form Setup
  const form = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      supplierId: "",
      warehouseId: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentTerms: "30 Days Credit",
      transporter: "Kolhapur Textile Freight",
      broker: "Direct Deal",
      remarks: "",
      items: [
        {
          yarnId: "",
          yarnName: "",
          count: "",
          color: "Raw White",
          brand: "",
          quantity: 1000,
          unit: "KG",
          rate: 240,
          gst: 5,
          discount: 0,
          total: 252000
        }
      ],
      status: "Approved"
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control
  });

  // Watch supplier to prefill payment terms
  const watchSupplierId = form.watch("supplierId");
  useEffect(() => {
    const selectedSup = suppliers.find((s) => s.id === watchSupplierId);
    if (selectedSup) {
      form.setValue("paymentTerms", "30 Days Credit");
    }
  }, [watchSupplierId, suppliers, form]);

  // Load existing PO details if editing
  useEffect(() => {
    if (editPO) {
      form.reset({
        supplierId: editPO.supplierId,
        warehouseId: editPO.warehouseId,
        orderDate: editPO.orderDate,
        expectedDelivery: editPO.expectedDelivery,
        paymentTerms: editPO.paymentTerms,
        transporter: editPO.transporter,
        broker: editPO.broker,
        remarks: editPO.remarks || "",
        items: editPO.items,
        status: editPO.status
      });
    }
  }, [editPO, form]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (po: PurchaseOrder) => procurementApiService.createPurchaseOrder(po),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("New Purchase Order contract generated successfully.");
      router.push("/dashboard/procurement/purchase-orders");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (po: PurchaseOrder) => procurementApiService.updatePurchaseOrder(po),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase Order contract updated.");
      router.push("/dashboard/procurement/purchase-orders");
    }
  });

  // Form helper calculations
  const watchItems = form.watch("items") || [];
  
  // Dynamic updates for item selection change
  const handleItemSelect = (index: number, valId: string) => {
    const selectedYarn = yarns.find((y) => y.id === valId);
    if (selectedYarn) {
      form.setValue(`items.${index}.yarnName`, selectedYarn.yarnName);
      form.setValue(`items.${index}.count`, selectedYarn.count);
      form.setValue(`items.${index}.brand`, selectedYarn.brand || "Standard Brand");
      form.setValue(`items.${index}.rate`, selectedYarn.rate || 220);
      form.setValue(`items.${index}.gst`, selectedYarn.gst || 5);
      form.setValue(`items.${index}.unit`, selectedYarn.unit || "KG");
    }
  };

  // Compute Grand totals
  let subtotal = 0;
  let gstTotal = 0;
  let discountTotal = 0;
  let grandTotal = 0;

  watchItems.forEach((item, index) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstPercent = Number(item.gst) || 0;
    const discPercent = Number(item.discount) || 0;

    const rowSubtotal = qty * rate;
    const rowDisc = rowSubtotal * (discPercent / 100);
    const rowNetSub = rowSubtotal - rowDisc;
    const rowGst = rowNetSub * (gstPercent / 100);
    const rowTotal = rowNetSub + rowGst;

    subtotal += rowSubtotal;
    discountTotal += rowDisc;
    gstTotal += rowGst;
    grandTotal += rowTotal;

    // Prefill total in form field value hiddenly so validation schema receives calculated value
    if (form.getValues(`items.${index}.total`) !== parseFloat(rowTotal.toFixed(2))) {
      form.setValue(`items.${index}.total`, parseFloat(rowTotal.toFixed(2)));
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  // Submit Handler
  const handleFormSubmit = (values: POFormValues) => {
    const poPayload: PurchaseOrder = {
      id: editPO?.id || `PO-${Date.now()}`,
      poNumber: editPO?.poNumber || `PO-2026-${String(Date.now()).substring(7, 10)}`,
      supplierId: values.supplierId,
      supplierName: suppliers.find((s) => s.id === values.supplierId)?.partyName || "Unknown supplier",
      supplierContact: suppliers.find((s) => s.id === values.supplierId)?.mobileNumber || "",
      orderDate: values.orderDate,
      expectedDelivery: values.expectedDelivery,
      paymentTerms: values.paymentTerms,
      transporter: values.transporter,
      broker: values.broker,
      warehouseId: values.warehouseId,
      warehouseName: warehouses.find((w) => w.id === values.warehouseId)?.warehouseName || "Warehouse Storage",
      currency: "INR",
      remarks: values.remarks,
      items: values.items as PurchaseOrderItem[],
      subtotal: parseFloat(subtotal.toFixed(2)),
      gstTotal: parseFloat(gstTotal.toFixed(2)),
      discountTotal: parseFloat(discountTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      status: values.status
    };

    if (editPO) {
      updateMutation.mutate(poPayload);
    } else {
      createMutation.mutate(poPayload);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={editPO ? `Modify Purchase Order: ${editPO.poNumber}` : "Issue Purchase Order (PO)"}
        description="Build multi-item contracts with yarn specification parameters like counts, colors, rates, and tax credits."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement", href: "/dashboard/procurement/dashboard" },
          { title: "Purchase Orders", href: "/dashboard/procurement/purchase-orders" },
          { title: editPO ? "Edit PO" : "New PO" }
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/procurement/purchase-orders")}
            className="h-9 gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Register
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Contract details */}
          <Card className="md:col-span-2 border-border/40 overflow-hidden bg-card">
            <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5">
              <CardTitle className="text-sm font-bold font-display">Header Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="supplierId" className="text-xs font-semibold">Yarn Supplier Mill *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("supplierId", val)}
                    value={form.watch("supplierId")}
                  >
                    <SelectTrigger id="supplierId">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.partyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.supplierId && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.supplierId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="warehouseId" className="text-xs font-semibold">Delivery Warehouse Godown *</Label>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="orderDate" className="text-xs font-semibold">PO Order Issue Date *</Label>
                  <Input id="orderDate" type="date" {...form.register("orderDate")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expectedDelivery" className="text-xs font-semibold">Expected Delivery Date *</Label>
                  <Input id="expectedDelivery" type="date" {...form.register("expectedDelivery")} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="paymentTerms" className="text-xs font-semibold">Payment Terms *</Label>
                  <Input id="paymentTerms" placeholder="e.g. 30 Days Credit" {...form.register("paymentTerms")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transporter" className="text-xs font-semibold">Transporter *</Label>
                  <Input id="transporter" placeholder="e.g. Kolhapur Textile Freight" {...form.register("transporter")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="broker" className="text-xs font-semibold">Broker *</Label>
                  <Input id="broker" placeholder="e.g. Direct Deal, Vijay Jakhotiya" {...form.register("broker")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs font-semibold">Contract remarks</Label>
                <Textarea id="remarks" rows={2} placeholder="Add comments related to price guarantees or lot exclusions..." {...form.register("remarks")} />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions and Billing Summary */}
          <div className="space-y-6">
            <Card className="border-border/40 overflow-hidden bg-card">
              <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5">
                <CardTitle className="text-sm font-bold font-display">Grand Total summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs font-semibold">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Subtotal:</span>
                  <span className="text-foreground font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (GST 5%):</span>
                  <span className="text-foreground font-bold">{formatCurrency(gstTotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount deductions:</span>
                    <span>-{formatCurrency(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/20 pt-3 text-sm font-bold">
                  <span>Grand Total (INR):</span>
                  <span className="text-primary text-base">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="border-t border-border/20 pt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs font-semibold">Fulfillment status</Label>
                    <Select
                      onValueChange={(val) => form.setValue("status", val as any)}
                      value={form.watch("status")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft PO</SelectItem>
                        <SelectItem value="Pending">Pending Sign-off</SelectItem>
                        <SelectItem value="Approved">Approved Contract</SelectItem>
                        <SelectItem value="Partially Received">Partially Received</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full h-10 gap-1.5 cursor-pointer text-xs"
                  >
                    <Save className="h-4 w-4" />
                    {editPO ? "Update PO Document" : "Save Contract & Issue PO"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dynamic Line items list */}
        <Card className="border-border/40 overflow-hidden bg-card">
          <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold font-display flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-primary" />
              Yarn Specifications & Line Items
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  yarnId: "",
                  yarnName: "",
                  count: "",
                  color: "Raw White",
                  brand: "",
                  quantity: 1000,
                  unit: "KG",
                  rate: 220,
                  gst: 5,
                  discount: 0,
                  total: 231000
                })
              }
              className="gap-1 cursor-pointer text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item Row
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {form.formState.errors.items && (
              <p className="text-xs text-destructive p-4 font-bold bg-destructive/5 border-b border-border/10">{form.formState.errors.items.message}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[900px]">
                <thead className="bg-muted/10 font-bold border-b border-border/10">
                  <tr>
                    <th className="p-3 w-[260px]">Yarn Type *</th>
                    <th className="p-3 w-[100px]">Count</th>
                    <th className="p-3 w-[120px]">Brand/Mill</th>
                    <th className="p-3 w-[100px]">Color</th>
                    <th className="p-3 w-[120px] text-right">Quantity (KG) *</th>
                    <th className="p-3 w-[110px] text-right">Rate / KG *</th>
                    <th className="p-3 w-[80px] text-right">GST %</th>
                    <th className="p-3 w-[80px] text-right">Disc %</th>
                    <th className="p-3 text-right w-[120px]">Row Total (INR)</th>
                    <th className="p-3 w-[50px] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {fields.map((field, idx) => {
                    const rowQty = form.watch(`items.${idx}.quantity`) || 0;
                    const rowRate = form.watch(`items.${idx}.rate`) || 0;
                    const rowDisc = form.watch(`items.${idx}.discount`) || 0;
                    const rowGst = form.watch(`items.${idx}.gst`) || 0;
                    
                    const calculatedRowTotal = (rowQty * rowRate * (1 - rowDisc / 100)) * (1 + rowGst / 100);

                    return (
                      <tr key={field.id} className="hover:bg-muted/5 align-middle">
                        <td className="p-3">
                          <Select
                            onValueChange={(val) => handleItemSelect(idx, val)}
                            value={form.watch(`items.${idx}.yarnId`)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Yarn" />
                            </SelectTrigger>
                            <SelectContent>
                              {yarns.map((y) => (
                                <SelectItem key={y.id} value={y.id}>
                                  {y.yarnName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Input readOnly className="bg-muted text-muted-foreground font-semibold" {...form.register(`items.${idx}.count`)} />
                        </td>
                        <td className="p-3">
                          <Input placeholder="Spinning Mill" {...form.register(`items.${idx}.brand`)} />
                        </td>
                        <td className="p-3">
                          <Input placeholder="Color" {...form.register(`items.${idx}.color`)} />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right"
                            {...form.register(`items.${idx}.quantity`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right"
                            {...form.register(`items.${idx}.rate`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right"
                            {...form.register(`items.${idx}.gst`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right"
                            {...form.register(`items.${idx}.discount`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          {formatCurrency(calculatedRowTotal)}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={fields.length === 1}
                            onClick={() => remove(idx)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
}
