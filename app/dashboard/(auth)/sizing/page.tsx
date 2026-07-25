"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus, CheckCircle, PackageCheck, Scissors, Search, Filter,
  Layers, Warehouse, Truck, RefreshCw, Calculator, ShieldCheck,
  FileDown, ChevronDown, ChevronUp
} from "lucide-react";

import { useSizingStore, OpeningStockEntry, FactoryReceivingEntry, PipeItem } from "@/lib/store/use-sizing-store";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// ----------------------------------------------------
// HELPER: CSV EXPORTER
// ----------------------------------------------------
function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    toast.error("No records available to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = r[h] === undefined || r[h] === null ? "" : String(r[h]).replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(",")
      )
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${filename} successfully!`);
}

// ----------------------------------------------------
// VALIDATION SCHEMAS
// ----------------------------------------------------

const openingStockSchema = z.object({
  date: z.string().min(1, "Date required"),
  sizingName: z.string().min(1, "Sizing Name required"),
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

const productionSchema = z.object({
  date: z.string().min(1, "Date required"),
  sizingName: z.string().min(1, "Sizing Mill required"),
  poNumber: z.string().min(1, "PO Number required"),
  setNumber: z.string().min(1, "Set Number required"),
  bagsIssued: z.number().min(1, "Bags required"),
  weightPerBagKg: z.number().min(1, "Weight per bag required"),
  sizingChemicalAddedKg: z.number().optional(),
  bhimCount: z.number().min(1, "Bhim count required"),
  cutPerBhim: z.number().min(1, "Cut per Bhim required"),
  ratePerKg: z.number().min(0.1, "Rate per kg required"),
  remarks: z.string().optional()
});

const factoryReceivingSchema = z.object({
  date: z.string().min(1, "Date required"),
  sizingName: z.string().min(1, "Sizing Name required"),
  poNumber: z.string().min(1, "PO Number required"),
  setNumber: z.string().min(1, "Set Number required"),
  bhimReceived: z.number().min(1, "Bhim Received required"),
  pipesReceived: z.number().min(1, "Pipes Received required"),
  status: z.enum(["Received", "Partial", "Pending"]),
  remarks: z.string().optional()
});

type OpeningStockValues = z.infer<typeof openingStockSchema>;
type ProductionValues = z.infer<typeof productionSchema>;
type FactoryReceivingValues = z.infer<typeof factoryReceivingSchema>;

export default function SizingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Zustand Store
  const {
    batches,
    openingStocks,
    factoryReceivings,
    pipes,
    totalMaterialReceivedKg,
    totalMaterialUsedKg,
    remainingStockKg,
    createBatch,
    createOpeningStock,
    createFactoryReceiving
  } = useSizingStore();

  // Master Data Dropdowns
  const { data: sizingMills = [] } = useQuery({ queryKey: ["sizingMills"], queryFn: () => mastersApiService.getSizingMills() });
  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const { data: pos = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });

  // Dialog States
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [receivingModalOpen, setReceivingModalOpen] = useState(false);

  // Pipe Breakdown Expand Drawer state
  const [expandedSetNumber, setExpandedSetNumber] = useState<string | null>(null);

  // Default values
  const defaultSizingName = sizingMills[0]?.millName || "Sumit Sizing Works";
  const defaultOwner = parties[0]?.partyName || "Dhandai Textiles (Own Firm)";

  // FORMS
  const openingForm = useForm<OpeningStockValues>({
    resolver: zodResolver(openingStockSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sizingName: defaultSizingName,
      materialOwner: defaultOwner,
      poNumber: pos[0]?.poNumber || "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      totalBags: 10,
      totalWeightKg: 500,
      setNumber: "SET-100",
      totalTaar: 2800,
      totalPipes: 11,
      weightPerPipeKg: 33,
      materialUsedKg: 400,
      remarks: ""
    }
  });

  const productionForm = useForm<ProductionValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sizingName: defaultSizingName,
      poNumber: pos[0]?.poNumber || "TANA/PO/2026/04/05/0001",
      setNumber: "SET-100",
      bagsIssued: 10,
      weightPerBagKg: 50,
      bhimCount: 11,
      cutPerBhim: 15,
      ratePerKg: 5,
      remarks: ""
    }
  });

  const receivingForm = useForm<FactoryReceivingValues>({
    resolver: zodResolver(factoryReceivingSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      sizingName: defaultSizingName,
      poNumber: pos[0]?.poNumber || "TANA/PO/2026/04/05/0001",
      setNumber: "SET-100",
      bhimReceived: 11,
      pipesReceived: 11,
      status: "Received",
      remarks: "11 Bhim & 11 Pipes received in factory."
    }
  });

  // ----------------------------------------------------
  // AUTO POPULATION HANDLER FOR PO SELECTION
  // ----------------------------------------------------

  const handlePOSelectOpening = (selectedPoNo: string) => {
    openingForm.setValue("poNumber", selectedPoNo);
    const po = pos.find((p) => p.poNumber === selectedPoNo);
    if (po) {
      openingForm.setValue("itemName", po.itemName || "40s Cotton Warp Yarn");
      openingForm.setValue("totalBags", po.totalBagsOrdered || 10);
      openingForm.setValue("totalWeightKg", po.totalWeightKg || 500);
      openingForm.setValue("materialOwner", po.purchaseFromName || defaultOwner);
      openingForm.setValue("tanaNumber", `TN-${po.hsnCode || "40S"}-001`);

      // Auto update pipes weight per pipe
      const pCount = openingForm.getValues("totalPipes") || 11;
      const calcWt = parseFloat(((po.totalWeightKg || 500) / pCount).toFixed(2));
      openingForm.setValue("weightPerPipeKg", calcWt);

      toast.info(`Auto-populated PO info for ${selectedPoNo}: ${po.itemName}, ${po.totalBagsOrdered} Bags, ${po.totalWeightKg} KG`);
    }
  };

  const handlePOSelectProduction = (selectedPoNo: string) => {
    productionForm.setValue("poNumber", selectedPoNo);
    const po = pos.find((p) => p.poNumber === selectedPoNo);
    if (po) {
      productionForm.setValue("bagsIssued", po.totalBagsOrdered || 10);
      productionForm.setValue("weightPerBagKg", po.perBagWeightKg || 50);
      toast.info(`Auto-populated Production PO info for ${selectedPoNo}`);
    }
  };

  // Watched Values for Production Calculations
  const prodBhim = productionForm.watch("bhimCount") || 0;
  const prodCuts = productionForm.watch("cutPerBhim") || 0;
  const prodTotalCuts = prodBhim * prodCuts; // Auto calculation: Bhim × Cuts/Bhim

  const prodBags = productionForm.watch("bagsIssued") || 0;
  const prodBagWeight = productionForm.watch("weightPerBagKg") || 0;
  const prodTotalWeight = prodBags * prodBagWeight;

  const prodRate = productionForm.watch("ratePerKg") || 0;
  const prodSizingCharge = prodTotalWeight * prodRate; // Auto calculation: Material Used × Rate

  // Watched Values for Opening Stock Calculations
  const opBags = openingForm.watch("totalBags") || 0;
  const opTotWeight = openingForm.watch("totalWeightKg") || 0;
  const opPipes = openingForm.watch("totalPipes") || 0;
  const opWtPipe = openingForm.watch("weightPerPipeKg") || 0;
  const opTotSetWeight = opPipes * opWtPipe;
  const opUsed = openingForm.watch("materialUsedKg") || 0;
  const opRemaining = Math.max(0, opTotWeight - opUsed);

  // ----------------------------------------------------
  // SUBMIT HANDLERS
  // ----------------------------------------------------

  const handleOpeningSubmit = (values: OpeningStockValues) => {
    const entry: OpeningStockEntry = {
      id: `OP-STOCK-${Date.now()}`,
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
      totalSetWeightKg: values.totalPipes * values.weightPerPipeKg,
      materialUsedKg: values.materialUsedKg,
      remainingStockKg: Math.max(0, values.totalWeightKg - values.materialUsedKg),
      remarks: values.remarks
    };

    createOpeningStock(entry);
    toast.success(`Opening Stock saved for Set ${values.setNumber}! Generated Pipes 1 to ${values.totalPipes} automatically.`);
    setOpeningModalOpen(false);
  };

  const handleProductionSubmit = (values: ProductionValues) => {
    const totalWeight = values.bagsIssued * values.weightPerBagKg;
    const totalCuts = values.bhimCount * values.cutPerBhim;
    const sizingCharges = totalWeight * values.ratePerKg;

    const batch = {
      id: `SZ-ID-${Date.now()}`,
      batchNumber: `SZ-2026-${String(batches.length + 1).padStart(4, "0")}`,
      dateIssuedToSizing: values.date,
      bagsIssued: values.bagsIssued,
      weightIssuedKg: totalWeight,
      bhimCount: values.bhimCount,
      cutPerBhim: values.cutPerBhim,
      totalCuts,
      totalPipes: values.bhimCount,
      materialUsedKg: totalWeight,
      ratePerKg: values.ratePerKg,
      sizingChargesRs: sizingCharges,
      sizingDoneBy: "Outsourced" as const,
      outsourcedPartyName: values.sizingName,
      status: "Completed" as const,
      remarks: values.remarks
    };

    createBatch(batch);
    toast.success(`Production Entry saved! Total Cuts: ${totalCuts}, Sizing Charge: ₹${sizingCharges.toLocaleString("en-IN")}`);
    setProductionModalOpen(false);
  };

  const handleReceivingSubmit = (values: FactoryReceivingValues) => {
    const entry: FactoryReceivingEntry = {
      id: `RCV-${Date.now()}`,
      date: values.date,
      sizingName: values.sizingName,
      poNumber: values.poNumber,
      setNumber: values.setNumber,
      bhimReceived: values.bhimReceived,
      pipesReceived: values.pipesReceived,
      remarks: values.remarks,
      status: values.status
    };

    createFactoryReceiving(entry);
    toast.success(`Factory Receiving Entry saved for Set ${values.setNumber}!`);
    setReceivingModalOpen(false);
  };

  // CSV EXPORT HANDLERS
  const handleExportOpeningStock = () => {
    const data = openingStocks.map((o) => ({
      "Date": o.date,
      "Sizing Mill": o.sizingName,
      "Material Owner (Buyer)": o.materialOwner,
      "PO Number": o.poNumber,
      "Tana Number": o.tanaNumber,
      "Item Name": o.itemName,
      "Total Bags": o.totalBags,
      "Total Weight (Kg)": o.totalWeightKg,
      "Set Number": o.setNumber,
      "Total Taar": o.totalTaar,
      "Total Pipes": o.totalPipes,
      "Weight/Pipe (Kg)": o.weightPerPipeKg,
      "Material Used (Kg)": o.materialUsedKg,
      "Remaining Stock (Kg)": o.remainingStockKg
    }));
    downloadCSV("Sizing_Opening_Stock_Records.csv", data);
  };

  const handleExportProduction = () => {
    const data = batches.map((b) => ({
      "Batch #": b.batchNumber,
      "Date": b.dateIssuedToSizing,
      "Sizing Unit": b.outsourcedPartyName || "In-house",
      "Bags Issued": b.bagsIssued,
      "Weight Issued (Kg)": b.weightIssuedKg,
      "Bhim Count": b.bhimCount || 11,
      "Cuts per Bhim": b.cutPerBhim || 15,
      "Total Cuts": b.totalCuts || 165,
      "Rate/Kg (Rs)": b.ratePerKg || 5,
      "Total Sizing Charge (Rs)": b.sizingChargesRs || 2500,
      "Status": b.status
    }));
    downloadCSV("Sizing_Production_Records.csv", data);
  };

  const handleExportFactoryReceiving = () => {
    const data = factoryReceivings.map((r) => ({
      "Date": r.date,
      "Sizing Mill": r.sizingName,
      "PO Number": r.poNumber,
      "Set Number": r.setNumber,
      "Bhim Received": r.bhimReceived,
      "Pipes Received": r.pipesReceived,
      "Status": r.status,
      "Remarks": r.remarks || ""
    }));
    downloadCSV("Factory_Receiving_Records.csv", data);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Sizing & Material Flow Module"
        description="Auto-population via PO selection, entity dropdowns, live stock balances, and pipe breakdowns."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing Module" }
        ]}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-primary/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Material Received</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-foreground">{totalMaterialReceivedKg.toLocaleString()} KG</p>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">GRN / Opening</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-amber-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material Used in Sizing</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-amber-600">{totalMaterialUsedKg.toLocaleString()} KG</p>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600">Sized Yarn</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-emerald-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remaining Stock Balance</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-emerald-600">{remainingStockKg.toLocaleString()} KG</p>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">Auto Updated</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm relative overflow-hidden bg-blue-500/[0.02]">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sizing Charges</p>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-extrabold text-blue-600">
                ₹{batches.reduce((acc, b) => acc + (b.sizingChargesRs || 0), 0).toLocaleString("en-IN")}
              </p>
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600">Job Work</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="cursor-pointer text-xs font-semibold">Overview & Stock</TabsTrigger>
          <TabsTrigger value="production" className="cursor-pointer text-xs font-semibold">Sizing Production</TabsTrigger>
          <TabsTrigger value="opening-stock" className="cursor-pointer text-xs font-semibold">Opening Stock Form</TabsTrigger>
          <TabsTrigger value="factory-receiving" className="cursor-pointer text-xs font-semibold">Factory Receiving</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & STOCK TRACKING */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Live Material Stock Tracking</CardTitle>
                <CardDescription className="text-xs">
                  Formula: Remaining Material Stock = Total Material Received - Material Used
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Live Calculation</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-xs text-muted-foreground font-semibold">Total Material Received</p>
                  <p className="text-xl font-bold text-foreground mt-1">{totalMaterialReceivedKg.toLocaleString()} KG</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-xs text-muted-foreground font-semibold">Material Used in Sizing</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">{totalMaterialUsedKg.toLocaleString()} KG</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-700 font-semibold">Remaining Material Available</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">{remainingStockKg.toLocaleString()} KG</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: SIZING PRODUCTION MODULE */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="production" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold">Sizing Production Log</CardTitle>
                <CardDescription className="text-xs">
                  Automated Total Cuts (`Bhim × Cuts/Bhim`) and Sizing Charges (`Material Used × Rate/kg`).
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportProduction} className="h-8 text-xs gap-1.5 cursor-pointer">
                  <FileDown className="h-3.5 w-3.5" /> Download CSV
                </Button>
                <Button size="sm" onClick={() => setProductionModalOpen(true)} className="h-8 text-xs gap-1.5 cursor-pointer font-bold">
                  <Plus className="h-3.5 w-3.5" /> New Production Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="text-xs font-bold">
                    <TableHead>Batch #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sizing Unit</TableHead>
                    <TableHead className="text-center">Bags / Weight</TableHead>
                    <TableHead className="text-center">Bhim × Cuts/Bhim</TableHead>
                    <TableHead className="text-center">Total Cuts</TableHead>
                    <TableHead className="text-right">Sizing Rate (₹/kg)</TableHead>
                    <TableHead className="text-right">Total Sizing Charge (₹)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="font-mono font-bold text-primary">{b.batchNumber}</TableCell>
                      <TableCell>{b.dateIssuedToSizing}</TableCell>
                      <TableCell className="font-semibold">{b.outsourcedPartyName || "In-house Mill"}</TableCell>
                      <TableCell className="text-center">{b.bagsIssued} Bags / {b.weightIssuedKg} KG</TableCell>
                      <TableCell className="text-center font-mono">{b.bhimCount || 11} Bhim × {b.cutPerBhim || 15}</TableCell>
                      <TableCell className="text-center font-bold text-foreground">{b.totalCuts || (b.bhimCount * b.cutPerBhim) || 165}</TableCell>
                      <TableCell className="text-right font-mono">₹{b.ratePerKg || 5}/kg</TableCell>
                      <TableCell className="text-right font-bold font-mono text-emerald-600">
                        ₹{(b.sizingChargesRs || (b.materialUsedKg * (b.ratePerKg || 5))).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{b.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: OPENING STOCK FORM & PIPES 1..N BREAKDOWN */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="opening-stock" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold">Opening Stock Register & Pipe Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  PO selection auto-populates item name, total bags, total weight, owner, and creates Pipes 1 to N automatically.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportOpeningStock} className="h-8 text-xs gap-1.5 cursor-pointer">
                  <FileDown className="h-3.5 w-3.5" /> Download CSV
                </Button>
                <Button size="sm" onClick={() => setOpeningModalOpen(true)} className="h-8 text-xs gap-1.5 cursor-pointer font-bold">
                  <Plus className="h-3.5 w-3.5" /> Entry Opening Stock Form
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="text-xs font-bold">
                    <TableHead></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sizing Name</TableHead>
                    <TableHead>Material Owner (Konacha Maal)</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Set # / Item</TableHead>
                    <TableHead className="text-center">Bags / Weight</TableHead>
                    <TableHead className="text-center">Taar & Pipes</TableHead>
                    <TableHead className="text-right">Material Used</TableHead>
                    <TableHead className="text-right font-bold text-emerald-600">Remaining Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openingStocks.map((op) => {
                    const isExpanded = expandedSetNumber === op.setNumber;
                    const setPipes = pipes.filter((p) => p.setNumber === op.setNumber);

                    return (
                      <React.Fragment key={op.id}>
                        <TableRow className="text-xs hover:bg-muted/10">
                          <TableCell className="w-8 text-center p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSetNumber(isExpanded ? null : op.setNumber)}
                              className="h-6 w-6 p-0 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          </TableCell>
                          <TableCell>{op.date}</TableCell>
                          <TableCell className="font-semibold">{op.sizingName}</TableCell>
                          <TableCell><Badge variant="outline" className="bg-blue-500/10 text-blue-600">{op.materialOwner}</Badge></TableCell>
                          <TableCell className="font-mono text-xs text-primary font-bold">{op.poNumber}</TableCell>
                          <TableCell className="font-mono font-semibold">{op.setNumber} ({op.itemName})</TableCell>
                          <TableCell className="text-center">{op.totalBags} Bags / {op.totalWeightKg} KG</TableCell>
                          <TableCell className="text-center font-mono">{op.totalTaar} Taar | {op.totalPipes} Pipes</TableCell>
                          <TableCell className="text-right font-mono">{op.materialUsedKg} KG</TableCell>
                          <TableCell className="text-right font-bold font-mono text-emerald-600">{op.remainingStockKg} KG</TableCell>
                        </TableRow>

                        {/* Pipes 1 to N Detailed Breakdown Drawer */}
                        {isExpanded && (
                          <TableRow className="bg-muted/15 border-b border-border/30">
                            <TableCell colSpan={10} className="p-4">
                              <div className="bg-card rounded-lg border border-border/40 p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-foreground">
                                    Pipes Breakdown for Set {op.setNumber} ({setPipes.length} Pipes)
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    Weight per Pipe: ~{op.weightPerPipeKg} KG | Total Set Weight: {op.totalSetWeightKg || (op.totalPipes * op.weightPerPipeKg)} KG
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                                  {setPipes.map((p, idx) => (
                                    <div key={p.id} className="p-2 rounded border border-border/40 bg-muted/20 flex flex-col gap-0.5">
                                      <div className="flex justify-between font-bold">
                                        <span className="font-mono text-primary">Pipe #{idx + 1}</span>
                                        <span className="font-mono">{p.weightKg} KG</span>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground truncate">{p.pipeNumber}</span>
                                      <Badge variant="outline" className="text-[9px] w-fit mt-1">{p.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: FACTORY RECEIVING ENTRY */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="factory-receiving" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold">Factory Receiving Entry Screen</CardTitle>
                <CardDescription className="text-xs">
                  Track returned Sized Sets from Sizing Mill to Factory (Bhim count, Pipes count, status & remarks).
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportFactoryReceiving} className="h-8 text-xs gap-1.5 cursor-pointer">
                  <FileDown className="h-3.5 w-3.5" /> Download CSV
                </Button>
                <Button size="sm" onClick={() => setReceivingModalOpen(true)} className="h-8 text-xs gap-1.5 cursor-pointer font-bold">
                  <Plus className="h-3.5 w-3.5" /> Record Factory Receiving
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="text-xs font-bold">
                    <TableHead>Date</TableHead>
                    <TableHead>Sizing Mill Name</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Set Number</TableHead>
                    <TableHead className="text-center">Bhim Received</TableHead>
                    <TableHead className="text-center">Pipes Received</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factoryReceivings.map((rcv) => (
                    <TableRow key={rcv.id} className="text-xs">
                      <TableCell>{rcv.date}</TableCell>
                      <TableCell className="font-semibold">{rcv.sizingName}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">{rcv.poNumber}</TableCell>
                      <TableCell className="font-mono font-bold text-foreground">{rcv.setNumber}</TableCell>
                      <TableCell className="text-center font-bold">{rcv.bhimReceived} Bhim</TableCell>
                      <TableCell className="text-center font-bold">{rcv.pipesReceived} Pipes</TableCell>
                      <TableCell className="text-muted-foreground">{rcv.remarks || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{rcv.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---------------------------------------------------- */}
      {/* DIALOG 1: OPENING STOCK FORM WITH PO AUTO-POPULATE */}
      {/* ---------------------------------------------------- */}
      <Dialog open={openingModalOpen} onOpenChange={setOpeningModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Opening Stock Entry Form (Sizing Process)</DialogTitle>
            <DialogDescription className="text-xs">
              Select PO Number to auto-populate Item Name, Total Bags, Weight, and Buyer Name.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={openingForm.handleSubmit(handleOpeningSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input type="date" {...openingForm.register("date")} className="h-8 text-xs" />
              </div>
              
              {/* Sizing Mill Selection Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Sizing Name (Select Mill) *</Label>
                <Select
                  onValueChange={(v) => openingForm.setValue("sizingName", v)}
                  value={openingForm.watch("sizingName")}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select sizing mill" /></SelectTrigger>
                  <SelectContent>
                    {sizingMills.map((m) => (
                      <SelectItem key={m.id} value={m.millName}>{m.millName}</SelectItem>
                    ))}
                    {sizingMills.length === 0 && (
                      <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* PO Number Select Dropdown -> Auto Populates Linked Info */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-primary">PO Number (Select to Auto-Fill) *</Label>
                <Select
                  onValueChange={handlePOSelectOpening}
                  value={openingForm.watch("poNumber")}
                >
                  <SelectTrigger className="h-8 text-xs font-mono border-primary/40"><SelectValue placeholder="Select PO #" /></SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>{p.poNumber} — {p.itemName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Material Owner / Buyer Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Material Owner (Konacha Maal) *</Label>
                <Select
                  onValueChange={(v) => openingForm.setValue("materialOwner", v)}
                  value={openingForm.watch("materialOwner")}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select owner / buyer" /></SelectTrigger>
                  <SelectContent>
                    {parties.map((p) => (
                      <SelectItem key={p.id} value={p.partyName}>{p.partyName}</SelectItem>
                    ))}
                    <SelectItem value="DKS Textiles (Own Firm)">DKS Textiles (Own Firm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tana Number *</Label>
                <Input {...openingForm.register("tanaNumber")} className="h-8 text-xs font-mono" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Item Name (Auto) *</Label>
                <Input {...openingForm.register("itemName")} className="h-8 text-xs bg-muted/20 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Bags (Auto) *</Label>
                <Input type="number" {...openingForm.register("totalBags", { valueAsNumber: true })} className="h-8 text-xs bg-muted/20" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Weight Kg (Auto) *</Label>
                <Input type="number" {...openingForm.register("totalWeightKg", { valueAsNumber: true })} className="h-8 text-xs bg-muted/20 font-bold" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number *</Label>
                <Select onValueChange={(v) => openingForm.setValue("setNumber", v)} value={openingForm.watch("setNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SET-100">SET-100</SelectItem>
                    <SelectItem value="SET-121">SET-121</SelectItem>
                    <SelectItem value="SET-2026-001">SET-2026-001</SelectItem>
                    <SelectItem value="SET-2026-002">SET-2026-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Taar (Ends) *</Label>
                <Input type="number" {...openingForm.register("totalTaar", { valueAsNumber: true })} className="h-8 text-xs" placeholder="2800" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Pipes (1 to N) *</Label>
                <Input
                  type="number"
                  {...openingForm.register("totalPipes", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const pCount = Number(e.target.value) || 1;
                      const totWt = openingForm.getValues("totalWeightKg") || 500;
                      openingForm.setValue("weightPerPipeKg", parseFloat((totWt / pCount).toFixed(2)));
                    }
                  })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Weight per Pipe (Kg) *</Label>
                <Input type="number" step="0.1" {...openingForm.register("weightPerPipeKg", { valueAsNumber: true })} className="h-8 text-xs font-mono" />
              </div>
            </div>

            {/* Calculated Balances Summary */}
            <div className="p-3 bg-muted/20 border border-border/40 rounded-lg space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Calculated Set Weight ({opPipes} Pipes × {opWtPipe} Kg):</span><span className="font-bold">{opTotSetWeight} KG</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Material Used:</span><span className="font-mono">{opUsed} KG</span></div>
              <div className="flex justify-between text-emerald-600 font-bold"><span className="text-emerald-700">Remaining Available Stock:</span><span className="font-mono">{opRemaining} KG</span></div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpeningModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="submit" className="h-8 text-xs font-bold">Save Opening Stock & Generate Pipes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------- */}
      {/* DIALOG 2: SIZING PRODUCTION FORM */}
      {/* ---------------------------------------------------- */}
      <Dialog open={productionModalOpen} onOpenChange={setProductionModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">New Sizing Production Entry</DialogTitle>
            <DialogDescription className="text-xs">
              Auto-calculates Cuts (`Bhim × Cuts/Bhim`) and Sizing Charges (`Material Used × Rate/kg`).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={productionForm.handleSubmit(handleProductionSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input type="date" {...productionForm.register("date")} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Sizing Mill *</Label>
                <Select onValueChange={(v) => productionForm.setValue("sizingName", v)} value={productionForm.watch("sizingName")}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select sizing mill" /></SelectTrigger>
                  <SelectContent>
                    {sizingMills.map((m) => (
                      <SelectItem key={m.id} value={m.millName}>{m.millName}</SelectItem>
                    ))}
                    {sizingMills.length === 0 && <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-primary">PO Number (Select to Auto-Fill) *</Label>
                <Select onValueChange={handlePOSelectProduction} value={productionForm.watch("poNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select PO #" /></SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>{p.poNumber} — {p.itemName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number *</Label>
                <Select onValueChange={(v) => productionForm.setValue("setNumber", v)} value={productionForm.watch("setNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SET-100">SET-100</SelectItem>
                    <SelectItem value="SET-121">SET-121</SelectItem>
                    <SelectItem value="SET-2026-001">SET-2026-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Bags Issued *</Label>
                <Input type="number" {...productionForm.register("bagsIssued", { valueAsNumber: true })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Per Bag Weight (Kg) *</Label>
                <Input type="number" step="0.1" {...productionForm.register("weightPerBagKg", { valueAsNumber: true })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-emerald-600">Chemical Added (Kg)</Label>
                <Input type="number" step="0.1" {...productionForm.register("sizingChemicalAddedKg", { valueAsNumber: true })} className="h-8 text-xs font-bold border-emerald-500/30" placeholder="e.g. 25" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Bhim Count *</Label>
                <Input type="number" {...productionForm.register("bhimCount", { valueAsNumber: true })} className="h-8 text-xs" placeholder="e.g. 11" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cuts per Bhim *</Label>
                <Input type="number" {...productionForm.register("cutPerBhim", { valueAsNumber: true })} className="h-8 text-xs" placeholder="e.g. 15" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Sizing Rate (₹ / Kg) *</Label>
              <Input type="number" step="0.1" {...productionForm.register("ratePerKg", { valueAsNumber: true })} className="h-8 text-xs font-mono" placeholder="5.00" />
            </div>

            {/* Calculated Summary Card */}
            <div className="p-3 bg-muted/20 border border-border/40 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Base Yarn Weight Issued:</span><span className="font-bold">{prodTotalWeight} KG</span></div>
              {Number(productionForm.watch("sizingChemicalAddedKg")) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Chemical / Extra Material Added:</span>
                  <span>+{productionForm.watch("sizingChemicalAddedKg")} KG (Total: {prodTotalWeight + Number(productionForm.watch("sizingChemicalAddedKg"))} KG)</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Total Calculated Cuts ({prodBhim} Bhim × {prodCuts} Cuts):</span><span className="font-bold text-foreground">{prodTotalCuts} Cuts</span></div>
              <div className="flex justify-between text-primary font-bold"><span className="text-primary">Total Sizing Charge ({prodTotalWeight} KG × ₹{prodRate}/kg):</span><span>₹{prodSizingCharge.toLocaleString("en-IN")}</span></div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProductionModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="submit" className="h-8 text-xs font-bold">Save Production Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------- */}
      {/* DIALOG 3: FACTORY RECEIVING FORM */}
      {/* ---------------------------------------------------- */}
      <Dialog open={receivingModalOpen} onOpenChange={setReceivingModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Factory Receiving Entry</DialogTitle>
            <DialogDescription className="text-xs">
              Record Sized Sets received back from Sizing Mill to Factory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={receivingForm.handleSubmit(handleReceivingSubmit)} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input type="date" {...receivingForm.register("date")} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Sizing Mill *</Label>
                <Select onValueChange={(v) => receivingForm.setValue("sizingName", v)} value={receivingForm.watch("sizingName")}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sizingMills.map((m) => (
                      <SelectItem key={m.id} value={m.millName}>{m.millName}</SelectItem>
                    ))}
                    {sizingMills.length === 0 && <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">PO Number *</Label>
                <Select onValueChange={(v) => receivingForm.setValue("poNumber", v)} value={receivingForm.watch("poNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>{p.poNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number *</Label>
                <Select onValueChange={(v) => receivingForm.setValue("setNumber", v)} value={receivingForm.watch("setNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SET-100">SET-100</SelectItem>
                    <SelectItem value="SET-121">SET-121</SelectItem>
                    <SelectItem value="SET-2026-001">SET-2026-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Bhim Received *</Label>
                <Input type="number" {...receivingForm.register("bhimReceived", { valueAsNumber: true })} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pipes Received *</Label>
                <Input type="number" {...receivingForm.register("pipesReceived", { valueAsNumber: true })} className="h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Remarks</Label>
              <Input {...receivingForm.register("remarks")} className="h-8 text-xs" placeholder="Condition remarks..." />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReceivingModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="submit" className="h-8 text-xs font-bold">Save Factory Receiving</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
