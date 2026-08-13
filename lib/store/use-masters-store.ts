import { create } from "zustand";
import { persist } from "zustand/middleware";

// ----------------------------------------------------
// ENTITY INTERFACES — PHASE 1
// ----------------------------------------------------

export interface Factory {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  activeStatus: "Active" | "Inactive";
  notes?: string;
}

export interface Loom {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  status: "Active" | "Idle" | "Under Repair";
  assignedLabourId?: string;
  assignedLabourName?: string;
  remarks?: string;
}

export interface Fabric {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  description?: string;
  status: "Active" | "Inactive";
}

export interface Party {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  activeStatus: "Active" | "Inactive";
  factoryId?: string;
  factoryName?: string;
}

export interface Labour {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  rateType: "Daily" | "Per Metre" | "Weekly" | "Contract";
  rate: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  activeStatus: "Active" | "Inactive" | "Left";
}

export interface Employee {
  id: string;
  tenantId?: string;
  employeeCode: string;
  name: string;
  photo?: string;
  mobile: string;
  email?: string;
  address: string;
  joiningDate: string;
  createdDate?: string;
  role: "Mukadam" | "Weaver" | "Helper" | "Mechanic" | "Electrician" | "Store Manager" | "Supervisor" | "Accountant";
  department: string;
  salaryType: "Monthly" | "Meter Based" | "Piece Based";
  rate: number;
  status: "Active" | "Inactive";
}

export interface Yarn {
  id: string;
  tenantId?: string;
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
  createdDate?: string;
  description?: string;
  status: "Active" | "Inactive";
}

export interface Shift {
  id: string;
  tenantId?: string;
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
  tenantId?: string;
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

export interface SizingMill {
  id: string;
  tenantId?: string;
  millCode: string;
  millName: string;
  contactPerson?: string;
  mobileNumber: string;
  gstNumber?: string;
  address: string;
  createdDate?: string;
  activeStatus: "Active" | "Inactive";
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
  sizingMills: SizingMill[];

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  // Sizing Mill CRUD
  createSizingMill: (mill: SizingMill) => void;
  updateSizingMill: (mill: SizingMill) => void;
  deleteSizingMill: (id: string) => void;

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
  // 1. FACTORIES (Multi-Tenant Scoped)
  const seededFactories: Factory[] = [
    {
      id: "FAC-ID-001",
      tenantId: "dhandai-textiles",
      factoryId: "FAC-001",
      factoryName: "Dhandai Textiles (Main Shed)",
      ownerName: "Bhushan Khairnar",
      plotNo: "Plot 18",
      addressLine1: "MIDC Industrial Zone",
      cityVillage: "Ichalkaranji",
      taluka: "Shirol",
      district: "Kolhapur",
      state: "Maharashtra",
      pincode: "416115",
      shedLength: 120,
      shedWidth: 60,
      totalArea: 7200,
      shedType: "RCC",
      noOfFloors: 2,
      contactNumber: "+91 98230 11223",
      email: "bhushan.dks@gmail.com",
      electricityMeterNo: "EB-4521-ICH",
      establishmentDate: "2018-04-01",
      activeStatus: "Active",
      notes: "Primary weaving shed — 24 power looms operational"
    },
    {
      id: "FAC-ID-002",
      tenantId: "dhandai-textiles",
      factoryId: "FAC-002",
      factoryName: "Dhandai Textiles Unit-II",
      ownerName: "Bhushan Khairnar",
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
      email: "bhushan.dks@gmail.com",
      activeStatus: "Active",
      notes: "Secondary rapier weaving shed — 12 looms operational"
    },
    {
      id: "FAC-ID-003",
      tenantId: "lalit-textiles",
      factoryId: "FAC-003",
      factoryName: "Lalit Textiles Weaving Unit",
      ownerName: "Lalit Patil",
      plotNo: "Plot No. 45",
      addressLine1: "Powerloom Park, Kolhapur Road",
      cityVillage: "Ichalkaranji",
      taluka: "Shirol",
      district: "Kolhapur",
      state: "Maharashtra",
      pincode: "416115",
      shedLength: 100,
      shedWidth: 50,
      totalArea: 5000,
      shedType: "RCC",
      noOfFloors: 1,
      contactNumber: "+91 99220 88990",
      email: "lalit@lalittextiles.com",
      activeStatus: "Active",
      notes: "Lalit Textiles high-speed rapier and powerloom weaving unit — 12 looms operational"
    },
    // Royal Fabrics (Surat, Gujarat)
    {
      id: "FAC-ID-RF1",
      tenantId: "royal-fabrics",
      factoryId: "FAC-RF1",
      factoryName: "Royal Jacquard Weaving Plant",
      ownerName: "Suresh Sharma",
      plotNo: "Plot No. 402",
      addressLine1: "Ring Road Textile Market",
      cityVillage: "Surat",
      taluka: "Surat City",
      district: "Surat",
      state: "Gujarat",
      pincode: "395002",
      shedLength: 150,
      shedWidth: 80,
      totalArea: 12000,
      shedType: "RCC",
      noOfFloors: 3,
      contactNumber: "+91 98765 43210",
      email: "admin@royalfabrics.com",
      electricityMeterNo: "EB-SURAT-882",
      establishmentDate: "2019-01-15",
      activeStatus: "Active",
      notes: "High-speed Electronic Jacquard fabric weaving plant"
    },
    // SilverThread Denim (Bhiwandi)
    {
      id: "FAC-ID-ST1",
      tenantId: "silverthread-denim",
      factoryId: "FAC-ST1",
      factoryName: "SilverThread Heavy Denim Plant",
      ownerName: "Rajesh Varma",
      plotNo: "Gat No. 88",
      addressLine1: "Powerloom Zone, Kalher",
      cityVillage: "Bhiwandi",
      taluka: "Bhiwandi",
      district: "Thane",
      state: "Maharashtra",
      pincode: "421302",
      shedLength: 110,
      shedWidth: 60,
      totalArea: 6600,
      shedType: "RCC",
      noOfFloors: 1,
      contactNumber: "+91 91234 56789",
      email: "manager@silverthread.com",
      activeStatus: "Active",
      notes: "14oz Indigo Denim rapier weaving plant"
    },
    // Mahadev Spinning (Ahmedabad)
    {
      id: "FAC-ID-MS1",
      tenantId: "mahadev-spinning",
      factoryId: "FAC-MS1",
      factoryName: "Mahadev Weaving & Sizing Unit",
      ownerName: "Sanjay Patel",
      plotNo: "Plot 12",
      addressLine1: "GIDC Naroda Industrial Estate",
      cityVillage: "Ahmedabad",
      taluka: "Naroda",
      district: "Ahmedabad",
      state: "Gujarat",
      pincode: "382330",
      shedLength: 130,
      shedWidth: 70,
      totalArea: 9100,
      shedType: "RCC",
      noOfFloors: 2,
      contactNumber: "+91 98111 22233",
      email: "admin@mahadevweaving.com",
      activeStatus: "Active",
      notes: "20 High-speed Airjet looms for 100% Grey Cotton Fabric"
    }
  ];

