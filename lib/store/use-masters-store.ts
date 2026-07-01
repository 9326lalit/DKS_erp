import { create } from "zustand";
import { persist } from "zustand/middleware";

// ----------------------------------------------------
// ENTITY INTERFACES — PHASE 1
// ----------------------------------------------------

export interface Factory {
  id: string;
  factoryId: string; // Auto-generated display code e.g. FAC-001
  factoryName: string;
  ownerName: string;
  plotNo: string;
  addressLine1: string;
  addressLine2?: string;
  cityVillage: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  shedLength: number; // in feet
  shedWidth: number; // in feet
  totalArea: number; // auto-computed: length × width
  shedType: "RCC" | "Tin" | "Mixed";
  noOfFloors?: number;
  gstNumber?: string;
  registrationNo?: string;
  contactNumber: string;
  email?: string;
  electricityMeterNo?: string;
  establishmentDate?: string;
  activeStatus: "Active" | "Inactive";
  notes?: string;
}

export interface Loom {
  id: string;
  loomId: string; // e.g. LOM-001
  factoryId: string;
  factoryName: string;
  loomNumber: string; // e.g. L-001
  loomType: "Power Loom" | "Handloom" | "Rapier" | "Shuttle";
  reedCount?: number;
  widthInches?: number;
  rpmSpeed?: number;
  makeBrand?: string;
  yearOfPurchase?: number;
  status: "Active" | "Idle" | "Under Repair";
  assignedLabourId?: string;
  assignedLabourName?: string;
  remarks?: string;
}

export interface Fabric {
  id: string;
  fabricCode: string;
  fabricName: string;
  construction: string;
  width: number;
  gsm: number;
  warp: string;
  weft: string;
  pick: number;
  ends: number;
  quality: string;
  unit: string;
  description?: string;
  status: "Active" | "Inactive";
}

export interface Party {
  id: string;
  partyCode: string;
  partyName: string;
  partyType: "Supplier" | "Buyer" | "Labour Contractor";
  contactPerson?: string;
  mobileNumber: string;
  gstNumber?: string;
  panNumber?: string;
  address: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  openingBalance: number;
  activeStatus: "Active" | "Inactive";
}

export interface Labour {
  id: string;
  labourId: string; // e.g. LAB-001
  fullName: string;
  labourType: "Weaver" | "Helper" | "Sizing Worker" | "Contractor";
  linkedFactoryId: string;
  linkedFactoryName: string;
  linkedLoomId?: string;
  linkedLoomNumber?: string;
  mobileNumber: string;
  aadhaarNumber?: string; // stored masked
  dateOfBirth?: string;
  address?: string;
  joiningDate: string;
  rateType: "Daily" | "Per Metre" | "Weekly" | "Contract";
  rate: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  activeStatus: "Active" | "Inactive" | "Left";
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  photo?: string;
  mobile: string;
  email?: string;
  address: string;
  joiningDate: string;
  role: "Mukadam" | "Weaver" | "Helper" | "Mechanic" | "Electrician" | "Store Manager" | "Supervisor" | "Accountant";
  department: string;
  salaryType: "Monthly" | "Meter Based" | "Piece Based";
  rate: number;
  status: "Active" | "Inactive";
}

export interface Yarn {
  id: string;
  yarnCode: string;
  yarnName: string;
  material: "Cotton" | "Polyester" | "PV" | "Viscose";
  count: string;
  denier?: string;
  brand: string;
  color: string;
  unit: string;
  coneWeight?: number;
  rate: number;
  gst: number;
  description?: string;
  status: "Active" | "Inactive";
}

export interface Shift {
  id: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  description?: string;
  status: "Active" | "Inactive";
}

export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  location: string;
  type: "Yarn" | "Beam" | "Grey Fabric" | "General";
  status: "Active" | "Inactive";
}

export interface Unit {
  id: string;
  code: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  description?: string;
  status: "Active" | "Inactive";
}

