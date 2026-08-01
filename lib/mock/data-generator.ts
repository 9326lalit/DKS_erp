// Deterministic Multi-Tenant Mock Data Generator for Textile Manufacturing ERP
// Supports Ichalkaranji, Surat, Bhiwandi, and Coimbatore Clusters

export interface Loom {
  id: string;
  name: string;
  type: "Airjet" | "Rapier" | "Jacquard" | "Shuttleless";
  rpm: number;
  widthCm: number;
  status: "running" | "idle" | "maintenance";
  efficiency: number; // percentage
  currentBeamId: string | null;
  assignedWeaverId: string | null;
}

export interface Employee {
  id: string;
  name: string;
  role: "weaver" | "jobber" | "helper" | "folder" | "supervisor" | "manager" | "accountant";
  shift: "Morning" | "Night";
  phone: string;
  salary: number; // INR
  attendancePercentage: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  gstNumber: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  gstNumber: string;
}

export interface Beam {
  id: string;
  beamNumber: string;
  yarnType: string;
  count: string;
  ends: number;
  meters: number;
  weightKg: number;
  lotNumber: string;
  status: "sizing" | "available" | "running" | "completed";
  assignedLoomId: string | null;
  sizingDate: string;
}

export interface ProductionRecord {
  id: string;
  loomId: string;
  beamId: string;
  date: string;
  shift: "Morning" | "Night";
  weaverId: string;
  metersProduced: number;
  efficiency: number;
  picks: number;
  defectsMeters: number;
}

export interface SalesRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  fabricType: string;
  meters: number;
  ratePerMeter: number;
  totalAmount: number;
  status: "draft" | "dispatched" | "paid";
}

export interface ElectricityBill {
  id: string;
  month: string;
  unitsConsumed: number;
  amount: number;
  dueDate: string;
  status: "paid";
}

export interface ExpenseRecord {
  id: string;
  month: string;
  category: "Repairs" | "Transport" | "Salary" | "Electricity" | "Sizing" | "Yarn Purchase" | "Stores & Spares" | "Miscellaneous";
  amount: number;
  description: string;
}

export interface YarnLot {
  lotNumber: string;
  supplierId: string;
  yarnType: string;
  count: string;
  totalWeightKg: number;
  receivedDate: string;
  balanceWeightKg: number;
  status: "active" | "exhausted";
}

export interface YarnType {
  id: string;
  name: string;
  count: string;
  blend: string;
  description: string;
}

export interface FabricType {
  id: string;
  name: string;
  construction: string;
  widthInches: number;
  weightGsm: number;
  description: string;
}