  // 2. LOOMS (Multi-Tenant Scoped)
  const dhandaiLooms: Loom[] = Array.from({ length: 36 }, (_, i) => {
    const loomNum = i + 1;
    const isMainShed = loomNum <= 24;
    return {
      id: `LOM-ID-${String(loomNum).padStart(3, "0")}`,
      tenantId: "dhandai-textiles",
      loomId: `LOM-${String(loomNum).padStart(3, "0")}`,
      factoryId: isMainShed ? "FAC-ID-001" : "FAC-ID-002",
      factoryName: isMainShed ? "Dhandai Textiles (Main Shed)" : "Dhandai Textiles Unit-II",
      loomNumber: `L-${String(loomNum).padStart(3, "0")}`,
      loomType: loomNum % 3 === 0 ? "Rapier" : "Power Loom",
      reedCount: 120,
      widthInches: 60,
      rpmSpeed: 680,
      makeBrand: "Picanol",
      yearOfPurchase: 2021 + (loomNum % 3),
      status: loomNum % 12 === 0 ? "Under Repair" : "Active"
    };
  });

  const lalitLooms: Loom[] = Array.from({ length: 24 }, (_, i) => {
    const loomNum = i + 1;
    return {
      id: `LOM-LALIT-${String(loomNum).padStart(3, "0")}`,
      tenantId: "lalit-textiles",
      loomId: `LOM-LT-${String(loomNum).padStart(3, "0")}`,
      factoryId: "FAC-ID-003",
      factoryName: "Lalit Textiles Weaving Unit",
      loomNumber: `LALIT-L-${String(loomNum).padStart(3, "0")}`,
      loomType: loomNum % 2 === 0 ? "Rapier" : "Power Loom",
      reedCount: 132,
      widthInches: 64,
      rpmSpeed: 720,
      makeBrand: "Tsudakoma",
      yearOfPurchase: 2023,
      status: "Active"
    };
  });

