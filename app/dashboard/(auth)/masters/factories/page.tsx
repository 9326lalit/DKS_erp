"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Factory, Trash2, Plus, ArrowLeft, Building2, MapPin, Zap, Ruler } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Factory as FactoryType } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { DetailViewCard } from "@/components/textile-erp/detail-view-card";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

// -------------------------------------------------------
// VALIDATION SCHEMA
// -------------------------------------------------------
const factorySchema = z.object({
  factoryName: z.string().min(2, "Factory name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  plotNo: z.string().min(1, "Plot/Survey No. is required"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  cityVillage: z.string().min(2, "City/Village is required"),
  taluka: z.string().min(2, "Taluka is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  shedLength: z.number().min(1, "Shed length is required"),
  shedWidth: z.number().min(1, "Shed width is required"),
  shedType: z.enum(["RCC", "Tin", "Mixed"]),
  noOfFloors: z.number().min(0).optional(),
  gstNumber: z.string().optional(),
  registrationNo: z.string().optional(),
  contactNumber: z.string().min(10, "Contact number is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  electricityMeterNo: z.string().optional(),
  establishmentDate: z.string().optional(),
  activeStatus: z.enum(["Active", "Inactive"]),
  notes: z.string().optional()
});

type FactoryFormValues = z.infer<typeof factorySchema>;

export default function FactoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({ activeStatus: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFactory, setEditFactory] = useState<FactoryType | null>(null);
  const [viewFactory, setViewFactory] = useState<FactoryType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FactoryType | null>(null);

  const { data: factories = [], isLoading } = useQuery({
    queryKey: ["factories"],
    queryFn: () => mastersApiService.getFactories()
  });

  const createMutation = useMutation({
    mutationFn: (f: FactoryType) => mastersApiService.createFactory(f),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      toast.success("Factory registered successfully.");
      setDialogOpen(false);
      form.reset(defaultValues);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (f: FactoryType) => mastersApiService.updateFactory(f),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      toast.success("Factory details updated.");
      setDialogOpen(false);
      setEditFactory(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteFactory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factories"] });
      toast.success("Factory deleted.");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  });

  const defaultValues: FactoryFormValues = {
    factoryName: "",
    ownerName: "",
    plotNo: "",
    addressLine1: "",
    addressLine2: "",
    cityVillage: "",
    taluka: "",
    district: "",
    state: "Maharashtra",
    pincode: "",
    shedLength: 0,
    shedWidth: 0,
    shedType: "RCC",
    noOfFloors: 1,
    gstNumber: "",
    registrationNo: "",
    contactNumber: "",
    email: "",
    electricityMeterNo: "",
    establishmentDate: "",
    activeStatus: "Active",
    notes: ""
  };

  const form = useForm<FactoryFormValues>({
    resolver: zodResolver(factorySchema),
    defaultValues
  });

  const shedLength = form.watch("shedLength") || 0;
  const shedWidth = form.watch("shedWidth") || 0;
  const totalArea = shedLength * shedWidth;

  const handleEditClick = (factory: FactoryType) => {
    setEditFactory(factory);
    setViewFactory(null);
    form.reset({
      factoryName: factory.factoryName,
      ownerName: factory.ownerName,
      plotNo: factory.plotNo,
      addressLine1: factory.addressLine1,
      addressLine2: factory.addressLine2 || "",
      cityVillage: factory.cityVillage,
      taluka: factory.taluka,
      district: factory.district,
      state: factory.state,
      pincode: factory.pincode,
      shedLength: factory.shedLength,
      shedWidth: factory.shedWidth,
      shedType: factory.shedType,
      noOfFloors: factory.noOfFloors || 1,
      gstNumber: factory.gstNumber || "",
      registrationNo: factory.registrationNo || "",
      contactNumber: factory.contactNumber,
      email: factory.email || "",
      electricityMeterNo: factory.electricityMeterNo || "",
      establishmentDate: factory.establishmentDate || "",
      activeStatus: factory.activeStatus,
      notes: factory.notes || ""
    });
    setDialogOpen(true);
  };

  const handleViewClick = (factory: FactoryType) => {
    setViewFactory(factory);
    setEditFactory(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (factory: FactoryType) => {
    setDeleteTarget(factory);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = (values: FactoryFormValues) => {
    const totalArea = values.shedLength * values.shedWidth;
    if (editFactory) {
      updateMutation.mutate({ ...editFactory, ...values, totalArea });
    } else {
      const seq = factories.length + 1;
      createMutation.mutate({
        id: `FAC-ID-${String(seq).padStart(3, "0")}-${Date.now()}`,
        factoryId: `FAC-${String(seq).padStart(3, "0")}`,
        ...values,
        totalArea
      });
    }
  };

  const filtered = factories.filter((f) => {
    const matchSearch =
      f.factoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.cityVillage.toLowerCase().includes(searchValue.toLowerCase()) ||
      f.factoryId.toLowerCase().includes(searchValue.toLowerCase());
    const matchStatus = selectedFilters.activeStatus === "all" || f.activeStatus === selectedFilters.activeStatus;
    return matchSearch && matchStatus;
  });

  const columns: TableColumn<FactoryType>[] = [
    { key: "createdDate", header: "Created Date", render: (item) => <span className="font-mono text-xs text-muted-foreground">{item.createdDate || item.establishmentDate || "25 Jul 2026"}</span>, sortable: true },
    { key: "factoryId", header: "Factory ID", sortable: true },
    { key: "factoryName", header: "Factory Name", sortable: true },
    { key: "ownerName", header: "Owner Name", sortable: true },
    { key: "cityVillage", header: "City/Village", sortable: true },
    {
      key: "shedType",
      header: "Shed Type",
      render: (item) => (
        <Badge variant="outline" className="text-[10px] font-semibold">
          {item.shedType}
        </Badge>
      )
    },
    {
      key: "totalArea",
      header: "Area (sq ft)",
      render: (item) => (
        <span className="font-semibold">{item.totalArea.toLocaleString()}</span>
      ),
      sortable: true
    },
    { key: "contactNumber", header: "Contact" },
    {
      key: "activeStatus",
      header: "Status",
      render: (item) => <StatusBadge status={item.activeStatus} type="general" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Factory Master"
        description="Register and manage all physical weaving factory units — shed dimensions, ownership, GST, and operational status."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters", href: "/dashboard/masters/factories" },
          { title: "Factory Master" }
        ]}
      />

      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Register New Factory"
        onCreateClick={() => {
          setEditFactory(null);
          setViewFactory(null);
          form.reset(defaultValues);
          setDialogOpen(true);
        }}
        exportTitle="Factories"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ activeStatus: "all" });
        }}
        filters={[
          {
            key: "activeStatus",
            placeholder: "Status",
            options: [
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" }
            ]
          }
        ]}
      />

      <MasterTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onStatusToggle={(item) => updateMutation.mutate({ ...item, activeStatus: item.activeStatus === "Active" ? "Inactive" : "Active" })}
        onBulkDelete={(items) => items.forEach((i) => deleteMutation.mutate(i.id))}
      />

      {/* Create/Edit/View Dialog */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditFactory(null);
          setViewFactory(null);
        }}
        title={
          viewFactory
            ? `Factory Profile: ${viewFactory.factoryName}`
            : editFactory
              ? `Edit Factory: ${editFactory.factoryName}`
              : "Register New Factory"
        }
        description={
          viewFactory
            ? `Factory ID: ${viewFactory.factoryId} | Area: ${viewFactory.totalArea.toLocaleString()} sq ft`
            : "Enter factory details including shed dimensions, GST registration, and contact information."
        }
      >
        {viewFactory ? (
          <DetailViewCard
            title={viewFactory.factoryName}
            subtitle={`Owner: ${viewFactory.ownerName} • Shed Type: ${viewFactory.shedType}`}
            statusBadge={<StatusBadge status={viewFactory.activeStatus} />}
            sections={[
              {
                title: "Factory Profile & Ownership",
                fields: [
                  { label: "Factory Name", value: viewFactory.factoryName, highlight: true },
                  { label: "Owner Name", value: viewFactory.ownerName, highlight: true },
                  { label: "Contact Phone", value: viewFactory.contactNumber, mono: true },
                  { label: "Email Address", value: viewFactory.email || "—" },
                  { label: "GST Number", value: viewFactory.gstNumber || "N/A", mono: true },
                  { label: "EB Meter No.", value: viewFactory.electricityMeterNo || "N/A", mono: true }
                ]
              },
              {
                title: "Shed Dimensions & Premises",
                fields: [
                  { label: "Shed Type", value: viewFactory.shedType, badge: true },
                  { label: "Dimensions (L × W)", value: `${viewFactory.shedLength} × ${viewFactory.shedWidth} ft`, mono: true },
                  { label: "Total Area", value: `${viewFactory.totalArea.toLocaleString()} sq ft`, highlight: true },
                  { label: "Full Address", value: `Plot No. ${viewFactory.plotNo}, ${viewFactory.addressLine1}${viewFactory.addressLine2 ? `, ${viewFactory.addressLine2}` : ""}, ${viewFactory.cityVillage}, ${viewFactory.taluka}, ${viewFactory.district}, ${viewFactory.state} — ${viewFactory.pincode}`, colSpan: 3 }
                ]
              }
            ]}
          >
            {viewFactory.notes && (
              <div className="p-3 bg-card border border-border/30 rounded-lg">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Remarks</span>
                <p className="text-xs mt-1 text-foreground">{viewFactory.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 px-6 cursor-pointer">
                Close Details
              </Button>
            </div>
          </DetailViewCard>
        ) : (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Factory Name *</Label>
                <Input {...form.register("factoryName")} placeholder="e.g. Shivaji Weaving Factory" />
                {form.formState.errors.factoryName && <p className="text-[10px] text-destructive">{form.formState.errors.factoryName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Owner Name *</Label>
                <Input {...form.register("ownerName")} placeholder="Full name of factory owner" />
                {form.formState.errors.ownerName && <p className="text-[10px] text-destructive">{form.formState.errors.ownerName.message}</p>}
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-border/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Factory Address</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Plot / Survey No. *</Label>
                  <Input {...form.register("plotNo")} placeholder="e.g. Plot No. 45-A / Gat No. 102" />
                  {form.formState.errors.plotNo && <p className="text-[10px] text-destructive">{form.formState.errors.plotNo.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Address Line 1 *</Label>
                  <Input {...form.register("addressLine1")} placeholder="Street / Area" />
                  {form.formState.errors.addressLine1 && <p className="text-[10px] text-destructive">{form.formState.errors.addressLine1.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Address Line 2</Label>
                <Input {...form.register("addressLine2")} placeholder="Landmark / Ward No." />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City / Village *</Label>
                  <Input {...form.register("cityVillage")} placeholder="e.g. Ichalkaranji" />
                  {form.formState.errors.cityVillage && <p className="text-[10px] text-destructive">{form.formState.errors.cityVillage.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Taluka *</Label>
                  <Input {...form.register("taluka")} placeholder="e.g. Shirol" />
                  {form.formState.errors.taluka && <p className="text-[10px] text-destructive">{form.formState.errors.taluka.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">District *</Label>
                  <Input {...form.register("district")} placeholder="e.g. Kolhapur" />
                  {form.formState.errors.district && <p className="text-[10px] text-destructive">{form.formState.errors.district.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">State *</Label>
                  <Input {...form.register("state")} placeholder="Maharashtra" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">PIN Code *</Label>
                  <Input {...form.register("pincode")} placeholder="416115" />
                  {form.formState.errors.pincode && <p className="text-[10px] text-destructive">{form.formState.errors.pincode.message}</p>}
                </div>
              </div>
            </div>

            {/* Shed Details */}
            <div className="border-t border-border/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Ruler className="h-3 w-3" /> Shed Dimensions</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Shed Length (ft) *</Label>
                  <Input type="number" step="0.01" {...form.register("shedLength", { valueAsNumber: true })} placeholder="e.g. 120" />
                  {form.formState.errors.shedLength && <p className="text-[10px] text-destructive">{form.formState.errors.shedLength.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Shed Width (ft) *</Label>
                  <Input type="number" step="0.01" {...form.register("shedWidth", { valueAsNumber: true })} placeholder="e.g. 60" />
                  {form.formState.errors.shedWidth && <p className="text-[10px] text-destructive">{form.formState.errors.shedWidth.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Area (auto)</Label>
                  <div className="h-10 px-3 flex items-center rounded-md border bg-muted/40 text-sm font-bold text-foreground">
                    {totalArea > 0 ? `${totalArea.toLocaleString()} sq ft` : "—"}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Shed Type *</Label>
                  <Select onValueChange={(val) => form.setValue("shedType", val as any)} value={form.watch("shedType")}>
                    <SelectTrigger><SelectValue placeholder="Select Shed Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RCC">RCC (Reinforced Concrete)</SelectItem>
                      <SelectItem value="Tin">Tin Shed</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">No. of Floors</Label>
                  <Input type="number" min="1" {...form.register("noOfFloors", { valueAsNumber: true })} placeholder="1" />
                </div>
              </div>
            </div>

            {/* Registration & Contact */}
            <div className="border-t border-border/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Registration & Contact</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GST Number</Label>
                  <Input {...form.register("gstNumber")} placeholder="27AAIPK1234F1Z5" className="uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Registration No. (MSME/Factory)</Label>
                  <Input {...form.register("registrationNo")} placeholder="MH-MSME-2024-0456" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contact Number *</Label>
                  <Input {...form.register("contactNumber")} placeholder="+91 98765 43210" />
                  {form.formState.errors.contactNumber && <p className="text-[10px] text-destructive">{form.formState.errors.contactNumber.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input type="email" {...form.register("email")} placeholder="factory@email.com" />
                </div>
              </div>
            </div>

            {/* Utility & Status */}
            <div className="border-t border-border/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5"><Zap className="h-3 w-3" /> Utility & Status</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Electricity Meter No.</Label>
                  <Input {...form.register("electricityMeterNo")} placeholder="EB Meter Reference" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Establishment Date</Label>
                  <Input type="date" {...form.register("establishmentDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Active Status *</Label>
                  <Select onValueChange={(val) => form.setValue("activeStatus", val as any)} value={form.watch("activeStatus")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notes / Remarks</Label>
                <Textarea rows={2} {...form.register("notes")} placeholder="Any additional factory remarks..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editFactory ? "Update Factory" : "Register Factory"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete Factory?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete <strong>{deleteTarget?.factoryName}</strong> ({deleteTarget?.factoryId}).
              All linked looms and labour records will lose their factory reference. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete Factory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
