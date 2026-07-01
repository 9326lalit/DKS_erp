// Deterministic Mock Data Generator for Textile Manufacturing ERP
// Ichalkaranji Weaving Cluster (Kolhapur, Maharashtra)

export interface Loom {
  id: string;
  name: string;
  type: "Airjet" | "Rapier";
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
  count: string; // e.g. 40s Combed, 30s Carded
  ends: number; // number of warp threads
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
  efficiency: number; // percentage
  picks: number; // loom picks count
  defectsMeters: number;
}

export interface SalesRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  fabricType: string;
  meters: number;
  ratePerMeter: number; // INR
  totalAmount: number; // INR
  status: "draft" | "dispatched" | "paid";
}

export interface ElectricityBill {
  id: string;
  month: string; // YYYY-MM
  unitsConsumed: number;
  amount: number;
  dueDate: string;
  status: "paid";
}

export interface ExpenseRecord {
  id: string;
  month: string; // YYYY-MM
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
  construction: string; // e.g. 60x60/132x72
  widthInches: number;
  weightGsm: number;
  description: string;
}

// ----------------------------------------------------
// Data Dictionaries for Realistic Generating
// ----------------------------------------------------

const MAHARASHTRA_NAMES = [
  "Yogesh Jakhotiya", "Amit Khairnar", "Sanjay Patil", "Rahul Shinde", "Vijay Deshmukh",
  "Nilesh More", "Sachin Kulkarni", "Prashant Joshi", "Aniket Gaikwad", "Ganesh Kadam",
  "Rajendra Chavan", "Santosh Mane", "Dinesh Pawar", "Sandip Sawant", "Vikas Kamble",
  "Abhijit Mohite", "Mahesh Jadhav", "Tushar Ghorpade", "Satish Naik", "Deepak Salunkhe",
  "Ramesh Thorat", "Sunil Kurade", "Laxman Chougule", "Appasaheb Awade", "Prakash Awade",
  "Pratap Bhosale", "Babasaheb Ghatage", "Shivaji Shirke", "Balasaheb Dhere", "Tanaji Lad",
  "Kiran Mule", "Arjun Jagtap", "Siddharth Dinde", "Vinayak Badadare", "Suresh Magdum",
  "Ravindra Sutar", "Pandurang Lohar", "Dattatray Kumbhar", "Maruti Mali", "Bhagwan Patil",
  "Sadashiv Gurav", "Kondiba Shelke", "Jaysingrao Halase", "Babgonda Patil", "Subhash Shenavi",
  "Anna Shinde", "Bapu Khot", "Vishwasrao Naik", "Jaywantrao Awale", "Raju Shetti"
];

const SUPPLIER_NAMES = [
  "Jakhotiya Spinners Pvt Ltd", "Ganesh Yarn Trading", "Sangam Spinning Mills", "Vardhman Textiles Ltd",
  "Indocount Industries", "Welspun India Yarn Dept", "Oswal Spinning Corp", "Nahar Spinning Mills",
  "RSWM Limited", "Sutlej Textiles", "Banswara Syntex", "Nitry Yarn Traders",
  "Ambika Cotton Mills", "Super Spinning Mills", "Pee Vee Textiles", "Loyal Textile Mills",
  "Ichalkaranji Co-op Spinners", "Dattajirao Kadam Spinners", "Kolhapur Zilla Sahakari Spinning",
  "Yashwant Sahakari Soot Girni"
];

const CUSTOMER_NAMES = [
  "Aashish Fabrics", "Balaji Textiles Ichalkaranji", "Krishna Weaving & Trading", "Vikas Trading Co.",
  "Dhanlaxmi Fab", "Ambika Processors Client", "Shree Ram Textiles", "Mahavir Fabrics",
  "Gokul Grey Sales", "Samarth Textile Agency", "Maruti Garments", "Mayur Fabrics Agency",
  "Rajararam Cotton Mills", "Panchganga Weaving Corp", "Deccan Processors Agent"
];

const YARN_COUNTS = [
  { count: "40s Combed", type: "Cotton Warp" },
  { count: "30s Carded", type: "Cotton Weft" },
  { count: "60s Combed", type: "Cotton Fine Warp" },
  { count: "80s Superfine", type: "Cotton Extra Fine" },
  { count: "2/40s Poly Cotton", type: "PC Blend" },
  { count: "30s PC", type: "PC Blend Weft" },
  { count: "20s OE", type: "Coarse Cotton" },
  { count: "2/20s Carded", type: "Double Cotton" },
  { count: "80D Polyester", type: "Polyester Filament" },
  { count: "150D Polyester Rotofit", type: "Polyester Texturised" }
];

