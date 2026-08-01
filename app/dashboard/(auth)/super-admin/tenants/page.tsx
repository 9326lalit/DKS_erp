"use client";

import React, { useState } from "react";
import { Building2, Factory, Search, Eye, Edit, Trash2, Crown, ArrowUpRight, Plus, MapPin, Mail, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantStore, Tenant } from "@/lib/store/use-tenant-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { StatsCard } from "@/components/textile-erp/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function SuperAdminTenantsPage() {
  const router = useRouter();
  const { tenants, activeTenantId, setActiveTenant, deleteTenant, updateTenantStatus, updateTenantPlan } = useTenantStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.businessDetails.ownerName.toLowerCase().includes(q) ||
      t.businessDetails.gstNumber.toLowerCase().includes(q) ||
      t.cluster.toLowerCase().includes(q) ||
      t.businessDetails.email.toLowerCase().includes(q)
    );
  });

  const handleImpersonate = (tenantId: string) => {
    setActiveTenant(tenantId);
    const tenant = tenants.find((t) => t.id === tenantId);
    toast.success(`Impersonating Mill: ${tenant?.name}`);
    router.push("/dashboard");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tenant Organizations & Business Directory"
        description="Comprehensive directory of all registered mill businesses, GST/PAN taxation records, & active units."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Registered Mills"
          value={tenants.length}
          description="Active Multi-Tenant Accounts"
          icon={Building2}
          trend={{ value: 100, label: "Tenant Accounts", direction: "up" }}
        />
        <StatsCard
          title="Active Subscriptions"
          value={tenants.filter((t) => t.status === "Active").length}
          description="Enterprise, Pro & Standard"
          icon={Crown}
          trend={{ value: 100, label: "Active Rate", direction: "up" }}
        />
        <StatsCard
          title="Textile Clusters"
          value={new Set(tenants.map((t) => t.cluster)).size}
          description="Ichalkaranji, Surat, Bhiwandi..."
          icon={MapPin}
          trend={{ value: 100, label: "Geographic Spread", direction: "neutral" }}
        />
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" /> Complete Tenant Businesses Directory
            </CardTitle>
            <CardDescription className="text-xs">
              Review owner contacts, GST/PAN records, loom capacities, and 1-click mill impersonation.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, GST, cluster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Tenant Mill</TableHead>
                <TableHead className="font-bold">Owner & Contact</TableHead>
                <TableHead className="font-bold">GST & PAN</TableHead>
                <TableHead className="font-bold">Cluster</TableHead>
                <TableHead className="font-bold">Looms</TableHead>
                <TableHead className="font-bold">Plan</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((t) => {
                const b = t.businessDetails;
                const isCurrent = t.id === activeTenantId;
                return (
                  <TableRow key={t.id} className={isCurrent ? "bg-emerald-500/5 font-medium" : ""}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-lg bg-muted">{t.logo}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            {t.name}
                            {isCurrent && <Badge className="text-[9px] px-1 py-0 bg-emerald-600">Active</Badge>}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{t.tagline}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{b.ownerName}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {b.email}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {b.phone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-mono">
                      <div className="flex flex-col">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">GST: {b.gstNumber}</span>
                        <span className="text-muted-foreground">PAN: {b.panNumber}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span>{t.cluster}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-bold text-foreground">
                      {t.factoryDetails.totalLooms} Looms
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <Badge variant="outline" className="border-blue-500/40 text-blue-600 font-semibold">
                        {t.plan}
                      </Badge>
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
                          variant="ghost"
                          onClick={() => {
                            setSelectedTenant(t);
                            setIsViewDetailsOpen(true);
                          }}
                          className="h-8 px-2 text-xs gap-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-500" /> Full Info
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleImpersonate(t.id)}
                          className="h-8 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1 cursor-pointer"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" /> Impersonate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* FULL BUSINESS DETAILS MODAL */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTenant && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-muted">{selectedTenant.logo}</span>
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      {selectedTenant.businessDetails.businessName}
                      <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600">
                        {selectedTenant.plan} Plan
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">{selectedTenant.tagline}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* 1. Legal & Taxation */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-500" /> Business Legal & GST Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">GST Number</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedTenant.businessDetails.gstNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">PAN Number</span>
                      <span className="font-mono font-bold text-foreground">{selectedTenant.businessDetails.panNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Business Type</span>
                      <span className="font-semibold text-foreground">{selectedTenant.businessDetails.businessType}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500" /> Address & Contact Info
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Owner / Email</span>
                      <span className="font-medium text-foreground block">{selectedTenant.businessDetails.ownerName}</span>
                      <span className="text-muted-foreground">{selectedTenant.businessDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Address</span>
                      <span className="font-medium text-foreground block">
                        {selectedTenant.businessDetails.addressLine1}, {selectedTenant.businessDetails.city}, {selectedTenant.businessDetails.state} - {selectedTenant.businessDetails.pincode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
                <Button
                  onClick={() => {
                    setIsViewDetailsOpen(false);
                    handleImpersonate(selectedTenant.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Impersonate & Open Mill Dashboard →
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
