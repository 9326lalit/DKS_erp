"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Activity,
  BarChart3,
  Box,
  Briefcase,
  Building2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  X,
  Zap,
  BookOpen,
  PhoneCall,
  Play,
  Globe,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DropdownItem {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: {
    columns?: DropdownItem[][];   // multi-column layout
    items?: DropdownItem[];       // single-column layout
  };
}

// ─── Nav Data ────────────────────────────────────────────────────────────────
const productsColumns: DropdownItem[][] = [
  [
    {
      label: "Procurement",
      description: "POs, GRNs and vendor management",
      href: "#solutions",
      icon: ShoppingCart,
      color: "bg-sky-100 text-sky-700",
    },
    {
      label: "Inventory",
      description: "Real-time stock across warehouses",
      href: "#solutions",
      icon: Box,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Manufacturing",
      description: "Loom, sizing and production planning",
      href: "#solutions",
      icon: Activity,
      color: "bg-violet-100 text-violet-700",
    },
  ],
  [
    {
      label: "Finance & GST",
      description: "Ledgers, payables, GSTR filing",
      href: "#solutions",
      icon: CircleDollarSign,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "CRM & Sales",
      description: "Leads, pipeline and customer 360",
      href: "#solutions",
      icon: Users,
      color: "bg-rose-100 text-rose-700",
    },
    {
      label: "Analytics",
      description: "Live KPIs, drill-downs, forecasts",
      href: "#solutions",
      icon: TrendingUp,
      color: "bg-indigo-100 text-indigo-700",
    },
  ],
  [
    {
      label: "Factory Management",
      description: "Shop floor, labour & shift tracking",
      href: "#solutions",
      icon: Briefcase,
      color: "bg-teal-100 text-teal-700",
    },
    {
      label: "Reports",
      description: "100+ ready reports across modules",
      href: "#solutions",
      icon: BarChart3,
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Dashboards",
      description: "Role-based views for every team",
      href: "#solutions",
      icon: LayoutDashboard,
      color: "bg-pink-100 text-pink-700",
    },
  ],
];

const solutionsItems: DropdownItem[] = [
  {
    label: "Textile & Weaving",
    description: "End-to-end loom and fabric management",
    href: "#solutions",
    icon: Globe,
    color: "bg-sky-100 text-sky-700",
  },
  {
    label: "General Manufacturing",
    description: "Multi-plant production workflows",
    href: "#solutions",
    icon: Building2,
    color: "bg-slate-100 text-slate-700",
  },
  {
    label: "Procurement & Supply Chain",
    description: "Vendor, GRN and logistics tracking",
    href: "#solutions",
    icon: Truck,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Finance & Compliance",
    description: "GST, accounting and audit-ready reports",
    href: "#solutions",
    icon: ShieldCheck,
    color: "bg-amber-100 text-amber-700",
  },
];

const resourcesItems: DropdownItem[] = [
  {
    label: "Product Tour",
    description: "See DKS ERP in action, step by step",
    href: "#contact",
    icon: Play,
    color: "bg-sky-100 text-sky-700",
  },
  {
    label: "Documentation",
    description: "Guides, API docs and tutorials",
    href: "#contact",
    icon: BookOpen,
    color: "bg-violet-100 text-violet-700",
  },
  {
    label: "Blog & Insights",
    description: "Manufacturing ERP tips and trends",
    href: "#contact",
    icon: FileText,
    color: "bg-rose-100 text-rose-700",
  },
  {
    label: "Help Center",
    description: "FAQs and support articles",
    href: "#contact",
    icon: HelpCircle,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Book a Demo",
    description: "Live walkthrough with our team",
    href: "#contact",
    icon: PhoneCall,
    color: "bg-orange-100 text-orange-700",
  },
  {
    label: "What's New",
    description: "Latest features and changelog",
    href: "#contact",
    icon: Zap,
    color: "bg-amber-100 text-amber-700",
  },
];

