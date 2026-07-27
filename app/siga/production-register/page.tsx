"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Moon,
  Sun,
  Bell,
  Search,
  Filter,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  ChevronDown,
  Activity,
  Layers,
  Target,
  Zap,
  BarChart3,
  User,
  Briefcase,
  Calendar,
  RefreshCw,
  X,
  Wallet,
  CreditCard,
  History,
  AlertTriangle,
  Package,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoomStatus = "Running" | "Idle" | "Completed" | "Stopped";
type ShiftType = "Morning" | "Afternoon" | "Night";
type RemainingColor = "orange" | "blue" | "green" | "red";

interface LoomEntry {
  id: string;
  loomNumber: string;
  machine: string;
  department: string;
  customer: string;
  brand: string;
  fabric: string;
  width: string;
  color: string;
  shift: ShiftType;
  target: number;
  previousProduction: number;
  todayProduction: number;
  remarks: string;
  status: LoomStatus;
  supervisor: string;
  saved: boolean;
  validationError: string | null;
}

interface HistoryEntry {
  time: string;
  worker: string;
  meters: number;
  shift: ShiftType;
}

interface AdvanceEntry {
  date: string;
  amount: number;
  reason: string;
}

interface SummaryState {
  assignedLooms: number;
  dailyTarget: number;
  previousProduction: number;
  todayProduction: number;
  finalProduction: number;
  remaining: number;
  completionPercent: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_USER = {
  name: "Ramesh Kumar",
  role: "Weaving Operator",
  shift: "Afternoon" as ShiftType,
  avatar: "RK",
  workerId: "W-2047",
};

const INITIAL_LOOMS: LoomEntry[] = [
  { id:"L-101",loomNumber:"L-101",machine:"Toyota Air Jet Loom",department:"Weaving",customer:"ABC Textiles",brand:"Nike",fabric:"Cotton",width:'58"',color:"Royal Blue",shift:"Morning",target:140,previousProduction:65,todayProduction:0,remarks:"",status:"Running",supervisor:"Ramesh Patel",saved:false,validationError:null },
  { id:"L-102",loomNumber:"L-102",machine:"Toyota Air Jet Loom",department:"Weaving",customer:"ABC Textiles",brand:"Adidas",fabric:"Polyester",width:'60"',color:"Jet Black",shift:"Morning",target:140,previousProduction:70,todayProduction:0,remarks:"",status:"Running",supervisor:"Ramesh Patel",saved:false,validationError:null },
  { id:"L-103",loomNumber:"L-103",machine:"Dornier Rapier Loom",department:"Weaving",customer:"XYZ Mills",brand:"Puma",fabric:"Cotton Blend",width:'54"',color:"Olive Green",shift:"Morning",target:140,previousProduction:55,todayProduction:0,remarks:"",status:"Running",supervisor:"Suresh Shah",saved:false,validationError:null },
  { id:"L-104",loomNumber:"L-104",machine:"Dornier Rapier Loom",department:"Weaving",customer:"XYZ Mills",brand:"Reebok",fabric:"Linen",width:'56"',color:"Cream White",shift:"Morning",target:140,previousProduction:60,todayProduction:0,remarks:"",status:"Idle",supervisor:"Suresh Shah",saved:false,validationError:null },
  { id:"L-105",loomNumber:"L-105",machine:"Picanol Rapier Loom",department:"Weaving",customer:"Reliance Retail",brand:"GAP",fabric:"Denim",width:'58"',color:"Indigo",shift:"Morning",target:140,previousProduction:68,todayProduction:0,remarks:"",status:"Running",supervisor:"Ramesh Patel",saved:false,validationError:null },
  { id:"L-106",loomNumber:"L-106",machine:"Picanol Rapier Loom",department:"Weaving",customer:"Reliance Retail",brand:"H&M",fabric:"Silk Blend",width:'44"',color:"Maroon Red",shift:"Morning",target:140,previousProduction:72,todayProduction:0,remarks:"",status:"Running",supervisor:"Ramesh Patel",saved:false,validationError:null },
  { id:"L-107",loomNumber:"L-107",machine:"Sulzer Projectile Loom",department:"Weaving",customer:"Arvind Mills",brand:"Levi's",fabric:"Heavy Denim",width:'60"',color:"Stone Wash",shift:"Morning",target:140,previousProduction:64,todayProduction:0,remarks:"",status:"Running",supervisor:"Kishan Verma",saved:false,validationError:null },
  { id:"L-108",loomNumber:"L-108",machine:"Sulzer Projectile Loom",department:"Weaving",customer:"Arvind Mills",brand:"Wrangler",fabric:"Canvas",width:'58"',color:"Khaki",shift:"Morning",target:140,previousProduction:59,todayProduction:0,remarks:"",status:"Idle",supervisor:"Kishan Verma",saved:false,validationError:null },
  { id:"L-109",loomNumber:"L-109",machine:"Toyota Air Jet Loom",department:"Weaving",customer:"Raymond Ltd",brand:"Raymond",fabric:"Wool Blend",width:'54"',color:"Charcoal Grey",shift:"Morning",target:140,previousProduction:66,todayProduction:0,remarks:"",status:"Running",supervisor:"Ramesh Patel",saved:false,validationError:null },
  { id:"L-110",loomNumber:"L-110",machine:"Dornier Rapier Loom",department:"Weaving",customer:"Raymond Ltd",brand:"Park Avenue",fabric:"Suiting",width:'56"',color:"Navy Blue",shift:"Morning",target:140,previousProduction:71,todayProduction:0,remarks:"",status:"Running",supervisor:"Suresh Shah",saved:false,validationError:null },
  { id:"L-111",loomNumber:"L-111",machine:"Picanol OptiMax",department:"Weaving",customer:"Mafatlal Group",brand:"Colorplus",fabric:"Cotton Twill",width:'58"',color:"Beige",shift:"Morning",target:140,previousProduction:62,todayProduction:0,remarks:"",status:"Running",supervisor:"Kishan Verma",saved:false,validationError:null },
  { id:"L-112",loomNumber:"L-112",machine:"Picanol OptiMax",department:"Weaving",customer:"Mafatlal Group",brand:"Louis Philippe",fabric:"Fine Cotton",width:'60"',color:"Off White",shift:"Morning",target:140,previousProduction:69,todayProduction:0,remarks:"",status:"Running",supervisor:"Kishan Verma",saved:false,validationError:null },
];

const PRODUCTION_HISTORY: HistoryEntry[] = [
  { time:"08:00 AM",worker:"Suresh Mehta (Worker A)",meters:65,shift:"Morning" },
  { time:"08:30 AM",worker:"Suresh Mehta (Worker A)",meters:70,shift:"Morning" },
  { time:"09:15 AM",worker:"Suresh Mehta (Worker A)",meters:55,shift:"Morning" },
  { time:"10:00 AM",worker:"Suresh Mehta (Worker A)",meters:72,shift:"Morning" },
  { time:"11:00 AM",worker:"Suresh Mehta (Worker A)",meters:64,shift:"Morning" },
  { time:"12:30 PM",worker:"Suresh Mehta (Worker A)",meters:59,shift:"Morning" },
];

const ADVANCE_HISTORY: AdvanceEntry[] = [
  { date:"15 Jul",amount:500,reason:"Personal" },
  { date:"17 Jul",amount:300,reason:"Medical" },
  { date:"19 Jul",amount:700,reason:"Home" },
];

const DEPARTMENTS = ["All","Weaving","Dyeing","Finishing","Quality"];
const CUSTOMERS = ["All","ABC Textiles","XYZ Mills","Reliance Retail","Arvind Mills","Raymond Ltd","Mafatlal Group"];
const BRANDS = ["All","Nike","Adidas","Puma","Reebok","GAP","H&M","Levi's","Wrangler","Raymond","Park Avenue","Colorplus","Louis Philippe"];
const STATUSES: (LoomStatus | "All")[] = ["All","Running","Idle","Completed","Stopped"];
const SHIFTS: (ShiftType | "All")[] = ["All","Morning","Afternoon","Night"];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function computeFinal(prev: number, today: number): number {
  return prev + today;
}

function computeRemaining(target: number, final: number): number {
  return Math.max(0, target - final);
}

function getRemainingColor(remaining: number, target: number, final: number): RemainingColor {
  if (final > target) return "red";
  if (remaining === 0) return "green";
  if (remaining <= 30) return "blue";
  return "orange";
}

function getRemainingColorClasses(color: RemainingColor): string {
  switch (color) {
    case "green": return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    case "blue":  return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    case "orange":return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    case "red":   return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  }
}

function computeSummary(looms: LoomEntry[]): SummaryState {
  const previousProduction = looms.reduce((s, l) => s + l.previousProduction, 0);
  const todayProduction    = looms.reduce((s, l) => s + l.todayProduction, 0);
  const dailyTarget        = looms.reduce((s, l) => s + l.target, 0);
  const finalProduction    = looms.reduce((s, l) => s + computeFinal(l.previousProduction, l.todayProduction), 0);
  const remaining          = looms.reduce((s, l) => s + computeRemaining(l.target, computeFinal(l.previousProduction, l.todayProduction)), 0);
  const completionPercent  = dailyTarget > 0 ? Math.min(100, Math.round((finalProduction / dailyTarget) * 100)) : 0;
  return { assignedLooms: looms.length, dailyTarget, previousProduction, todayProduction, finalProduction, remaining, completionPercent };
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;
    const diff = value - prev;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayed(Math.round(prev + (diff * step) / 20));
      if (step >= 20) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayed.toLocaleString()}{suffix}</>;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const accentGradient: Record<string, string> = {
  violet:"from-violet-500 to-violet-600",indigo:"from-indigo-500 to-indigo-600",
  slate:"from-slate-500 to-slate-600",amber:"from-amber-500 to-amber-600",
  blue:"from-blue-500 to-blue-600",orange:"from-orange-500 to-orange-600",
  green:"from-emerald-500 to-emerald-600",
};
const accentBg: Record<string, string> = {
  violet:"bg-violet-50 dark:bg-violet-900/20",indigo:"bg-indigo-50 dark:bg-indigo-900/20",
  slate:"bg-slate-100 dark:bg-slate-800/30",amber:"bg-amber-50 dark:bg-amber-900/20",
  blue:"bg-blue-50 dark:bg-blue-900/20",orange:"bg-orange-50 dark:bg-orange-900/20",
  green:"bg-emerald-50 dark:bg-emerald-900/20",
};
const accentText: Record<string, string> = {
  violet:"text-violet-700 dark:text-violet-300",indigo:"text-indigo-700 dark:text-indigo-300",
  slate:"text-slate-700 dark:text-slate-300",amber:"text-amber-700 dark:text-amber-300",
  blue:"text-blue-700 dark:text-blue-300",orange:"text-orange-700 dark:text-orange-300",
  green:"text-emerald-700 dark:text-emerald-300",
};
const colorText: Record<string, string> = {
  emerald:"text-emerald-600 dark:text-emerald-400",blue:"text-blue-600 dark:text-blue-400",
  amber:"text-amber-600 dark:text-amber-400",violet:"text-violet-600 dark:text-violet-400",
  indigo:"text-indigo-600 dark:text-indigo-400",slate:"text-slate-600 dark:text-slate-400",
};

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
  sub?: React.ReactNode;
  live?: boolean;
}

