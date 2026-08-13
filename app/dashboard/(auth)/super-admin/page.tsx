"use client";

import React, { useState } from "react";
import {
  Building2,
  Factory,
  Check,
  Plus,
  Crown,
  Search,
  Eye,
  Edit,
  Trash2,
  Cpu,
  MapPin,
  Mail,
  Phone,
  FileText,
  UserCheck,
  MoreVertical,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantStore, Tenant, GLOBAL_SUPER_ADMIN_USER } from "@/lib/store/use-tenant-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { StatsCard } from "@/components/textile-erp/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const {
    tenants,
    activeTenantId,
    setActiveTenant,
    addTenant,
    deleteTenant,
    updateTenantStatus,
    updateTenantPlan,
    updateTenantBusinessDetails,
    loginSuperAdmin
  } = useTenantStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // New Tenant Form
  const [newMillName, setNewMillName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCluster, setNewCluster] = useState("Surat, Gujarat");
  const [newLoomCount, setNewLoomCount] = useState(20);

  // Edit Business Form
  const [editGst, setEditGst] = useState("");
  const [editPan, setEditPan] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Aggregate Metrics Across ALL Tenants
  const totalTenants = tenants.length;
  const totalLooms = tenants.reduce((sum, t) => sum + (t.factoryDetails.totalLooms || 0), 0);
  const totalUnits = tenants.reduce((sum, t) => sum + (t.units.length || 0), 0);
  const totalUsers = tenants.reduce((sum, t) => sum + (t.users.length || 0), 0);

  // Filter Tenants
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

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMillName || !newEmail) {
      toast.error("Mill Name and Email are required.");
      return;
    }

    const slug = newMillName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const created: Tenant = {
      id: slug,
      name: newMillName,
      slug,
      logo: "🏭",
      tagline: `${newMillName} Weaving Mill`,
      cluster: newCluster,
      plan: "Pro",
      status: "Active",
      currency: "INR",
      businessDetails: {
        businessName: newMillName,
        ownerName: newOwnerName || "Mill Manager",
        gstNumber: "27AAAPM1234F1Z5",
        panNumber: "AAAPM1234F",
        businessType: "Private Limited",
        industry: "Textile Manufacturing",
        phone: "+91 98111 22222",
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
        phone: "+91 98111 22222",
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
          id: `${slug}-u1`,
          name: `${newMillName} Main Shed`,
          code: "U1",
          type: "Weaving Shed",
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
          phone: "+91 98111 22222"
        }
      ]
    };

    addTenant(created);
    setIsAddOpen(false);
    toast.success(`Registered New Tenant: ${newMillName}`);
  };

  const handleSaveEditBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    updateTenantBusinessDetails(selectedTenant.id, {
      gstNumber: editGst,
      panNumber: editPan,
      phone: editPhone
    });
    setIsEditOpen(false);
    toast.success(`Updated Business Info for ${selectedTenant.name}`);
  };

  return (
    <PageContainer>
      {/* Super Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1.5 px-3 py-1 font-bold">
              <Crown className="h-4 w-4 text-amber-500" /> Global SaaS Control Center
            </Badge>
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/40 font-semibold">Platform Admin Live</Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight font-display text-foreground">
            SaaS Tenant Control Center & Business Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Full system control panel for reviewing registered tenant businesses, loom capacities, GST/PAN records, and active mill subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              loginSuperAdmin();
              toast.info("Logged in as Global Super Admin");
            }}
            variant="outline"
            className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Crown className="h-3.5 w-3.5" /> Super Admin Active
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-semibold cursor-pointer">
                <Plus className="h-4 w-4" /> Register New Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Tenant Mill</DialogTitle>
                <DialogDescription>Create a new tenant organization on the SaaS platform.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Mill Business Name</Label>
                  <Input placeholder="e.g. Laxmi Weaving Mills" value={newMillName} onChange={(e) => setNewMillName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Owner / Manager</Label>
                    <Input placeholder="e.g. Ramesh Patel" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Looms</Label>
                    <Input type="number" value={newLoomCount} onChange={(e) => setNewLoomCount(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Admin Email</Label>
                  <Input type="email" placeholder="admin@laxmiweaving.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Cluster Region</Label>
                  <Input placeholder="e.g. Surat, Gujarat" value={newCluster} onChange={(e) => setNewCluster(e.target.value)} />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">Create & Launch Tenant</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Aggregated SaaS Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered Tenant Businesses"
          value={totalTenants}
          description="Independent Mill Accounts"
          icon={Building2}
          trend={{ value: 100, label: "Active Mills", direction: "up" }}
        />
        <StatsCard
          title="Total Capacity (Looms)"
          value={totalLooms}
          description="Airjet, Rapier & Jacquard"
          icon={Cpu}
          trend={{ value: 100, label: "Operating", direction: "up" }}
        />
        <StatsCard
          title="Active Weaving Sheds"
          value={totalUnits}
          description="Across 4 Clusters"
          icon={Factory}
          trend={{ value: 100, label: "Multi-Unit Ready", direction: "neutral" }}
        />
        <StatsCard
          title="Total Registered Users"
          value={totalUsers}
          description="Owners, Managers & Staff"
          icon={UserCheck}
          trend={{ value: 100, label: "Active Sessions", direction: "up" }}
        />
      </div>

      {/* Tenant Search & Table Section */}
      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" /> Complete Tenant Businesses Directory
            </CardTitle>
            <CardDescription className="text-xs">
              View all business details, GST/PAN numbers, owner contacts, loom capacity, and subscription status.
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead className="font-bold">Tenant Mill</TableHead>
                  <TableHead className="font-bold">Owner & Contact</TableHead>
                  <TableHead className="font-bold">GST & PAN</TableHead>
                  <TableHead className="font-bold">Cluster</TableHead>
                  <TableHead className="font-bold">Capacity</TableHead>
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

                      <TableCell className="py-3 text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{t.factoryDetails.totalLooms} Looms</span>
                          <span className="text-[11px] text-muted-foreground">{t.units.length} Unit Shed(s)</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold">
                          {t.plan}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        <Badge
                          className={
                            t.status === "Active"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : t.status === "Trial"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTenant(t);
                              setIsViewDetailsOpen(true);
                            }}
                            className="h-8 px-2 text-xs gap-1 cursor-pointer"
                            title="View Full Business Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" /> Full Specs
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              <DropdownMenuLabel>Tenant Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTenant(t);
                                  setEditGst(t.businessDetails.gstNumber);
                                  setEditPan(t.businessDetails.panNumber);
                                  setEditPhone(t.businessDetails.phone);
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" /> Edit Business Info
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] text-muted-foreground">Change Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => updateTenantStatus(t.id, "Active")}>
                                Set Status: Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTenantStatus(t.id, "Trial")}>
                                Set Status: Trial
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTenantStatus(t.id, "Suspended")} className="text-rose-500">
                                Set Status: Suspended
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] text-muted-foreground">Change Plan</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => updateTenantPlan(t.id, "Enterprise")}>
                                Upgrade to Enterprise
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTenantPlan(t.id, "Pro")}>
                                Change to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateTenantPlan(t.id, "Standard")}>
                                Change to Standard
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${t.name}?`)) {
                                    deleteTenant(t.id);
                                    toast.success(`Deleted tenant ${t.name}`);
                                  }
                                }}
                                className="text-rose-600 font-bold"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Tenant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Owner Name</span>
                      <span className="font-semibold text-foreground">{selectedTenant.businessDetails.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Industry</span>
                      <span className="font-semibold text-foreground">{selectedTenant.businessDetails.industry}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Default Tax Rate</span>
                      <span className="font-semibold text-foreground">{selectedTenant.financialYearDetails.defaultTax}% GST</span>
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500" /> Contact Info & Factory Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Email & Phone</span>
                      <span className="font-medium text-foreground block">{selectedTenant.businessDetails.email}</span>
                      <span className="text-muted-foreground">{selectedTenant.businessDetails.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Full Address</span>
                      <span className="font-medium text-foreground block">
                        {selectedTenant.businessDetails.addressLine1}, {selectedTenant.businessDetails.city}, {selectedTenant.businessDetails.state} - {selectedTenant.businessDetails.pincode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Factory Specs & Looms */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Factory className="h-4 w-4 text-blue-500" /> Factory Operations & Looms
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Factory Name</span>
                      <span className="font-semibold text-foreground">{selectedTenant.factoryDetails.factoryName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Looms Count</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTenant.factoryDetails.totalLooms} Looms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Shift System</span>
                      <span className="font-semibold text-foreground">{selectedTenant.factoryDetails.shiftSystem}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Working Hours</span>
                      <span className="font-semibold text-foreground">{selectedTenant.factoryDetails.workingHours}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Mill Shed Units */}
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                  <h4 className="font-bold text-foreground text-sm flex items-center justify-between">
                    <span>Active Shed Units ({selectedTenant.units.length})</span>
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    {selectedTenant.units.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2">
                          <Factory className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{u.name} ({u.code})</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                          {u.totalLooms} Looms • {u.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
                <Button
                  onClick={() => {
                    setIsViewDetailsOpen(false);
                    setEditGst(selectedTenant.businessDetails.gstNumber);
                    setEditPan(selectedTenant.businessDetails.panNumber);
                    setEditPhone(selectedTenant.businessDetails.phone);
                    setIsEditOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Business Specs
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT BUSINESS INFO MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business Details</DialogTitle>
            <DialogDescription>Update GST, PAN, and contact information for {selectedTenant?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEditBusiness} className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={editGst} onChange={(e) => setEditGst(e.target.value)} required className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input value={editPan} onChange={(e) => setEditPan(e.target.value)} required className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                Save Business Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
