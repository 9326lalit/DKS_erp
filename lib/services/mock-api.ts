// Mock API Service Layer for Textile Weaving ERP
// Integrates with Zustand store and Mock Data Generator

import { getMockData, Loom, ProductionRecord, SalesRecord, ExpenseRecord, YarnLot, Beam } from "@/lib/mock/data-generator";
import { useERPStore, BusinessDetails, FactoryDetails, FinancialYearDetails } from "@/lib/store/use-erp-store";

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface DashboardData {
  stats: {
    runningLooms: number;
    idleLooms: number;
    maintenanceLooms: number;
    todayProductionMeters: number;
    monthlyProductionMeters: number;
    activeBeamsCount: number;
    yarnStockKg: number;
    greyFabricStockMeters: number;
    salesInr: number;
    expensesInr: number;
    profitInr: number;
    avgLoomEfficiency: number;
  };
  charts: {
    productionTrend: { date: string; meters: number; efficiency: number }[];
    salesVsExpensesTrend: { month: string; sales: number; expenses: number }[];
    shiftProduction: { name: string; meters: number }[];
    loomUtilization: { name: string; value: number; color: string }[];
    expenseBreakdown: { name: string; value: number }[];
    topCustomers: { name: string; sales: number }[];
    topSuppliers: { name: string; weight: number }[];
  };
  recentPurchases: { lotNumber: string; supplier: string; yarnType: string; count: string; weight: number; date: string }[];
  recentProduction: { id: string; loom: string; weaver: string; shift: string; meters: string; efficiency: string; date: string }[];
  recentSales: { invoiceNumber: string; customer: string; fabricType: string; meters: number; totalAmount: number; date: string; status: string }[];
  recentActivities: { id: string; time: string; type: "beam" | "purchase" | "production" | "sales" | "alert"; message: string }[];
}

