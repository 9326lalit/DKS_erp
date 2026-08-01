"use client";

import React, { useState } from "react";
import { Building2, Factory, Check, Plus, ShieldCheck, KeyRound, User, Mail, Globe, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTenantStore, Tenant } from "@/lib/store/use-tenant-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function TenantsPage() {
  const { tenants, activeTenantId, activeUnitId, setActiveTenant, setActiveUnit, addTenant } = useTenantStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Tenant Form State
  const [newMillName, setNewMillName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCluster, setNewCluster] = useState("Surat, Gujarat");
  const [newLoomCount, setNewLoomCount] = useState(20);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMillName || !newEmail) {
      toast.error("Please fill in Mill Name and Admin Email");
      return;
    }

    const slug = newMillName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const createdTenant: Tenant = {
      id: slug,
      name: newMillName,
      slug,
      logo: "🏭",
      tagline: `${newMillName} Weaving Plant`,
      cluster: newCluster,
      plan: "Pro",
      status: "Active",
      currency: "INR",
      businessDetails: {
        businessName: newMillName,
        ownerName: newOwnerName || "Mill Manager",
        gstNumber: "27AAAAA0000A1Z5",
        panNumber: "AAAAA0000A",
        businessType: "Proprietorship",
        industry: "Textile Weaving",
        phone: "+91 98000 11111",
        email: newEmail,
        addressLine1: "Industrial Zone",
        city: newCluster.split(",")[0] || "Ichalkaranji",
        district: newCluster.split(",")[0] || "Kolhapur",
        state: newCluster.split(",")[1]?.trim() || "Maharashtra",
        country: "India",
        pincode: "416115",
        currency: "INR",
        timezone: "Asia/Kolkata"
      },
      factoryDetails: {
        factoryName: `${newMillName} Main Shed`,
        factoryCode: "MS-01",
        factoryType: "Airjet Shed",
        factoryAddress: `${newCluster} Industrial Park`,
        city: newCluster.split(",")[0] || "Ichalkaranji",
        district: newCluster.split(",")[0] || "Kolhapur",
        state: newCluster.split(",")[1]?.trim() || "Maharashtra",
        country: "India",
        pincode: "416115",
        factoryManager: newOwnerName || "Mill Manager",
        phone: "+91 98000 11111",
        email: newEmail,
        workingHours: "24 Hours",
        shiftSystem: "2-Shift System",
        morningShiftStart: "08:00 AM",
        morningShiftEnd: "08:00 PM",
        nightShiftStart: "08:00 PM",
        nightShiftEnd: "08:00 AM",
        totalLooms: Number(newLoomCount) || 20,
        factoryStatus: "Active"
      },
      financialYearDetails: {
        financialYear: "2026-2027",
        openingDate: "2026-04-01",
        closingDate: "2027-03-31",
        openingStockDate: "2026-04-01",
        currency: "INR",
        defaultTax: 5
      },
      units: [
        {
          id: `${slug}-unit-1`,
          name: `${newMillName} Unit 1`,
          code: "U1",
          type: "Main Weaving Shed",
          location: newCluster,
          status: "Operational",
          totalLooms: Number(newLoomCount) || 20
        }
      ],
      users: [
        {
          id: `usr-${slug}`,
          name: newOwnerName || "Mill Admin",
          email: newEmail,
          role: "Super Admin",
          avatarUrl: "/images/avatars/01.png",
          phone: "+91 98000 11111"
        }
      ]
    };

    addTenant(createdTenant);
    setIsAddOpen(false);
    toast.success(`Successfully created new tenant mill: ${newMillName}!`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Multi-Tenant Organization Management"
        description="Manage independent textile mills, switch tenant datasets, configure weaving sheds, & view test credentials."
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 cursor-pointer">
                <Plus className="h-4 w-4" /> Register New Tenant Mill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Tenant Organization</DialogTitle>
                <DialogDescription>
                  Add a new independent textile mill tenant with custom looms, units, & admin credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="millName">Mill / Business Name</Label>
                  <Input
                    id="millName"
                    placeholder="e.g. Vardhman Weaving Pvt Ltd"
                    value={newMillName}
                    onChange={(e) => setNewMillName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner / Admin Name</Label>
                    <Input
                      id="ownerName"
                      placeholder="e.g. Vikram Sharma"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loomCount">Total Looms</Label>
                    <Input
                      id="loomCount"
                      type="number"
                      value={newLoomCount}
                      onChange={(e) => setNewLoomCount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Work Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@vardhmanweaving.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cluster">Cluster City / Region</Label>
                  <Input
                    id="cluster"
                    placeholder="e.g. Bhiwandi, Maharashtra"
                    value={newCluster}
                    onChange={(e) => setNewCluster(e.target.value)}
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                    Create & Switch to Tenant
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Active Tenant Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tenants.map((tenant) => {
          const isActive = tenant.id === activeTenantId;
          const user = tenant.users[0];
          return (
            <Card
              key={tenant.id}
              className={`relative overflow-hidden transition-all ${
                isActive
                  ? "border-2 border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                  : "border-border hover:border-emerald-500/40"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Active Tenant
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{tenant.logo}</span>
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      {tenant.name}
                    </CardTitle>
                    <CardDescription className="text-xs">{tenant.cluster}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Plan & Status</span>
                    <Badge variant="outline" className="mt-0.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                      {tenant.plan} • {tenant.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Total Capacity</span>
                    <span className="font-semibold text-foreground">{tenant.factoryDetails.totalLooms} Looms</span>
                  </div>
                </div>

                {/* Login Credentials Box */}
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-emerald-500" /> {user.name} ({user.role})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" /> {user.email}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <KeyRound className="h-3 w-3" /> password123
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{tenant.units.length} Shed Unit(s)</span>
                  {isActive ? (
                    <Button disabled variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Currently Active
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setActiveTenant(tenant.id);
                        toast.success(`Switched Active Tenant to: ${tenant.name}`);
                      }}
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Switch Tenant →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Testing Instructions Banner */}
      <Card className="border border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> Multi-Tenant Testing & Credential Guide
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
              You can switch tenants instantly using the top navbar badge, sidebar header dropdown, or using the buttons above. All dashboard metrics, loom statuses, yarn stock, and sales reports automatically isolate and update per active tenant.
            </p>
          </div>
          <Button variant="outline" className="border-amber-500/40 text-amber-900 dark:text-amber-300 hover:bg-amber-500/10 text-xs shrink-0 cursor-pointer" onClick={() => window.location.href="/dashboard/login/v2"}>
            Test Login Page →
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
