"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Coins,
  Factory,
  FileCheck,
  FolderLock,
  Layers,
  Percent,
  ShoppingBag,
  Truck,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  hoverColor: string;
  summary: string;
  details: {
    title: string;
    items: { label: string; value: string; highlight?: boolean }[];
  };
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "supplier",
    label: "Supplier",
    icon: Truck,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    hoverColor: "hover:bg-blue-500/20 hover:border-blue-500/30",
    summary: "Yogesh Jakhotiya Yarn",
    details: {
      title: "Supplier Information",
      items: [
        { label: "Company", value: "Jakhotiya Spinners Pvt Ltd" },
        { label: "Location", value: "Ichalkaranji Industrial Area, Kolhapur" },
        { label: "GSTIN", value: "27AABCJ4812K1Z5" },
        { label: "Rating", value: "★★★★★ (Preferred Yarn Supplier)" }
      ]
    }
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: ShoppingBag,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    hoverColor: "hover:bg-indigo-500/20 hover:border-indigo-500/30",
    summary: "1,000 KG Cotton Yarn",
    details: {
      title: "Procurement Order",
      items: [
        { label: "Purchase Order", value: "PO-2026-0842" },
        { label: "Item", value: "100% Cotton Yarn (40s Combed Warp)" },
        { label: "Quantity", value: "1,000 KG (40 Bags)" },
        { label: "Rate", value: "₹245.00 / KG", highlight: true },
        { label: "Total Amount", value: "₹2,45,000.00" }
      ]
    }
  },
  {
    id: "lot",
    label: "Yarn Lot",
    icon: FolderLock,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    hoverColor: "hover:bg-purple-500/20 hover:border-purple-500/30",
    summary: "LOT-2026-001",
    details: {
      title: "Yarn Inventory Lot",
      items: [
        { label: "Lot Number", value: "LOT-2026-001" },
        { label: "Received Date", value: "2026-06-15" },
        { label: "Yarn Quality", value: "40s Ne Combed (Warp Special)" },
        { label: "Warehouse", value: "Warehouse A (Yarn Section)" },
        { label: "Available Weight", value: "1,000 KG" }
      ]
    }
  },
  {
    id: "sizing",
    label: "Sizing",
    icon: Layers,
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    hoverColor: "hover:bg-sky-500/20 hover:border-sky-500/30",
    summary: "500 KG Yarn Sized",
    details: {
      title: "Sizing House Operations",
      items: [
        { label: "Sizing Dispatch", value: "SD-2026-012" },
        { label: "Job Worker", value: "D.K. Warping & Sizing, Ichalkaranji" },
        { label: "Warp Count", value: "40s Cotton" },
        { label: "Total Warp Length", value: "22,400 Meters" },
        { label: "Warp Ends", value: "4,800 Threads" }
      ]
    }
  },
  {
    id: "beam",
    label: "Beams",
    icon: FileCheck,
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    hoverColor: "hover:bg-violet-500/20 hover:border-violet-500/30",
    summary: "12 Weaving Beams",
    details: {
      title: "Weaver's Beams",
      items: [
        { label: "Beam Received", value: "SR-2026-019" },
        { label: "Beam IDs", value: "BM-0024 to BM-0035 (12 Beams)" },
        { label: "Meters / Beam", value: "1,850 Meters per Beam" },
        { label: "Ends on Beam", value: "4,800 ends" },
        { label: "Status", value: "Ready for Loom Mounting" }
      ]
    }
  },
  {
    id: "loom",
    label: "Loom Allocation",
    icon: Factory,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    hoverColor: "hover:bg-amber-500/20 hover:border-amber-500/30",
    summary: "Assigned to Loom 12",
    details: {
      title: "Loom Mounting & Assignment",
      items: [
        { label: "Loom Number", value: "Loom 12" },
        { label: "Loom Type", value: "Airjet (Picanol OmniPlus)" },
        { label: "Loom Speed", value: "680 RPM" },
        { label: "Mounted Beam", value: "BM-0024 (Cotton 40s)" },
        { label: "Weaver Assigned", value: "Sachin Patil (Morning Shift)" }
      ]
    }
  },
  {
    id: "production",
    label: "Production",
    icon: Percent,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    hoverColor: "hover:bg-emerald-500/20 hover:border-emerald-500/30",
    summary: "1,845 Meters produced",
    details: {
      title: "Manufacturing Weaving Log",
      items: [
        { label: "Loom Efficiency", value: "92.4% Average", highlight: true },
        { label: "Daily Production", value: "82 Meters per Shift" },
        { label: "Total Produced", value: "1,845 Meters (Beam BM-0024 completed)" },
        { label: "Defects Rate", value: "1.2% (Grade A Cloth)" },
        { label: "Date Interval", value: "2026-06-18 to 2026-06-24" }
      ]
    }
  },
  {
    id: "fabric",
    label: "Grey Fabric",
    icon: Building2,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    hoverColor: "hover:bg-rose-500/20 hover:border-rose-500/30",
    summary: "Cambric 60x60 Quality",
    details: {
      title: "Finished Cloth Inventory",
      items: [
        { label: "Quality Name", value: "Cotton Grey Cambric 60x60 / 132x72" },
        { label: "Stock Quantity", value: "1,845 Meters (Rolls: 18)" },
        { label: "GSM", value: "80 GSM" },
        { label: "Warehouse Location", value: "Warehouse B (Fabric Section)" },
        { label: "Status", value: "Passed Quality Control (Ready to Sell)" }
      ]
    }
  },
  {
    id: "sales",
    label: "Sales Order",
    icon: Coins,
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    hoverColor: "hover:bg-teal-500/20 hover:border-teal-500/30",
    summary: "Sold to Balaji Fabrics",
    details: {
      title: "Commercial Invoice",
      items: [
        { label: "Customer", value: "Balaji Fabrics Ichalkaranji" },
        { label: "Invoice Number", value: "SL-2026-0048" },
        { label: "Quantity Sold", value: "1,800 Meters" },
        { label: "Selling Rate", value: "₹78.00 / Meter", highlight: true },
        { label: "Total Revenue", value: "₹1,40,400.00" }
      ]
    }
  },
  {
    id: "profit",
    label: "Profitability",
    icon: TrendingUp,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    hoverColor: "hover:bg-green-500/20 hover:border-green-500/30",
    summary: "₹25.60 Profit / Meter",
    details: {
      title: "Costing & Net Margins",
      items: [
        { label: "Yarn Cost / Meter", value: "₹34.50" },
        { label: "Sizing Cost / Meter", value: "₹4.80" },
        { label: "Weaving & Labor Cost", value: "₹8.20" },
        { label: "Electricity Cost / Meter", value: "₹4.90" },
        { label: "Total Fabric Cost", value: "₹52.40 / Meter" },
        { label: "Net Margin", value: "₹25.60 / Meter (32.8%)", highlight: true },
        { label: "Batch Net Profit", value: "₹46,080.00" }
      ]
    }
  }
];