const FABRIC_QUALITIES = [
  { name: "Cotton Grey Cambric 60x60 / 132x72", quality: "60s x 60s / 132 x 72", width: 63, gsm: 80 },
  { name: "Cotton Grey Poplin 40x40 / 92x64", quality: "40s x 40s / 92 x 64", width: 50, gsm: 95 },
  { name: "Cotton Grey Müll 80x80 / 92x80", quality: "80s x 80s / 92 x 80", width: 44, gsm: 55 },
  { name: "Cotton Grey Sheeting 20x20 / 60x60", quality: "20s x 20s / 60 x 60", width: 60, gsm: 140 },
  { name: "Cotton Grey Twill 30x30 / 124x64", quality: "30s x 30s / 124 x 64", width: 58, gsm: 160 },
  { name: "Cotton Grey Satin 40x40 / 132x80", quality: "40s x 40s / 132 x 80", width: 63, gsm: 125 },
  { name: "PC Blend Shirting 2/40x30PC / 88x64", quality: "2/40s PC x 30s PC / 88 x 64", width: 58, gsm: 110 },
  { name: "PC Twill 2/20x20 / 108x56", quality: "2/20s Cotton x 20s Cotton / 108 x 56", width: 63, gsm: 195 },
  { name: "Polyester Grey Satin 80D x 150D", quality: "80D x 150D / 120 x 76", width: 48, gsm: 105 },
  { name: "Cotton Grey Canvas 10x10 / 48x40", quality: "10s x 10s / 48 x 40", width: 36, gsm: 220 }
];

