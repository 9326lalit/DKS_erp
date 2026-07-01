"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Factory, Save, ArrowLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useERPStore, FactoryDetails } from "@/lib/store/use-erp-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/textile-erp/image-uploader";
import { Button } from "@/components/ui/button";

const factorySchema = z.object({
  factoryName: z.string().min(3, "Factory name must be at least 3 characters"),
  factoryCode: z.string().min(2, "Factory code must be at least 2 characters"),
  factoryType: z.string().min(1, "Select factory type"),
  factoryAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  factoryManager: z.string().min(2, "Manager name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  factoryImageUrl: z.string().optional(),
  workingHours: z.string().min(1, "Working hours are required"),
  shiftSystem: z.string().min(1, "Select shift system"),
  morningShiftStart: z.string(),
  morningShiftEnd: z.string(),
  nightShiftStart: z.string(),
  nightShiftEnd: z.string(),
  totalLooms: z.number().min(1, "Total looms must be at least 1"),
  factoryStatus: z.string()
});

type FactoryFormValues = z.infer<typeof factorySchema>;

export default function FactorySetupPage() {
  const router = useRouter();
  const { factoryDetails, setFactoryDetails } = useERPStore();

  // If no factory details are present (e.g. bypassed onboarding), seed standard defaults
  const initialValues: FactoryFormValues = factoryDetails || {
    factoryName: "Ichalkaranji Weaving Unit-I",
    factoryCode: "IWU-01",
    factoryType: "Powerloom Shed",
    factoryAddress: "Plot No. 45-48, MIDC Industrial Area, Ichalkaranji",
    city: "Ichalkaranji",
    district: "Kolhapur",
    state: "Maharashtra",
    country: "India",
    pincode: "416115",
    latitude: "16.6978",
    longitude: "74.4649",
    factoryManager: "Sanjay Patil",
    phone: "+91 98230 11223",
    email: "sanjay.patil@khairnartextile.com",
    factoryImageUrl: "",
    workingHours: "24 Hours (Continuous Run)",
    shiftSystem: "2-Shift System (12 Hours each)",
    morningShiftStart: "07:30 AM",
    morningShiftEnd: "07:30 PM",
    nightShiftStart: "07:30 PM",
    nightShiftEnd: "07:30 AM",
    totalLooms: 36,
    factoryStatus: "Active"
  };

  const form = useForm<FactoryFormValues>({
    resolver: zodResolver(factorySchema),
    defaultValues: initialValues
  });

  const onSubmit = (data: FactoryFormValues) => {
    setFactoryDetails(data);
    toast.success("Factory layout details saved successfully.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Factory Configuration Settings"
        description="View and update your powerloom weaving sheds, shift rosters, and active loom limits."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Business Setup" },
          { title: "Factory Details" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/default")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4">
            <CardTitle className="text-base font-bold font-display flex items-center gap-2">
              <Factory className="h-4.5 w-4.5 text-primary" />
              Loom Shed Profile & Capacity
            </CardTitle>
            <CardDescription className="text-xs">
              Ensure active loom counts align with your electricity load licenses and workforce allocations.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="factoryName" className="text-xs font-semibold">Factory / Unit Name *</Label>
                <Input id="factoryName" {...form.register("factoryName")} />
                {form.formState.errors.factoryName && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.factoryName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factoryCode" className="text-xs font-semibold">Factory Code *</Label>
                <Input id="factoryCode" {...form.register("factoryCode")} />
                {form.formState.errors.factoryCode && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.factoryCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="factoryType" className="text-xs font-semibold">Factory Shed Type *</Label>
                <Select
                  onValueChange={(val) => form.setValue("factoryType", val)}
                  value={form.watch("factoryType")}
                >
                  <SelectTrigger id="factoryType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Powerloom Shed">Powerloom Shed</SelectItem>
                    <SelectItem value="Autoloom Mill">Autoloom Mill (Shuttleless)</SelectItem>
                    <SelectItem value="Sizing Unit">Sizing & Warping Plant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalLooms" className="text-xs font-semibold">Active Looms Capacity *</Label>
                <Input
                  id="totalLooms"
                  type="number"
                  {...form.register("totalLooms", { valueAsNumber: true })}
                />
                {form.formState.errors.totalLooms && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.totalLooms.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="factoryAddress" className="text-xs font-semibold">Factory Address *</Label>
              <Input id="factoryAddress" {...form.register("factoryAddress")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-semibold">City *</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs font-semibold">State *</Label>
                <Input id="state" {...form.register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-xs font-semibold">Pincode *</Label>
                <Input id="pincode" {...form.register("pincode")} />
              </div>
            </div>

            {/* Geographical coordinates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-xs font-semibold">Latitude</Label>
                <Input id="latitude" {...form.register("latitude")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-xs font-semibold">Longitude</Label>
                <Input id="longitude" {...form.register("longitude")} />
              </div>
            </div>

            {/* Management contacts */}
            <div className="border-t pt-5 space-y-4">
              <h4 className="text-xs font-bold text-foreground">Management & Operational Control</h4>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="factoryManager" className="text-xs font-semibold">Factory Manager *</Label>
                  <Input id="factoryManager" {...form.register("factoryManager")} />
                  {form.formState.errors.factoryManager && (
                    <p className="text-[10px] text-destructive font-medium">{form.formState.errors.factoryManager.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold">Manager Mobile *</Label>
                  <Input id="phone" {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">Manager Email *</Label>
                  <Input id="email" {...form.register("email")} />
                </div>
              </div>
            </div>

            {/* Shifts configuration */}
            <div className="border-t pt-5 space-y-4">
              <h4 className="text-xs font-bold text-foreground">Shift System Config</h4>
              
              <div className="grid gap-4 sm:grid-cols-2 bg-muted/20 border border-border/10 p-4 rounded-xl">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Morning Shift Hours
                  </Label>
                  <div className="flex gap-2">
                    <Input readOnly {...form.register("morningShiftStart")} />
                    <span className="self-center text-xs text-muted-foreground">to</span>
                    <Input readOnly {...form.register("morningShiftEnd")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-900 animate-pulse" />
                    Night Shift Hours
                  </Label>
                  <div className="flex gap-2">
                    <Input readOnly {...form.register("nightShiftStart")} />
                    <span className="self-center text-xs text-muted-foreground">to</span>
                    <Input readOnly {...form.register("nightShiftEnd")} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-5">
              <ImageUploader
                label="Weaving Unit Entrance / Inside Image"
                value={form.watch("factoryImageUrl")}
                onChange={(val) => form.setValue("factoryImageUrl", val)}
              />
            </div>
          </CardContent>

          <CardFooter className="bg-muted/5 border-t p-4 flex justify-between">
            <div className="flex gap-2 text-xs text-muted-foreground items-center">
              <Info className="h-4.5 w-4.5 text-primary shrink-0" />
              Saving changes will update the loom summaries on the main dashboard instantly.
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