// Multi-Tenant Configurations
const TENANT_PROFILES: Record<string, {
  loomCount: number;
  defaultType: Loom["type"];
  city: string;
  prefix: string;
  names: string[];
  suppliers: string[];
  customers: string[];
  counts: { count: string; type: string }[];
  qualities: { name: string; quality: string; width: number; gsm: number }[];
}> = {
  "dhandai-textiles": {
    loomCount: 24,
    defaultType: "Airjet",
    city: "Ichalkaranji",
    prefix: "DT",
    names: ["Bhushan Khairnar", "Sumit Patil", "Sanjay Patil", "Rahul Shinde", "Vijay Deshmukh", "Nilesh More", "Sachin Kulkarni", "Prashant Joshi", "Aniket Gaikwad", "Ganesh Kadam"],
    suppliers: ["Surat Yarn Mills Pvt Ltd", "Ichalkaranji Cotton Suppliers", "Reliance Yarn Industries", "Vardhman Textiles Ltd", "Sangam Spinning Mills"],
    customers: ["Dhandai Fabrics", "Balaji Fabrics Pvt Ltd", "Krishna Fabrics Ichalkaranji", "Vikas Trading Co.", "Dhanlaxmi Fab"],
    counts: [
      { count: "40s Combed", type: "Cotton Warp" },
      { count: "30s Carded", type: "Cotton Weft" },
      { count: "60s Combed", type: "Cotton Fine Warp" }
    ],
    qualities: [
      { name: "Cotton Grey Cambric 60x60 / 132x72", quality: "60s x 60s / 132 x 72", width: 63, gsm: 80 },
      { name: "Cotton Grey Poplin 40x40 / 92x64", quality: "40s x 40s / 92 x 64", width: 50, gsm: 95 }
    ]
  },
  "royal-fabrics": {
    loomCount: 36,
    defaultType: "Jacquard",
    city: "Surat",
    prefix: "RF",
    names: ["Rajesh Shah", "Jignesh Patel", "Manish Mehta", "Bhavin Kapadia", "Ketan Solanki", "Hardik Trivedi", "Paresh Desai"],
    suppliers: ["Surat Synthetic Yarn Hub", "Garden Silk Mills", "Filatex India Ltd", "Sumilon Polyester", "Alok Industries"],
    customers: ["Surat Saree Centre", "Jay Ambe Creation", "Mahavir Dress Material", "Vipul Silk Store", "Radhe Tex"],
    counts: [
      { count: "80D Polyester", type: "Polyester Filament" },
      { count: "150D Texturised", type: "Polyester Weft" },
      { count: "2/40s Viscose", type: "Viscose Blend" }
    ],
    qualities: [
      { name: "Polyester Jacquard Satin 80D x 150D", quality: "80D x 150D / 120 x 76", width: 48, gsm: 105 },
      { name: "Synthetic Brocade Fancy 150D x 150D", quality: "150D x 150D / 144 x 80", width: 54, gsm: 135 }
    ]
  },
  "silverthread-denim": {
    loomCount: 18,
    defaultType: "Shuttleless",
    city: "Bhiwandi",
    prefix: "ST",
    names: ["Amit Patel", "Deepak Sharma", "Rakesh Verma", "Vikram Singh", "Sunil Yadav", "Manoj Gupta"],
    suppliers: ["Raymond Denim Yarn", "Arvind Mills Yarn Division", "Mafatlal Industries", "Nahar Indigo Spun"],
    customers: ["Bhiwandi Garments Co", "Mumbai Jeans Hub", "Metro Denim Traders", "Superfit Jeans Manufacturer"],
    counts: [
      { count: "10s OE Indigo", type: "Indigo Denim Warp" },
      { count: "12s Carded Slub", type: "Slub Weft" },
      { count: "2/20s Heavy Cotton", type: "Twilled Cotton" }
    ],
    qualities: [
      { name: "Indigo Denim Twill 14oz 10x10", quality: "10s Indigo x 10s / 64 x 42", width: 60, gsm: 380 },
      { name: "Heavy Cotton Canvas 10x10 / 48x40", quality: "10s x 10s / 48 x 40", width: 58, gsm: 320 }
    ]
  },
  "mahadev-weaving": {
    loomCount: 30,
    defaultType: "Airjet",
    city: "Coimbatore",
    prefix: "MW",
    names: ["Suresh Kumar", "Karthik Subramanian", "Ramesh Natarajan", "Venkatesh Iyer", "Sundar Rajan", "Prakash Swamy"],
    suppliers: ["Coimbatore Super Spun", "Lakshmi Mills Yarn", "KPR Mill Ltd", "Sri Ramakrishna Mills"],
    customers: ["Global Export Fabrics Ltd", "Coimbatore Fine Cottons", "EuroBed Linen Exporters", "Texcorp Singapore"],
    counts: [
      { count: "80s Superfine Combed", type: "Superfine Cotton" },
      { count: "100s Gassed Mercerized", type: "Ultra Fine Combed" },
      { count: "60s Egyptian Cotton", type: "Long Staple Cotton" }
    ],
    qualities: [
      { name: "Superfine Combed Sheeting 80x80 / 180x120", quality: "80s x 80s / 180 x 120", width: 110, gsm: 115 },
      { name: "Export Luxury Percale 100x100 / 220x140", quality: "100s x 100s / 220 x 140", width: 120, gsm: 95 }
    ]
  }
};

let seedValue = 12345;
function random() {
  const x = Math.sin(seedValue++) * 10000;
  return x - Math.floor(x);
}

function getRandomRange(min: number, max: number): number {
  return min + random() * (max - min);
}