export const mockApiService = {
  // Business Services
  async getBusiness(): Promise<BusinessDetails | null> {
    await delay(300);
    const storeState = useERPStore.getState();
    return storeState.businessDetails;
  },

  async createBusiness(details: BusinessDetails): Promise<BusinessDetails> {
    await delay(500);
    const storeState = useERPStore.getState();
    storeState.setBusinessDetails(details);
    return details;
  },

  async updateBusiness(details: BusinessDetails): Promise<BusinessDetails> {
    await delay(400);
    const storeState = useERPStore.getState();
    storeState.setBusinessDetails(details);
    return details;
  },

  // Factory Services
  async getFactory(): Promise<FactoryDetails | null> {
    await delay(300);
    const storeState = useERPStore.getState();
    return storeState.factoryDetails;
  },

  async createFactory(details: FactoryDetails): Promise<FactoryDetails> {
    await delay(500);
    const storeState = useERPStore.getState();
    storeState.setFactoryDetails(details);
    return details;
  },

  async updateFactory(details: FactoryDetails): Promise<FactoryDetails> {
    await delay(400);
    const storeState = useERPStore.getState();
    storeState.setFactoryDetails(details);
    return details;
  },

  // Financial Year Setup
  async getFinancialYear(): Promise<FinancialYearDetails | null> {
    await delay(300);
    const storeState = useERPStore.getState();
    return storeState.financialYearDetails;
  },

  async updateFinancialYear(details: FinancialYearDetails): Promise<FinancialYearDetails> {
    await delay(400);
    const storeState = useERPStore.getState();
    storeState.setFinancialYearDetails(details);
    return details;
  },

  // Dashboard Aggregated Analytics
  async getDashboard(): Promise<DashboardData> {
    await delay(450);
    const data = getMockData();

    // 1. Calculate Loom Statuses
    const runningLooms = data.looms.filter((l) => l.status === "running").length;
    const idleLooms = data.looms.filter((l) => l.status === "idle").length;
    const maintenanceLooms = data.looms.filter((l) => l.status === "maintenance").length;

    // 2. Active Beams
    const activeBeamsCount = data.beams.filter((b) => b.status === "running").length;

    // 3. Yarn Stock: Sum of active lot balances
    const yarnStockKg = data.yarnLots
      .filter((l) => l.status === "active")
      .reduce((sum, l) => sum + l.balanceWeightKg, 0);

    // 4. Production Metrics
    // Get latest date from production records
    const latestDate = data.productionRecords[0]?.date || "2026-06-24";
    const todayProd = data.productionRecords
      .filter((r) => r.date === latestDate)
      .reduce((sum, r) => sum + r.metersProduced, 0);

    const monthlyProd = data.productionRecords.reduce((sum, r) => sum + r.metersProduced, 0);

    // Average Loom Efficiency
    const runningLoomItems = data.looms.filter((l) => l.status === "running");
    const avgLoomEfficiency = runningLoomItems.length
      ? Math.round(runningLoomItems.reduce((sum, l) => sum + l.efficiency, 0) / runningLoomItems.length)
      : 0;

    // 5. Financial Summary (Salary, Electricity, Sizing, Yarn purchase in the last month)
    // Sales Revenue
    const salesInr = data.salesRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    
    // Expenses (Last Month e.g., 2026-06)
    const currentMonthExpenses = data.expenseRecords.filter((e) => e.month === "2026-06");
    const expensesInr = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profitInr = salesInr - expensesInr;

    // Grey Fabric Stock (Meters)
    // Production (all records) minus Sales (total meters sold) plus opening fabric stock (mocked)
    const totalMetersSold = data.salesRecords.reduce((sum, s) => sum + s.meters, 0);
    const greyFabricStockMeters = Math.max(12450, monthlyProd - totalMetersSold + 15000); // realistic base stock

    // ----------------------------------------------------
    // CHARTS AGGREGATION
    // ----------------------------------------------------

    // A. Daily Production Trend (Last 14 days)
    const dailyProductionMap: Record<string, { meters: number; effSum: number; count: number }> = {};
    data.productionRecords.forEach((r) => {
      if (!dailyProductionMap[r.date]) {
        dailyProductionMap[r.date] = { meters: 0, effSum: 0, count: 0 };
      }
      dailyProductionMap[r.date].meters += r.metersProduced;
      dailyProductionMap[r.date].effSum += r.efficiency;
      dailyProductionMap[r.date].count += 1;
    });

    const productionTrend = Object.entries(dailyProductionMap)
      .map(([date, val]) => ({
        date,
        meters: Math.round(val.meters),
        efficiency: Math.round(val.effSum / (val.count || 1))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // B. Sales vs Expenses Trend (12 Months)
    const salesVsExpensesTrend = [
      { month: "Jul 25", sales: 850000, expenses: 720000 },
      { month: "Aug 25", sales: 920000, expenses: 740000 },
      { month: "Sep 25", sales: 890000, expenses: 790000 },
      { month: "Oct 25", sales: 980000, expenses: 810000 },
      { month: "Nov 25", sales: 1100000, expenses: 840000 },
      { month: "Dec 25", sales: 1050000, expenses: 850000 },
      { month: "Jan 26", sales: 1150000, expenses: 880000 },
      { month: "Feb 26", sales: 1200000, expenses: 900000 },
      { month: "Mar 26", sales: 1350000, expenses: 950000 },
      { month: "Apr 26", sales: 1280000, expenses: 910000 },
      { month: "May 26", sales: 1450000, expenses: 990000 },
      { month: "Jun 26", sales: salesInr, expenses: expensesInr } // Live linked
    ];

    // C. Shift Production
    const morningMeters = data.productionRecords
      .filter((r) => r.shift === "Morning")
      .reduce((sum, r) => sum + r.metersProduced, 0);
    const nightMeters = data.productionRecords
      .filter((r) => r.shift === "Night")
      .reduce((sum, r) => sum + r.metersProduced, 0);

    const shiftProduction = [
      { name: "Morning Shift (07:30 AM - 07:30 PM)", meters: Math.round(morningMeters) },
      { name: "Night Shift (07:30 PM - 07:30 AM)", meters: Math.round(nightMeters) }
    ];

    // D. Loom Utilization
    const loomUtilization = [
      { name: "Running", value: runningLooms, color: "var(--color-emerald-500)" },
      { name: "Idle", value: idleLooms, color: "var(--color-amber-500)" },
      { name: "Maintenance", value: maintenanceLooms, color: "var(--color-red-500)" }
    ];

    // E. Expense Breakdown
    const expenseBreakdown = currentMonthExpenses.map((e) => ({
      name: e.category,
      value: e.amount
    }));

    // F. Top Customers
    const customerSales: Record<string, number> = {};
    data.salesRecords.forEach((s) => {
      const cust = data.customers.find((c) => c.id === s.customerId)?.name || "Unknown Customer";
      customerSales[cust] = (customerSales[cust] || 0) + s.totalAmount;
    });
    const topCustomers = Object.entries(customerSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // G. Top Suppliers
    const supplierWeights: Record<string, number> = {};
    data.yarnLots.forEach((l) => {
      const supp = data.suppliers.find((s) => s.id === l.supplierId)?.name || "Unknown Supplier";
      supplierWeights[supp] = (supplierWeights[supp] || 0) + l.totalWeightKg;
    });
    const topSuppliers = Object.entries(supplierWeights)
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    // ----------------------------------------------------
    // RECENT LISTS
    // ----------------------------------------------------

    // Purchases
    const recentPurchases = data.yarnLots.slice(0, 5).map((l) => {
      const supplierName = data.suppliers.find((s) => s.id === l.supplierId)?.name || "Supplier";
      return {
        lotNumber: l.lotNumber,
        supplier: supplierName,
        yarnType: l.yarnType,
        count: l.count,
        weight: l.totalWeightKg,
        date: l.receivedDate
      };
    });

    // Production
    const recentProduction = data.productionRecords.slice(0, 8).map((r) => {
      const loomName = data.looms.find((l) => l.id === r.loomId)?.name || `Loom ${r.loomId}`;
      const weaverName = data.employees.find((e) => e.id === r.weaverId)?.name || "Weaver";
      return {
        id: r.id,
        loom: loomName,
        weaver: weaverName,
        shift: r.shift,
        meters: r.metersProduced.toFixed(1),
        efficiency: r.efficiency.toFixed(1) + "%",
        date: r.date
      };
    });

    // Sales
    const recentSales = data.salesRecords.slice(0, 5).map((s) => {
      const customerName = data.customers.find((c) => c.id === s.customerId)?.name || "Customer";
      return {
        invoiceNumber: s.invoiceNumber,
        customer: customerName,
        fabricType: s.fabricType,
        meters: s.meters,
        totalAmount: s.totalAmount,
        date: s.date,
        status: s.status
      };
    });

    // Activities
    const recentActivities = [
      {
        id: "ACT-01",
        time: "Just Now",
        type: "production" as const,
        message: "Loom 04 completed shift. Total output: 84.5 meters. Efficiency: 93%."
      },
      {
        id: "ACT-02",
        time: "1 hour ago",
        type: "beam" as const,
        message: "Beam BEAM-0042 mounted successfully on Loom 12."
      },
      {
        id: "ACT-03",
        time: "3 hours ago",
        type: "sales" as const,
        message: "Sales Invoice SL-2026-0048 (4,500 meters Cotton Grey Poplin) dispatched to Balaji Textiles."
      },
      {
        id: "ACT-04",
        time: "5 hours ago",
        type: "purchase" as const,
        message: "Yarn Lot LOT-2026-015 received from Sangam Spinning Mills. Total weight: 2,500 KG Cotton Warp."
      },
      {
        id: "ACT-05",
        time: "10 hours ago",
        type: "alert" as const,
        message: "Loom 18 scheduled for maintenance. Electrical contact check-up."
      },
      {
        id: "ACT-06",
        time: "1 day ago",
        type: "beam" as const,
        message: "Sizing batch BM-0082 sizing completed. 12 Beams transferred to ready inventory."
      }
    ];

    return {
      stats: {
        runningLooms,
        idleLooms,
        maintenanceLooms,
        todayProductionMeters: todayProd,
        monthlyProductionMeters: monthlyProd,
        activeBeamsCount,
        yarnStockKg,
        greyFabricStockMeters,
        salesInr,
        expensesInr,
        profitInr,
        avgLoomEfficiency
      },
      charts: {
        productionTrend,
        salesVsExpensesTrend,
        shiftProduction,
        loomUtilization,
        expenseBreakdown,
        topCustomers,
        topSuppliers
      },
      recentPurchases,
      recentProduction,
      recentSales,
      recentActivities
    };
  }
};