// ----------------------------------------------------
// STORE STATE INTERFACE
// ----------------------------------------------------

interface MastersState {
  isHydrated: boolean;
  factories: Factory[];
  looms: Loom[];
  fabrics: Fabric[];
  parties: Party[];
  yarns: Yarn[];
  shifts: Shift[];
  warehouses: Warehouse[];
  units: Unit[];
  labour: Labour[];
  employees: Employee[];
  expenseCategories: ExpenseCategory[];

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  // Factory CRUD
  createFactory: (factory: Factory) => void;
  updateFactory: (factory: Factory) => void;
  deleteFactory: (id: string) => void;

  // Loom CRUD
  createLoom: (loom: Loom) => void;
  updateLoom: (loom: Loom) => void;
  deleteLoom: (id: string) => void;

  // Fabric CRUD
  createFabric: (fabric: Fabric) => void;
  updateFabric: (fabric: Fabric) => void;
  deleteFabric: (id: string) => void;

  // Party CRUD
  createParty: (party: Party) => void;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;

  // Yarn CRUD
  createYarn: (yarn: Yarn) => void;
  updateYarn: (yarn: Yarn) => void;
  deleteYarn: (id: string) => void;

  // Shift CRUD
  createShift: (shift: Shift) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;

  // Warehouse CRUD
  createWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  // Unit CRUD
  createUnit: (unit: Unit) => void;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (id: string) => void;

  // Labour CRUD
  createLabour: (labour: Labour) => void;
  updateLabour: (labour: Labour) => void;
  deleteLabour: (id: string) => void;

  // Employee CRUD
  createEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;

  // Expense Category CRUD
  createExpenseCategory: (expenseCategory: ExpenseCategory) => void;
  updateExpenseCategory: (expenseCategory: ExpenseCategory) => void;
  deleteExpenseCategory: (id: string) => void;
}

// ----------------------------------------------------
// SEED DATA
// ----------------------------------------------------