// Helper to seed deterministically
let seedValue = 12345;
function random() {
  const x = Math.sin(seedValue++) * 10000;
  return x - Math.floor(x);
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function getRandomRange(min: number, max: number): number {
  return min + random() * (max - min);
}

// ----------------------------------------------------
// GENERATORS
// ----------------------------------------------------

export function generateMockData() {
  seedValue = 54321; // Reset seed for consistent generation

  // 1. Employees (50)
  const employees: Employee[] = [];
  const roles: Employee["role"][] = [
    "weaver", "weaver", "weaver", "weaver", "weaver", // Heavy weight on weavers
    "jobber", "helper", "folder", "supervisor"
  ];
  
  for (let i = 1; i <= 50; i++) {
    let role: Employee["role"] = "weaver";
    if (i === 1) role = "manager";
    else if (i === 2) role = "accountant";
    else if (i <= 35) role = "weaver";
    else if (i <= 38) role = "jobber"; // Jobbers look after looms
    else if (i <= 42) role = "helper";
    else if (i <= 47) role = "folder";
    else role = "supervisor";

    const shift = i % 2 === 0 ? "Morning" : "Night";
    let salary = 14000; // Weavers base
    if (role === "manager") salary = 40000;
    else if (role === "accountant") salary = 25000;
    else if (role === "supervisor") salary = 22000;
    else if (role === "jobber") salary = 18000;
    else if (role === "folder") salary = 13000;
    else if (role === "helper") salary = 11000;

    // Add some random variation to salaries
    salary += Math.floor(getRandomRange(-1000, 2000));

    employees.push({
      id: `EMP-${String(i).padStart(3, "0")}`,
      name: MAHARASHTRA_NAMES[i - 1] || `Employee ${i}`,
      role,
      shift,
      phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
      salary,
      attendancePercentage: Math.round(getRandomRange(82, 99))
    });
  }

  // 2. Suppliers (20)
  const suppliers: Supplier[] = SUPPLIER_NAMES.map((name, i) => {
    const contact = MAHARASHTRA_NAMES[(i * 2) % MAHARASHTRA_NAMES.length];
    return {
      id: `SUP-${String(i + 1).padStart(3, "0")}`,
      name,
      contactPerson: contact,
      phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
      email: `sales@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      city: i % 4 === 0 ? "Ichalkaranji" : i % 4 === 1 ? "Kolhapur" : i % 4 === 2 ? "Bhiwandi" : "Mumbai",
      gstNumber: `27${name.substring(0, 3).toUpperCase()}${Math.floor(getRandomRange(1000, 9999))}K1Z${i}`
    };
  });

  // 3. Customers (15)
  const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => {
    const contact = MAHARASHTRA_NAMES[(i * 3) % MAHARASHTRA_NAMES.length];
    return {
      id: `CUST-${String(i + 1).padStart(3, "0")}`,
      name,
      contactPerson: contact,
      phone: `+91 9${Math.floor(getRandomRange(100000000, 999999999))}`,
      email: `purchase@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      city: i % 3 === 0 ? "Ichalkaranji" : i % 3 === 1 ? "Surat" : "Ahmedabad",
      gstNumber: `24${name.substring(0, 3).toUpperCase()}${Math.floor(getRandomRange(1000, 9999))}M2Z${i}`
    };
  });

  // 4. Yarn Types (10)
  const yarnTypes: YarnType[] = YARN_COUNTS.map((yc, i) => ({
    id: `YARN-${String(i + 1).padStart(2, "0")}`,
    name: yc.type,
    count: yc.count,
    blend: yc.type.includes("PC") ? "65% Poly / 35% Cotton" : yc.type.includes("Polyester") ? "100% Polyester" : "100% Cotton",
    description: `${yc.count} grade suitable for textile weaving operations.`
  }));

  // 5. Fabric Types (10)
  const fabricTypes: FabricType[] = FABRIC_QUALITIES.map((fq, i) => ({
    id: `FAB-${String(i + 1).padStart(2, "0")}`,
    name: fq.name,
    construction: fq.quality,
    widthInches: fq.width,
    weightGsm: fq.gsm,
    description: `High durability grey cloth used for general processing and export.`
  }));

  // 6. Yarn Lots (20)
  const yarnLots: YarnLot[] = [];
  for (let i = 1; i <= 20; i++) {
    const supplier = suppliers[(i - 1) % suppliers.length];
    const yarn = yarnTypes[(i * 3) % yarnTypes.length];
    const totalWeight = Math.round(getRandomRange(20, 50)) * 100; // 2000 to 5000 kg
    const balanceWeight = i <= 5 ? 0 : Math.round(getRandomRange(0.05, 0.7) * totalWeight);
    
    yarnLots.push({
      lotNumber: `LOT-2026-${String(i).padStart(3, "0")}`,
      supplierId: supplier.id,
      yarnType: yarn.name,
      count: yarn.count,
      totalWeightKg: totalWeight,
      receivedDate: `2026-05-${String(Math.floor(getRandomRange(1, 28))).padStart(2, "0")}`,
      balanceWeightKg: balanceWeight,
      status: balanceWeight === 0 ? "exhausted" : "active"
    });
  }

  // 7. Beams (100)
  const beams: Beam[] = [];
  const beamStatuses: Beam["status"][] = ["running", "available", "completed", "sizing"];
  
  for (let i = 1; i <= 100; i++) {
    const yarn = yarnTypes[i % yarnTypes.length];
    const lot = yarnLots[i % yarnLots.length];
    const ends = Math.round(getRandomRange(40, 75)) * 100; // 4000 to 7500 warp threads
    const meters = Math.round(getRandomRange(10, 24)) * 100; // 1000 to 2400 meters
    const weightKg = Math.round(meters * 0.14); // 0.14 kg per meter avg warp weight
    
    // Status distribution
    let status: Beam["status"] = "available";
    if (i <= 30) status = "running"; // 30 currently on looms
    else if (i <= 65) status = "completed"; // used up
    else if (i <= 85) status = "available"; // ready to mount
    else status = "sizing"; // currently in sizing house

    beams.push({
      id: `BM-${String(i).padStart(4, "0")}`,
      beamNumber: `BEAM-${String(i).padStart(4, "0")}`,
      yarnType: yarn.name,
      count: yarn.count,
      ends,
      meters,
      weightKg,
      lotNumber: lot.lotNumber,
      status,
      assignedLoomId: null, // Will map during looms setup
      sizingDate: `2026-06-${String(Math.floor(getRandomRange(1, 15))).padStart(2, "0")}`
    });
  }

  // 8. Looms (36)
  const looms: Loom[] = [];
  const weavers = employees.filter((e) => e.role === "weaver");
  
  // Keep track of which beams are running
  const runningBeams = beams.filter((b) => b.status === "running");
  
  for (let i = 1; i <= 36; i++) {
    // 24 Airjets, 12 Rapiers
    const type = i <= 24 ? "Airjet" : "Rapier";
    const rpm = type === "Airjet" ? Math.floor(getRandomRange(600, 720)) : Math.floor(getRandomRange(400, 480));
    
    // Width distribution (in cm)
    let widthCm = 190;
    if (i % 6 === 0) widthCm = 340;
    else if (i % 3 === 0) widthCm = 280;
    else if (i % 2 === 0) widthCm = 220;

    // Status: 30 running, 4 idle, 2 maintenance
    let status: Loom["status"] = "running";
    if (i === 12 || i === 25 || i === 31 || i === 35) status = "idle";
    else if (i === 5 || i === 18) status = "maintenance";

    const currentBeam = status === "running" ? runningBeams[i % runningBeams.length] : null;
    const weaver = status === "running" ? weavers[i % weavers.length] : null;
    
    const loomId = `L-${String(i).padStart(2, "0")}`;

    if (currentBeam) {
      currentBeam.assignedLoomId = loomId;
    }

    looms.push({
      id: loomId,
      name: `Loom ${String(i).padStart(2, "0")}`,
      type,
      rpm,
      widthCm,
      status,
      efficiency: status === "running" ? Math.round(getRandomRange(84, 96)) : 0,
      currentBeamId: currentBeam ? currentBeam.id : null,
      assignedWeaverId: weaver ? weaver.id : null
    });
  }

  // 9. Production Records (500)
  const productionRecords: ProductionRecord[] = [];
  let recordId = 1;
  const runningLoomItems = looms.filter((l) => l.status === "running");
  const dates: string[] = [];
  
  // Generate dates for the last 14 days
  for (let d = 0; d < 14; d++) {
    const dt = new Date("2026-06-24");
    dt.setDate(dt.getDate() - d);
    dates.push(dt.toISOString().split("T")[0]);
  }

  // For each date, morning & night shifts for running looms
  // 14 days * 30 running looms * 2 shifts = 840 potential records.
  // We'll generate exactly 500 records by limiting looms/dates to fit the count.
  for (const date of dates) {
    if (recordId > 500) break;
    
    for (const loom of runningLoomItems) {
      if (recordId > 500) break;

      const beam = beams.find((b) => b.id === loom.currentBeamId) || beams[0];
      const weaverMorning = weavers[(recordId * 2) % weavers.length];
      const weaverNight = weavers[(recordId * 2 + 1) % weavers.length];

      // Morning Shift
      const morningMeters = loom.type === "Airjet" ? getRandomRange(65, 88) : getRandomRange(40, 58);
      const morningEff = getRandomRange(83, 95);
      
      productionRecords.push({
        id: `PRD-${String(recordId++).padStart(5, "0")}`,
        loomId: loom.id,
        beamId: beam.id,
        date,
        shift: "Morning",
        weaverId: weaverMorning.id,
        metersProduced: parseFloat(morningMeters.toFixed(1)),
        efficiency: parseFloat(morningEff.toFixed(1)),
        picks: Math.round(morningMeters * 4200), // approx picks
        defectsMeters: parseFloat((morningMeters * getRandomRange(0.01, 0.03)).toFixed(1))
      });

      if (recordId > 500) break;

      // Night Shift
      const nightMeters = loom.type === "Airjet" ? getRandomRange(60, 85) : getRandomRange(38, 55);
      const nightEff = getRandomRange(81, 94);
      
      productionRecords.push({
        id: `PRD-${String(recordId++).padStart(5, "0")}`,
        loomId: loom.id,
        beamId: beam.id,
        date,
        shift: "Night",
        weaverId: weaverNight.id,
        metersProduced: parseFloat(nightMeters.toFixed(1)),
        efficiency: parseFloat(nightEff.toFixed(1)),
        picks: Math.round(nightMeters * 4200),
        defectsMeters: parseFloat((nightMeters * getRandomRange(0.015, 0.035)).toFixed(1))
      });
    }
  }

  // 10. Sales Records (50)
  const salesRecords: SalesRecord[] = [];
  const invoiceDates = [...dates].reverse(); // start sales 14 days ago
  
  for (let i = 1; i <= 50; i++) {
    const customer = customers[i % customers.length];
    const fabric = fabricTypes[i % fabricTypes.length];
    const meters = Math.round(getRandomRange(15, 80)) * 100; // 1500 to 8000 meters
    
    // rate range 45 to 110 INR
    let ratePerMeter = 55;
    if (fabric.name.includes("60x60")) ratePerMeter = 78;
    else if (fabric.name.includes("80x80")) ratePerMeter = 98;
    else if (fabric.name.includes("Canvas")) ratePerMeter = 115;
    else if (fabric.name.includes("Twill")) ratePerMeter = 85;
    else if (fabric.name.includes("Satin")) ratePerMeter = 90;

    const totalAmount = meters * ratePerMeter;
    const dateIdx = i % invoiceDates.length;
    const invoiceDate = invoiceDates[dateIdx];
    
    salesRecords.push({
      id: `INV-${String(i).padStart(4, "0")}`,
      invoiceNumber: `SL-2026-${String(i).padStart(4, "0")}`,
      date: invoiceDate,
      customerId: customer.id,
      fabricType: fabric.name,
      meters,
      ratePerMeter,
      totalAmount,
      status: i <= 40 ? "paid" : i <= 47 ? "dispatched" : "draft"
    });
  }

  // 11. Electricity Bills (12 months)
  const months = [
    "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"
  ];
  
  const electricityBills: ElectricityBill[] = months.map((month, i) => {
    // 36 looms running 24x7 consumes roughly 18,000 to 25,000 units/kWh per month
    const unitsConsumed = Math.round(getRandomRange(19000, 24500));
    // rate is roughly 8.5 Rs per unit for industrial
    const amount = Math.round(unitsConsumed * 8.5);
    
    // due date next month 10th
    const [year, m] = month.split("-");
    let nextMonth = parseInt(m) + 1;
    let nextYear = parseInt(year);
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const dueDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-10`;

    return {
      id: `ELEC-${String(i + 1).padStart(3, "0")}`,
      month,
      unitsConsumed,
      amount,
      dueDate,
      status: "paid"
    };
  });

  // 12. Expenses (12 months)
  // Categories: Repairs, Transport, Salary, Electricity, Sizing, Yarn Purchase, Stores, Misc
  const expenseRecords: ExpenseRecord[] = [];
  let expId = 1;

  for (const month of months) {
    // Salary expense (50 employees total salaries)
    const totalSalaries = employees.reduce((acc, curr) => acc + curr.salary, 0);
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Salary",
      amount: totalSalaries,
      description: "Monthly staff & weaver salaries"
    });

    // Electricity bill
    const elecBill = electricityBills.find((b) => b.month === month);
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Electricity",
      amount: elecBill ? elecBill.amount : 180000,
      description: `MSEDCL Industrial Electricity Bill for ${month}`
    });

    // Sizing expenses (converting yarn to beam)
    // ~12 beams sized per month, Rs 6,500 sizing charges per beam
    const sizingAmount = Math.round(getRandomRange(10, 16) * 6500);
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Sizing",
      amount: sizingAmount,
      description: "Yarn sizing & warping charges"
    });

    // Yarn purchase (largest cost)
    // Buy ~10,000 kg yarn per month @ Rs 220 / kg average
    const yarnCost = Math.round(getRandomRange(8000, 12000) * 220);
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Yarn Purchase",
      amount: yarnCost,
      description: "Cotton Yarn purchase stock replenishment"
    });

    // Repairs
    const repairsCost = Math.round(getRandomRange(15000, 35000));
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Repairs",
      amount: repairsCost,
      description: "Loom repairs, spare parts & accessories replacement"
    });

    // Transport
    const transportCost = Math.round(getRandomRange(20000, 40000));
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Transport",
      amount: transportCost,
      description: "Inward yarn freight & outward grey fabric dispatch transport"
    });

    // Stores & Spares
    const storesCost = Math.round(getRandomRange(10000, 25000));
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Stores & Spares",
      amount: storesCost,
      description: "Lubricants, loom oils, selectors, weft feeders spares"
    });

    // Misc
    const miscCost = Math.round(getRandomRange(5000, 15000));
    expenseRecords.push({
      id: `EXP-${String(expId++).padStart(4, "0")}`,
      month,
      category: "Miscellaneous",
      amount: miscCost,
      description: "Office expenses, water charges, factory miscellaneous"
    });
  }

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

// Global cached mock data instance
let cachedMockData: ReturnType<typeof generateMockData> | null = null;

export function getMockData() {
  if (!cachedMockData) {
    cachedMockData = generateMockData();
  }
  return cachedMockData;
}

// Reset mock data to initial generated state
export function resetMockData() {
  cachedMockData = generateMockData();
  return cachedMockData;
}
