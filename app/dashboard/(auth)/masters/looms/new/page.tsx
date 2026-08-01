"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Sparkles,
  Scissors,
  Zap,
  User,
  Layers,
  Settings
} from "lucide-react";

import { mastersApiService } from "@/lib/services/masters-api";
import { Loom, useMastersStore } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const loomSchema = z.object({
  factoryId: z.string().min(1, "Firm / Factory is required"),
  factoryName: z.string(),
  loomNumber: z.string().min(1, "Loom number is required"),
  loomType: z.enum(["Power Loom", "Handloom", "Rapier", "Shuttle"]),
  reedCount: z.number().optional(),
  widthInches: z.number().optional(),
  rpmSpeed: z.number().optional(),
  makeBrand: z.string().optional(),
  yearOfPurchase: z.number().optional(),
  status: z.enum(["Active", "Idle", "Under Repair"]),
  assignedLabourId: z.string().optional(),
  assignedLabourName: z.string().optional(),
  remarks: z.string().optional()
});

type LoomFormValues = z.infer<typeof loomSchema>;

export default function NewLoomEntryPage() {
  const router = useRouter();
  const createLoom = useMastersStore((state) => state.createLoom);

  const { data: factories = [] } = useQuery({
    queryKey: ["factories"],
    queryFn: () => mastersApiService.getFactories()
  });

  const { data: labour = [] } = useQuery({
    queryKey: ["labour"],
    queryFn: () => mastersApiService.getLabour()
  });

  const { data: looms = [] } = useQuery({
    queryKey: ["looms"],
    queryFn: () => mastersApiService.getLooms()
  });

  const queryClient = useQueryClient();

  const form = useForm<LoomFormValues>({
    resolver: zodResolver(loomSchema),
    defaultValues: {
      factoryId: factories[0]?.id || "FAC-ID-001",
      factoryName: factories[0]?.factoryName || "Dhandai Textiles (Main Shed)",
      loomNumber: `L-${String(looms.length + 1).padStart(3, "0")}`,
      loomType: "Power Loom",
      status: "Active",
      rpmSpeed: 700,
      reedCount: 120,
      widthInches: 60,
      makeBrand: "Picanol",
      yearOfPurchase: new Date().getFullYear(),
      remarks: "New loom registered in Master Admin"
    }
  });

  const watchedFactoryId = form.watch("factoryId");
  const watchedLoomType = form.watch("loomType");
  const watchedLoomNumber = form.watch("loomNumber");

  const onSubmit = (values: LoomFormValues) => {
    const selectedFactory = factories.find((f) => f.id === values.factoryId);

    // Duplicate Loom Number Check per Factory
    const isDuplicateLoom = looms.some(
      (l) => l.factoryId === values.factoryId && l.loomNumber.trim().toLowerCase() === values.loomNumber.trim().toLowerCase()
    );

    if (isDuplicateLoom) {
      toast.error(`Duplicate Loom Error: Loom '${values.loomNumber}' already exists in ${selectedFactory?.factoryName || "this Weaving Unit"}!`);
      form.setError("loomNumber", {
        type: "manual",
        message: `Loom Number '${values.loomNumber}' is already registered in ${selectedFactory?.factoryName || "this unit"}. Duplicate Loom Numbers are prohibited.`
      });
      return;
    }

    const selectedLabour = labour.find((l) => l.id === values.assignedLabourId);
    const seq = looms.length + 1;

    const newLoom: Loom = {
      id: `LOM-ID-${String(seq).padStart(3, "0")}-${Date.now()}`,
      loomId: `LOM-${String(seq).padStart(3, "0")}`,
      factoryId: values.factoryId,
      factoryName: selectedFactory?.factoryName || values.factoryName,
      loomNumber: values.loomNumber,
      loomType: values.loomType,
      reedCount: values.reedCount,
      widthInches: values.widthInches,
      rpmSpeed: values.rpmSpeed,
      makeBrand: values.makeBrand,
      yearOfPurchase: values.yearOfPurchase,
      status: values.status,
      assignedLabourId: values.assignedLabourId,
      assignedLabourName: selectedLabour?.fullName || values.assignedLabourName,
      remarks: values.remarks
    };

    createLoom(newLoom);
    queryClient.invalidateQueries({ queryKey: ["looms"] });
    toast.success(`Loom "${values.loomNumber}" registered successfully for ${selectedFactory?.factoryName || "Firm"}!`);

    if (selectedFactory) {
      router.push(`/dashboard/masters/factories/${encodeURIComponent(selectedFactory.id)}`);
    } else {
      router.push("/dashboard/masters/looms");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Register New Loom"
        description="Register a new loom machine and assign it to a weaving firm (Dhandai Textiles, Lalit Textiles, etc.)."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Loom Master", href: "/dashboard/masters/looms" },
          { title: "New Loom Entry" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Loom Master
          </Button>
        }
      />

      <Card className="border-border/40 shadow-sm bg-card max-w-4xl mx-auto overflow-hidden">
        <CardHeader className="bg-primary/5 p-5 border-b border-border/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Master Loom Registration Form
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Enter loom specifications, speed RPM, and link to a weaving unit. No popup modals.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              Full Page Registration
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Firm Identification & Location */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Building2 className="h-4 w-4" /> 1. Firm Identification & Weaving Shed
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Weaving Firm / Unit *</Label>
                  <Select
                    onValueChange={(val) => {
                      form.setValue("factoryId", val);
                      const f = factories.find((fact) => fact.id === val);
                      if (f) form.setValue("factoryName", f.factoryName);
                    }}
                    value={watchedFactoryId}
                  >
                    <SelectTrigger className="h-9 truncate">
                      <SelectValue placeholder="Select Firm / Factory" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {factories.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.factoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.factoryId && (
                    <p className="text-[11px] text-red-500">{form.formState.errors.factoryId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Loom Number *</Label>
                  <Input
                    placeholder="e.g. L-037 or LALIT-L-013"
                    {...form.register("loomNumber")}
                    className="font-mono font-bold text-primary"
                  />
                  {form.formState.errors.loomNumber && (
                    <p className="text-[11px] text-red-500">{form.formState.errors.loomNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Loom Type *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("loomType", val as any)}
                    value={watchedLoomType}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Power Loom">Power Loom</SelectItem>
                      <SelectItem value="Handloom">Handloom</SelectItem>
                      <SelectItem value="Rapier">Rapier Machine</SelectItem>
                      <SelectItem value="Shuttle">Shuttle Loom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Initial Status *</Label>
                  <Select
                    onValueChange={(val) => form.setValue("status", val as any)}
                    value={form.watch("status")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active (Operational)</SelectItem>
                      <SelectItem value="Idle">Idle (Stopped)</SelectItem>
                      <SelectItem value="Under Repair">Under Repair / Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Technical Specifications & Performance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Settings className="h-4 w-4" /> 2. Technical Specifications & Motor Speed
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Speed (RPM) *</Label>
                  <Input
                    type="number"
                    {...form.register("rpmSpeed", { valueAsNumber: true })}
                    placeholder="e.g. 720"
                    className="font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reed Count (dents/inch)</Label>
                  <Input
                    type="number"
                    {...form.register("reedCount", { valueAsNumber: true })}
                    placeholder="e.g. 120"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reed Width (Inches)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("widthInches", { valueAsNumber: true })}
                    placeholder="e.g. 60"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Make / Machine Brand</Label>
                  <Input
                    placeholder="e.g. Picanol, Tsudakoma, Toyota"
                    {...form.register("makeBrand")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Year of Purchase</Label>
                  <Input
                    type="number"
                    {...form.register("yearOfPurchase", { valueAsNumber: true })}
                    placeholder="e.g. 2023"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Labour Assignment & Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
                <User className="h-4 w-4" /> 3. Labour Assignment & Storage Notes
              </h4>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Assigned Weaver / Labour Worker</Label>
                <Select
                  onValueChange={(val) => {
                    form.setValue("assignedLabourId", val);
                    const l = labour.find((lab) => lab.id === val);
                    if (l) form.setValue("assignedLabourName", l.fullName);
                  }}
                  value={form.watch("assignedLabourId") || ""}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Weaver (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {labour.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.fullName} ({l.labourType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Remarks & Maintenance Notes</Label>
                <Textarea
                  placeholder="Enter loom condition, motor specs, or maintenance notes..."
                  {...form.register("remarks")}
                  className="h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Save &amp; Register Loom
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