const getInitialSeeds = () => {
  const seededFactories: Factory[] = [
    {
      id: "FAC-ID-001",
      factoryId: "FAC-001",
      factoryName: "Shivaji Weaving Factory",
      ownerName: "Shivaji Khairnar",
      plotNo: "Plot No. 45-A",
      addressLine1: "MIDC Industrial Area, Sector-3",
      addressLine2: "Near Power House",
      cityVillage: "Ichalkaranji",
      taluka: "Shirol",
      district: "Kolhapur",
      state: "Maharashtra",
      pincode: "416115",
      shedLength: 120,
      shedWidth: 60,
      totalArea: 7200,
      shedType: "RCC",
      noOfFloors: 1,
      gstNumber: "27AAIPK1234F1Z5",
      registrationNo: "MH-MSME-2024-0456",
      contactNumber: "+91 98230 11223",
      email: "shivaji.factory@gmail.com",
      electricityMeterNo: "EB-4521-KOL",
      establishmentDate: "2018-04-01",
      activeStatus: "Active",
      notes: "Primary weaving shed — 18 power looms operational"
    },
    {
      id: "FAC-ID-002",
      factoryId: "FAC-002",
      factoryName: "Yogesh Looming Works",
      ownerName: "Yogesh Jakhotya",
      plotNo: "Gat No. 102",
      addressLine1: "Ward No. 12, Textile Zone",
      cityVillage: "Ichalkaranji",
      taluka: "Shirol",
      district: "Kolhapur",
      state: "Maharashtra",
      pincode: "416115",
      shedLength: 80,
      shedWidth: 40,
      totalArea: 3200,
      shedType: "Tin",
      noOfFloors: 1,
      contactNumber: "+91 98765 44321",
      activeStatus: "Active",
      notes: "Secondary unit — handloom and rapier setup"
    }
  ];

  const seededLooms: Loom[] = [
    { id: "LOM-ID-001", loomId: "LOM-001", factoryId: "FAC-ID-001", factoryName: "Shivaji Weaving Factory", loomNumber: "L-001", loomType: "Power Loom", reedCount: 120, widthInches: 60, rpmSpeed: 680, makeBrand: "Picanol", yearOfPurchase: 2021, status: "Active" },
    { id: "LOM-ID-002", loomId: "LOM-002", factoryId: "FAC-ID-001", factoryName: "Shivaji Weaving Factory", loomNumber: "L-002", loomType: "Power Loom", reedCount: 120, widthInches: 60, rpmSpeed: 660, makeBrand: "Picanol", yearOfPurchase: 2021, status: "Active" },
    { id: "LOM-ID-003", loomId: "LOM-003", factoryId: "FAC-ID-001", factoryName: "Shivaji Weaving Factory", loomNumber: "L-003", loomType: "Rapier", reedCount: 100, widthInches: 58, rpmSpeed: 580, makeBrand: "Toyota", yearOfPurchase: 2022, status: "Idle" },
    { id: "LOM-ID-004", loomId: "LOM-004", factoryId: "FAC-ID-001", factoryName: "Shivaji Weaving Factory", loomNumber: "L-004", loomType: "Power Loom", reedCount: 120, widthInches: 60, rpmSpeed: 700, makeBrand: "Picanol", yearOfPurchase: 2023, status: "Under Repair" },
    { id: "LOM-ID-005", loomId: "LOM-005", factoryId: "FAC-ID-002", factoryName: "Yogesh Looming Works", loomNumber: "L-001", loomType: "Handloom", reedCount: 80, widthInches: 45, status: "Active", makeBrand: "Local Make", yearOfPurchase: 2019 },
    { id: "LOM-ID-006", loomId: "LOM-006", factoryId: "FAC-ID-002", factoryName: "Yogesh Looming Works", loomNumber: "L-002", loomType: "Shuttle", reedCount: 90, widthInches: 50, rpmSpeed: 200, status: "Active", makeBrand: "Local Make", yearOfPurchase: 2020 },
  ];

  const seededFabrics: Fabric[] = [
    {
      id: "FAB-ID-001",
      fabricCode: "FAB-001",
      fabricName: "Rustic Cotton Poplin",
      construction: "60x60 / 132x72",
      width: 44,
      gsm: 120,
      warp: "40s",
      weft: "40s",
      pick: 72,
      ends: 132,
      quality: "Premium",
      unit: "Meters",
      description: "Soft cotton fabric ideal for shirting and fashion wear.",
      status: "Active"
    }
  ];

  const seededParties: Party[] = [
    {
      id: "PRT-ID-001",
      partyCode: "PRT-S001",
      partyName: "Yogesh Jakhotya Spinners",
      partyType: "Supplier",
      contactPerson: "Yogesh Jakhotya",
      mobileNumber: "+91 98765 43210",
      gstNumber: "27AAIJY1234K1Z5",
      panNumber: "AAIJY1234K",
      address: "Plot 22, Yarn Market, Ichalkaranji, Kolhapur - 416115",
      bankName: "Bank of Maharashtra",
      accountNumber: "60234512345",
      ifscCode: "MAHB0001234",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-002",
      partyCode: "PRT-S002",
      partyName: "Om Yarn Traders",
      partyType: "Supplier",
      contactPerson: "Sanjay Patil",
      mobileNumber: "+91 98341 56789",
      gstNumber: "27AAIOY1234P1Z3",
      panNumber: "AAIOY1234P",
      address: "Shop No. 5, Textile Complex, Ichalkaranji - 416115",
      openingBalance: 25000,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-003",
      partyCode: "PRT-S003",
      partyName: "Shree Ganesh Yarn Depot",
      partyType: "Supplier",
      contactPerson: "Rahul Shinde",
      mobileNumber: "+91 91234 56789",
      gstNumber: "27AAIGS1234R1Z7",
      panNumber: "AAIGS1234R",
      address: "Gat No. 8, Yarn Colony, Ichalkaranji - 416115",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-004",
      partyCode: "PRT-B001",
      partyName: "Shivaji Khairnar (Own Firm)",
      partyType: "Buyer",
      contactPerson: "Shivaji Khairnar",
      mobileNumber: "+91 98230 11223",
      gstNumber: "27AAIPK1234F1Z5",
      panNumber: "AAIPK1234F",
      address: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-005",
      partyCode: "PRT-B002",
      partyName: "Balaji Textiles Pvt Ltd",
      partyType: "Buyer",
      contactPerson: "Suresh Balaji",
      mobileNumber: "+91 99001 23456",
      gstNumber: "27AAIBP1234S1Z2",
      address: "Surat Textile Hub, Surat, Gujarat - 395001",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-006",
      partyCode: "PRT-LC001",
      partyName: "Ramesh Labour Contractor",
      partyType: "Labour Contractor",
      contactPerson: "Ramesh Patil",
      mobileNumber: "+91 97654 32100",
      address: "Ward No. 7, Ichalkaranji - 416115",
      openingBalance: 0,
      activeStatus: "Active"
    }
  ];

  const seededLabour: Labour[] = [
    {
      id: "LAB-ID-001",
      labourId: "LAB-001",
      fullName: "Mahadev Koli",
      labourType: "Weaver",
      linkedFactoryId: "FAC-ID-001",
      linkedFactoryName: "Shivaji Weaving Factory",
      linkedLoomId: "LOM-ID-001",
      linkedLoomNumber: "L-001",
      mobileNumber: "+91 98765 00001",
      aadhaarNumber: "XXXX-XXXX-1234",
      joiningDate: "2022-06-01",
      rateType: "Per Metre",
      rate: 8.5,
      activeStatus: "Active"
    },
    {
      id: "LAB-ID-002",
      labourId: "LAB-002",
      fullName: "Suresh Kadam",
      labourType: "Weaver",
      linkedFactoryId: "FAC-ID-001",
      linkedFactoryName: "Shivaji Weaving Factory",
      linkedLoomId: "LOM-ID-002",
      linkedLoomNumber: "L-002",
      mobileNumber: "+91 98765 00002",
      joiningDate: "2023-01-15",
      rateType: "Per Metre",
      rate: 8.5,
      activeStatus: "Active"
    },
    {
      id: "LAB-ID-003",
      labourId: "LAB-003",
      fullName: "Ganesh Mane",
      labourType: "Helper",
      linkedFactoryId: "FAC-ID-001",
      linkedFactoryName: "Shivaji Weaving Factory",
      mobileNumber: "+91 98765 00003",
      joiningDate: "2022-09-01",
      rateType: "Daily",
      rate: 450,
      activeStatus: "Active"
    },
    {
      id: "LAB-ID-004",
      labourId: "LAB-004",
      fullName: "Vijay Powar",
      labourType: "Sizing Worker",
      linkedFactoryId: "FAC-ID-002",
      linkedFactoryName: "Yogesh Looming Works",
      mobileNumber: "+91 97654 00004",
      joiningDate: "2021-03-10",
      rateType: "Daily",
      rate: 500,
      activeStatus: "Active"
    },
    {
      id: "LAB-ID-005",
      labourId: "LAB-005",
      fullName: "Prakash Shinde",
      labourType: "Contractor",
      linkedFactoryId: "FAC-ID-001",
      linkedFactoryName: "Shivaji Weaving Factory",
      mobileNumber: "+91 96543 00005",
      joiningDate: "2024-01-01",
      rateType: "Contract",
      rate: 35000,
      activeStatus: "Active"
    }
  ];

  const seededYarns: Yarn[] = [
    { id: "YRN-ID-001", yarnCode: "YRN-001", yarnName: "40s Cotton", material: "Cotton", count: "40s", brand: "Vardhman", color: "Natural", unit: "KG", rate: 185, gst: 5, status: "Active" },
    { id: "YRN-ID-002", yarnCode: "YRN-002", yarnName: "150D Polyester", material: "Polyester", count: "150D", denier: "150D", brand: "Reliance", color: "White", unit: "KG", rate: 120, gst: 12, status: "Active" },
    { id: "YRN-ID-003", yarnCode: "YRN-003", yarnName: "60s Cotton", material: "Cotton", count: "60s", brand: "Nahar", color: "Natural", unit: "KG", rate: 210, gst: 5, status: "Active" }
  ];

  const seededShifts: Shift[] = [
    { id: "SHF-ID-001", shiftCode: "SHF-001", shiftName: "Morning Shift", startTime: "06:00 AM", endTime: "02:00 PM", breakTime: "30 Min", status: "Active" },
    { id: "SHF-ID-002", shiftCode: "SHF-002", shiftName: "Night Shift", startTime: "10:00 PM", endTime: "06:00 AM", breakTime: "30 Min", status: "Active" }
  ];

  const seededWarehouses: Warehouse[] = [
    { id: "WH-ID-001", warehouseCode: "WH-001", warehouseName: "Yarn Godown A", location: "Factory Block-1", type: "Yarn", status: "Active" },
    { id: "WH-ID-002", warehouseCode: "WH-002", warehouseName: "Fabric Roll Store", location: "Factory Block-2", type: "Grey Fabric", status: "Active" },
    { id: "WH-ID-003", warehouseCode: "WH-003", warehouseName: "Warp Beam Rack", location: "Sizing Unit", type: "Beam", status: "Active" }
  ];

  const seededUnits: Unit[] = [
    { id: "UOM-ID-001", code: "KG", name: "Kilogram" },
    { id: "UOM-ID-002", code: "MTR", name: "Meter" },
    { id: "UOM-ID-003", code: "CNE", name: "Cone" },
    { id: "UOM-ID-004", code: "BM", name: "Beam" },
    { id: "UOM-ID-005", code: "RL", name: "Roll" }
  ];

  const seededExpenseCats: ExpenseCategory[] = [
    { id: "EXP-01", categoryCode: "EXP-ELEC", categoryName: "Electricity", description: "Loom motors power consumption utility bills", status: "Active" },
    { id: "EXP-02", categoryCode: "EXP-SAL", categoryName: "Salary", description: "Office administrative and supervisors base payrolls", status: "Active" },
    { id: "EXP-03", categoryCode: "EXP-REP", categoryName: "Repair", description: "Loom spare parts purchase and accessories repairs", status: "Active" }
  ];

  return {
    factories: seededFactories,
    looms: seededLooms,
    fabrics: seededFabrics,
    parties: seededParties,
    yarns: seededYarns,
    shifts: seededShifts,
    warehouses: seededWarehouses,
    units: seededUnits,
    labour: seededLabour,
    employees: [],
    expenseCategories: seededExpenseCats
  };
};

