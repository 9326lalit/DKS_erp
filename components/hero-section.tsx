"use client";

import Link from "next/link";
import {
  ArrowRight, CheckCircle, Play, TrendingUp, ShieldCheck,
  ShoppingCart, Box, Activity, CircleDollarSign, BarChart3,
  Home, Package, Bell, Search,
  ArrowUpRight,
} from "lucide-react";

const bars = [32, 44, 38, 58, 50, 66, 58, 80, 70, 88, 78, 100];

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-white">

      {/* subtle gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 90% 60% at 60% 20%, rgba(14,165,233,0.06) 0%, transparent 65%)",
            "radial-gradient(ellipse 50% 50% at 5% 85%, rgba(99,102,241,0.04) 0%, transparent 55%)",
          ].join(","),
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-12 lg:py-20">

        {/* ══ LEFT COPY ═══════════════════════════════════════════════════════ */}
        <div>

          {/* eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            <span className="text-xs font-bold text-sky-700">India's #1 Textile &amp; Manufacturing ERP</span>
          </div>

          {/* headline */}
          <h1 className="mb-5 text-5xl font-extrabold leading-[1.07] tracking-tight text-slate-900 sm:text-6xl lg:text-[60px]">
            Run your entire<br />
            factory on{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              one platform.
            </span>
          </h1>

          {/* sub */}
          <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-500">
            Procurement, inventory, manufacturing, finance, GST and analytics — connected in one cloud ERP built for Indian factories.
          </p>

          {/* CTAs */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/login/v2"
              className="group inline-flex items-center gap-2.5 rounded-full bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_6px_24px_rgba(14,165,233,0.38)] transition-all hover:-translate-y-0.5 hover:bg-sky-500"
            >
              Book Free Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                <Play className="h-2.5 w-2.5 translate-x-[1px] fill-slate-600 text-slate-600" />
              </span>
              Watch Demo
            </Link>
          </div>

          {/* trust items */}
          <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2">
            {["14-day free trial", "No credit card", "GST-ready", "Go live in 2–6 weeks"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>

          {/* stats strip */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {[
              { v: "95%",  l: "Less manual work" },
              { v: "60%",  l: "Faster ops" },
              { v: "100+", l: "Businesses" },
              { v: "2–6w", l: "Go-live time" },
            ].map((s) => (
              <div key={s.l} className="py-4 text-center">
                <p className="text-xl font-extrabold text-slate-900">{s.v}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT: product dashboard mockup ════════════════════════════════ */}
        <div className="mt-12 lg:mt-0">

          {/* shadow glow behind the card */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-40 blur-3xl"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.15) 0%, transparent 70%)" }}
            />

            {/* card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">

              {/* browser chrome */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="mx-3 flex flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="flex-1 text-[11px] text-slate-400">app.dkserp.com/dashboard</span>
                  <span className="text-[9px] font-bold text-emerald-600">LIVE</span>
                </div>
              </div>

              {/* app shell */}
              <div className="flex" style={{ height: 460 }}>

                {/* ── SIDEBAR ──────────────────────────────────────────────── */}
                <div className="flex w-44 shrink-0 flex-col border-r border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold text-white"
                      style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}
                    >
                      DK
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">DKS ERP</p>
                      <p className="text-[9px] text-slate-400">Textile Edition</p>
                    </div>
                  </div>

                  <nav className="flex-1 space-y-0.5 p-2.5">
                    {[
                      { icon: Home,             label: "Dashboard",     active: true  },
                      { icon: ShoppingCart,     label: "Procurement",   active: false },
                      { icon: Package,          label: "Inventory",     active: false },
                      { icon: Activity,         label: "Manufacturing", active: false },
                      { icon: CircleDollarSign, label: "Finance",       active: false },
                      { icon: TrendingUp,       label: "Sales & CRM",   active: false },
                      { icon: ShieldCheck,      label: "GST",           active: false },
                      { icon: BarChart3,        label: "Analytics",     active: false },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                          active ? "bg-sky-600 text-white shadow-sm" : "text-slate-500"
                        }`}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        {label}
                      </div>
                    ))}
                  </nav>

                  <div className="border-t border-slate-100 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white">RM</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-bold text-slate-800">Rohit Mehta</p>
                        <p className="text-[8px] text-slate-400">Administrator</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden bg-[#f8fafc]">

                  {/* topbar */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">Good morning, Rohit 👋</p>
                      <p className="text-[9px] text-slate-400">Tuesday, 26 July 2026 · Factory overview</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-400">
                        <Search className="h-3 w-3" /> Search…
                      </div>
                      <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white">
                        <Bell className="h-3.5 w-3.5 text-slate-400" />
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
                      </div>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-3.5 space-y-3">

                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Revenue",      value: "₹48.2L",  change: "+12.4%", up: true, c: "#10b981", bg: "#f0fdf4" },
                        { label: "Orders",       value: "1,284",   change: "+8.1%",  up: true, c: "#0ea5e9", bg: "#eff6ff" },
                        { label: "Looms",        value: "142/160", change: "88.7%",  up: null, c: "#8b5cf6", bg: "#f5f3ff" },
                        { label: "GST Payable",  value: "₹6.8L",  change: "GSTR-3B",up: null, c: "#f59e0b", bg: "#fffbeb" },
                      ].map((k) => (
                        <div key={k.label} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
                          <p className="mt-1.5 text-[15px] font-extrabold text-slate-900">{k.value}</p>
                          <span
                            className="mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold"
                            style={{ backgroundColor: k.bg, color: k.c }}
                          >
                            {k.up && <ArrowUpRight className="h-2 w-2" />}
                            {k.change}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* chart + activity */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 165px" }}>

                      {/* bar chart */}
                      <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                        <div className="mb-2.5 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-900">Revenue — FY 2025–26</p>
                            <p className="text-[9px] text-slate-400">Monthly revenue</p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-600">▲ +23% YoY</span>
                        </div>
                        <div className="flex h-[72px] items-end gap-[3px]">
                          {bars.map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t"
                              style={{
                                height: `${h}%`,
                                background: i >= 10 ? "linear-gradient(to top,#0369a1,#38bdf8)" : i >= 7 ? "#93c5fd" : "#e2e8f0",
                                animation: `barUp 0.4s ease-out ${i * 0.035}s both`,
                              }}
                            />
                          ))}
                        </div>
                        <div className="mt-1 flex justify-between">
                          {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                            <span key={i} className="flex-1 text-center text-[6px] font-medium text-slate-300">{m}</span>
                          ))}
                        </div>
                      </div>

                      {/* live feed */}
                      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <div className="mb-2.5 flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-900">Live Activity</p>
                          <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                          </span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { c: "#0ea5e9", t: "PO #4821 approved",  s: "₹3.2L · 3 vendors", time: "2m" },
                            { c: "#10b981", t: "GRN: 240 units",     s: "Warehouse B",        time: "8m" },
                            { c: "#8b5cf6", t: "Invoice INV-0992",   s: "Generated & sent",   time: "15m" },
                            { c: "#f59e0b", t: "Payment ₹1.2L",      s: "Fabrique Mills",     time: "24m" },
                            { c: "#f43f5e", t: "SO-2201 confirmed",  s: "580 metres",         time: "41m" },
                          ].map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="relative mt-[5px] shrink-0">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.c }} />
                                {i === 0 && <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full opacity-60" style={{ backgroundColor: a.c }} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-semibold text-slate-800">{a.t}</p>
                                <p className="text-[8px] text-slate-400">{a.s} · {a.time} ago</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* bottom row */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 140px" }}>

                      {/* procurement pipeline */}
                      <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                        <p className="mb-2.5 text-[11px] font-bold text-slate-900">Procurement Pipeline</p>
                        <div className="space-y-2">
                          {[
                            { label: "Draft",            count: 8,  pct: 20, c: "#94a3b8" },
                            { label: "Pending approval", count: 5,  pct: 50, c: "#f59e0b" },
                            { label: "In transit",       count: 12, pct: 72, c: "#0ea5e9" },
                            { label: "Received",         count: 34, pct: 92, c: "#10b981" },
                          ].map((r) => (
                            <div key={r.label}>
                              <div className="mb-1 flex justify-between">
                                <span className="text-[9px] font-semibold text-slate-600">{r.label}</span>
                                <span className="text-[9px] font-bold text-slate-700">{r.count}</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${r.pct}%`, backgroundColor: r.c, animation: "grow 0.7s ease-out both" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* inventory */}
                      <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                        <p className="mb-2.5 text-[11px] font-bold text-slate-900">Inventory Status</p>
                        <div className="space-y-2.5">
                          {[
                            { n: "Cotton Yarn",    q: "2,840 kg",  s: "OK",      c: "#10b981", bg: "#f0fdf4" },
                            { n: "Polyester Blend",q: "1,220 kg",  s: "Low",     c: "#f59e0b", bg: "#fffbeb" },
                            { n: "Dye (Blue)",     q: "480 L",     s: "OK",      c: "#10b981", bg: "#f0fdf4" },
                            { n: "Grey Fabric",    q: "340 mtrs",  s: "Reorder", c: "#f43f5e", bg: "#fff1f2" },
                          ].map((r) => (
                            <div key={r.n} className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[9px] font-semibold text-slate-800">{r.n}</p>
                                <p className="text-[8px] text-slate-400">{r.q}</p>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                                style={{ backgroundColor: r.bg, color: r.c }}
                              >
                                {r.s}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* pending tasks */}
                      <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                        <p className="mb-2.5 text-[11px] font-bold text-slate-900">Action Items</p>
                        <div className="space-y-2.5">
                          {[
                            { t: "Approve PO #4822", p: "High",   c: "#ef4444" },
                            { t: "File GSTR-1 Jul",  p: "Due",    c: "#f59e0b" },
                            { t: "Reorder Grey Fab", p: "Low",    c: "#6366f1" },
                            { t: "Review SO-2205",   p: "Normal", c: "#0ea5e9" },
                          ].map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="mt-[3px] h-3 w-3 shrink-0 rounded border-[1.5px] border-slate-200" />
                              <div>
                                <p className="text-[9px] font-semibold leading-tight text-slate-800">{a.t}</p>
                                <p className="text-[8px] font-bold" style={{ color: a.c }}>{a.p}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes barUp {
          from { transform: scaleY(0); transform-origin: bottom; }
          to   { transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes grow { from { width: 0; } }
      `}</style>
    </section>
  );
}