export function WorkflowCard({ className }: { className?: string }) {
  const [activeStep, setActiveStep] = useState<string>("production");

  const currentStep = WORKFLOW_STEPS.find((step) => step.id === activeStep) || WORKFLOW_STEPS[0];

  return (
    <Card className={cn("border-border/40 overflow-hidden", className)}>
      <CardHeader className="bg-muted/10 border-b border-border/10 pb-4">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight font-display flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Textile Production Pipeline & Costing Trace
            </CardTitle>
            <CardDescription className="text-xs">
              Follow an order from raw yarn purchase to final grey cloth sales margins (Click a step below)
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium">
            24x7 Live Flow
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Horizontal Scroll Pipeline Container */}
        <div className="relative w-full overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-center gap-3 min-w-[1000px] px-2 py-3">
            {WORKFLOW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isSelected = step.id === activeStep;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step Node */}
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 w-24 text-center cursor-pointer shrink-0 outline-none select-none",
                      step.hoverColor,
                      isSelected 
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 scale-105"
                        : "border-border/50 bg-background text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg mb-2 transition-colors",
                      isSelected ? "bg-background/10 text-white" : step.color
                    )}>
                      <StepIcon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block leading-tight truncate w-full">
                      {step.label}
                    </span>
                    <span className={cn(
                      "text-[9px] mt-1 block truncate w-full leading-normal",
                      isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {step.summary.split(" ")[0] === "LOT-2026-001" ? "LOT-001" : step.summary}
                    </span>
                  </button>

                  {/* Connector Arrow */}
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 animate-pulse" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 md:grid-cols-3 bg-muted/20 border border-border/10 rounded-xl p-5"
          >
            {/* Header info */}
            <div className="flex flex-col gap-3 justify-center border-b md:border-b-0 md:border-r border-border/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-xl border-1", currentStep.color)}>
                  {React.createElement(currentStep.icon, { className: "h-6 w-6" })}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Step {WORKFLOW_STEPS.indexOf(currentStep) + 1} of 10
                  </span>
                  <h4 className="text-lg font-bold font-display text-foreground leading-tight">
                    {currentStep.label}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                This step tracks {currentStep.label.toLowerCase()} logs. In a live environment, this binds real-time database inputs directly to the loom efficiency records.
              </p>
            </div>

            {/* Structured details list */}
            <div className="md:col-span-2 flex flex-col gap-4 justify-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground/80 tracking-wider">
                  {currentStep.details.title}
                </span>
                <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/5 text-primary">
                  Live Trace Reference
                </Badge>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {currentStep.details.items.map((item, key) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border border-border/10 text-xs",
                      item.highlight ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold" : "bg-background text-muted-foreground"
                    )}
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn(
                      "font-semibold text-foreground",
                      item.highlight && "text-emerald-700 dark:text-emerald-400"
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