  // Royal Fabrics 40 Electronic Jacquard Looms
  const royalLooms: Loom[] = Array.from({ length: 40 }, (_, i) => {
    const loomNum = i + 1;
    return {
      id: `LOM-RF-ID-${String(loomNum).padStart(3, "0")}`,
      tenantId: "royal-fabrics",
      loomId: `LOM-RF-${String(loomNum).padStart(3, "0")}`,
      factoryId: "FAC-ID-RF1",
      factoryName: "Royal Jacquard Weaving Plant",
      loomNumber: `RF-JAC-${String(loomNum).padStart(3, "0")}`,
      loomType: "Rapier",
      reedCount: 144,
      widthInches: 72,
      rpmSpeed: 760,
      makeBrand: "Staubli Jacquard",
      yearOfPurchase: 2022 + (loomNum % 3),
      status: loomNum % 10 === 0 ? "Idle" : "Active"
    };
  });

  // SilverThread 16 Denim Looms
  const silverThreadLooms: Loom[] = Array.from({ length: 16 }, (_, i) => {
    const loomNum = i + 1;
    return {
      id: `LOM-ST-ID-${String(loomNum).padStart(3, "0")}`,
      tenantId: "silverthread-denim",
      loomId: `LOM-ST-${String(loomNum).padStart(3, "0")}`,
      factoryId: "FAC-ID-ST1",
      factoryName: "SilverThread Heavy Denim Plant",
      loomNumber: `ST-DEN-${String(loomNum).padStart(3, "0")}`,
      loomType: "Rapier",
      reedCount: 110,
      widthInches: 68,
      rpmSpeed: 640,
      makeBrand: "Dornier",
      yearOfPurchase: 2020 + (loomNum % 4),
      status: "Active"
    };
  });

  // Mahadev Spinning 20 Airjet Looms
  const mahadevLooms: Loom[] = Array.from({ length: 20 }, (_, i) => {
    const loomNum = i + 1;
    return {
      id: `LOM-MS-ID-${String(loomNum).padStart(3, "0")}`,
      tenantId: "mahadev-spinning",
      loomId: `LOM-MS-${String(loomNum).padStart(3, "0")}`,
      factoryId: "FAC-ID-MS1",
      factoryName: "Mahadev Weaving & Sizing Unit",
      loomNumber: `MS-AIR-${String(loomNum).padStart(3, "0")}`,
      loomType: "Power Loom",
      reedCount: 120,
      widthInches: 64,
      rpmSpeed: 820,
      makeBrand: "Toyota Airjet",
      yearOfPurchase: 2023,
      status: "Active"
    };
  });

  const seededLooms: Loom[] = [
    ...dhandaiLooms,
    ...lalitLooms,
    ...royalLooms,
    ...silverThreadLooms,
    ...mahadevLooms
  ];

  // 3. FABRICS (Multi-Tenant Scoped)
  const seededFabrics: Fabric[] = [
    {
      id: "FAB-ID-001",
      tenantId: "dhandai-textiles",
      fabricCode: "FAB-001",
      fabricName: "Dhandai Premium Cotton Poplin",
      construction: "60x60 / 132x72",
      width: 44,
      gsm: 120,
      warp: "40s",
      weft: "40s",
      pick: 72,
      ends: 132,
      quality: "Premium",
      unit: "Meters",
      description: "Dhandai Textiles premium cotton fabric for shirting.",
      status: "Active"
    },
    {
      id: "FAB-ID-002",
      tenantId: "royal-fabrics",
      fabricCode: "FAB-RF-001",
      fabricName: "Royal Silk Brocade Jacquard",
      construction: "80x80 / 160x90",
      width: 54,
      gsm: 160,
      warp: "60s Silk",
      weft: "120D Polyester",
      pick: 90,
      ends: 160,
      quality: "Designer Jacquard",
      unit: "Meters",
      description: "Royal Fabrics premium saree and upholstery Jacquard fabric.",
      status: "Active"
    },
    {
      id: "FAB-ID-003",
      tenantId: "silverthread-denim",
      fabricCode: "FAB-ST-001",
      fabricName: "14oz Heavy Indigo Denim",
      construction: "3/1 Twill / 68x44",
      width: 60,
      gsm: 420,
      warp: "10s Indigo Slub",
      weft: "12s OE Cotton",
      pick: 44,
      ends: 68,
      quality: "Export Grade Denim",
      unit: "Meters",
      description: "Heavyweight 14oz ring denim for jeans production.",
      status: "Active"
    }
  ];

