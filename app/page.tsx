import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Box,
  Building2,
  CheckCircle2,
  CheckCircle,
  CircleDollarSign,
  Clipboard,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { LandingNavbar } from "@/components/landing-navbar";
import { HeroSection } from "@/components/hero-section";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const modules = [
  {
    title: "Procurement",
    tag: "Supply chain",
    description:
      "Digitise your entire buying cycle — from purchase requisition to vendor invoice — with approvals, GRN tracking and landed costs built in.",
    features: [
      "Purchase orders & approvals",
      "Goods receipt notes",
      "Vendor management",
      "Purchase invoicing",
    ],
    icon: ShoppingCart,
    accent: "#0ea5e9",
    iconBg: "#eff6ff",
    tagBg: "#eff6ff",
    tagColor: "#0369a1",
    border: "#bae6fd",
  },
  {
    title: "Inventory",
    tag: "Warehousing",
    description:
      "Live stock across multiple warehouses. Track by batch, serial number or lot with automatic reorder alerts and movement history.",
    features: [
      "Multi-warehouse tracking",
      "Batch & serial numbers",
      "Stock transfers",
      "Reorder automation",
    ],
    icon: Box,
    accent: "#10b981",
    iconBg: "#f0fdf4",
    tagBg: "#f0fdf4",
    tagColor: "#047857",
    border: "#a7f3d0",
  },
  {
    title: "Manufacturing",
    tag: "Production",
    description:
      "Plan and execute jobs across looms, sizing machines and finishing lines. Track WIP, yarn consumption and output in real time.",
    features: [
      "Loom & sizing management",
      "Job work orders",
      "Production planning",
      "WIP & output tracking",
    ],
    icon: Activity,
    accent: "#8b5cf6",
    iconBg: "#f5f3ff",
    tagBg: "#f5f3ff",
    tagColor: "#6d28d9",
    border: "#ddd6fe",
  },
  {
    title: "Finance & GST",
    tag: "Accounting",
    description:
      "Complete double-entry accounting with GST-ready ledgers. Generate GSTR-1, GSTR-3B and auto-reconcile ITC in minutes.",
    features: [
      "Invoices & ledgers",
      "GSTR-1 / GSTR-3B filing",
      "Payables & receivables",
      "Bank reconciliation",
    ],
    icon: CircleDollarSign,
    accent: "#f59e0b",
    iconBg: "#fffbeb",
    tagBg: "#fffbeb",
    tagColor: "#b45309",
    border: "#fde68a",
  },
  {
    title: "Sales & CRM",
    tag: "Revenue",
    description:
      "Track every lead, quote, order and dispatch in one pipeline. Know your best customers and never miss a follow-up.",
    features: [
      "Sales orders & dispatch",
      "Customer 360 view",
      "Lead & pipeline tracking",
      "Quotation management",
    ],
    icon: TrendingUp,
    accent: "#f43f5e",
    iconBg: "#fff1f2",
    tagBg: "#fff1f2",
    tagColor: "#be123c",
    border: "#fecdd3",
  },
  {
    title: "Analytics",
    tag: "Intelligence",
    description:
      "Role-based dashboards, 100+ ready reports and KPI drill-downs. Make every decision from live data — not yesterday's spreadsheet.",
    features: [
      "Live KPI dashboards",
      "100+ ready reports",
      "Drill-down analytics",
      "Trend forecasting",
    ],
    icon: BarChart3,
    accent: "#6366f1",
    iconBg: "#eef2ff",
    tagBg: "#eef2ff",
    tagColor: "#4338ca",
    border: "#c7d2fe",
  },
];

const problems = [
  {
    icon: Clipboard,
    title: "Manual data entry",
    desc: "Hours wasted copying between Excel sheets, emails and WhatsApp.",
  },
  {
    icon: Users,
    title: "Disconnected teams",
    desc: "Sales, factory, warehouse and finance all working in separate silos.",
  },
  {
    icon: Box,
    title: "Inventory blind spots",
    desc: "Stock-outs, over-ordering and untracked batches costing you money.",
  },
  {
    icon: Activity,
    title: "Production delays",
    desc: "No live visibility into looms, jobs, labour or machine output.",
  },
  {
    icon: ShieldCheck,
    title: "GST headaches",
    desc: "Manual reconciliation and last-minute filing stress every month.",
  },
  {
    icon: BarChart3,
    title: "No real-time data",
    desc: "Decisions driven by gut feel — reports are always a week late.",
  },
];

