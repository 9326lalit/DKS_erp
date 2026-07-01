import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Box,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clipboard,
  Linkedin,
  ShieldCheck,
  ShoppingCart,
  Truck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const solutions = [
  {
    title: "Procurement",
    description: "Purchase orders, GRN and vendor management.",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    description: "Real-time stock across warehouses & batches.",
    icon: Box,
  },
  {
    title: "Manufacturing",
    description: "Plan jobs, looms, sizing & production.",
    icon: Activity,
  },
  {
    title: "Factory management",
    description: "Shop floor, labour & shift tracking.",
    icon: Briefcase,
  },
  {
    title: "Finance",
    description: "Ledgers, payables, receivables, banking.",
    icon: CircleDollarSign,
  },
  {
    title: "GST",
    description: "GSTR-ready filings & auto reconciliation.",
    icon: ShieldCheck,
  },
  {
    title: "Reports",
    description: "100+ ready reports across modules.",
    icon: BarChart3,
  },
  {
    title: "Analytics",
    description: "KPIs, drill-downs and forecasts.",
    icon: TrendingUp,
  },
  {
    title: "Labour",
    description: "Attendance, wages & productivity.",
    icon: Users,
  },
  {
    title: "Purchase & Sales",
    description: "Quotes, orders, dispatch & invoicing.",
    icon: ShoppingCart,
  },
  {
    title: "Sales & CRM",
    description: "Leads, pipelines & customer 360.",
    icon: Users,
  },
  {
    title: "Dashboards",
    description: "Role-based views for every team.",
    icon: BarChart3,
  },
];

const modules = [
  {
    title: "Procurement",
    description: ["Purchase orders", "Goods receipt", "Purchase invoice", "Vendor management"],
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    description: ["Stock tracking", "Warehouses", "Batch & serial", "Stock transfers"],
    icon: Box,
  },
  {
    title: "Manufacturing",
    description: ["Factory ops", "Loom & sizing", "Production planning", "Job work"],
    icon: Activity,
  },
  {
    title: "Finance & GST",
    description: ["Invoices & ledgers", "GSTR filing", "Reports", "Accounting ready"],
    icon: CircleDollarSign,
  },
  {
    title: "CRM",
    description: ["Customer 360", "Sales pipeline", "Lead tracking", "Quotations"],
    icon: Users,
  },
  {
    title: "Analytics",
    description: ["Live dashboards", "Charts & KPIs", "Drill-down reports", "Forecasts"],
    icon: TrendingUp,
  },
];

const highlights = [
  "Real-time purchase order visibility",
  "Live inventory and warehouse tracking",
  "Fast factory and production oversight",
  "Simple finance and GST-ready reporting",
];