  // 4. PARTIES (Multi-Tenant Scoped)
  const seededParties: Party[] = [
    {
      id: "PRT-ID-001",
      tenantId: "dhandai-textiles",
      partyCode: "PRT-B001",
      partyName: "Dhandai Textiles (Own Firm)",
      partyType: "Buyer",
      contactPerson: "Bhushan Khairnar",
      mobileNumber: "+91 98230 11223",
      gstNumber: "27AAIPK1234F1Z5",
      panNumber: "AAIPK1234F",
      address: "Plot 18, MIDC Industrial Zone, Ichalkaranji - 416115",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ID-002",
      tenantId: "dhandai-textiles",
      partyCode: "PRT-S001",
      partyName: "Surat Yarn Mills Pvt Ltd",
      partyType: "Supplier",
      contactPerson: "Suresh Sharma",
      mobileNumber: "+91 98765 43210",
      gstNumber: "24AAIJY1234K1Z5",
      panNumber: "AAIJY1234K",
      address: "Ring Road Yarn Market, Surat, Gujarat - 395002",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-RF-001",
      tenantId: "royal-fabrics",
      partyCode: "PRT-RF-B1",
      partyName: "Royal Fabrics & Weaving (Own Firm)",
      partyType: "Buyer",
      contactPerson: "Suresh Sharma",
      mobileNumber: "+91 98765 43210",
      gstNumber: "24AAACR1234M1Z8",
      panNumber: "AAACR1234M",
      address: "Ring Road Textile Market, Surat, Gujarat - 395002",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-RF-002",
      tenantId: "royal-fabrics",
      partyCode: "PRT-RF-S1",
      partyName: "Surat Silk & Filament Yarn Corp",
      partyType: "Supplier",
      contactPerson: "Kirtan Patel",
      mobileNumber: "+91 98220 99887",
      gstNumber: "24AAACS9988K1Z2",
      panNumber: "AAACS9988K",
      address: "Silk Complex, Surat - 395003",
      openingBalance: 0,
      activeStatus: "Active"
    },
    {
      id: "PRT-ST-001",
      tenantId: "silverthread-denim",
      partyCode: "PRT-ST-B1",
      partyName: "SilverThread Denim Mill",
      partyType: "Buyer",
      contactPerson: "Rajesh Varma",
      mobileNumber: "+91 91234 56789",
      gstNumber: "27AAACS4321L1Z9",
      panNumber: "AAACS4321L",
      address: "Powerloom Zone, Bhiwandi - 421302",
      openingBalance: 0,
      activeStatus: "Active"
    }
  ];

  // 5. LABOUR (Multi-Tenant Scoped)
  const seededLabour: Labour[] = [
    { id: "LAB-ID-001", tenantId: "dhandai-textiles", labourId: "LAB-001", fullName: "Mahadev Koli", labourType: "Weaver", linkedFactoryId: "FAC-ID-001", linkedFactoryName: "Dhandai Textiles (Main Shed)", linkedLoomId: "LOM-ID-001", linkedLoomNumber: "L-001, L-002", mobileNumber: "+91 98230 11223", joiningDate: "2022-06-01", rateType: "Per Metre", rate: 8.5, activeStatus: "Active" },
    { id: "LAB-ID-002", tenantId: "dhandai-textiles", labourId: "LAB-002", fullName: "Ganesh Mane", labourType: "Weaver", linkedFactoryId: "FAC-ID-001", linkedFactoryName: "Dhandai Textiles (Main Shed)", linkedLoomId: "LOM-ID-003", linkedLoomNumber: "L-003, L-004", mobileNumber: "+91 98230 22334", joiningDate: "2022-08-15", rateType: "Per Metre", rate: 8.5, activeStatus: "Active" },
    // Royal Fabrics Labourers
    { id: "LAB-RF-001", tenantId: "royal-fabrics", labourId: "LAB-RF-01", fullName: "Jignesh Patel", labourType: "Weaver", linkedFactoryId: "FAC-ID-RF1", linkedFactoryName: "Royal Jacquard Weaving Plant", linkedLoomId: "LOM-RF-ID-001", linkedLoomNumber: "RF-JAC-001, RF-JAC-002", mobileNumber: "+91 98765 88990", joiningDate: "2021-03-10", rateType: "Per Metre", rate: 12.0, activeStatus: "Active" },
    { id: "LAB-RF-002", tenantId: "royal-fabrics", labourId: "LAB-RF-02", fullName: "Ramesh Bhai", labourType: "Helper", linkedFactoryId: "FAC-ID-RF1", linkedFactoryName: "Royal Jacquard Weaving Plant", mobileNumber: "+91 98765 77665", joiningDate: "2023-02-01", rateType: "Daily", rate: 700, activeStatus: "Active" }
  ];