const whyFeatures = [
  {
    icon: Zap,
    title: "Live in 2–6 weeks",
    desc: "Structured onboarding gets you productive fast. No months-long implementation cycles.",
    color: "#0ea5e9",
    bg: "#eff6ff",
  },
  {
    icon: Globe,
    title: "GST & compliance built in",
    desc: "Auto-generate GSTR-1, GSTR-3B, e-invoices and e-way bills. No add-ons needed.",
    color: "#10b981",
    bg: "#f0fdf4",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Operators, managers and finance users each see exactly what they need.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: Users,
    title: "Dedicated human support",
    desc: "A real team answers your questions, trains your staff and stays with you.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
];

const stats = [
  { value: "95%",  label: "Less manual work",       sub: "vs. spreadsheet operations" },
  { value: "60%",  label: "Faster operations",       sub: "across procurement & finance" },
  { value: "70%",  label: "Productivity boost",      sub: "reported by factory operators" },
  { value: "100+", label: "Businesses live",         sub: "across India" },
];

const comparison = [
  { feature: "Implementation time",   old: "6–12 months",       dks: "2–6 weeks" },
  { feature: "Up-front cost",         old: "₹25L+ in licenses", dks: "Subscription only" },
  { feature: "Cloud-native",          old: false,                dks: true },
  { feature: "Mobile access",         old: false,                dks: true },
  { feature: "Real-time dashboards",  old: false,                dks: true },
  { feature: "GST compliance",        old: "Paid add-on",        dks: "Built-in" },
  { feature: "No-code configuration", old: false,                dks: true },
  { feature: "24×7 support",          old: "Ticket queue",       dks: "Dedicated team" },
];

const testimonials = [
  {
    quote:
      "DKS ERP replaced 9 different tools we were juggling. Our factory finally runs as one unified system.",
    name: "Rohit Mehta",
    role: "CEO",
    company: "Northwind Textiles",
    initials: "RM",
    gradient: "linear-gradient(135deg,#0ea5e9,#2563eb)",
  },
  {
    quote:
      "GST filings used to take a full week. Now it's a 30-minute review. The team got their evenings back.",
    name: "Priya Shah",
    role: "Finance Manager",
    company: "Fabrique Mills",
    initials: "PS",
    gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  },
  {
    quote:
      "Real-time loom and sizing data changed how we plan production. Output is up 22% in 4 months.",
    name: "Arun Iyer",
    role: "Operations Manager",
    company: "Lumen & Co",
    initials: "AI",
    gradient: "linear-gradient(135deg,#10b981,#0f766e)",
  },
  {
    quote:
      "We onboarded 3 plants in 6 weeks. The implementation team was responsive, thorough and brilliant.",
    name: "Vikram Singh",
    role: "Factory Owner",
    company: "Axle Works",
    initials: "VS",
    gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
  },
];

const timeline = [
  { year: "2019", title: "Founded DKS ERP",     desc: "Started with a vision to modernise Indian textile manufacturing." },
  { year: "2021", title: "First factory live",   desc: "Deployed at our first textile unit in Surat — procurement & inventory." },
  { year: "2023", title: "Full module suite",    desc: "Launched manufacturing, GST, CRM and analytics covering end-to-end ops." },
  { year: "2025", title: "100+ businesses live", desc: "Trusted by manufacturers and factories across India." },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LABEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ children, color = "#0ea5e9", bg = "#eff6ff" }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span
      className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">
      <LandingNavbar />
      <HeroSection />

      {/* ══════════════════════════════════════════════════════════════════════
          LOGOS / SOCIAL PROOF BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="border-y border-slate-100 bg-slate-50/60 py-4">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Trusted by manufacturers across India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-end">
              {["Northwind Textiles", "Fabrique Mills", "Lumen & Co", "Axle Works", "Sunrise Looms"].map((n) => (
                <span key={n} className="text-sm font-semibold text-slate-400 transition hover:text-slate-600">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PROBLEM
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel color="#e11d48" bg="#fff1f2">The Problem</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Still running your factory on{" "}
              <span className="text-rose-500">spreadsheets?</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Disconnected tools and manual processes cost growing manufacturers crores in productivity every year.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group relative flex gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-100 hover:shadow-md"
                >
                  <div className="shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* transition bridge */}
          <div className="mt-14 flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-slate-100 max-w-[160px]" />
            <p className="text-sm font-bold text-slate-400">There's a better way</p>
            <div className="h-px flex-1 bg-slate-100 max-w-[160px]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODULES
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="solutions" className="bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Product Modules</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Powerful modules.{" "}
              <span className="text-sky-600">Built to work together.</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Six deeply integrated modules covering your entire operation — from supplier to customer, procurement to profit.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: m.border }}
                >
                  {/* top accent line */}
                  <div className="h-[3px]" style={{ background: m.accent }} />

                  <div className="flex flex-1 flex-col p-7">
                    {/* header row */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ backgroundColor: m.iconBg, color: m.accent }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
                        style={{ backgroundColor: m.tagBg, color: m.tagColor }}
                      >
                        {m.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">{m.title}</h3>
                    <p className="mt-2.5 text-sm leading-7 text-slate-500">{m.description}</p>

                    <ul className="mt-5 flex-1 space-y-2.5">
                      {m.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: m.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="#contact"
                      className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                      style={{ color: m.accent }}
                    >
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/dashboard/login/v2"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Explore all modules <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY DKS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="why-us" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* left */}
            <div>
              <SectionLabel color="#6d28d9" bg="#f5f3ff">Why choose DKS</SectionLabel>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Built for the way{" "}
                <span className="text-sky-600">Indian factories</span> work.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-500">
                Not adapted from a foreign ERP. Built ground-up for Indian manufacturing — with GST, multi-plant ops and regional workflows at its core.
              </p>

              <div className="mt-10 space-y-5">
                {whyFeatures.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5 transition hover:border-slate-200">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: f.bg, color: f.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{f.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* right: metrics visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "95%",   label: "Less manual work",     sub: "vs spreadsheet operations",   color: "#0ea5e9",  bg: "#eff6ff",  icon: Zap },
                { value: "60%",   label: "Faster operations",    sub: "procurement to finance",       color: "#10b981",  bg: "#f0fdf4",  icon: TrendingUp },
                { value: "70%",   label: "Productivity boost",   sub: "reported by factory operators",color: "#8b5cf6",  bg: "#f5f3ff",  icon: Users },
                { value: "3mo",   label: "Average ROI period",   sub: "from go-live to full return",  color: "#f59e0b",  bg: "#fffbeb",  icon: BarChart3 },
                { value: "100+",  label: "Businesses live",      sub: "manufacturers across India",   color: "#f43f5e",  bg: "#fff1f2",  icon: Building2 },
                { value: "2–6w",  label: "Go-live timeline",     sub: "structured onboarding",        color: "#6366f1",  bg: "#eef2ff",  icon: CheckCircle },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: m.bg, color: m.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-slate-900" style={{ color: m.color }}>{m.value}</p>
                      <p className="mt-1 font-bold text-slate-800">{m.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{m.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div
          className="mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 sm:px-8 lg:px-12"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0c4a6e 55%, #0f172a 100%)",
          }}
        >
          <div className="py-16">
            <div className="mb-14 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">Business results</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Real outcomes. Real businesses.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.value}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition hover:bg-white/10"
                >
                  <p className="text-5xl font-extrabold text-white">{s.value}</p>
                  <p className="mt-3 font-semibold text-sky-200">{s.label}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COMPARISON
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
          <div className="mb-14 text-center">
            <SectionLabel color="#047857" bg="#f0fdf4">Comparison</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              DKS ERP vs. Traditional ERP
            </h2>
            <p className="mt-5 text-lg text-slate-500">
              See why modern manufacturers switch to DKS.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* header */}
            <div className="grid grid-cols-[1.8fr_1.1fr_1.1fr] border-b border-slate-100 bg-slate-50 px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Feature</p>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Traditional ERP</p>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-sky-600">DKS ERP</p>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.8fr_1.1fr_1.1fr] items-center border-b border-slate-50 px-6 py-4 text-sm last:border-0 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
              >
                <p className="font-medium text-slate-800">{row.feature}</p>
                <div className="flex justify-center">
                  {row.old === false ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-400">
                      ✕
                    </span>
                  ) : (
                    <span className="text-slate-400">{row.old}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.dks === true ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                      ✓
                    </span>
                  ) : (
                    <span className="font-bold text-slate-900">{row.dks}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-14 text-center">
            <SectionLabel color="#b45309" bg="#fffbeb">Testimonials</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Loved by operators and owners.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                {/* stars */}
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-5 text-base leading-8 text-slate-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm"
                    style={{ background: t.gradient }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-14 text-center">
            <SectionLabel color="#4338ca" bg="#eef2ff">About Us</SectionLabel>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              The team behind DKS ERP.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
              Founded by builders with deep roots in textile manufacturing and enterprise software.
            </p>
          </div>

          {/* founders */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { name: "Bhushan Khairnar", role: "CEO & Co-Founder", initials: "BK", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)", about: "12+ years in textile manufacturing. Built DKS ERP from the factory floor up — solving problems he lived firsthand." },
              { name: "Lalit Khairnar",   role: "COO & Co-Founder", initials: "LK", gradient: "linear-gradient(135deg,#10b981,#0369a1)", about: "Enterprise software veteran. Brings product architecture and customer success experience from 100+ factory deployments." },
            ].map((f) => (
              <div key={f.name} className="group flex gap-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg" style={{ background: f.gradient }}>
                  {f.initials}
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{f.name}</p>
                    <p className="text-sm font-semibold text-sky-600">{f.role}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{f.about}</p>
                  </div>
                  <button className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-sky-600 transition hover:bg-slate-100">
                    <Linkedin className="h-3.5 w-3.5" />
                    Connect on LinkedIn
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* timeline */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t, i) => (
              <div key={t.year} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div
                  className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}
                >
                  {i + 1}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">{t.year}</p>
                <p className="mt-1 font-bold text-slate-900">{t.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div
            className="overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
            style={{
              background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 55%, #38bdf8 100%)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">
              Start today
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Ready to see DKS ERP in action?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-sky-100">
              Book a free demo. Our team walks you through the modules most relevant to your operation — no pressure, no obligation.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-bold text-sky-700 shadow-lg transition hover:bg-sky-50 hover:-translate-y-0.5"
              >
                Book Free Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/login/v2"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Sign in →
              </Link>
            </div>
            <p className="mt-6 text-xs text-sky-200">
              14-day free trial · No credit card required · Setup in hours, not months
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            {/* left */}
            <div>
              <SectionLabel>Contact us</SectionLabel>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Let's talk about your business.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-500">
                Whether you want a live demo, a custom walkthrough or have a specific challenge — we'd love to hear from you.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  { icon: Mail,   label: "Email us",   value: "bhushan.dks@gmail.com" },
                  { icon: Phone,  label: "Call us",    value: "+91 98765 43210" },
                  { icon: MapPin, label: "Our office", value: "Mumbai, Maharashtra, India" },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                        <Icon className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{c.label}</p>
                        <p className="font-semibold text-slate-800">{c.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* demo info card */}
              <div className="mt-10 rounded-2xl border border-sky-100 bg-sky-50 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <p className="font-bold text-slate-900">Live demo access available</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Try DKS ERP with real textile factory data. Every module is live to explore.
                </p>
                <div className="mt-4 space-y-1 font-mono text-sm text-slate-600">
                  <p>bhushan.dks@gmail.com / 123123123</p>
                  <p>lalit.dks@gmail.com / 123123123</p>
                </div>
              </div>
            </div>

            {/* form */}
            <form className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="mb-7 text-xl font-bold text-slate-900">Send us a message</p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Full name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    placeholder="Rohit Mehta"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Work email</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    placeholder="rohit@company.com"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Company name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="Northwind Textiles"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">How can we help?</label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100">
                  <option>Book a free demo</option>
                  <option>Request a custom walkthrough</option>
                  <option>Ask about pricing</option>
                  <option>Technical question</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</label>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder="Tell us about your factory, team size, and what you'd like to improve..."
                />
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
              >
                Send message <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                We typically respond within 2 hours during business hours.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-900/10 bg-slate-950 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* brand */}
            <div className="space-y-5">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="text-lg font-extrabold text-white">
                  DKS <span className="text-sky-400">ERP</span>
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-7 text-slate-400">
                The modern ERP for textile and manufacturing businesses. Built in India, trusted by Indian factories.
              </p>
              <div className="space-y-1.5 text-sm text-slate-500">
                <p>bhushan.dks@gmail.com</p>
                <p>+91 98765 43210</p>
                <p>Mumbai, India</p>
              </div>
            </div>

            {[
              {
                title: "Product",
                links: ["Solutions", "Modules", "Pricing", "Integrations", "Changelog", "Security"],
              },
              {
                title: "Industries",
                links: ["Textile & Weaving", "Manufacturing", "Food Processing", "Automobile", "Warehousing"],
              },
              {
                title: "Company",
                links: ["About", "Customers", "Blog", "Careers", "Privacy Policy", "Terms"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-sm text-slate-400 transition hover:text-white">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              © 2026 DKS ERP. All rights reserved. Made with ♥ in India.
            </p>
            <div className="flex gap-5 text-xs text-slate-500">
              {["Privacy", "Terms", "Security", "Status"].map((l) => (
                <Link key={l} href="#" className="transition hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