const testimonials = [
  {
    quote: "DKS ERP replaced 9 different tools we were juggling. Our factory finally runs as one system.",
    name: "Rohit Mehta",
    role: "CEO, Northwind Textiles",
    initials: "RM",
  },
  {
    quote: "GST filings used to take a week. Now it's a 30-minute review. The team got their evenings back.",
    name: "Priya Shah",
    role: "Finance Manager, Fabrique Mills",
    initials: "PS",
  },
  {
    quote: "Real-time loom and sizing data changed how we plan production. Output is up 22% in 4 months.",
    name: "Arun Iyer",
    role: "Operations Manager, Lumen & Co",
    initials: "AI",
  },
  {
    quote: "We onboarded 3 plants in 6 weeks. Implementation team was world-class.",
    name: "Vikram Singh",
    role: "Factory Owner, Axle Works",
    initials: "VS",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            DKS ERP
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#about" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              About
            </Link>
            <Link href="#solutions" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Solutions
            </Link>
            <Link href="#why-us" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Why us
            </Link>
            <Link href="#contact" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Contact
            </Link>
          </nav>
          <Link href="/dashboard/login/v2" className="rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
            Login
          </Link>
        </div>
      </header>

      <section id="hero" className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Modern ERP Platform for Manufacturing
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
                Run your entire business from
                <span className="block text-sky-600">one powerful ERP platform.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Simplify procurement, inventory, factory operations, finance, and production with one centralized cloud-based ERP built for modern textile and manufacturing businesses.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/login/v2">
                <Button className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-white shadow-lg shadow-sky-200/40 transition hover:bg-sky-700">
                  Book Free Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Watch Demo
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                14-day free trial
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                No credit card
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                GST ready
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_45px_120px_-65px_rgba(15,23,42,0.18)]">
            <div className="absolute right-6 top-6 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md">
              Production +18% this week
            </div>
            <div className="absolute left-6 top-6 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500" />
              Stock alert: Cotton Yarn low
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between rounded-3xl bg-white px-5 py-4 shadow-sm">
                <div className="text-sm text-slate-500">app.axiomerp.com / dashboard</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Revenue</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">₹48.2L</p>
                  <p className="mt-2 text-sm text-emerald-600">+12.4%</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Orders</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">1,284</p>
                  <p className="mt-2 text-sm text-sky-600">+8.1%</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-100 p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Revenue trend</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Paid</span>
                </div>
                <div className="mt-4 h-24 rounded-[1.5rem] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="bg-[#f8fbff] py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">The problem</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Still managing your business through Excel?
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Spreadsheets and disconnected tools cost growing manufacturers crores in lost productivity every year. Sound familiar?
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Disconnected teams</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sales, finance, factory and warehouse working in silos.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Clipboard className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Manual entries</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Hours lost copying data between Excel sheets and tools.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Box className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Inventory errors</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Stock-outs, over-ordering and untracked batches.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Delayed production</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">No visibility into looms, jobs or labour output.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Lost purchase records</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Vendor POs and invoices scattered across inboxes.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">No real-time visibility</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Reports are days late and never match across teams.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">GST complexity</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manual reconciliation and filing eat into your week.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900">No analytics</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Decisions made on gut feel instead of live numbers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">The solution</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Everything your business needs, in one platform.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Replace 10+ tools with a single source of truth. Connected workflows from purchase to production to payment.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {solutions.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">Key leaders</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Our exceptional leaders driving DKS ERP.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Meet the founders who built DKS ERP to simplify textile manufacturing, inventory and finance operations.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-hidden rounded-t-[2rem] bg-slate-100">
                <img src="/images/about/Bhushan.jpg" alt="Bhushan Khairnar" className="h-80 w-full object-cover object-top" />
              </div>
              <div className="border-t border-slate-200 px-6 py-6 text-center">
                <p className="text-xl font-semibold text-slate-900">Bhushan Khairnar</p>
                {/* <p className="mt-2 text-sm text-slate-500">CEO & Founder</p> */}
                <button className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-slate-100">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="overflow-hidden rounded-t-[2rem] bg-slate-100">
                <img src="/images/about/Lalit.jpg" alt="Lalit Khairnar" className="h-80 w-full object-cover object-top" />
              </div>
              <div className="border-t border-slate-200 px-6 py-6 text-center">
                <p className="text-xl font-semibold text-slate-900">Lalit Khairnar</p>
                {/* <p className="mt-2 text-sm text-slate-500">COO & Co-Founder</p> */}
                <button className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-slate-100">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">2019</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">Started DKS ERP</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">2021</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">First factory live</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">2023</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">Expanded modules</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">2025</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">100+ businesses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="border-b border-slate-200 bg-white/80 py-16">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Product modules</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Powerful modules. Built to work together.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">{item.title}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    {item.description.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm font-semibold text-sky-700">Explore →</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-us" className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">What we solve</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Replace scattered tools with one dependable ERP flow.
            </h2>
            <p className="text-base leading-8 text-slate-600">
              From purchase orders to warehouse movement and finance reporting, DKS ERP helps teams stay aligned with less friction and less manual work.
            </p>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">Procurement</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Create purchase orders and follow approvals without switching tools.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">Inventory</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Track stock movement, warehouse movement, and party masters in one place.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">Reporting</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Monitor performance through clear dashboards and business summaries.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">Team access</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Give operators, admin, and finance users the right view without clutter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-sky-700 via-sky-700 to-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Business results</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Real outcomes from real customers.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-4xl font-semibold text-white">95%</p>
              <p className="mt-3 text-sm text-sky-100">Less manual work</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-4xl font-semibold text-white">60%</p>
              <p className="mt-3 text-sm text-sky-100">Faster operations</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-4xl font-semibold text-white">70%</p>
              <p className="mt-3 text-sm text-sky-100">Productivity increase</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-4xl font-semibold text-white">99.9%</p>
              <p className="mt-3 text-sm text-sky-100">System availability</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-4xl font-semibold text-white">100+</p>
              <p className="mt-3 text-sm text-sky-100">Businesses served</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <Image
              src="/images/extra/image2.jpg"
              alt="DKS ERP operations dashboard"
              width={900}
              height={640}
              className="h-auto w-full rounded-xl object-cover"
            />
          </div>
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Why choose us</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              A polished ERP that feels simple, practical, and ready to grow.
            </h2>
            <p className="text-base leading-8 text-slate-600">
              The UI is light, modern, and focused on the essentials. Teams can move from procurement to reporting without getting lost in clutter.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-900">Designed for real business flow</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Whether you are running factory operations, managing warehouse movement, or reviewing finance, DKS ERP keeps the experience user-friendly and consistent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Comparison</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Traditional ERP vs. DKS ERP
            </h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600">
              <div>Feature</div>
              <div className="text-center">Traditional ERP</div>
              <div className="text-center text-sky-700">DKS ERP</div>
            </div>
            <div className="divide-y divide-slate-200 text-sm text-slate-700">
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5">
                <div>Implementation time</div>
                <div className="text-center text-slate-500">6–12 months</div>
                <div className="text-center font-semibold text-slate-900">2–6 weeks</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5 bg-slate-50">
                <div>Up-front cost</div>
                <div className="text-center text-slate-500">₹25L+ licenses</div>
                <div className="text-center font-semibold text-slate-900">Subscription, no licenses</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5">
                <div>Cloud-native</div>
                <div className="text-center text-rose-500">✕</div>
                <div className="text-center text-emerald-600">✓</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5 bg-slate-50">
                <div>Mobile apps</div>
                <div className="text-center text-rose-500">✕</div>
                <div className="text-center text-emerald-600">✓</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5">
                <div>Real-time dashboards</div>
                <div className="text-center text-rose-500">✕</div>
                <div className="text-center text-emerald-600">✓</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5 bg-slate-50">
                <div>GST & local compliance</div>
                <div className="text-center text-slate-500">Add-on</div>
                <div className="text-center font-semibold text-slate-900">Built-in</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5">
                <div>Customization</div>
                <div className="text-center text-slate-500">Developer required</div>
                <div className="text-center font-semibold text-slate-900">No-code workflows</div>
              </div>
              <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] px-6 py-5 bg-slate-50">
                <div>Support</div>
                <div className="text-center text-slate-500">Ticket queue</div>
                <div className="text-center font-semibold text-slate-900">24×7 human support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Testimonials</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Loved by operators and owners.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-500">★★★★★</span>
                  <span className="text-sm">Customer review</span>
                </div>
                <p className="mt-6 text-lg leading-8 text-slate-900">“{item.quote}”</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-200 bg-[linear-gradient(90deg,#f8fbff_0%,#f8fafc_100%)] py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Contact us</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Let’s build a smoother ERP experience for your business.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              Whether you want to explore the demo, request a walkthrough, or discuss a custom setup, we would love to hear from you. Fill out the form and our team will get back to you with the right next step.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-900">
                <CheckCircle2 className="h-5 w-5 text-sky-600" />
                <p className="font-semibold">Demo access available</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>bhushan.dks@gmail.com / 123123123</p>
                <p>lalit.dks@gmail.com / 123123123</p>
              </div>
            </div>
          </div>
          <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="you@company.com" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Your company name" />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Tell us what you need help with" />
            </div>
            <Button className="mt-6 w-full sm:w-auto">Send message</Button>
          </form>
        </div>
      </section>

      <footer className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-lg font-semibold text-slate-900">DKS ERP</p>
              </div>
              <p className="max-w-lg text-sm leading-7 text-slate-600">
                The modern ERP for manufacturing, textile and production businesses. Built in India, trusted across Indian manufacturing teams.
              </p>
              <div className="space-y-2 text-sm text-slate-600">
                <p>bhushan.dks@gmail.com</p>
                <p>+91 98765 43210</p>
                <p>Mumbai, India</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Product</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Solutions</p>
                <p>Modules</p>
                <p>Pricing</p>
                <p>Integrations</p>
                <p>Changelog</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Industries</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Textile</p>
                <p>Manufacturing</p>
                <p>Food</p>
                <p>Automobile</p>
                <p>Warehouse</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Company</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>About</p>
                <p>Customers</p>
                <p>Careers</p>
                <p>Privacy</p>
                <p>Terms</p>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 DKS ERP. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-4">
                <p>Privacy</p>
                <p>Terms</p>
                <p>Security</p>
                <p>Status</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