  // 6. YARNS (Multi-Tenant Scoped)
  const seededYarns: Yarn[] = [
    { id: "YRN-ID-001", tenantId: "dhandai-textiles", yarnCode: "YRN-001", yarnName: "40s Cotton Warp", material: "Cotton", count: "40s", brand: "Vardhman", color: "Natural", unit: "KG", rate: 280, gst: 12, status: "Active" },
    { id: "YRN-RF-001", tenantId: "royal-fabrics", yarnCode: "YRN-RF-01", yarnName: "80s Filament Silk Yarn", material: "Viscose", count: "80s", brand: "Surat Silk", color: "Golden Yellow", unit: "KG", rate: 650, gst: 12, status: "Active" },
    { id: "YRN-ST-001", tenantId: "silverthread-denim", yarnCode: "YRN-ST-01", yarnName: "10s Indigo Slub Warp", material: "Cotton", count: "10s", brand: "Raymond", color: "Deep Indigo", unit: "KG", rate: 320, gst: 12, status: "Active" }
  ];

  const seededShifts: Shift[] = [
    { id: "SHF-ID-001", tenantId: "dhandai-textiles", shiftCode: "SHF-001", shiftName: "Day Shift", startTime: "08:00 AM", endTime: "08:00 PM", breakTime: "60 Min", status: "Active" },
    { id: "SHF-ID-002", tenantId: "dhandai-textiles", shiftCode: "SHF-002", shiftName: "Night Shift", startTime: "08:00 PM", endTime: "08:00 AM", breakTime: "60 Min", status: "Active" }
  ];

  const seededWarehouses: Warehouse[] = [
    { id: "WH-ID-001", tenantId: "dhandai-textiles", warehouseCode: "WH-001", warehouseName: "Dhandai Yarn Store", location: "Main Factory", type: "Yarn", status: "Active" },
    { id: "WH-RF-001", tenantId: "royal-fabrics", warehouseCode: "WH-RF-01", warehouseName: "Royal Jacquard Yarn & Silk Store", location: "Surat Market", type: "Yarn", status: "Active" }
  ];

  const seededUnits: Unit[] = [
    { id: "UOM-ID-001", code: "KG", name: "Kilogram" },
    { id: "UOM-ID-002", code: "MTR", name: "Meter" },
    { id: "UOM-ID-003", code: "CNE", name: "Cone" },
    { id: "UOM-ID-004", code: "BM", name: "Beam" }
  ];

  const seededExpenseCats: ExpenseCategory[] = [
    { id: "EXP-01", categoryCode: "EXP-ELEC", categoryName: "Electricity", description: "Loom motors power consumption bills", status: "Active" },
    { id: "EXP-02", categoryCode: "EXP-SAL", categoryName: "Salary", description: "Supervisors and staff payrolls", status: "Active" }
  ];

  const seededSizingMills: SizingMill[] = [
    { id: "SZM-ID-001", tenantId: "dhandai-textiles", millCode: "SZM-001", millName: "Sumit Sizing Works", contactPerson: "Sumit Patil", mobileNumber: "+91 99220 11223", address: "Gat No. 14, Sizing Zone, Ichalkaranji", activeStatus: "Active" },
    { id: "SZM-RF-001", tenantId: "royal-fabrics", millCode: "SZM-RF-01", millName: "Surat Jacquard Warping & Sizing", contactPerson: "Ketan Patel", mobileNumber: "+91 98220 55443", address: "GIDC Sizing Zone, Surat", activeStatus: "Active" }
  ];

  return {
    factories: seededFactories,
    looms: seededLooms,
    fabrics: [],
    parties: [],
    yarns: [],
    shifts: [],
    warehouses: [],
    units: seededUnits,
    labour: [],
    employees: [],
    expenseCategories: [],
    sizingMills: []
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
      sizingMills: [],

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

      // CRUD: Sizing Mills
      createSizingMill: (mill) => set((state) => ({ sizingMills: [mill, ...state.sizingMills] })),
      updateSizingMill: (mill) =>
        set((state) => ({
          sizingMills: state.sizingMills.map((m) => (m.id === mill.id ? mill : m))
        })),
      deleteSizingMill: (id) =>
        set((state) => ({
          sizingMills: state.sizingMills.filter((m) => m.id !== id)
        })),
    }),
    {
      name: "dks-textile-erp-masters-v5",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          state.initializeSeeds();
        }
      }
    }
  )
);
