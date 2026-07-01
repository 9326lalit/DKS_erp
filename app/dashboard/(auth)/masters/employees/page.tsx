"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Users, Trash2, ArrowLeft, Plus, ShieldCheck, Mail, Phone, Calendar, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { mastersApiService } from "@/lib/services/masters-api";
import { Employee } from "@/lib/store/use-masters-store";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { MasterToolbar } from "@/components/textile-erp/master-toolbar";
import { MasterTable, TableColumn } from "@/components/textile-erp/master-table";
import { MasterDialog } from "@/components/textile-erp/master-dialog";
import { StatusBadge } from "@/components/textile-erp/status-badge";
import { ImageUploader } from "@/components/textile-erp/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// ----------------------------------------------------
// VALIDATION SCHEMA
// ----------------------------------------------------
const employeeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  photo: z.string().optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number starting with 6-9"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  joiningDate: z.string().min(1, "Joining date is required"),
  role: z.enum([
    "Mukadam",
    "Weaver",
    "Helper",
    "Mechanic",
    "Electrician",
    "Store Manager",
    "Supervisor",
    "Accountant"
  ]),
  department: z.string().min(1, "Department is required"),
  salaryType: z.enum(["Monthly", "Meter Based", "Piece Based"]),
  rate: z.number().min(0, "Rate must be positive"),
  status: z.enum(["Active", "Inactive"])
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function EmployeesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    role: "all",
    salaryType: "all",
    status: "all"
  });

  // Modal/Drawer controls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  // Delete Alert state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetEmployee, setDeleteTargetEmployee] = useState<Employee | null>(null);

  // TanStack Queries & Mutations
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => mastersApiService.getEmployees()
  });

  const createMutation = useMutation({
    mutationFn: (newEmp: Employee) => mastersApiService.createEmployee(newEmp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("New employee registered successfully.");
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (emp: Employee) => mastersApiService.updateEmployee(emp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee master updated successfully.");
      setDialogOpen(false);
      setEditEmployee(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mastersApiService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee removed from active registry.");
      setDeleteConfirmOpen(false);
      setDeleteTargetEmployee(null);
    }
  });

  const statusToggleMutation = useMutation({
    mutationFn: (emp: Employee) => {
      const updatedEmp: Employee = {
        ...emp,
        status: emp.status === "Active" ? "Inactive" : "Active"
      };
      return mastersApiService.updateEmployee(updatedEmp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee status updated.");
    }
  });

  // React Hook Form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      photo: "",
      mobile: "",
      email: "",
      address: "MIDC Sector 3, Ichalkaranji",
      joiningDate: new Date().toISOString().split("T")[0],
      role: "Weaver",
      department: "Production",
      salaryType: "Meter Based",
      rate: 8.5,
      status: "Active"
    }
  });

  const resetForm = () => {
    form.reset({
      name: "",
      photo: "",
      mobile: "",
      email: "",
      address: "MIDC Sector 3, Ichalkaranji",
      joiningDate: new Date().toISOString().split("T")[0],
      role: "Weaver",
      department: "Production",
      salaryType: "Meter Based",
      rate: 8.5,
      status: "Active"
    });
  };

  // Auto assign department based on role
  const watchRole = form.watch("role");
  React.useEffect(() => {
    if (["Weaver", "Mukadam", "Helper"].includes(watchRole)) {
      form.setValue("department", "Production");
      if (watchRole === "Weaver") {
        form.setValue("salaryType", "Meter Based");
        form.setValue("rate", 8.5);
      } else {
        form.setValue("salaryType", "Monthly");
        form.setValue("rate", 18000);
      }
    } else if (["Mechanic", "Electrician"].includes(watchRole)) {
      form.setValue("department", "Maintenance");
      form.setValue("salaryType", "Monthly");
      form.setValue("rate", 22000);
    } else {
      form.setValue("department", "Administration");
      form.setValue("salaryType", "Monthly");
      form.setValue("rate", 25000);
    }
  }, [watchRole, form]);

  // Trigger Edit Drawer
  const handleEditClick = (emp: Employee) => {
    setEditEmployee(emp);
    setViewEmployee(null);
    setDialogOpen(true);
    
    // Set form values
    Object.entries(emp).forEach(([key, val]) => {
      form.setValue(key as any, val);
    });
  };

  // Trigger View Drawer
  const handleViewClick = (emp: Employee) => {
    setViewEmployee(emp);
    setEditEmployee(null);
    setDialogOpen(true);
  };

  // Trigger Delete Alert
  const handleDeleteClick = (emp: Employee) => {
    setDeleteTargetEmployee(emp);
    setDeleteConfirmOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (values: EmployeeFormValues) => {
    if (editEmployee) {
      updateMutation.mutate({
        ...editEmployee,
        ...values
      });
    } else {
      createMutation.mutate({
        id: `EMP-${Date.now()}`,
        employeeCode: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
        ...values
      });
    }
  };

  // Filter & Search logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      emp.mobile.includes(searchValue) ||
      emp.role.toLowerCase().includes(searchValue.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchValue.toLowerCase());

    const matchesRole =
      selectedFilters.role === "all" ||
      emp.role === selectedFilters.role;

    const matchesSalaryType =
      selectedFilters.salaryType === "all" ||
      emp.salaryType === selectedFilters.salaryType;

    const matchesStatus =
      selectedFilters.status === "all" ||
      emp.status === selectedFilters.status;

    return matchesSearch && matchesRole && matchesSalaryType && matchesStatus;
  });

  const columns: TableColumn<Employee>[] = [
    {
      key: "name",
      header: "Employee Details",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border/40 shadow-sm">
            <AvatarImage src={item.photo} alt={item.name} />
            <AvatarFallback className="font-bold text-[10px] bg-primary/5 text-primary">
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-foreground">{item.name}</div>
            <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
              <span>{item.employeeCode}</span>
              <span className="h-1 w-1 bg-border rounded-full" />
              <span>{item.department}</span>
            </div>
          </div>
        </div>
      ),
      sortable: true
    },
    { key: "role", header: "Designation / Role", render: (item) => <Badge variant="secondary" className="font-bold">{item.role}</Badge>, sortable: true },
    { key: "mobile", header: "Mobile Contact", render: (item) => <span className="font-semibold">{item.mobile}</span> },
    { key: "joiningDate", header: "Joining Date", sortable: true },
    { key: "salaryType", header: "Wage Standard", render: (item) => <span>{item.salaryType}</span>, sortable: true },
    {
      key: "rate",
      header: "Base Pay Rate",
      render: (item) => (
        <span className="font-bold">
          {item.salaryType === "Meter Based"
            ? `₹${item.rate} / Meter`
            : item.salaryType === "Piece Based"
            ? `₹${item.rate} / Piece`
            : `₹${item.rate.toLocaleString()} / Month`}
        </span>
      ),
      sortable: true
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} type="general" />,
      sortable: true
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Employee & Operator Registers"
        description="Configure factory shift operators (Weavers, Mukadams, Mechanics) and administrative staff. Align salary standards (piece rates vs monthly base pay)."
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard/default" },
          { title: "Masters Registry", href: "/dashboard/masters" },
          { title: "Staff Directory" }
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/masters")} className="h-9 gap-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Masters
          </Button>
        }
      />

      {/* Toolbar & Search */}
      <MasterToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        createLabel="Register Employee"
        onCreateClick={() => {
          setEditEmployee(null);
          setViewEmployee(null);
          resetForm();
          setDialogOpen(true);
        }}
        exportTitle="Employees"
        selectedFilters={selectedFilters}
        onFilterChange={(key, val) => setSelectedFilters((p) => ({ ...p, [key]: val }))}
        onClearFilters={() => {
          setSearchValue("");
          setSelectedFilters({ role: "all", salaryType: "all", status: "all" });
        }}
        filters={[
          {
            key: "role",
            placeholder: "Designation",
            options: [
              { label: "Weaver", value: "Weaver" },
              { label: "Mukadam", value: "Mukadam" },
              { label: "Helper", value: "Helper" },
              { label: "Mechanic", value: "Mechanic" },
              { label: "Electrician", value: "Electrician" },
              { label: "Supervisor", value: "Supervisor" },
              { label: "Store Manager", value: "Store Manager" },
              { label: "Accountant", value: "Accountant" }
            ]
          },
          {
            key: "salaryType",
            placeholder: "Salary Type",
            options: [
              { label: "Meter Based", value: "Meter Based" },
              { label: "Monthly Base", value: "Monthly" },
              { label: "Piece Based", value: "Piece Based" }
            ]
          },
          {
            key: "status",
            placeholder: "Status",
            options: [
              { label: "Active Staff", value: "Active" },
              { label: "Inactive Staff", value: "Inactive" }
            ]
          }
        ]}
      />

      {/* Employees Table */}
      <MasterTable
        data={filteredEmployees}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onStatusToggle={(item) => statusToggleMutation.mutate(item)}
        onBulkDelete={(items) => {
          items.forEach((item) => deleteMutation.mutate(item.id));
        }}
      />

      {/* Slide-out Panel Drawer (Create/Edit/View) */}
      <MasterDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditEmployee(null);
          setViewEmployee(null);
        }}
        title={
          viewEmployee
            ? `Staff Details: ${viewEmployee.name}`
            : editEmployee
            ? `Edit Staff profile: ${editEmployee.name}`
            : "Register New Staff Member"
        }
        description={
          viewEmployee
            ? `Review HR profile parameters for ${viewEmployee.employeeCode}`
            : "Capture personal info, role designations, and payroll values accurately."
        }
      >
        {viewEmployee ? (
          // View Mode Screen
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="flex items-center gap-4 border-b border-border/10 pb-5">
              <Avatar className="h-16 w-16 border border-border/40 shadow">
                <AvatarImage src={viewEmployee.photo} alt={viewEmployee.name} />
                <AvatarFallback className="font-bold text-lg bg-primary/5 text-primary">
                  {viewEmployee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-bold text-foreground block">{viewEmployee.name}</span>
                <span className="font-bold text-primary block mt-0.5">{viewEmployee.employeeCode}</span>
                <Badge variant="secondary" className="font-bold text-[10px] mt-1.5">{viewEmployee.role}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Phone className="h-3 w-3" /> Contact Mobile</span>
                <span className="font-semibold text-foreground">{viewEmployee.mobile}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Mail className="h-3 w-3" /> Contact Email</span>
                <span className="font-semibold text-foreground">{viewEmployee.email || "N/A"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Department</span>
                <span className="font-semibold text-foreground">{viewEmployee.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> Joining Date</span>
                <span className="font-semibold text-foreground">{viewEmployee.joiningDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Status</span>
                <StatusBadge status={viewEmployee.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/10 pb-4">
              <div>
                <span className="text-muted-foreground block font-medium">Wage/Salary Type</span>
                <span className="font-bold text-foreground">{viewEmployee.salaryType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Base Wage Pay Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {viewEmployee.salaryType === "Meter Based"
                    ? `₹${viewEmployee.rate} / Meter`
                    : viewEmployee.salaryType === "Piece Based"
                    ? `₹${viewEmployee.rate} / Piece`
                    : `₹${viewEmployee.rate.toLocaleString()} / Month`}
                </span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Residential address</span>
              <p className="font-medium text-foreground bg-muted/20 p-3 rounded-lg border border-border/10 mt-1.5">{viewEmployee.address}</p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Close Panel
              </Button>
            </div>
          </div>
        ) : (
          // Create/Edit Mode Form
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Employee Full Name *</Label>
                <Input id="name" placeholder="e.g. Ramesh Chandra Yadav" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">Designation Role *</Label>
                <Select
                  onValueChange={(val) => form.setValue("role", val as any)}
                  value={form.watch("role")}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weaver">Weaver</SelectItem>
                    <SelectItem value="Mukadam">Mukadam (Jobber)</SelectItem>
                    <SelectItem value="Helper">Helper (Folder/Loader)</SelectItem>
                    <SelectItem value="Mechanic">Loom Mechanic</SelectItem>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Store Manager">Store Manager</SelectItem>
                    <SelectItem value="Supervisor">Shift Supervisor</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-xs font-semibold">Mobile Number (Indian 10-digit) *</Label>
                <Input id="mobile" placeholder="e.g. 9876543210" {...form.register("mobile")} />
                {form.formState.errors.mobile && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email address</Label>
                <Input id="email" placeholder="e.g. name@factory.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-semibold">Department *</Label>
                <Input id="department" readOnly className="bg-muted" {...form.register("department")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="joiningDate" className="text-xs font-semibold">Joining Date *</Label>
                <Input id="joiningDate" type="date" {...form.register("joiningDate")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold">Status *</Label>
                <Select
                  onValueChange={(val) => form.setValue("status", val as any)}
                  value={form.watch("status")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="salaryType" className="text-xs font-semibold">Salary / Wage Standard *</Label>
                <Select
                  onValueChange={(val) => form.setValue("salaryType", val as any)}
                  value={form.watch("salaryType")}
                >
                  <SelectTrigger id="salaryType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly Fixed Salary</SelectItem>
                    <SelectItem value="Meter Based">Meter Based Production Wage</SelectItem>
                    <SelectItem value="Piece Based">Piece Based Output Wage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rate" className="text-xs font-semibold">
                  {form.watch("salaryType") === "Meter Based"
                    ? "Rate per Weaved Meter (₹) *"
                    : form.watch("salaryType") === "Piece Based"
                    ? "Rate per Fabric Piece (₹) *"
                    : "Monthly Base Salary (₹) *"}
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  {...form.register("rate", { valueAsNumber: true })}
                />
                {form.formState.errors.rate && (
                  <p className="text-[10px] text-destructive font-medium">{form.formState.errors.rate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">Residential permanent address *</Label>
              <Textarea id="address" rows={2} placeholder="Ward, Village, District, State..." {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-[10px] text-destructive font-medium">{form.formState.errors.address.message}</p>
              )}
            </div>

            <ImageUploader
              value={form.watch("photo")}
              onChange={(base64Url) => form.setValue("photo", base64Url)}
              label="Staff Avatar Photo"
              helperText="Upload employee profile image up to 2MB"
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border/10">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editEmployee ? "Update Employee Profile" : "Register Employee"}
              </Button>
            </div>
          </form>
        )}
      </MasterDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold font-display flex items-center gap-2 text-destructive">
              <Trash2 className="h-4.5 w-4.5 text-destructive" />
              Remove Staff registry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete **{deleteTargetEmployee?.name}**? This will remove them from daily weaver logs and operational allocations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold cursor-pointer"
              onClick={() => deleteTargetEmployee && deleteMutation.mutate(deleteTargetEmployee.id)}
            >
              Remove Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
