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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bulkAddSchema = z.object({
  factoryId: z.string().min(1, "Factory required"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(100, "Max 100 looms at once"),
  prefix: z.string().min(1, "Prefix required"),
  startNumber: z.number().min(1, "Start number required"),
  loomType: z.enum(["Power Loom", "Handloom", "Rapier", "Shuttle"]),
  reedCount: z.number().optional(),
  widthInches: z.number().optional(),
  rpmSpeed: z.number().optional(),
  makeBrand: z.string().optional()
});

type BulkAddFormValues = z.infer<typeof bulkAddSchema>;

export default function BulkNewLoomsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: factories = [] } = useQuery({
    queryKey: ["factories"],
    queryFn: () => mastersApiService.getFactories()
  });

  const { data: looms = [] } = useQuery({
    queryKey: ["looms"],
    queryFn: () => mastersApiService.getLooms()
  });

  const form = useForm<BulkAddFormValues>({
    resolver: zodResolver(bulkAddSchema),
    defaultValues: {
      factoryId: factories[0]?.id || "FAC-ID-003",
      quantity: 12,
      prefix: "LALIT-L-",
      startNumber: 1,
      loomType: "Power Loom",
      reedCount: 120,
      widthInches: 60,
      rpmSpeed: 700,
      makeBrand: "Tsudakoma"
    }
  });

  const watchedQty = form.watch("quantity") || 0;
  const watchedPrefix = form.watch("prefix") || "L-";
  const watchedStartNum = form.watch("startNumber") || 1;
  const watchedFactoryId = form.watch("factoryId");

  const onSubmit = (values: BulkAddFormValues) => {
    const factory = factories.find((f) => f.id === values.factoryId);
    if (!factory) {
      toast.error("Please select a valid factory.");
      return;
    }

    // Check for duplicate loom numbers in target factory
    const existingFactoryLoomNumbers = looms
      .filter((l) => l.factoryId === factory.id)
      .map((l) => l.loomNumber.trim().toLowerCase());

    const duplicates: string[] = [];
    for (let i = 0; i < values.quantity; i++) {
      const num = values.startNumber + i;
      const loomNo = `${values.prefix}${String(num).padStart(3, "0")}`;
      if (existingFactoryLoomNumbers.includes(loomNo.trim().toLowerCase())) {
        duplicates.push(loomNo);
      }
    }

    if (duplicates.length > 0) {
      toast.error(`Duplicate Loom Error: Looms (${duplicates.join(", ")}) already exist in "${factory.factoryName}"!`);
      form.setError("startNumber", {
        type: "manual",
        message: `Starting number sequence creates duplicate looms (${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? "..." : ""}) in ${factory.factoryName}.`
      });
      return;
    }

    const newLooms: Loom[] = [];
    for (let i = 0; i < values.quantity; i++) {
      const num = values.startNumber + i;
      const loomNo = `${values.prefix}${String(num).padStart(3, "0")}`;
      const seq = looms.length + i + 1;

      newLooms.push({
        id: `LOM-ID-BULK-${Date.now()}-${i}`,
        loomId: `LOM-${String(seq).padStart(3, "0")}`,
        factoryId: factory.id,
        factoryName: factory.factoryName,
        loomNumber: loomNo,
        loomType: values.loomType,
        reedCount: values.reedCount,
        widthInches: values.widthInches,
        rpmSpeed: values.rpmSpeed,
        makeBrand: values.makeBrand,
        status: "Active"
      });
    }

    useMastersStore.setState((state) => ({
      looms: [...newLooms, ...state.looms]
    }));

    queryClient.invalidateQueries({ queryKey: ["looms"] });
    toast.success(`Successfully added ${values.quantity} looms to "${factory.factoryName}"!`);
    router.push(`/dashboard/masters/factories/${encodeURIComponent(factory.id)}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Bulk Add Looms to Firm"
        description="Easily generate and register multiple looms at once for any weaving firm (e.g. Lalit Textiles 12 Looms, Dhandai Textiles 36 Looms)."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Loom Master", href: "/dashboard/masters/looms" },
          { title: "Bulk Add" }
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Loom Master
          </Button>
        }
      />

      <Card className="border-border/40 shadow-sm bg-card max-w-3xl mx-auto overflow-hidden">
        <CardHeader className="bg-primary/5 p-5 border-b border-border/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Bulk Loom Generation & Registration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Generate N sequential looms with customized numbering prefix for your weaving sheds.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              Batch Generator
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Target Firm / Weaving Unit *</Label>
              <Select
                onValueChange={(val) => form.setValue("factoryId", val)}
                value={watchedFactoryId}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Factory / Firm" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.factoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Looms Quantity to Generate *</Label>
                <Input
                  type="number"
                  {...form.register("quantity", { valueAsNumber: true })}
                  placeholder="e.g. 12"
                  className="font-mono font-bold text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loom Number Prefix *</Label>
                <Input
                  {...form.register("prefix")}
                  placeholder="e.g. LALIT-L- or L-"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Numbering From *</Label>
                <Input
                  type="number"
                  {...form.register("startNumber", { valueAsNumber: true })}
                  placeholder="1"
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Loom Type *</Label>
                <Select
                  onValueChange={(v) => form.setValue("loomType", v as any)}
                  value={form.watch("loomType")}
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Speed (RPM)</Label>
                <Input
                  type="number"
                  {...form.register("rpmSpeed", { valueAsNumber: true })}
                  placeholder="720"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reed Count</Label>
                <Input
                  type="number"
                  {...form.register("reedCount", { valueAsNumber: true })}
                  placeholder="120"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Make / Brand</Label>
                <Input
                  {...form.register("makeBrand")}
                  placeholder="Tsudakoma"
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
              <span className="font-bold text-primary block flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Generation Live Preview:
              </span>
              <p className="text-muted-foreground pt-1">
                Will register <strong>{watchedQty} looms</strong> for{" "}
                <strong className="text-foreground">
                  {factories.find((f) => f.id === watchedFactoryId)?.factoryName || "Selected Firm"}
                </strong>.
              </p>
              <p className="font-mono text-emerald-600 font-bold pt-1">
                Generated Loom Numbers: {watchedPrefix}
                {String(watchedStartNum).padStart(3, "0")} to {watchedPrefix}
                {String(watchedStartNum + Math.max(0, watchedQty - 1)).padStart(3, "0")}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Generate &amp; Save All Looms
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