// ----------------------------------------------------
// ZUSTAND STORE
// ----------------------------------------------------

export const useMastersStore = create<MastersState>()(
  persist(
    (set) => ({
      isHydrated: false,
      factories: [],
      looms: [],
      fabrics: [],
      parties: [],
      yarns: [],
      shifts: [],
      warehouses: [],
      units: [],
      labour: [],
      employees: [],
      expenseCategories: [],

      setHydrated: (val) => set({ isHydrated: val }),

      initializeSeeds: () => {
        const seeds = getInitialSeeds();
        set({ ...seeds });
      },

      // CRUD: Factories
      createFactory: (factory) => set((state) => ({ factories: [factory, ...state.factories] })),
      updateFactory: (factory) =>
        set((state) => ({
          factories: state.factories.map((f) => (f.id === factory.id ? factory : f))
        })),
      deleteFactory: (id) =>
        set((state) => ({
          factories: state.factories.filter((f) => f.id !== id)
        })),

      // CRUD: Looms
      createLoom: (loom) => set((state) => ({ looms: [loom, ...state.looms] })),
      updateLoom: (loom) =>
        set((state) => ({
          looms: state.looms.map((l) => (l.id === loom.id ? loom : l))
        })),
      deleteLoom: (id) =>
        set((state) => ({
          looms: state.looms.filter((l) => l.id !== id)
        })),

      // CRUD: Fabrics
      createFabric: (fabric) => set((state) => ({ fabrics: [fabric, ...state.fabrics] })),
      updateFabric: (fabric) =>
        set((state) => ({
          fabrics: state.fabrics.map((f) => (f.id === fabric.id ? fabric : f))
        })),
      deleteFabric: (id) =>
        set((state) => ({
          fabrics: state.fabrics.filter((f) => f.id !== id)
        })),

      // CRUD: Parties
      createParty: (party) => set((state) => ({ parties: [party, ...state.parties] })),
      updateParty: (party) =>
        set((state) => ({
          parties: state.parties.map((p) => (p.id === party.id ? party : p))
        })),
      deleteParty: (id) =>
        set((state) => ({
          parties: state.parties.filter((p) => p.id !== id)
        })),

      // CRUD: Yarns
      createYarn: (yarn) => set((state) => ({ yarns: [yarn, ...state.yarns] })),
      updateYarn: (yarn) =>
        set((state) => ({
          yarns: state.yarns.map((y) => (y.id === yarn.id ? yarn : y))
        })),
      deleteYarn: (id) =>
        set((state) => ({
          yarns: state.yarns.filter((y) => y.id !== id)
        })),

      // CRUD: Shifts
      createShift: (shift) => set((state) => ({ shifts: [shift, ...state.shifts] })),
      updateShift: (shift) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shift.id ? shift : s))
        })),
      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== id)
        })),

      // CRUD: Warehouses
      createWarehouse: (warehouse) => set((state) => ({ warehouses: [warehouse, ...state.warehouses] })),
      updateWarehouse: (warehouse) =>
        set((state) => ({
          warehouses: state.warehouses.map((w) => (w.id === warehouse.id ? warehouse : w))
        })),
      deleteWarehouse: (id) =>
        set((state) => ({
          warehouses: state.warehouses.filter((w) => w.id !== id)
        })),

      // CRUD: Units
      createUnit: (unit) => set((state) => ({ units: [unit, ...state.units] })),
      updateUnit: (unit) =>
        set((state) => ({
          units: state.units.map((u) => (u.id === unit.id ? unit : u))
        })),
      deleteUnit: (id) =>
        set((state) => ({
          units: state.units.filter((u) => u.id !== id)
        })),

      // CRUD: Labour
      createLabour: (labour) => set((state) => ({ labour: [labour, ...state.labour] })),
      updateLabour: (labour) =>
        set((state) => ({
          labour: state.labour.map((l) => (l.id === labour.id ? labour : l))
        })),
      deleteLabour: (id) =>
        set((state) => ({
          labour: state.labour.filter((l) => l.id !== id)
        })),

      // CRUD: Employees
      createEmployee: (employee) => set((state) => ({ employees: [employee, ...state.employees] })),
      updateEmployee: (employee) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === employee.id ? employee : e))
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id)
        })),

      // CRUD: Expense Categories
      createExpenseCategory: (cat) => set((state) => ({ expenseCategories: [cat, ...state.expenseCategories] })),
      updateExpenseCategory: (cat) =>
        set((state) => ({
          expenseCategories: state.expenseCategories.map((c) => (c.id === cat.id ? cat : c))
        })),
      deleteExpenseCategory: (id) =>
        set((state) => ({
          expenseCategories: state.expenseCategories.filter((c) => c.id !== id)
        })),
    }),
    {
      name: "dks-textile-erp-masters-v2",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.factories.length === 0) {
            state.initializeSeeds();
          }
        }
      }
    }
  )
);
