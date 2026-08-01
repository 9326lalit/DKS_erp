"use client";

import React from "react";
import { CreditCard, Sparkles, Building2, CheckCircle2, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTenantStore } from "@/lib/store/use-tenant-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { StatsCard } from "@/components/textile-erp/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SaaSBillingSubscriptionsPage() {
  const { tenants, updateTenantPlan, updateTenantStatus } = useTenantStore();

  const planPrices = {
    Enterprise: 49999,
    Pro: 24999,
    Standard: 14999
  };

  const totalARR = tenants.reduce((sum, t) => sum + (planPrices[t.plan] || 14999) * 12, 0);
  const totalMRR = tenants.reduce((sum, t) => sum + (planPrices[t.plan] || 14999), 0);

  return (
    <PageContainer>
      <PageHeader
        title="SaaS Subscriptions & Platform Billing"
        description="Monitor tenant plan subscriptions, monthly recurring revenue (MRR), & billing cycles."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Monthly Recurring Revenue (MRR)"
          value={`₹${totalMRR.toLocaleString("en-IN")}`}
          description="Active Subscriptions"
          icon={CreditCard}
          trend={{ value: 18, label: "MoM Growth", direction: "up" }}
        />
        <StatsCard
          title="Annual Recurring Revenue (ARR)"
          value={`₹${totalARR.toLocaleString("en-IN")}`}
          description="Annualized Platform Sales"
          icon={TrendingUp}
          trend={{ value: 24, label: "YoY Growth", direction: "up" }}
        />
        <StatsCard
          title="Paying Tenant Accounts"
          value={`${tenants.filter((t) => t.status === "Active").length} / ${tenants.length}`}
          description="Active Paying Customers"
          icon={Building2}
          trend={{ value: 100, label: "Active Rate", direction: "up" }}
        />
      </div>

      {/* Subscription Tier Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-600 text-white">Enterprise Plan</Badge>
              <span className="text-sm font-extrabold font-mono text-purple-900 dark:text-purple-300">₹49,999 / mo</span>
            </div>
            <CardTitle className="text-base font-bold mt-2">Enterprise Mills</CardTitle>
            <CardDescription className="text-xs">
              {tenants.filter((t) => t.plan === "Enterprise").length} Active Mills • Unlimited Looms, Multi-Unit & 24x7 Priority Support.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-600 text-white">Pro Plan</Badge>
              <span className="text-sm font-extrabold font-mono text-blue-900 dark:text-blue-300">₹24,999 / mo</span>
            </div>
            <CardTitle className="text-base font-bold mt-2">Pro Weaving Mills</CardTitle>
            <CardDescription className="text-xs">
              {tenants.filter((t) => t.plan === "Pro").length} Active Mills • Up to 40 Looms, Tana & Bana Procurement, Sizing.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-600 text-white">Standard Plan</Badge>
              <span className="text-sm font-extrabold font-mono text-emerald-900 dark:text-emerald-300">₹14,999 / mo</span>
            </div>
            <CardTitle className="text-base font-bold mt-2">Standard Sheds</CardTitle>
            <CardDescription className="text-xs">
              {tenants.filter((t) => t.plan === "Standard").length} Active Sheds • Up to 20 Looms, Basic Inventory & Invoicing.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Subscription Management Table */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" /> Active Tenant Subscription Roster
          </CardTitle>
          <CardDescription className="text-xs">
            Manage subscription plans, billing cycle, renewal status, and account suspension.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Tenant Mill</TableHead>
                <TableHead className="font-bold">Cluster</TableHead>
                <TableHead className="font-bold">Active Plan</TableHead>
                <TableHead className="font-bold">Monthly Bill</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Manage Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.logo}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.businessDetails.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-xs text-muted-foreground">{t.cluster}</TableCell>

                  <TableCell className="py-3 text-xs">
                    <Badge variant="outline" className="border-blue-500/40 text-blue-600 font-bold">
                      {t.plan}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(planPrices[t.plan] || 14999).toLocaleString("en-IN")} / mo
                  </TableCell>

                  <TableCell className="py-3 text-xs">
                    <Badge className={t.status === "Active" ? "bg-emerald-500/20 text-emerald-600" : "bg-rose-500/20 text-rose-600"}>
                      {t.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const nextPlan = t.plan === "Standard" ? "Pro" : t.plan === "Pro" ? "Enterprise" : "Standard";
                          updateTenantPlan(t.id, nextPlan);
                          toast.success(`Updated ${t.name} plan to ${nextPlan}`);
                        }}
                        className="h-7 text-[11px] cursor-pointer"
                      >
                        Change Tier
                      </Button>

                      <Button
                        size="sm"
                        variant={t.status === "Active" ? "destructive" : "default"}
                        onClick={() => {
                          const nextStatus = t.status === "Active" ? "Suspended" : "Active";
                          updateTenantStatus(t.id, nextStatus);
                          toast.success(`Updated ${t.name} status to ${nextStatus}`);
                        }}
                        className="h-7 text-[11px] cursor-pointer"
                      >
                        {t.status === "Active" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
