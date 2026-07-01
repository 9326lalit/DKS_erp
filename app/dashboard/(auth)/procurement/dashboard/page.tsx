"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  FileText,
  PackageCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { procurementApiService } from "@/lib/services/procurement-api";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { StatsCard } from "@/components/textile-erp/stats-card";
import { ChartCard } from "@/components/textile-erp/chart-card";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Colors for Pie Charts
const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ProcurementDashboardPage() {
  const router = useRouter();

  // Queries
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["procurementDashboard"],
    queryFn: () => procurementApiService.getPurchaseDashboard()
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Procurement Control Center"
        description="Monitor raw yarn purchase contracts, inspect incoming vehicle deliveries, and track supplier billing liabilities."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Procurement Control" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/procurement/purchase-orders/new")}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Active Suppliers"
          value={dashboardData?.totalSuppliers ?? 0}
          description="Yarn spinning mills & traders"
          icon={Users}
          loading={isLoading}
        />
        <StatsCard
          title="Open Purchase Orders"
          value={dashboardData?.openPOs ?? 0}
          description="Awaiting approval or transit release"
          icon={ShoppingBag}
          loading={isLoading}
          className="border-indigo-500/10 dark:border-indigo-500/5"
        />
        <StatsCard
          title="Pending Deliveries"
          value={dashboardData?.pendingDeliveries ?? 0}
          description="POs with incomplete yarn arrivals"
          icon={Truck}
          loading={isLoading}
          className="border-amber-500/10 dark:border-amber-500/5"
        />
        <StatsCard
          title="Total Purchase Value"
          value={formatCurrency(dashboardData?.totalPurchaseValue ?? 0)}
          description="Invoice balances posted (6 Months)"
          icon={DollarSign}
          loading={isLoading}
          className="border-emerald-500/10 dark:border-emerald-500/5"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Purchase Value Trend bar chart */}
        <ChartCard
          title="Monthly Purchases Ledger"
          description="Consolidated value of purchase invoices posted monthly (INR)"
          className="md:col-span-2"
          loading={isLoading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dashboardData?.monthlyTrends ?? []}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground font-semibold" />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                tickLine={false}
                axisLine={false}
                className="text-[10px] text-muted-foreground font-semibold"
              />
              <RechartsTooltip
                formatter={(v: any) => [formatCurrency(v), "Purchases"]}
                contentStyle={{
                  background: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  fontSize: "11px",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Purchase Value" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PO Status Distribution pie chart */}
        <ChartCard
          title="Purchase Status Overview"
          description="Fulfillment stages of registered PO files"
          loading={isLoading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dashboardData?.statusDistribution ?? []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="status"
              >
                {(dashboardData?.statusDistribution ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  fontSize: "11px",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-muted-foreground mt-2">
            {(dashboardData?.statusDistribution ?? []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.status} ({item.count})</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Top Suppliers Purchase Distribution */}
        <ChartCard
          title="Top Yarn Suppliers by Purchase Value"
          description="Leading spinning mills & trade houses value share (INR)"
          loading={isLoading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={dashboardData?.supplierAnalysis ?? []}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} tickLine={false} axisLine={false} className="text-[9px]" />
              <YAxis dataKey="supplierName" type="category" width={80} tickLine={false} axisLine={false} className="text-[9px] font-semibold text-foreground" />
              <RechartsTooltip
                formatter={(v: any) => [formatCurrency(v), "Order Value"]}
                contentStyle={{
                  background: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  fontSize: "11px",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Operational Activity Registers */}
        <Card className="md:col-span-2 border-border/40 overflow-hidden bg-card flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base font-bold font-display">Recent Activity Log</CardTitle>
              <p className="text-xs text-muted-foreground">Recent purchase orders and material arrivals</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/procurement/purchase-orders")}
              className="text-xs gap-1 cursor-pointer font-bold"
            >
              All Orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/10 text-xs">
                {(dashboardData?.recentActivities ?? []).map((act) => (
                  <div key={act.id} className="p-4 hover:bg-muted/5 flex items-center justify-between gap-4 transition-colors">
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-lg border shrink-0 ${act.type === "PO" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-sky-500/10 text-sky-600 border-sky-500/20"}`}>
                        {act.type === "PO" ? <FileText className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground leading-snug">{act.title}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                          <span>{act.code}</span>
                          <span className="h-1 w-1 bg-border rounded-full" />
                          <span>{act.date}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={act.status} type={act.type === "PO" ? "invoice" : "lot"} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