export function generateMockDataForTenant(tenantId: string = "dhandai-textiles") {
  seedValue = 54321; // Reset seed
  const profile = TENANT_PROFILES[tenantId] || TENANT_PROFILES["dhandai-textiles"];

  // 1. Employees
  const employees: Employee[] = [];
  for (let i = 1; i <= 30; i++) {
    let role: Employee["role"] = "weaver";
    if (i === 1) role = "manager";
    else if (i === 2) role = "accountant";
    else if (i <= 20) role = "weaver";
    else if (i <= 23) role = "jobber";
    else if (i <= 26) role = "helper";
    else if (i <= 28) role = "folder";
    else role = "supervisor";

    const shift = i % 2 === 0 ? "Morning" : "Night";
    let salary = 15000;
    if (role === "manager") salary = 45000;
    else if (role === "accountant") salary = 28000;
    else if (role === "supervisor") salary = 24000;
    else if (role === "jobber") salary = 20000;

    employees.push({
      id: `${profile.prefix}-EMP-${String(i).padStart(3, "0")}`,
      name: profile.names[i % profile.names.length] || `${profile.city} Staff ${i}`,
      role,
      shift,
      phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
      salary,
      attendancePercentage: Math.round(getRandomRange(85, 99))
    });
  }

  // 2. Suppliers
  const suppliers: Supplier[] = profile.suppliers.map((name, i) => ({
    id: `${profile.prefix}-SUP-${String(i + 1).padStart(3, "0")}`,
    name,
    contactPerson: profile.names[i % profile.names.length],
    phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
    email: `sales@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    city: profile.city,
    gstNumber: `27${name.substring(0, 3).toUpperCase()}${Math.floor(getRandomRange(1000, 9999))}K1Z${i}`
  }));

  // 3. Customers
  const customers: Customer[] = profile.customers.map((name, i) => ({
    id: `${profile.prefix}-CUST-${String(i + 1).padStart(3, "0")}`,
    name,
    contactPerson: profile.names[(i + 2) % profile.names.length],
    phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
    email: `buy@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    city: profile.city,
    gstNumber: `27${name.substring(0, 3).toUpperCase()}${Math.floor(getRandomRange(1000, 9999))}C1Z${i}`
  }));

  // 4. Yarn Types
  const yarnTypes: YarnType[] = profile.counts.map((c, i) => ({
    id: `${profile.prefix}-YT-${i + 1}`,
    name: `${c.count} ${c.type}`,
    count: c.count,
    blend: c.type,
    description: `High tensile ${c.count} yarn for ${profile.defaultType} looms`
  }));

  // 5. Fabric Types
  const fabricTypes: FabricType[] = profile.qualities.map((q, i) => ({
    id: `${profile.prefix}-FT-${i + 1}`,
    name: q.name,
    construction: q.quality,
    widthInches: q.width,
    weightGsm: q.gsm,
    description: `${q.name} woven on high-speed ${profile.defaultType} looms`
  }));

  // 6. Yarn Lots
  const yarnLots: YarnLot[] = [];
  for (let i = 1; i <= 8; i++) {
    const sup = suppliers[i % suppliers.length];
    const yt = yarnTypes[i % yarnTypes.length];
    const totalWeight = Math.round(getRandomRange(3000, 8000));
    yarnLots.push({
      lotNumber: `${profile.prefix}-LOT-2026-${String(i).padStart(3, "0")}`,
      supplierId: sup.id,
      yarnType: yt.name,
      count: yt.count,
      totalWeightKg: totalWeight,
      balanceWeightKg: Math.round(totalWeight * getRandomRange(0.2, 0.8)),
      receivedDate: `2026-07-${String(Math.floor(getRandomRange(1, 28))).padStart(2, "0")}`,
      status: "active"
    });
  }

  // 7. Looms
  const looms: Loom[] = [];
  const weavers = employees.filter((e) => e.role === "weaver");
  for (let i = 1; i <= profile.loomCount; i++) {
    const isRunning = i % 5 !== 0;
    const isMaint = i % 10 === 0;
    looms.push({
      id: `${profile.prefix}-L-${String(i).padStart(2, "0")}`,
      name: `${profile.prefix} Loom ${i}`,
      type: profile.defaultType,
      rpm: profile.defaultType === "Airjet" ? 680 : profile.defaultType === "Jacquard" ? 520 : 450,
      widthCm: 220,
      status: isMaint ? "maintenance" : isRunning ? "running" : "idle",
      efficiency: isMaint ? 0 : isRunning ? Math.round(getRandomRange(85, 96)) : 0,
      currentBeamId: isRunning ? `${profile.prefix}-BM-${String(i).padStart(3, "0")}` : null,
      assignedWeaverId: weavers[i % weavers.length]?.id || null
    });
  }

  // 8. Beams
  const beams: Beam[] = [];
  for (let i = 1; i <= profile.loomCount + 5; i++) {
    const loom = looms[i - 1];
    const yt = yarnTypes[i % yarnTypes.length];
    const lot = yarnLots[i % yarnLots.length];
    beams.push({
      id: `${profile.prefix}-BM-${String(i).padStart(3, "0")}`,
      beamNumber: `BM-${profile.prefix}-${2000 + i}`,
      yarnType: yt.name,
      count: yt.count,
      ends: 4800,
      meters: 2200,
      weightKg: 280,
      lotNumber: lot.lotNumber,
      status: loom?.status === "running" ? "running" : i % 2 === 0 ? "available" : "sizing",
      assignedLoomId: loom?.status === "running" ? loom.id : null,
      sizingDate: `2026-07-${String(Math.floor(getRandomRange(10, 28))).padStart(2, "0")}`
    });
  }

  // 9. Production Records (Last 14 days)
  const productionRecords: ProductionRecord[] = [];
  let prodId = 1;
  for (let d = 1; d <= 14; d++) {
    const dateStr = `2026-07-${String(d).padStart(2, "0")}`;
    looms.forEach((loom, idx) => {
      if (loom.status !== "maintenance") {
        const weaver = weavers[idx % weavers.length];
        productionRecords.push({
          id: `${profile.prefix}-PRD-${String(prodId++).padStart(4, "0")}`,
          loomId: loom.id,
          beamId: loom.currentBeamId || `${profile.prefix}-BM-001`,
          date: dateStr,
          shift: idx % 2 === 0 ? "Morning" : "Night",
          weaverId: weaver?.id || "EMP-001",
          metersProduced: Math.round(getRandomRange(140, 220)),
          efficiency: Math.round(getRandomRange(84, 96)),
          picks: Math.round(getRandomRange(90000, 140000)),
          defectsMeters: Math.round(getRandomRange(1, 4))
        });
      }
    });
  }

  // 10. Sales Records
  const salesRecords: SalesRecord[] = [];
  for (let i = 1; i <= 15; i++) {
    const cust = customers[i % customers.length];
    const fab = fabricTypes[i % fabricTypes.length];
    const meters = Math.round(getRandomRange(2000, 8000));
    const rate = Math.round(getRandomRange(45, 120));
    salesRecords.push({
      id: `${profile.prefix}-SLS-${String(i).padStart(4, "0")}`,
      invoiceNumber: `INV-${profile.prefix}-2026-${String(i).padStart(3, "0")}`,
      date: `2026-07-${String(Math.floor(getRandomRange(1, 28))).padStart(2, "0")}`,
      customerId: cust.id,
      fabricType: fab.name,
      meters,
      ratePerMeter: rate,
      totalAmount: meters * rate,
      status: i % 3 === 0 ? "draft" : i % 2 === 0 ? "dispatched" : "paid"
    });
  }

  // 11. Electricity Bills
  const electricityBills: ElectricityBill[] = [
    { id: `${profile.prefix}-EB-01`, month: "2026-04", unitsConsumed: 48000, amount: 480000, dueDate: "2026-05-15", status: "paid" },
    { id: `${profile.prefix}-EB-02`, month: "2026-05", unitsConsumed: 52000, amount: 520000, dueDate: "2026-06-15", status: "paid" },
    { id: `${profile.prefix}-EB-03`, month: "2026-06", unitsConsumed: 51000, amount: 510000, dueDate: "2026-07-15", status: "paid" }
  ];

  // 12. Expenses
  const expenseCategories: ExpenseRecord["category"][] = [
    "Yarn Purchase", "Electricity", "Salary", "Sizing", "Repairs", "Transport", "Stores & Spares"
  ];
  const expenseRecords: ExpenseRecord[] = [];
  let expId = 1;
  ["2026-05", "2026-06", "2026-07"].forEach((month) => {
    expenseCategories.forEach((cat) => {
      expenseRecords.push({
        id: `${profile.prefix}-EXP-${String(expId++).padStart(4, "0")}`,
        month,
        category: cat,
        amount: Math.round(getRandomRange(20000, cat === "Yarn Purchase" ? 1800000 : 400000)),
        description: `${cat} operational expense for ${profile.city} mill`
      });
    });
  });

  return {
    employees,
    suppliers,
    customers,
    yarnTypes,
    fabricTypes,
    yarnLots,
    beams,
    looms,
    productionRecords,
    salesRecords,
    electricityBills,
    expenseRecords
  };
}

// Multi-Tenant Cached Mock Data Instances
const tenantCache = new Map<string, ReturnType<typeof generateMockDataForTenant>>();

export function getMockData(tenantId?: string) {
  const targetId = tenantId || "dhandai-textiles";
  if (!tenantCache.has(targetId)) {
    tenantCache.set(targetId, generateMockDataForTenant(targetId));
  }
  return tenantCache.get(targetId)!;
}

export function resetMockData(tenantId?: string) {
  if (tenantId) {
    tenantCache.delete(tenantId);
  } else {
    tenantCache.clear();
  }
  return getMockData(tenantId);
}
