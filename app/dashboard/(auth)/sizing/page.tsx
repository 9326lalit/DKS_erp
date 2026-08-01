"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import {
  Plus, FileDown, ChevronDown, ChevronUp, Scissors, Building2, ExternalLink, Sparkles,
  Warehouse, Truck, CheckCircle2, Clock, AlertTriangle, Layers
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSizingStore, SizingBatch, OpeningStockEntry, FactoryReceivingEntry } from "@/lib/store/use-sizing-store";
import { mastersApiService } from "@/lib/services/masters-api";
import { tanaApiService } from "@/lib/services/tana-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  cgstPercent: z.number(),
  sgstPercent: z.number(),
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

const millSchema = z.object({
  millName: z.string().min(2, "Mill name is required"),
  contactPerson: z.string().optional(),
  mobileNumber: z.string().min(10, "10-digit mobile required"),
  address: z.string().min(2, "Address required"),
  activeStatus: z.enum(["Active", "Inactive"])
});

type OpeningStockValues = z.infer<typeof openingStockSchema>;
type ProductionValues = z.infer<typeof productionSchema>;
type FactoryReceivingValues = z.infer<typeof factoryReceivingSchema>;
type MillFormValues = z.infer<typeof millSchema>;

export default function SizingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("production");
  const [millModalOpen, setMillModalOpen] = useState(false);

  const millForm = useForm<MillFormValues>({
    resolver: zodResolver(millSchema),
    defaultValues: {
      millName: "",
      contactPerson: "",
      mobileNumber: "",
      address: "",
      activeStatus: "Active"
    }
  });

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
    updateOpeningStock,
    createFactoryReceiving
  } = useSizingStore();

  // Master Data Dropdowns
  const { data: sizingMills = [] } = useQuery({ queryKey: ["sizingMills"], queryFn: () => mastersApiService.getSizingMills() });
  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const { data: pos = [] } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });

  const createMillMutation = useMutation({
    mutationFn: (data: any) => mastersApiService.createSizingMill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizingMills"] });
      toast.success("Sizing Mill registered successfully!");
      setMillModalOpen(false);
      millForm.reset();
    }
  });

  const handleMillSubmit = (values: MillFormValues) => {
    const seq = sizingMills.length + 1;
    const year = new Date().getFullYear();
    createMillMutation.mutate({
      id: `SZM-ID-${Date.now()}`,
      millCode: `SZM-${year}-${String(seq).padStart(4, "0")}`,
      createdDate: new Date().toISOString().split("T")[0],
      ...values
    });
  };

  // Dialog States
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [receivingModalOpen, setReceivingModalOpen] = useState(false);

  // Factory Receiving Search & Filters
  const [rcvSearchValue, setRcvSearchValue] = useState("");
  const [rcvFilters, setRcvFilters] = useState<Record<string, string>>({ status: "all" });

  const filteredFactoryReceivings = factoryReceivings.filter((rcv) => {
    const ms =
      rcv.sizingName.toLowerCase().includes(rcvSearchValue.toLowerCase()) ||
      rcv.poNumber.toLowerCase().includes(rcvSearchValue.toLowerCase()) ||
      rcv.setNumber.toLowerCase().includes(rcvSearchValue.toLowerCase()) ||
      (rcv.remarks || "").toLowerCase().includes(rcvSearchValue.toLowerCase());
    const mst = rcvFilters.status === "all" || rcv.status === rcvFilters.status;
    return ms && mst;
  });

  const receivingColumns: TableColumn<FactoryReceivingEntry>[] = [
    { key: "date", header: "Date", sortable: true },
    { key: "sizingName", header: "Sizing Mill Name", sortable: true, render: (r) => <span className="font-semibold">{r.sizingName}</span> },
    {
      key: "poNumber",
      header: "PO Number",
      sortable: true,
      render: (r) => (
        <Link href="/dashboard/tana/purchase-orders" className="font-mono text-xs font-bold text-primary hover:underline">
          {r.poNumber}
        </Link>
      )
    },
    {
      key: "setNumber",
      header: "Set Number",
      sortable: true,
      render: (r) => (
        <Link href={`/dashboard/masters/open-stock/${encodeURIComponent(r.setNumber)}`} className="font-mono text-xs font-bold text-primary hover:underline">
          {r.setNumber}
        </Link>
      )
    },
    {
      key: "bhimReceived",
      header: "Bhim Received",
      sortable: true,
      render: (r) => <span className="font-bold text-xs">{r.bhimReceived} Bhim</span>
    },
    {
      key: "pipesReceived",
      header: "Pipes Received",
      sortable: true,
      render: (r) => <span className="font-bold text-xs font-mono">{r.pipesReceived} Pipes</span>
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (r) => <span className="text-xs text-muted-foreground">{r.remarks || "—"}</span>
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => (
        <Badge
          variant="outline"
          className={
            r.status === "Received"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px]"
              : r.status === "Partial"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px]"
                : "bg-red-500/10 text-red-600 border-red-500/20 font-bold text-[10px]"
          }
        >
          {r.status}
        </Badge>
      )
    }
  ];

  // Tab 1 Production Search & Filters
  const [prodSearchValue, setProdSearchValue] = useState("");
  const [prodFilters, setProdFilters] = useState<Record<string, string>>({ status: "all" });

  const filteredBatches = batches.filter((b) => {
    const ms =
      b.batchNumber.toLowerCase().includes(prodSearchValue.toLowerCase()) ||
      (b.outsourcedPartyName || "").toLowerCase().includes(prodSearchValue.toLowerCase()) ||
      (b.remarks || "").toLowerCase().includes(prodSearchValue.toLowerCase());
    const mst = prodFilters.status === "all" || b.status === prodFilters.status;
    return ms && mst;
  });

  const productionColumns: TableColumn<SizingBatch>[] = [
    {
      key: "batchNumber",
      header: "Batch #",
      sortable: true,
      render: (b) => (
        <Link href={`/dashboard/sizing/${b.id}`} className="font-mono font-bold text-primary hover:underline">
          {b.batchNumber}
        </Link>
      )
    },
    { key: "dateIssuedToSizing", header: "Date", sortable: true },
    { key: "outsourcedPartyName", header: "Sizing Unit", sortable: true, render: (b) => <span className="font-semibold">{b.outsourcedPartyName || "In-house Mill"}</span> },
    { key: "bagsIssued", header: "Bags / Weight", render: (b) => <span>{b.bagsIssued} Bags / {b.weightIssuedKg} KG</span> },
    { key: "bhimCount", header: "Bhim × Cuts/Bhim", render: (b) => <span className="font-mono">{b.bhimCount || 11} Bhim × {b.cutPerBhim || 15}</span> },
    { key: "totalCuts", header: "Total Cuts", sortable: true, render: (b) => <span className="font-bold text-foreground">{b.totalCuts || (b.bhimCount * b.cutPerBhim) || 165}</span> },
    { key: "ratePerKg", header: "Rate (₹/kg)", render: (b) => <span className="font-mono">₹{b.ratePerKg || 5}/kg</span> },
    { key: "sizingChargesRs", header: "Total Charge (₹)", sortable: true, render: (b) => <span className="font-bold font-mono text-emerald-600">₹{(b.sizingChargesRs || (b.materialUsedKg * (b.ratePerKg || 5))).toLocaleString("en-IN")}</span> },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (b) => <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{b.status}</Badge>
    },
    {
      key: "id",
      header: "Action Page",
      render: (b) => (
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary cursor-pointer">
          <Link href={`/dashboard/sizing/${b.id}`}>
            View Page
          </Link>
        </Button>
      )
    }
  ];

  // Tab 2 Opening Stock Search & Filters
  const [opSearchValue, setOpSearchValue] = useState("");
  const [opFilters, setOpFilters] = useState<Record<string, string>>({ owner: "all" });

  const filteredOpeningStocks = openingStocks.filter((op) => {
    const ms =
      op.setNumber.toLowerCase().includes(opSearchValue.toLowerCase()) ||
      op.sizingName.toLowerCase().includes(opSearchValue.toLowerCase()) ||
      op.poNumber.toLowerCase().includes(opSearchValue.toLowerCase()) ||
      op.materialOwner.toLowerCase().includes(opSearchValue.toLowerCase()) ||
      op.itemName.toLowerCase().includes(opSearchValue.toLowerCase());
    const mst = opFilters.owner === "all" || op.materialOwner === opFilters.owner;
    return ms && mst;
  });

  const openingStockColumns: TableColumn<OpeningStockEntry>[] = [
    { key: "date", header: "Date", sortable: true },
    { key: "sizingName", header: "Sizing Name", sortable: true, render: (op) => <span className="font-semibold">{op.sizingName}</span> },
    { key: "materialOwner", header: "Material Owner", sortable: true, render: (op) => <Badge variant="outline" className="bg-blue-500/10 text-blue-600 font-bold">{op.materialOwner}</Badge> },
    {
      key: "poNumber",
      header: "PO Number",
      sortable: true,
      render: (op) => (
        <Link href="/dashboard/tana/purchase-orders" className="font-mono text-xs font-bold text-primary hover:underline">
          {op.poNumber}
        </Link>
      )
    },
    {
      key: "setNumber",
      header: "Set # / Item",
      sortable: true,
      render: (op) => (
        <span>
          <Link href={`/dashboard/sizing/${encodeURIComponent(op.id)}`} className="text-primary font-bold hover:underline font-mono">
            {op.setNumber}
          </Link>{" "}
          <span className="text-muted-foreground text-xs">({op.itemName})</span>
        </span>
      )
    },
    { key: "totalBags", header: "Bags / Weight", render: (op) => <span>{op.totalBags} Bags / {op.totalWeightKg} KG</span> },
    { key: "totalTaar", header: "Taar & Pipes", render: (op) => <span className="font-mono">{op.totalTaar} Taar | {op.totalPipes} Pipes</span> },
    { key: "materialUsedKg", header: "Material Used", render: (op) => <span className="font-mono">{op.materialUsedKg} KG</span> },
    { key: "remainingStockKg", header: "Remaining Stock", sortable: true, render: (op) => <span className="font-bold font-mono text-emerald-600">{op.remainingStockKg} KG</span> },
    {
      key: "id",
      header: "Pipes Breakdown Page",
      render: (op) => (
        <Button asChild variant="outline" size="sm" className="h-7 text-[11px] font-bold text-primary border-primary/30 hover:bg-primary/10 gap-1 cursor-pointer">
          <Link href={`/dashboard/sizing/${encodeURIComponent(op.id)}`}>
            Open Pipe Breakdown Page
          </Link>
        </Button>
      )
    }
  ];

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
      cgstPercent: 6,
      sgstPercent: 6,
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

      // Auto-override Set Number from opening stock linked to this PO
      const linkedStock = openingStocks.find((s) => s.poNumber === selectedPoNo);
      if (linkedStock) {
        productionForm.setValue("setNumber", linkedStock.setNumber);
        toast.info(
          `Auto-populated: ${selectedPoNo} → Set ${linkedStock.setNumber} | ${po.totalBagsOrdered} Bags, ${po.totalWeightKg} KG | Remaining Stock: ${linkedStock.remainingStockKg} KG`
        );
      } else {
        toast.info(`Auto-populated Production PO info for ${selectedPoNo}`);
      }
    }
  };

  const handlePOSelectReceiving = (selectedPoNo: string) => {
    receivingForm.setValue("poNumber", selectedPoNo);
    // Auto-override Set Number from opening stock linked to this PO
    const linkedStock = openingStocks.find((s) => s.poNumber === selectedPoNo);
    if (linkedStock) {
      receivingForm.setValue("setNumber", linkedStock.setNumber);
      toast.info(`Auto-populated: ${selectedPoNo} → Set ${linkedStock.setNumber}`);
    }
  };

  // Watched Values for Production Calculations
  const prodBhim = productionForm.watch("bhimCount") || 0;
  const prodCuts = productionForm.watch("cutPerBhim") || 0;
  const prodTotalCuts = prodBhim * prodCuts; // Auto calculation: Bhim × Cuts/Bhim

  const prodBags = productionForm.watch("bagsIssued") || 0;
  const prodBagWeight = productionForm.watch("weightPerBagKg") || 0;
  const prodTotalWeight = prodBags * prodBagWeight; // Base yarn weight (used for sizing charge)

  const prodChemicalAdded = Number(productionForm.watch("sizingChemicalAddedKg")) || 0;
  const prodGrandTotalWeight = prodTotalWeight + prodChemicalAdded; // Base + Chemical (total on beam)

  const prodRate = productionForm.watch("ratePerKg") || 0;
  const prodSizingCharge = prodTotalWeight * prodRate; // Sizing charge only on BASE yarn weight

  // Remaining stock lookup for selected PO (production modal)
  const prodSelectedPO = productionForm.watch("poNumber");
  const prodLinkedStock = openingStocks.find((s) => s.poNumber === prodSelectedPO);
  const prodIsFullyConsumed = prodLinkedStock ? prodLinkedStock.remainingStockKg === 0 : false;
  const prodIsOverIssuing = prodLinkedStock ? prodTotalWeight > prodLinkedStock.remainingStockKg && prodLinkedStock.remainingStockKg > 0 : false;

  // Derived set numbers from opening stocks for dynamic dropdowns
  const availableSetNumbers = openingStocks.map((s) => ({ setNumber: s.setNumber, poNumber: s.poNumber }));

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
    // Duplicate Set Number Check
    const isDuplicateSet = openingStocks.some(
      (s) => s.setNumber.trim().toLowerCase() === values.setNumber.trim().toLowerCase()
    );

    if (isDuplicateSet) {
      toast.error(`Duplicate Set Number Error: Set '${values.setNumber}' already exists!`);
      openingForm.setError("setNumber", {
        type: "manual",
        message: `Set Number '${values.setNumber}' already exists in Opening Stock Register.`
      });
      return;
    }

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
    const totalWeight = values.bagsIssued * values.weightPerBagKg; // Base yarn weight
    const chemicalAdded = values.sizingChemicalAddedKg || 0;
    const totalCuts = values.bhimCount * values.cutPerBhim;
    const sizingCharges = totalWeight * values.ratePerKg; // Charge only on base yarn

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
      sizingChemicalAddedKg: chemicalAdded > 0 ? chemicalAdded : undefined,
      ratePerKg: values.ratePerKg,
      sizingChargesRs: sizingCharges,
      sizingDoneBy: "Outsourced" as const,
      outsourcedPartyName: values.sizingName,
      status: "Completed" as const,
      remarks: values.remarks
    };

    createBatch(batch);

    // Update linked opening stock's materialUsedKg and remainingStockKg
    const linkedStock = openingStocks.find((s) => s.poNumber === values.poNumber);
    if (linkedStock) {
      const newUsed = linkedStock.materialUsedKg + totalWeight;
      const newRemaining = Math.max(0, linkedStock.totalWeightKg - newUsed);
      updateOpeningStock({
        ...linkedStock,
        materialUsedKg: newUsed,
        remainingStockKg: newRemaining
      });
    }

    toast.success(
      `Production Entry saved! Batch: SZ-2026-${String(batches.length + 1).padStart(4, "0")} | Cuts: ${totalCuts} | Charge: ₹${sizingCharges.toLocaleString("en-IN")}${linkedStock ? ` | Remaining Stock: ${Math.max(0, linkedStock.remainingStockKg - totalWeight)} KG` : ""
      }`
    );
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
        description="Auto-population via PO selection, entity dropdowns, live stock balances, sizing mills master, and pipe breakdowns."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Sizing Module" }
        ]}
        actions={
          <Button
            asChild
            className="h-9 gap-1.5 bg-primary cursor-pointer font-bold"
          >
            <Link href="/dashboard/masters/sizing-mills">
              <Plus className="h-4 w-4" /> Add Sizing
            </Link>
          </Button>
        }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production" className="cursor-pointer text-xs font-semibold">Sizing Production Log</TabsTrigger>
          <TabsTrigger value="opening-stock" className="cursor-pointer text-xs font-semibold">Opening Stock Form</TabsTrigger>
          <TabsTrigger value="factory-receiving" className="cursor-pointer text-xs font-semibold">Factory Receiving</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SIZING PRODUCTION MODULE */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="production" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-sm font-bold">Sizing Production Log</CardTitle>
              <CardDescription className="text-xs">
                Automated Total Cuts (`Bhim × Cuts/Bhim`) and Sizing Charges (`Material Used × Rate/kg`).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <MasterToolbar
                searchPlaceholder="Search Batch #, Sizing Unit, Remarks..."
                searchValue={prodSearchValue}
                onSearchChange={setProdSearchValue}
                filters={[
                  {
                    key: "status",
                    placeholder: "Filter by Status",
                    options: [
                      { label: "All Status", value: "all" },
                      { label: "In Process", value: "In Process" },
                      { label: "Completed", value: "Completed" }
                    ]
                  }
                ]}
                selectedFilters={prodFilters}
                onFilterChange={(key, val) => setProdFilters((prev) => ({ ...prev, [key]: val }))}
                onClearFilters={() => {
                  setProdSearchValue("");
                  setProdFilters({ status: "all" });
                }}
                createLabel="New Sizing Production Entry"
                onCreateClick={() => router.push("/dashboard/sizing/new")}
              />

              <MasterTable
                data={filteredBatches}
                columns={productionColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: OPENING STOCK FORM & PIPES 1..N BREAKDOWN */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="opening-stock" className="space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-sm font-bold">Opening Stock Register & Pipe Breakdown</CardTitle>
              <CardDescription className="text-xs">
                PO selection auto-populates item name, total bags, total weight, owner, and creates Pipes 1 to N automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <MasterToolbar
                searchPlaceholder="Search Set #, Sizing Name, PO #, Owner, Item..."
                searchValue={opSearchValue}
                onSearchChange={setOpSearchValue}
                selectedFilters={opFilters}
                onFilterChange={(key, val) => setOpFilters((prev) => ({ ...prev, [key]: val }))}
                onClearFilters={() => {
                  setOpSearchValue("");
                  setOpFilters({ owner: "all" });
                }}
                createLabel="Entry Opening Stock Form"
                onCreateClick={() => setOpeningModalOpen(true)}
              />

              <MasterTable
                data={filteredOpeningStocks}
                columns={openingStockColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: FACTORY RECEIVING ENTRY */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="factory-receiving" className="space-y-4">

          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Factory Receiving Log & Status Tracking
              </CardTitle>
              <CardDescription className="text-xs">
                Track returned Sized Sets from Sizing Mill to Factory floor (Bhim count, Pipes count, status & remarks).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <MasterToolbar
                searchPlaceholder="Search Date, Mill, PO #, Set #, Remarks..."
                searchValue={rcvSearchValue}
                onSearchChange={setRcvSearchValue}
                filters={[
                  {
                    key: "status",
                    placeholder: "Filter by Status",
                    options: [
                      { label: "All Status", value: "all" },
                      { label: "Received", value: "Received" },
                      { label: "Partial", value: "Partial" },
                      { label: "Pending", value: "Pending" }
                    ]
                  }
                ]}
                selectedFilters={rcvFilters}
                onFilterChange={(key, val) => setRcvFilters((prev) => ({ ...prev, [key]: val }))}
                onClearFilters={() => {
                  setRcvSearchValue("");
                  setRcvFilters({ status: "all" });
                }}
                createLabel="Record Factory Receiving"
                onCreateClick={() => router.push("/dashboard/sizing/receiving/new")}
              />

              <MasterTable
                data={filteredFactoryReceivings}
                columns={receivingColumns}
              />
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
        <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/20 pb-3">
            <DialogTitle className="text-base font-bold text-foreground">New Sizing Production Entry</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select PO or Set Number to auto-fill specs. Computes Bhim cuts, CGST &amp; SGST jobwork tax bill.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={productionForm.handleSubmit(handleProductionSubmit)} className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input type="date" {...productionForm.register("date")} className="h-9 text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sizing Mill *</Label>
                <Select onValueChange={(v) => productionForm.setValue("sizingName", v)} value={productionForm.watch("sizingName")}>
                  <SelectTrigger className="h-9 text-xs truncate w-full"><SelectValue placeholder="Select sizing mill" className="truncate" /></SelectTrigger>
                  <SelectContent>
                    {sizingMills.map((m) => (
                      <SelectItem key={m.id} value={m.millName}>{m.millName}</SelectItem>
                    ))}
                    {sizingMills.length === 0 && <SelectItem value="Kolhapur Sizing Mill Unit-1">Kolhapur Sizing Mill Unit-1</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold text-primary">PO Number (Select to Auto-Fill) *</Label>
                <Select onValueChange={handlePOSelectProduction} value={productionForm.watch("poNumber")}>
                  <SelectTrigger className="h-9 text-xs font-mono border-primary/40 truncate w-full overflow-hidden">
                    <SelectValue placeholder="Select PO #" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => {
                      const linked = openingStocks.find((s) => s.poNumber === p.poNumber);
                      return (
                        <SelectItem key={p.id} value={p.poNumber} className="text-xs">
                          {p.poNumber} — {p.itemName} {linked ? `(${linked.remainingStockKg} KG left)` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Set Number (Auto from PO) *</Label>
                <Select onValueChange={(v) => productionForm.setValue("setNumber", v)} value={productionForm.watch("setNumber")}>
                  <SelectTrigger className="h-9 text-xs font-mono bg-muted/20 truncate w-full overflow-hidden">
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSetNumbers.length > 0 ? (
                      availableSetNumbers.map((s) => (
                        <SelectItem key={s.setNumber} value={s.setNumber} className="text-xs">
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bags Issued *</Label>
                <Input type="number" {...productionForm.register("bagsIssued", { valueAsNumber: true })} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Per Bag Weight (Kg) *</Label>
                <Input type="number" step="0.1" {...productionForm.register("weightPerBagKg", { valueAsNumber: true })} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-emerald-600">Chemical Added (Kg)</Label>
                <Input type="number" step="0.1" {...productionForm.register("sizingChemicalAddedKg", { valueAsNumber: true })} className="h-9 text-xs font-bold border-emerald-500/30" placeholder="e.g. 25" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bhim (Beam) Count *</Label>
                <Input type="number" {...productionForm.register("bhimCount", { valueAsNumber: true })} className="h-9 text-xs" placeholder="e.g. 11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cuts per Bhim *</Label>
                <Input type="number" {...productionForm.register("cutPerBhim", { valueAsNumber: true })} className="h-9 text-xs" placeholder="e.g. 15" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sizing Rate (₹ / Kg) *</Label>
                <Input type="number" step="0.1" {...productionForm.register("ratePerKg", { valueAsNumber: true })} className="h-9 text-xs font-mono" placeholder="5.00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CGST (%)</Label>
                <Input type="number" step="0.5" {...productionForm.register("cgstPercent", { valueAsNumber: true })} className="h-9 text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">SGST (%)</Label>
                <Input type="number" step="0.5" {...productionForm.register("sgstPercent", { valueAsNumber: true })} className="h-9 text-xs font-mono" />
              </div>
            </div>

            {/* Stock Availability Banner */}
            {prodLinkedStock && (
              <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${prodIsFullyConsumed
                ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700"
                : prodIsOverIssuing
                  ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                  : "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700"
                }`}>
                <span className={`font-semibold ${prodIsFullyConsumed ? "text-red-700 dark:text-red-400" :
                  prodIsOverIssuing ? "text-amber-700 dark:text-amber-400" :
                    "text-emerald-700 dark:text-emerald-400"
                  }`}>
                  {prodIsFullyConsumed
                    ? `⚠ Set ${prodLinkedStock.setNumber}: Fully Consumed — 0 KG remaining`
                    : prodIsOverIssuing
                      ? `⚠ Set ${prodLinkedStock.setNumber}: Only ${prodLinkedStock.remainingStockKg} KG available (issuing ${prodTotalWeight} KG)`
                      : `✓ Set ${prodLinkedStock.setNumber}: ${prodLinkedStock.remainingStockKg} KG available in stock`
                  }
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  Total issued: {prodLinkedStock.totalWeightKg} KG | Used: {prodLinkedStock.materialUsedKg} KG
                </span>
              </div>
            )}

            {/* Calculated Summary Card with Tax Breakdown */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Yarn Weight Issued:</span>
                <span className="font-bold">{prodTotalWeight} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Calculated Cuts ({prodBhim} Bhim × {prodCuts} Cuts):</span>
                <span className="font-bold text-purple-600">{prodBhim * prodCuts} Cuts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal Jobwork Amount ({prodTotalWeight} KG × ₹{prodRate}/kg):</span>
                <span className="font-bold font-mono">₹{(prodTotalWeight * prodRate).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>CGST ({productionForm.watch("cgstPercent") || 6}%) + SGST ({productionForm.watch("sgstPercent") || 6}%):</span>
                <span className="font-mono">₹{((prodTotalWeight * prodRate) * (((productionForm.watch("cgstPercent") || 6) + (productionForm.watch("sgstPercent") || 6)) / 100)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold text-sm text-foreground">
                <span>Grand Total Sizing Bill (with GST):</span>
                <span className="text-primary font-mono text-base">
                  ₹{((prodTotalWeight * prodRate) * (1 + ((productionForm.watch("cgstPercent") || 6) + (productionForm.watch("sgstPercent") || 6)) / 100)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProductionModalOpen(false)} className="h-9 text-xs">Cancel</Button>
              <Button type="submit" className="h-9 text-xs font-bold bg-primary text-primary-foreground">Save Production Entry</Button>
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
                <Label className="text-xs font-semibold text-primary">PO Number (Overrides Set #) *</Label>
                <Select onValueChange={handlePOSelectReceiving} value={receivingForm.watch("poNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono border-primary/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {pos.map((p) => (
                      <SelectItem key={p.id} value={p.poNumber}>{p.poNumber} — {p.itemName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Set Number (Auto from PO) *</Label>
                <Select onValueChange={(v) => receivingForm.setValue("setNumber", v)} value={receivingForm.watch("setNumber")}>
                  <SelectTrigger className="h-8 text-xs font-mono bg-muted/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableSetNumbers.length > 0 ? (
                      availableSetNumbers.map((s) => (
                        <SelectItem key={s.setNumber} value={s.setNumber}>
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

      {/* ---------------------------------------------------- */}
      {/* DIALOG: QUICK REGISTER SIZING MILL */}
      {/* ---------------------------------------------------- */}
      <Dialog open={millModalOpen} onOpenChange={setMillModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" /> Register New Sizing Mill
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register a new Warping &amp; Sizing Job-Work Mill or agency into Master Data.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={millForm.handleSubmit(handleMillSubmit)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Sizing Mill Name *</Label>
              <Input {...millForm.register("millName")} placeholder="e.g. Sumit Sizing Works" className="h-8 text-xs font-semibold" />
              {millForm.formState.errors.millName && <p className="text-[10px] text-destructive">{millForm.formState.errors.millName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input {...millForm.register("contactPerson")} placeholder="e.g. Ramesh Bhai" className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input {...millForm.register("mobileNumber")} placeholder="e.g. 9876543210" className="h-8 text-xs font-mono" />
                {millForm.formState.errors.mobileNumber && <p className="text-[10px] text-destructive">{millForm.formState.errors.mobileNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Address *</Label>
              <Input {...millForm.register("address")} placeholder="Mill address or Industrial Area..." className="h-8 text-xs" />
              {millForm.formState.errors.address && <p className="text-[10px] text-destructive">{millForm.formState.errors.address.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status *</Label>
              <Select onValueChange={(v) => millForm.setValue("activeStatus", v as any)} value={millForm.watch("activeStatus")}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setMillModalOpen(false)} className="h-8 text-xs">Cancel</Button>
              <Button type="submit" disabled={createMillMutation.isPending} className="h-8 text-xs font-bold bg-primary">
                Save &amp; Register Sizing Mill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