function SummaryCard({ label, value, icon, accent, sub, live }: SummaryCardProps) {
  return (
    <div className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", accentGradient[accent] ?? accentGradient.violet)} />
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accentBg[accent] ?? accentBg.violet, accentText[accent] ?? accentText.violet)}>
          {icon}
        </div>
      </div>
      <div className={cn("text-2xl font-bold tracking-tight", accentText[accent] ?? accentText.violet)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      {live && (
        <span className="absolute bottom-2 right-2 flex items-center gap-0.5 text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live
        </span>
      )}
    </div>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}

function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all hover:border-ring/50 cursor-pointer">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

interface SidebarMetricProps {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  live?: boolean;
}

function SidebarMetric({ label, value, color, icon, live }: SidebarMetricProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={colorText[color] ?? colorText.violet}>{icon}</span>
        {label}
        {live && <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
      <span className={cn("text-xs font-bold", colorText[color] ?? colorText.violet)}>{value}</span>
    </div>
  );
}

interface PayrollRowProps {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  net?: boolean;
}

function PayrollRow({ label, value, positive, negative, net }: PayrollRowProps) {
  return (
    <div className={cn("flex items-center justify-between", net && "rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2")}>
      <span className={cn("text-xs", net ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className={cn("text-xs font-bold", positive && "text-emerald-600 dark:text-emerald-400", negative && "text-rose-600 dark:text-rose-400", net && "text-emerald-700 dark:text-emerald-300 text-sm")}>
        {negative ? "−" : positive ? "+" : ""}{value}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductionRegisterPage() {
  const { theme, setTheme } = useTheme();
  const [looms, setLooms] = useState<LoomEntry[]>(INITIAL_LOOMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept]           = useState("All");
  const [filterCustomer, setFilterCustomer]   = useState("All");
  const [filterBrand, setFilterBrand]         = useState("All");
  const [filterStatus, setFilterStatus]       = useState<LoomStatus | "All">("All");
  const [filterShift, setFilterShift]         = useState<ShiftType | "All">("All");
  const [showFilters, setShowFilters]         = useState(false);
  const [savingIds, setSavingIds]             = useState<Set<string>>(new Set());
  const [mounted, setMounted]                 = useState(false);
  const [currentTime, setCurrentTime]         = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const summary = useMemo(() => computeSummary(looms), [looms]);

  const filteredLooms = useMemo(() => looms.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || l.loomNumber.toLowerCase().includes(q) || l.machine.toLowerCase().includes(q) || l.customer.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q) || l.fabric.toLowerCase().includes(q);
    return matchSearch && (filterDept === "All" || l.department === filterDept) && (filterCustomer === "All" || l.customer === filterCustomer) && (filterBrand === "All" || l.brand === filterBrand) && (filterStatus === "All" || l.status === filterStatus) && (filterShift === "All" || l.shift === filterShift);
  }), [looms, searchQuery, filterDept, filterCustomer, filterBrand, filterStatus, filterShift]);

  const runningCount   = useMemo(() => looms.filter((l) => l.status === "Running").length, [looms]);
  const completedCount = useMemo(() => looms.filter((l) => computeFinal(l.previousProduction, l.todayProduction) >= l.target).length, [looms]);
  const idleCount      = useMemo(() => looms.filter((l) => l.status === "Idle").length, [looms]);

  const handleProductionChange = useCallback((id: string, rawValue: string) => {
    const value = rawValue === "" ? 0 : parseInt(rawValue, 10);
    if (isNaN(value)) return;
    setLooms((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const finalVal = computeFinal(l.previousProduction, value);
      let validationError: string | null = null;
      if (value < 0) validationError = "Production cannot be negative";
      else if (finalVal > l.target) validationError = `Exceeds target by ${finalVal - l.target} m`;
      return { ...l, todayProduction: Math.max(0, value), validationError, saved: false };
    }));
  }, []);

  const handleRemarksChange = useCallback((id: string, remarks: string) => {
    setLooms((prev) => prev.map((l) => l.id === id ? { ...l, remarks, saved: false } : l));
  }, []);

  const handleSave = useCallback(async (id: string) => {
    const loom = looms.find((l) => l.id === id);
    if (!loom) return;
    if (loom.validationError) { toast.error("Fix validation errors before saving", { description: loom.validationError }); return; }
    setSavingIds((prev) => new Set([...prev, id]));
    await new Promise((res) => setTimeout(res, 600));
    setLooms((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const finalProduction = computeFinal(l.previousProduction, l.todayProduction);
      return { ...l, saved: true, status: finalProduction >= l.target ? "Completed" : l.status };
    }));
    setSavingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    toast.success(`Loom ${loom.loomNumber} saved successfully`, { description: `Production: ${loom.todayProduction} m | Final: ${computeFinal(loom.previousProduction, loom.todayProduction)} m` });
  }, [looms]);

  const handleSaveAll = useCallback(async () => {
    const unsaved = looms.filter((l) => !l.saved && l.todayProduction > 0);
    if (unsaved.length === 0) { toast.info("No new production to save"); return; }
    const ids = unsaved.map((l) => l.id);
    setSavingIds(new Set(ids));
    await new Promise((res) => setTimeout(res, 800));
    setLooms((prev) => prev.map((l) => {
      if (!ids.includes(l.id)) return l;
      const finalProduction = computeFinal(l.previousProduction, l.todayProduction);
      return { ...l, saved: true, status: finalProduction >= l.target ? "Completed" : l.status };
    }));
    setSavingIds(new Set());
    toast.success(`${ids.length} looms saved successfully!`, { description: "All production records updated." });
  }, [looms]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading Production Register…</p>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";
  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {/* ── STICKY HEADER ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg shadow-sm">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none tracking-tight">SIGA Workforce</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Production Register · ERP v1.0</p>
              </div>
            </div>

            {/* Center clock */}
            <div className="hidden md:flex flex-col items-center gap-0.5">
              <p className="text-xs font-semibold">{formatTime(currentTime)}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(currentTime)}</p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <Badge variant="info" className="hidden sm:inline-flex gap-1 font-semibold text-xs px-3 py-1">
                <Clock className="h-3 w-3" />{CURRENT_USER.shift} Shift
              </Badge>

              <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-bold text-white">
                  {CURRENT_USER.avatar}
                </div>
                <div className="leading-none">
                  <p className="text-xs font-semibold">{CURRENT_USER.name}</p>
                  <p className="text-[10px] text-muted-foreground">{CURRENT_USER.role}</p>
                </div>
              </div>

              <button id="siga-notification-btn" onClick={() => toast.info("No new notifications")}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-accent transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
              </button>

              <button id="siga-theme-toggle" onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-accent transition-colors">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Button id="siga-save-all-btn" size="sm" onClick={handleSaveAll}
                className="hidden sm:inline-flex bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md">
                <Save className="h-3.5 w-3.5" />Save All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── PAGE BODY ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 py-6 space-y-6">

        {/* Worker context banner */}
        <div className="flex items-center gap-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-bold text-white shrink-0">
            {CURRENT_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
              Welcome, {CURRENT_USER.name} &nbsp;·&nbsp; {CURRENT_USER.role} &nbsp;·&nbsp; {CURRENT_USER.workerId}
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
              Morning shift production already completed by Worker A. Please enter your Afternoon shift production below.
            </p>
          </div>
          <Badge variant="success" className="shrink-0 hidden sm:inline-flex">Active Session</Badge>
        </div>

        {/* ── SUMMARY CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <SummaryCard label="Assigned Looms"      value={<AnimatedCounter value={summary.assignedLooms} />}          icon={<Layers className="h-4 w-4" />}     accent="violet" sub="Total assigned" />
          <SummaryCard label="Daily Target"         value={<AnimatedCounter value={summary.dailyTarget} suffix=" m" />}         icon={<Target className="h-4 w-4" />}     accent="indigo" sub="All looms combined" />
          <SummaryCard label="Previous Production"  value={<AnimatedCounter value={summary.previousProduction} suffix=" m" />}  icon={<History className="h-4 w-4" />}    accent="slate"  sub="Worker A · Morning" />
          <SummaryCard label="Today's Production"   value={<AnimatedCounter value={summary.todayProduction} suffix=" m" />}     icon={<Activity className="h-4 w-4" />}   accent="amber"  sub="Your current entry" live />
          <SummaryCard label="Final Production"     value={<AnimatedCounter value={summary.finalProduction} suffix=" m" />}     icon={<Zap className="h-4 w-4" />}        accent="blue"   sub="Previous + Today"   live />
          <SummaryCard label="Remaining"            value={<AnimatedCounter value={summary.remaining} suffix=" m" />}           icon={<AlertCircle className="h-4 w-4" />} accent={summary.remaining === 0 ? "green" : "orange"} sub="Target − Final" live />
          <SummaryCard label="Completion"           value={<AnimatedCounter value={summary.completionPercent} suffix="%" />}    icon={<BarChart3 className="h-4 w-4" />}  accent={summary.completionPercent >= 100 ? "green" : "violet"} sub={<Progress value={summary.completionPercent} className="h-1.5 mt-1" />} live />
        </div>

        {/* ── MAIN CONTENT: table + sidebar ──────────────────────────── */}
        <div className="flex gap-5">
          {/* Left: filters + table */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="siga-search" type="text" placeholder="Search loom, machine, customer, brand, fabric…"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button id="siga-filter-toggle" variant="outline" size="sm" onClick={() => setShowFilters((p) => !p)} className={cn("gap-2", showFilters && "bg-accent")}>
                  <Filter className="h-3.5 w-3.5" />Filters
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFilters && "rotate-180")} />
                </Button>
                <Button id="siga-save-all-mobile" size="sm" onClick={handleSaveAll} className="sm:hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  <Save className="h-3.5 w-3.5" />Save All
                </Button>
              </div>
            </div>

            {/* Filter drawer */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <FilterSelect id="siga-filter-dept"     label="Department" value={filterDept}     options={DEPARTMENTS} onChange={setFilterDept} />
                <FilterSelect id="siga-filter-customer" label="Customer"   value={filterCustomer} options={CUSTOMERS}   onChange={setFilterCustomer} />
                <FilterSelect id="siga-filter-brand"    label="Brand"      value={filterBrand}    options={BRANDS}      onChange={setFilterBrand} />
                <FilterSelect id="siga-filter-status"   label="Status"     value={filterStatus}   options={STATUSES}    onChange={(v) => setFilterStatus(v as LoomStatus | "All")} />
                <FilterSelect id="siga-filter-shift"    label="Shift"      value={filterShift}    options={SHIFTS}      onChange={(v) => setFilterShift(v as ShiftType | "All")} />
              </div>
            )}

            {/* Result count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredLooms.length}</span> of <span className="font-semibold text-foreground">{looms.length}</span> looms
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Running: {runningCount}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />Idle: {idleCount}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />Done: {completedCount}</span>
              </div>
            </div>

            {/* Production Register Table */}
            <div className="overflow-x-auto rounded-xl border border-border shadow-sm" id="siga-production-table">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    {["Loom #","Machine","Dept","Customer","Brand","Fabric","Width","Color","Shift","Target","Previous","Your Production","Final","Remaining","Remarks","Status","Save"].map((col) => (
                      <th key={col} className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLooms.map((loom, idx) => {
                    const final     = computeFinal(loom.previousProduction, loom.todayProduction);
                    const remaining = computeRemaining(loom.target, final);
                    const remColor  = getRemainingColor(remaining, loom.target, final);
                    const remClass  = getRemainingColorClasses(remColor);
                    const isSaving  = savingIds.has(loom.id);
                    const isEven    = idx % 2 === 0;
                    return (
                      <tr key={loom.id} className={cn(
                        "border-b border-border/50 transition-colors hover:bg-accent/40",
                        isEven ? "bg-background" : "bg-muted/20",
                        loom.saved && "bg-emerald-50/30 dark:bg-emerald-900/10"
                      )}>
                        {/* Loom # */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 text-[11px] font-bold text-violet-700 dark:text-violet-300 shrink-0">
                              {loom.loomNumber.replace("L-", "")}
                            </div>
                            <span className="font-semibold text-xs">{loom.loomNumber}</span>
                          </div>
                        </td>
                        {/* Machine */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Cpu className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs max-w-[110px] truncate">{loom.machine}</span>
                          </div>
                        </td>
                        {/* Dept */}
                        <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs text-muted-foreground">{loom.department}</span></td>
                        {/* Customer */}
                        <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-medium">{loom.customer}</span></td>
                        {/* Brand */}
                        <td className="px-3 py-3 whitespace-nowrap"><Badge variant="secondary" className="text-[10px] font-semibold">{loom.brand}</Badge></td>
                        {/* Fabric */}
                        <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs text-muted-foreground">{loom.fabric}</span></td>
                        {/* Width */}
                        <td className="px-3 py-3 whitespace-nowrap text-center"><span className="text-xs text-muted-foreground">{loom.width}</span></td>
                        {/* Color */}
                        <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs text-muted-foreground">{loom.color}</span></td>
                        {/* Shift */}
                        <td className="px-3 py-3 whitespace-nowrap"><Badge variant="info" className="text-[10px]">{loom.shift}</Badge></td>
                        {/* Target */}
                        <td className="px-3 py-3 whitespace-nowrap text-center"><span className="text-xs font-semibold">{loom.target} m</span></td>
                        {/* Previous */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{loom.previousProduction} m</span>
                          <p className="text-[9px] text-muted-foreground leading-none mt-0.5">Worker A</p>
                        </td>
                        {/* Your Production — EDITABLE */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="relative">
                              <input id={`siga-prod-${loom.id}`} type="number" min={0}
                                max={loom.target - loom.previousProduction}
                                value={loom.todayProduction === 0 ? "" : loom.todayProduction}
                                onChange={(e) => handleProductionChange(loom.id, e.target.value)}
                                placeholder="0"
                                className={cn(
                                  "w-20 rounded-md border px-2 py-1.5 text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all bg-card text-foreground",
                                  loom.validationError ? "border-red-400 focus:ring-red-300/50" : "border-border hover:border-ring/50"
                                )} />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">m</span>
                            </div>
                            {loom.validationError && (
                              <p className="text-[9px] text-red-500 leading-tight flex items-center gap-0.5">
                                <AlertTriangle className="h-2.5 w-2.5 shrink-0" />{loom.validationError}
                              </p>
                            )}
                          </div>
                        </td>
                        {/* Final — AUTO */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className={cn("text-xs font-bold", final >= loom.target ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")}>
                            {final} m
                          </span>
                          {final >= loom.target && <CheckCircle2 className="ml-1 inline h-3 w-3 text-emerald-500" />}
                        </td>
                        {/* Remaining — AUTO */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className={cn("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", remClass)}>
                            {remaining} m
                          </span>
                        </td>
                        {/* Remarks — EDITABLE */}
                        <td className="px-3 py-3">
                          <input id={`siga-remarks-${loom.id}`} type="text" placeholder="Remarks…" value={loom.remarks}
                            onChange={(e) => handleRemarksChange(loom.id, e.target.value)}
                            className="w-28 rounded-md border border-border bg-card px-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all hover:border-ring/50" />
                        </td>
                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                              loom.status === "Running" ? "bg-emerald-500 animate-pulse" :
                              loom.status === "Idle" ? "bg-amber-500" :
                              loom.status === "Completed" ? "bg-blue-500" : "bg-red-500")} />
                            <span className={cn("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium",
                              loom.status === "Running" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700" :
                              loom.status === "Idle" ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700" :
                              loom.status === "Completed" ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" :
                              "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                            )}>{loom.status}</span>
                          </div>
                        </td>
                        {/* Save */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Button id={`siga-save-${loom.id}`} size="sm" onClick={() => handleSave(loom.id)}
                            disabled={isSaving || !!loom.validationError}
                            className={cn("h-7 px-3 text-[11px] font-semibold transition-all",
                              loom.saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white")}>
                            {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> :
                             loom.saved ? <><CheckCircle2 className="h-3 w-3" />Saved</> :
                             <><Save className="h-3 w-3" />Save</>}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals row */}
                  {filteredLooms.length > 0 && (
                    <tr className="border-t-2 border-border bg-muted/50 font-semibold">
                      <td colSpan={9} className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Totals ({filteredLooms.length} looms)
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold">{filteredLooms.reduce((s,l)=>s+l.target,0)} m</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-400">{filteredLooms.reduce((s,l)=>s+l.previousProduction,0)} m</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-amber-600 dark:text-amber-400">{filteredLooms.reduce((s,l)=>s+l.todayProduction,0)} m</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-blue-600 dark:text-blue-400">{filteredLooms.reduce((s,l)=>s+computeFinal(l.previousProduction,l.todayProduction),0)} m</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-orange-600 dark:text-orange-400">{filteredLooms.reduce((s,l)=>s+computeRemaining(l.target,computeFinal(l.previousProduction,l.todayProduction)),0)} m</td>
                      <td colSpan={3} />
                    </tr>
                  )}

                  {filteredLooms.length === 0 && (
                    <tr>
                      <td colSpan={17} className="px-3 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Package className="h-8 w-8 opacity-40" />
                          <p className="text-sm font-medium">No looms found</p>
                          <p className="text-xs">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────────── */}
          <aside className="hidden xl:flex flex-col w-72 shrink-0 gap-4">
            {/* Today's Summary */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 px-4 py-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-600" />Today&apos;s Summary
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <SidebarMetric label="Running Looms"    value={`${runningCount} / ${looms.length}`} color="emerald" icon={<Activity className="h-3.5 w-3.5" />} />
                <SidebarMetric label="Completed Looms"  value={`${completedCount}`}                  color="blue"    icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                <SidebarMetric label="Idle Looms"       value={`${idleCount}`}                       color="amber"   icon={<Clock className="h-3.5 w-3.5" />} />
                <div className="my-2 border-t border-border" />
                <SidebarMetric label="Total Target"      value={`${summary.dailyTarget} m`}          color="violet"  icon={<Target className="h-3.5 w-3.5" />} />
                <SidebarMetric label="Total Previous"    value={`${summary.previousProduction} m`}   color="slate"   icon={<History className="h-3.5 w-3.5" />} />
                <SidebarMetric label="Today's Production" value={`${summary.todayProduction} m`}    color="amber"   icon={<Zap className="h-3.5 w-3.5" />} live />
                <SidebarMetric label="Final Production"  value={`${summary.finalProduction} m`}      color="indigo"  icon={<TrendingUp className="h-3.5 w-3.5" />} live />
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Completion</span>
                    <span className={cn("font-bold", summary.completionPercent >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-violet-600 dark:text-violet-400")}>
                      {summary.completionPercent}%
                    </span>
                  </div>
                  <Progress value={summary.completionPercent} className="h-2" />
                </div>
              </div>
            </div>

            {/* Payroll Preview */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-4 py-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />Payroll Preview
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Estimated for current month</p>
              </div>
              <div className="p-4 space-y-2.5">
                <PayrollRow label="Production Earnings" value="₹6,200" positive />
                <PayrollRow label="Bonus"               value="₹500"   positive />
                <PayrollRow label="Advance (Uthan)"     value="₹1,500" negative />
                <div className="my-2 border-t-2 border-dashed border-border" />
                <PayrollRow label="Net Pay"             value="₹5,200" net />
              </div>
            </div>

            {/* Advance History */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 px-4 py-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-rose-600" />Advance History
                </h2>
              </div>
              <div className="p-3 space-y-2">
                {ADVANCE_HISTORY.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold">{a.date}</p>
                      <p className="text-[10px] text-muted-foreground">{a.reason}</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">−₹{a.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 pt-1">
                  <span className="text-xs text-muted-foreground font-medium">Total Advance</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">−₹{ADVANCE_HISTORY.reduce((s,a)=>s+a.amount,0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── PRODUCTION HISTORY TIMELINE ─────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/30 dark:to-blue-950/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />Production History — Today
              </h2>
              <Badge variant="info" className="text-[10px]">
                <Clock className="h-2.5 w-2.5" />{formatDate(currentTime)}
              </Badge>
            </div>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {PRODUCTION_HISTORY.map((entry, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
                      <Activity className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 min-w-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{entry.time}</span>
                          <Badge variant="secondary" className="text-[10px]">{entry.shift} Shift</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <User className="h-3 w-3" />{entry.worker}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">{entry.meters} m</span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Worker A final total */}
                <div className="flex gap-4 items-start">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Worker A — Morning Shift Total</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">6 sessions recorded across all looms</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{PRODUCTION_HISTORY.reduce((s,e)=>s+e.meters,0)} m</span>
                  </div>
                </div>

                {/* Current worker — in progress */}
                <div className="flex gap-4 items-start">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-sm">
                    <Clock className="h-4 w-4 text-violet-600 animate-pulse" />
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/10 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-violet-800 dark:text-violet-300">{CURRENT_USER.name} — In Progress</p>
                        <Badge variant="warning" className="text-[10px] animate-pulse">Live</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Afternoon Shift — Enter your production above</p>
                    </div>
                    <span className="text-xl font-bold text-violet-700 dark:text-violet-400">{summary.todayProduction} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MOBILE: Payroll + Advance cards ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:hidden">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-4 py-3">
              <h2 className="text-sm font-bold flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" />Payroll Preview</h2>
            </div>
            <div className="p-4 space-y-2.5">
              <PayrollRow label="Production Earnings" value="₹6,200" positive />
              <PayrollRow label="Bonus"               value="₹500"   positive />
              <PayrollRow label="Advance (Uthan)"     value="₹1,500" negative />
              <div className="my-2 border-t-2 border-dashed border-border" />
              <PayrollRow label="Net Pay"             value="₹5,200" net />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 px-4 py-3">
              <h2 className="text-sm font-bold flex items-center gap-2"><CreditCard className="h-4 w-4 text-rose-600" />Advance History</h2>
            </div>
            <div className="p-3 space-y-2">
              {ADVANCE_HISTORY.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold">{a.date}</p>
                    <p className="text-[10px] text-muted-foreground">{a.reason}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">−₹{a.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-6 py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Layers className="h-3.5 w-3.5 text-white" />
            </div>
            <span><strong className="text-foreground">SIGA Workforce ERP</strong> · Production Register v1.0 · Phase 1 MVP</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{CURRENT_USER.name} · {CURRENT_USER.workerId}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(currentTime)}</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{CURRENT_USER.shift} Shift</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Online · Local Mode</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
