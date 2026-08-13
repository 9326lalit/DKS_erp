"use client";

import React, { useState } from "react";
import { Factory, Building2, MapPin, Cpu, Search, Eye, ShieldCheck, Clock } from "lucide-react";
import { useTenantStore } from "@/lib/store/use-tenant-store";
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

export default function GlobalFactoriesPage() {
  const { tenants } = useTenantStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const allUnits = tenants.flatMap((t) =>
    t.units.map((u) => ({
      ...u,
      tenantId: t.id,
      tenantName: t.name,
      tenantLogo: t.logo,
      cluster: t.cluster,
      factoryDetails: t.factoryDetails
    }))
  );

  const filteredUnits = allUnits.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.tenantName.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q)
    );
  });

  const totalLooms = tenants.reduce((sum, t) => sum + (t.factoryDetails?.totalLooms || 0), 0);

  return (
    <PageContainer>
      <PageHeader
        title="Global Factories & Weaving Sheds Registry"
        description="Cross-tenant overview of all registered manufacturing plants, weaving sheds, & sizing units."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Registered Sheds"
          value={allUnits.length}
          description="Operational & Support Sheds"
          icon={Factory}
          trend={{ value: 100, label: "Active Units", direction: "up" }}
        />
        <StatsCard
          title="Global Installed Capacity"
          value={`${totalLooms} Looms`}
          description="Airjet, Rapier & Jacquard"
          icon={Cpu}
          trend={{ value: 100, label: "Capacity", direction: "up" }}
        />
        <StatsCard
          title="Textile Clusters"
          value={new Set(tenants.map((t) => t.cluster)).size}
          description="Ichalkaranji, Surat, Bhiwandi..."
          icon={MapPin}
          trend={{ value: 100, label: "Regions", direction: "neutral" }}
        />
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Factory className="h-5 w-5 text-indigo-500" /> All Global Manufacturing Sheds & Units
            </CardTitle>
            <CardDescription className="text-xs">
              Review factory configurations, shift systems, and installed loom counts per unit.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by factory name, mill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead className="font-bold">Unit / Shed Name</TableHead>
                  <TableHead className="font-bold">Parent Tenant Mill</TableHead>
                  <TableHead className="font-bold">Unit Type</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Capacity</TableHead>
                  <TableHead className="font-bold">Shift System</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          {u.name}
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{u.code}</Badge>
                        </span>
                        <span className="text-xs text-muted-foreground">{u.location}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{u.tenantLogo}</span>
                        <span className="font-semibold text-foreground">{u.tenantName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-foreground text-[11px]">
                        {u.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {u.cluster}
                    </TableCell>

                    <TableCell className="py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {u.totalLooms > 0 ? `${u.totalLooms} Looms` : "Support Unit"}
                    </TableCell>

                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {u.factoryDetails?.shiftSystem || "24 Hours"}
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <Badge className={u.status === "Operational" ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" : "bg-amber-500/20 text-amber-600"}>
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUnit(u);
                          setIsViewOpen(true);
                        }}
                        className="h-8 text-xs gap-1 cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Specs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* FACTORY UNIT SPECS MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedUnit && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedUnit.tenantLogo}</span>
                  <div>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      {selectedUnit.name}
                      <Badge variant="outline" className="text-[10px]">{selectedUnit.code}</Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Belongs to: <span className="font-semibold text-foreground">{selectedUnit.tenantName}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Unit Type:</span>
                    <span className="font-semibold">{selectedUnit.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Location Shed:</span>
                    <span className="font-semibold">{selectedUnit.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Textile Cluster:</span>
                    <span className="font-semibold">{selectedUnit.cluster}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Installed Looms:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedUnit.totalLooms > 0 ? `${selectedUnit.totalLooms} Looms` : "Support Unit"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Operational Status:</span>
                    <Badge className={selectedUnit.status === "Operational" ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"}>
                      {selectedUnit.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" /> Shift Configurations
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase">Shift System</span>
                      <span className="font-medium">{selectedUnit.factoryDetails?.shiftSystem || "12-Hour Two Shift"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase">Loom Monitoring</span>
                      <span className="font-medium">Real-Time RPM Sync</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close Specs</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
