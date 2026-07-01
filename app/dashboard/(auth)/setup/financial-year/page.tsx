"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Save, ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useERPStore, FinancialYearDetails } from "@/lib/store/use-erp-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fySchema = z.object({
  financialYear: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, "Format must be YYYY-YYYY (e.g. 2026-2027)"),
  openingDate: z.string().min(1, "Opening date is required"),
  closingDate: z.string().min(1, "Closing date is required"),
  openingStockDate: z.string().min(1, "Opening stock date is required"),
  currency: z.string().min(1, "Currency is required"),
  defaultTax: z.number().min(0).max(100)
});

type FYFormValues = z.infer<typeof fySchema>;

export default function FYSetupPage() {
  const router = useRouter();
  const { financialYearDetails, setFinancialYearDetails } = useERPStore();

  // If no FY details are present, seed standard defaults
  const initialValues: FYFormValues = financialYearDetails || {
    financialYear: "2026-2027",
    openingDate: "2026-04-01",
    closingDate: "2027-03-31",
    openingStockDate: "2026-04-01",
    currency: "INR",
    defaultTax: 5
  };

  const form = useForm<FYFormValues>({
    resolver: zodResolver(fySchema),
    defaultValues: initialValues
  });

  const onSubmit = (data: FYFormValues) => {
    setFinancialYearDetails(data);
    toast.success("Financial year settings updated successfully.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Financial Calendar Configurations"
        description="Review or modify tax rates, opening ledger stock dates, and active fiscal books timelines."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Business Setup" },
          { title: "Financial Year Details" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/default")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4">
            <CardTitle className="text-base font-bold font-display flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              Accounting Calendar Period
            </CardTitle>
            <CardDescription className="text-xs">
              Configure accounting book intervals. Modifying these values updates general ledger reports.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="financialYear" className="text-xs font-semibold">Active Financial Year *</Label>
                <Input id="financialYear" placeholder="2026-2027" {...form.register("financialYear")} />
                {form.formState.errors.financialYear && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.financialYear.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs font-semibold">Functional Currency</Label>
                <Input id="currency" readOnly {...form.register("currency")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="openingDate" className="text-xs font-semibold">Opening Date *</Label>
                <Input id="openingDate" type="date" {...form.register("openingDate")} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingDate" className="text-xs font-semibold">Closing Date *</Label>
                <Input id="closingDate" type="date" {...form.register("closingDate")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingStockDate" className="text-xs font-semibold">Opening Stock Date *</Label>
                <Input id="openingStockDate" type="date" {...form.register("openingStockDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTax" className="text-xs font-semibold">Default GST Rate (%)</Label>
              <Input
                id="defaultTax"
                type="number"
                {...form.register("defaultTax", { valueAsNumber: true })}
              />
              {form.formState.errors.defaultTax && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.defaultTax.message}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Standard SGST/CGST or IGST percentage for yarn purchase and grey sales (Default 5%).</p>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 text-xs text-primary max-w-lg">
              <Info className="h-4.5 w-4.5 shrink-0 text-primary mt-0.5" />
              <p className="leading-relaxed">
                <strong>Audit note:</strong> Modifying the opening dates after entries are registered locks historical ledger records. Speak with your accounting administrator before committing adjustments.
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/5 border-t p-4 flex justify-between">
            <div className="flex gap-2 text-xs text-muted-foreground items-center">
              <Info className="h-4.5 w-4.5 text-primary shrink-0" />
              Saving changes will update functional currencies throughout invoicing logs.
            </div>
            
            <Button type="submit" className="shadow cursor-pointer select-none">
              <Save className="mr-1.5 h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageContainer>
  );
}
