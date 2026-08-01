"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Coins,
  Cpu,
  Factory,
  Layers,
  RefreshCw,
  Truck
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";

import { mockApiService } from "@/lib/services/mock-api";
import { useERPStore } from "@/lib/store/use-erp-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { StatsCard } from "@/components/textile-erp/stats-card";
import { ChartCard } from "@/components/textile-erp/chart-card";
import { WorkflowCard } from "@/components/textile-erp/workflow-card";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { LoadingState, ErrorState } from "@/components/textile-erp/ui-states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useTenantStore, ROLE_PERMISSIONS, UserRole } from "@/lib/store/use-tenant-store";
import { UserCheck, ShieldCheck, Crown, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { businessDetails, factoryDetails, financialYearDetails } = useERPStore();
  const { currentUser, tenants, activeTenantId, switchRole, isGlobalSuperAdmin } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (isGlobalSuperAdmin) {
      router.replace("/dashboard/super-admin");
    }
  }, [isGlobalSuperAdmin, router]);

  const role = currentUser?.role || "Super Admin";
  const roleConfig = ROLE_PERMISSIONS[role];

  // Fetch live dashboard aggregates using TanStack Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardData", refreshCount, activeTenantId],
    queryFn: () => mockApiService.getDashboard()
  });

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Textile Manufacturing Dashboard"
          description="Loading latest production efficiencies and weaving logs..."
        />
        <LoadingState message="Fetching live loom operations, yarn stocks, and invoices..." />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <PageHeader title="Textile Manufacturing Dashboard" />
        <ErrorState onAction={refetch} description="Failed to fetch aggregated loom dashboard data." />
      </PageContainer>
    );
  }

  const { stats, charts, recentPurchases, recentProduction, recentSales, recentActivities } = data;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: financialYearDetails?.currency || "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const testRoles: UserRole[] = ["Super Admin", "Mill Manager", "Production Head", "Accountant", "Global Super Admin"];

  return (
    <PageContainer>
      {/* Top Banner Header */}
      <PageHeader
        title={`${businessDetails?.businessName || "Textile Mill"} - Manufacturing Control`}
        description={`Weaving Unit: ${factoryDetails?.factoryName || "Unit-I"} | Active Looms: ${factoryDetails?.totalLooms || 24} | Fiscal: FY ${financialYearDetails?.financialYear || "2026-27"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 gap-1.5 cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              Sync Live
            </Button>
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1">
              Live Mill Operations
            </Badge>
          </div>
        }
      />

      {/* Role Access Scope & Quick Role Switcher Banner */}
      <Card className="border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-slate-900/5 to-transparent">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={roleConfig?.badgeColor || "bg-emerald-600 text-white"}>
                {role === "Global Super Admin" ? <Crown className="h-3.5 w-3.5 mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
                Role: {role}
              </Badge>
              <span className="text-xs font-bold text-foreground">
                Logged in as: {currentUser?.name || "User"} ({currentUser?.email})
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {roleConfig?.description}
            </p>
          </div>

          {/* Quick Role Test Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Test Role:</span>
            {testRoles.map((r) => {
              const isSel = r === role;
              return (
                <Button
                  key={r}
                  size="sm"
                  variant={isSel ? "default" : "outline"}
                  onClick={() => switchRole(r)}
                  className={`h-7 text-[11px] px-2.5 cursor-pointer ${
                    isSel ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold" : "hover:border-emerald-500/40"
                  }`}
                >
                  {r === "Global Super Admin" && <Crown className="h-3 w-3 mr-1 text-amber-400" />}
                  {r}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 1. KPIs Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Looms Operational"
          value={`${stats.runningLooms} / ${factoryDetails?.totalLooms || 36}`}
          icon={Factory}
          description="Running 24x7 Powerloom"
          trend={{ value: Math.round((stats.runningLooms / (factoryDetails?.totalLooms || 36)) * 100), label: "% Utilization", direction: "up" }}
        />
        <StatsCard
          title="Idle / Down Looms"
          value={stats.idleLooms + stats.maintenanceLooms}
          icon={AlertTriangle}
          description={`Idle: ${stats.idleLooms} | Maint: ${stats.maintenanceLooms}`}
          className={stats.maintenanceLooms > 0 ? "border-amber-500/20" : ""}
        />
        <StatsCard
          title="Today's Weaving"
          value={`${stats.todayProductionMeters.toLocaleString()} M`}
          icon={Activity}
          description="Average shift speed"
          trend={{ value: 4.8, label: "vs yesterday", direction: "up" }}
        />
        <StatsCard
          title="Monthly Production"
          value={`${stats.monthlyProductionMeters.toLocaleString()} Meters`}
          icon={Layers}
          description="Warp/Weft Grey Cloth"
          trend={{ value: 12.5, label: "vs last month", direction: "up" }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Mounted Beams"
          value={stats.activeBeamsCount}
          icon={Cpu}
          description="Warp beam feed counts"
        />
        <StatsCard
          title="Yarn Warehouse Stock"
          value={`${stats.yarnStockKg.toLocaleString()} KG`}
          icon={Truck}
          description="Active lot balances"
          trend={{ value: 8.2, label: "replenishment rate", direction: "up" }}
        />
        <StatsCard
          title="Grey Cloth Stock"
          value={`${stats.greyFabricStockMeters.toLocaleString()} Meters`}
          icon={Layers}
          description="Ready for dispatch sales"
        />
        <StatsCard
          title="Net Gross Margin"
          value={formatCurrency(stats.profitInr)}
          icon={Coins}
          description="Sales minus June expenses"
          trend={{ value: 18.4, label: "ROI margin", direction: "up" }}
          className="bg-emerald-500/[0.02] border-emerald-500/20"
        />
      </div>

      {/* 2. Business Process Trace Pipeline (Interactive) */}
      <WorkflowCard />

      {/* 3. Recharts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Production Trend Area Chart */}
        <ChartCard
          title="Daily Weaving Production Trend"
          description="Daily meters woven vs loom average efficiency (last 14 days)"
          className="md:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.productionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
              <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
              <RechartsTooltip contentStyle={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))", fontSize: "11px", borderRadius: "8px" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Area yAxisId="left" type="monotone" dataKey="meters" name="Meters Produced" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#metersGrad)" />
              <Area yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="var(--color-emerald-500)" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Loom Status Utilisation Donut Chart */}
        <ChartCard
          title="Loom Allocation Utilization"
          description={`Operational status profile of the ${factoryDetails?.totalLooms || 36} active looms`}
        >
          <div className="h-full flex flex-col items-center justify-center">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.loomUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.loomUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <span className="text-2xl font-bold font-display">{stats.runningLooms}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">Running</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="flex gap-4 text-xs font-semibold mt-2">
              {charts.loomUtilization.map((item, key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Financial Flow: Sales vs Expenses */}
        <ChartCard
          title="Financial Performance Log"
          description="Monthly Fabric Sales Revenues vs Operating Expenses (12 Months)"
          className="md:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.salesVsExpensesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
              <YAxis tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
              <RechartsTooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))", fontSize: "11px", borderRadius: "8px" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="sales" name="Sales Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Operating Expenses" fill="var(--color-neutral-300)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Expenses Category Distribution pie */}
        <ChartCard
          title="June Operating Expenses"
          description="Operational cost breakdown distribution for this month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.expenseBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="var(--color-primary)"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                className="text-[9px] font-semibold"
              >
                {charts.expenseBreakdown.map((entry, index) => {
                  const COLORS = [
                    "var(--color-primary)",
                    "var(--color-neutral-400)",
                    "var(--color-neutral-600)",
                    "var(--color-neutral-200)",
                    "var(--color-neutral-800)"
                  ];
                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                })}
              </Pie>
              <RechartsTooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 4. Tables Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weaving production entry table */}
        <Card className="border-border/40 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold font-display">Recent Loom Weaving Entries</CardTitle>
              <CardDescription className="text-xs">Live daily log entries from morning and night loom shifts.</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary">Shift Production</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/10">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Loom</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Weaver</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Shift</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Output</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Eff.</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {recentProduction.map((item, key) => (
                  <TableRow key={key} className="hover:bg-muted/5 border-b border-border/10">
                    <TableCell className="font-bold">{item.loom}</TableCell>
                    <TableCell className="text-muted-foreground">{item.weaver}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.shift === "Morning" ? "bg-amber-500/5 text-amber-600 border-amber-500/20 text-[10px]" : "bg-blue-900/5 text-blue-900 border-blue-900/20 text-[10px]"}>
                        {item.shift}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{item.meters} M</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">{item.efficiency}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.date.substring(5)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sales Dispatches Table */}
        <Card className="border-border/40 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold font-display">Recent Fabric Sales & Dispatches</CardTitle>
              <CardDescription className="text-xs">Commercial invoice dispatches and payments log.</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary">Invoices Ledger</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/10">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Invoice</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Customer</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Cloth Quality</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Quantity</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {recentSales.map((item, key) => (
                  <TableRow key={key} className="hover:bg-muted/5 border-b border-border/10">
                    <TableCell className="font-bold">{item.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[120px]">{item.customer}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[130px] truncate">{item.fabricType.split("Grey")[1] || item.fabricType}</TableCell>
                    <TableCell className="text-right font-semibold">{item.meters.toLocaleString()} M</TableCell>
                    <TableCell className="text-right font-bold text-foreground">{formatCurrency(item.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={item.status} type="invoice" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Purchases and Lots */}
        <Card className="border-border/40 overflow-hidden shadow-sm md:col-span-2">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4">
            <CardTitle className="text-sm font-bold font-display">Recent Yarn Purchase Lots Received</CardTitle>
            <CardDescription className="text-xs">Warp/Weft raw yarn bags lot receipt registry entries.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/10">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Lot ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Supplier</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10">Yarn Count</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Qty Received</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {recentPurchases.map((item, key) => (
                  <TableRow key={key} className="hover:bg-muted/5 border-b border-border/10">
                    <TableCell className="font-bold">{item.lotNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {item.count} ({item.yarnType})
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">{item.weight.toLocaleString()} KG</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Live Mill Activity Feed */}
        <Card className="border-border/40 shadow-sm flex flex-col justify-between">
          <CardHeader className="bg-muted/5 border-b border-border/10 pb-4">
            <CardTitle className="text-sm font-bold font-display">Recent Mill Activities Feed</CardTitle>
            <CardDescription className="text-xs">Chronological operational events log inside the weaving unit.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex-1 max-h-[300px] overflow-y-auto scrollbar-thin">
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {act.type === "beam" && (
                      <span className="h-2 w-2 rounded-full bg-violet-500 block ring-4 ring-violet-500/10" />
                    )}
                    {act.type === "purchase" && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 block ring-4 ring-blue-500/10" />
                    )}
                    {act.type === "production" && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 block ring-4 ring-emerald-500/10" />
                    )}
                    {act.type === "sales" && (
                      <span className="h-2 w-2 rounded-full bg-teal-500 block ring-4 ring-teal-500/10" />
                    )}
                    {act.type === "alert" && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 block ring-4 ring-rose-500/10" />
                    )}
                  </div>
                  
                  <div className="space-y-0.5 flex-1">
                    <p className="text-foreground leading-normal font-medium">{act.message}</p>
                    <span className="text-[10px] text-muted-foreground block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
