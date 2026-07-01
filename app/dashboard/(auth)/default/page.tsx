"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Truck, FileText, Scissors, Package, Factory, Component, Users, ArrowRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { sizingApiService } from "@/lib/services/sizing-api";
import { mastersApiService } from "@/lib/services/masters-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, subtitle, icon: Icon, color, href }: { title: string; value: string | number; subtitle?: string; icon: React.ElementType; color: string; href?: string }) {
  const content = (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { data: tanaPOs = [], isLoading: loadingTana } = useQuery({ queryKey: ["tana-pos"], queryFn: () => tanaApiService.getPOs() });
  const { data: tanaGRNs = [] } = useQuery({ queryKey: ["tana-grns"], queryFn: () => tanaApiService.getGRNs() });
  const { data: tanaPIs = [] } = useQuery({ queryKey: ["tana-pis"], queryFn: () => tanaApiService.getPIs() });
  const { data: banaPOs = [] } = useQuery({ queryKey: ["bana-pos"], queryFn: () => banaApiService.getPOs() });
  const { data: banaGRNs = [] } = useQuery({ queryKey: ["bana-grns"], queryFn: () => banaApiService.getGRNs() });
  const { data: banaPIs = [] } = useQuery({ queryKey: ["bana-pis"], queryFn: () => banaApiService.getPIs() });
  const { data: sizingBatches = [] } = useQuery({ queryKey: ["sizing-batches"], queryFn: () => sizingApiService.getBatches() });
  const { data: factories = [] } = useQuery({ queryKey: ["factories"], queryFn: () => mastersApiService.getFactories() });
  const { data: looms = [] } = useQuery({ queryKey: ["looms"], queryFn: () => mastersApiService.getLooms() });
  const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: () => mastersApiService.getParties() });
  const { data: labour = [] } = useQuery({ queryKey: ["labour"], queryFn: () => mastersApiService.getLabour() });

  const tanaStock = tanaApiService.getStock();
  const sizingStock = sizingApiService.getStock();

  // Summary calculations
  const openTanaPOs = tanaPOs.filter(p => p.status !== "Closed").length;
  const openBanaPOs = banaPOs.filter(p => p.status !== "Closed").length;
  const pendingTanaPIs = tanaPIs.filter(p => p.paymentStatus === "Pending").length;
  const pendingBanaPIs = banaPIs.filter(p => p.paymentStatus === "Pending").length;
  const activeSizingBatches = sizingBatches.filter(b => b.status !== "Completed").length;
  const totalPOs = tanaPOs.length + banaPOs.length;
  const totalGRNs = tanaGRNs.length + banaGRNs.length;
  const totalPendingPayments = pendingTanaPIs + pendingBanaPIs;

  const totalPOValue = [...tanaPOs, ...banaPOs].reduce((s, p) => s + p.netPayable, 0);
  const pendingPaymentValue = [...tanaPIs.filter(p => p.paymentStatus === "Pending"), ...banaPIs.filter(p => p.paymentStatus === "Pending")].reduce((s, p) => s + p.netPayable, 0);

  const recentPOs = [...tanaPOs.map(p => ({ ...p, type: "Tana" })), ...banaPOs.map(p => ({ ...p, type: "Bana" }))].sort((a, b) => b.poDate.localeCompare(a.poDate)).slice(0, 5);

  const isLoading = loadingTana;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">DKS Textile ERP — Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Phase 1: Procurement & Factory Overview · Real-time data from all modules</p>
      </div>

      {/* Primary KPI Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total POs Raised" value={totalPOs} subtitle={`${openTanaPOs + openBanaPOs} open / pending`} icon={ShoppingCart} color="bg-blue-500/10 text-blue-600" href="/dashboard/tana/purchase-orders" />
            <StatCard title="GRNs Created" value={totalGRNs} subtitle={`Tana: ${tanaGRNs.length} · Bana: ${banaGRNs.length}`} icon={Truck} color="bg-violet-500/10 text-violet-600" href="/dashboard/tana/goods-receipt" />
            <StatCard title="Invoices Pending" value={totalPendingPayments} subtitle={`₹${pendingPaymentValue.toLocaleString("en-IN")} due`} icon={FileText} color="bg-red-500/10 text-red-600" href="/dashboard/tana/invoices" />
            <StatCard title="Sizing Batches Active" value={activeSizingBatches} subtitle={`${sizingBatches.length} total batches`} icon={Scissors} color="bg-amber-500/10 text-amber-600" href="/dashboard/sizing" />
          </div>

          {/* Stock Cards */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Current Stock Levels</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /><span className="text-xs font-semibold text-muted-foreground">Raw Tana (Warp)</span></div>
                  <p className="text-2xl font-bold">{tanaStock.bags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-xs text-muted-foreground">{tanaStock.weightKg.toLocaleString()} KG in store</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-muted-foreground">Sized Tana (Ready)</span></div>
                  <p className="text-2xl font-bold">{sizingStock.sizedTanaBags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-xs text-muted-foreground">{sizingStock.sizedTanaWeightKg.toLocaleString()} KG ready for loom</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><div className="h-2.5 w-2.5 rounded-full bg-violet-500" /><span className="text-xs font-semibold text-muted-foreground">Bana (Weft)</span></div>
                  <p className="text-2xl font-bold">{banaApiService.getStock().bags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-xs text-muted-foreground">{banaApiService.getStock().weightKg.toLocaleString()} KG in store</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Masters Summary + Recent POs */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Masters Summary */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-sm font-bold">Master Data Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Link href="/dashboard/masters/factories" className="flex items-center justify-between hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors group">
                  <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><Factory className="h-4 w-4 text-orange-600" /></div><div><p className="text-xs font-semibold">Factories</p><p className="text-[10px] text-muted-foreground">{factories.filter(f => f.activeStatus === "Active").length} active</p></div></div>
                  <div className="flex items-center gap-1"><span className="text-lg font-bold">{factories.length}</span><ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" /></div>
                </Link>
                <Link href="/dashboard/masters/looms" className="flex items-center justify-between hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors group">
                  <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Component className="h-4 w-4 text-blue-600" /></div><div><p className="text-xs font-semibold">Looms</p><p className="text-[10px] text-muted-foreground">{looms.filter(l => l.status === "Active").length} active</p></div></div>
                  <div className="flex items-center gap-1"><span className="text-lg font-bold">{looms.length}</span><ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" /></div>
                </Link>
                <Link href="/dashboard/masters/parties" className="flex items-center justify-between hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors group">
                  <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-violet-600" /></div><div><p className="text-xs font-semibold">Parties</p><p className="text-[10px] text-muted-foreground">{parties.filter(p => p.partyType === "Supplier").length} suppliers</p></div></div>
                  <div className="flex items-center gap-1"><span className="text-lg font-bold">{parties.length}</span><ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" /></div>
                </Link>
                <Link href="/dashboard/masters/labour" className="flex items-center justify-between hover:bg-muted/30 rounded-lg px-2 py-2 transition-colors group">
                  <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-teal-600" /></div><div><p className="text-xs font-semibold">Labour</p><p className="text-[10px] text-muted-foreground">{labour.filter(l => l.activeStatus === "Active").length} active workers</p></div></div>
                  <div className="flex items-center gap-1"><span className="text-lg font-bold">{labour.length}</span><ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" /></div>
                </Link>
              </CardContent>
            </Card>

            {/* Recent POs */}
            <Card className="border-border/40 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Recent Purchase Orders</CardTitle>
                <Link href="/dashboard/tana/purchase-orders"><Button variant="ghost" size="sm" className="h-7 text-[10px] cursor-pointer">View All <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {recentPOs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No purchase orders yet.</p>
                  ) : recentPOs.map((po, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 hover:bg-muted/20 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">{po.poNumber}</span>
                          <Badge variant="outline" className={`text-[9px] font-bold ${(po as any).type === "Tana" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-violet-500/10 text-violet-600 border-violet-500/20"}`}>{(po as any).type}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{po.purchaseFromName} · {po.poDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">₹{po.netPayable.toLocaleString("en-IN")}</p>
                        <Badge variant="outline" className={`text-[9px] font-semibold ${po.status === "Closed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : po.status === "Partially Received" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>{po.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Invoices Alert */}
          {totalPendingPayments > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/5 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">{totalPendingPayments} Purchase Invoice{totalPendingPayments > 1 ? "s" : ""} Pending Payment</p>
                    <p className="text-xs text-amber-600">Total outstanding: ₹{pendingPaymentValue.toLocaleString("en-IN")} across Tana and Bana invoices.</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Link href="/dashboard/tana/invoices"><Button size="sm" variant="outline" className="h-8 text-xs border-amber-500/30 cursor-pointer">View Tana Invoices</Button></Link>
                    <Link href="/dashboard/bana/invoices"><Button size="sm" variant="outline" className="h-8 text-xs border-amber-500/30 cursor-pointer">View Bana Invoices</Button></Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