const navItems: NavItem[] = [
  {
    label: "Products",
    dropdown: { columns: productsColumns },
  },
  {
    label: "Solutions",
    dropdown: { items: solutionsItems },
  },
  { label: "Why DKS", href: "#why-us" },
  {
    label: "Resources",
    dropdown: { items: resourcesItems },
  },
  { label: "Pricing", href: "#contact" },
  { label: "About", href: "#about" },
];

// ─── Dropdown Panel ───────────────────────────────────────────────────────────
function DropdownPanel({ item, wide }: { item: NavItem; wide?: boolean }) {
  const { dropdown } = item;
  if (!dropdown) return null;

  if (dropdown.columns) {
    return (
      <div
        className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.18)] ${wide ? "w-[720px]" : "w-[560px]"}`}
      >
        <div className="grid grid-cols-3 gap-2">
          {dropdown.columns.map((col, ci) => (
            <div key={ci} className="space-y-1">
              {col.map((d) => {
                const Icon = d.icon;
                return (
                  <Link
                    key={d.label}
                    href={d.href}
                    className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                  >
                    <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${d.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 group-hover:text-sky-700">
                        {d.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {d.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Link
            href="/dashboard/login/v2"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Explore all modules →
          </Link>
        </div>
      </div>
    );
  }

  if (dropdown.items) {
    const half = Math.ceil(dropdown.items.length / 2);
    const leftItems = dropdown.items.slice(0, half);
    const rightItems = dropdown.items.slice(half);
    return (
      <div className="absolute left-1/2 top-full z-50 mt-3 w-[480px] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-2 gap-2">
          {[leftItems, rightItems].map((col, ci) => (
            <div key={ci} className="space-y-1">
              {col.map((d) => {
                const Icon = d.icon;
                return (
                  <Link
                    key={d.label}
                    href={d.href}
                    className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-slate-50"
                  >
                    <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${d.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 group-hover:text-sky-700">
                        {d.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {d.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export function LandingNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection for shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openDropdown = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      {/* ── Desktop header ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-200">
              <Building2 className="h-5 w-5" />
            </span>
            <span>DKS <span className="text-sky-600">ERP</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const hasDropdown = !!item.dropdown;
              const isActive = activeDropdown === item.label;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown && openDropdown(item.label)}
                  onMouseLeave={() => hasDropdown && scheduleClose()}
                >
                  {item.href && !hasDropdown ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={`flex items-center gap-1 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}

                  {/* Dropdown */}
                  {hasDropdown && isActive && (
                    <div
                      onMouseEnter={() => openDropdown(item.label)}
                      onMouseLeave={scheduleClose}
                    >
                      <DropdownPanel
                        item={item}
                        wide={item.label === "Products"}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/dashboard/login/v2"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200/50 transition hover:bg-sky-700"
            >
              Book Free Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
          style={{ paddingTop: "0" }}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
                <Building2 className="h-5 w-5" />
              </span>
              <span>DKS <span className="text-sky-600">ERP</span></span>
            </Link>
            <button
              className="flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const hasDropdown = !!item.dropdown;
                const expanded = mobileExpanded === item.label;

                if (!hasDropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                }

                // Flatten all sub-items for mobile
                const allItems: DropdownItem[] = item.dropdown?.columns
                  ? item.dropdown.columns.flat()
                  : item.dropdown?.items ?? [];

                return (
                  <div key={item.label}>
                    <button
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() =>
                        setMobileExpanded(expanded ? null : item.label)
                      }
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded && (
                      <div className="mt-1 space-y-0.5 pl-4">
                        {allItems.map((d) => {
                          const Icon = d.icon;
                          return (
                            <Link
                              key={d.label}
                              href={d.href}
                              className="group flex items-center gap-3 rounded-xl px-4 py-2.5 transition hover:bg-slate-50"
                              onClick={() => setMobileOpen(false)}
                            >
                              <span
                                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.color}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="text-sm font-medium text-slate-700 group-hover:text-sky-700">
                                {d.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <Link
                href="/dashboard/login/v2"
                className="block rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="#contact"
                className="block rounded-xl bg-sky-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                onClick={() => setMobileOpen(false)}
              >
                Book Free Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
