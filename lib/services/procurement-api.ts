import { useProcurementStore, PurchaseOrder, GRN, PurchaseInvoice, SupplierLedgerTransaction } from "@/lib/store/use-procurement-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PurchaseDashboardData {
  totalSuppliers: number;
  openPOs: number;
  receivedOrders: number;
  pendingDeliveries: number;
  todayPurchasesAmount: number;
  monthlyPurchasesAmount: number;
  totalPurchaseValue: number;
  monthlyTrends: { month: string; amount: number }[];
  supplierAnalysis: { supplierName: string; value: number }[];
  statusDistribution: { status: string; count: number }[];
  recentActivities: { id: string; type: "PO" | "GRN"; code: string; title: string; date: string; status: string }[];
}

export const procurementApiService = {
  // 1. Dashboard Hydration
  async getPurchaseDashboard(): Promise<PurchaseDashboardData> {
    await delay(350);
    const store = useProcurementStore.getState();
    const poList = store.purchaseOrders;
    const invoiceList = store.invoices;

    // Suppliers Count
    const supplierIds = new Set(poList.map((po) => po.supplierId));
    const totalSuppliers = supplierIds.size;

    // PO Statuses
    const openPOs = poList.filter((po) => po.status === "Approved" || po.status === "Pending").length;
    const receivedOrders = poList.filter((po) => po.status === "Completed").length;
    const pendingDeliveries = poList.filter((po) => po.status === "Partially Received" || po.status === "Approved" || po.status === "Pending").length;

    // Values
    const totalPurchaseValue = invoiceList.reduce((acc, curr) => acc + curr.grandTotal, 0);
    
    // Today's Purchases
    const today = "2026-06-24";
    const todayPurchasesAmount = invoiceList
      .filter((inv) => inv.invoiceDate === today)
      .reduce((acc, curr) => acc + curr.grandTotal, 0);

    // Monthly Purchases (June 2026)
    const monthlyPurchasesAmount = invoiceList
      .filter((inv) => inv.invoiceDate.startsWith("2026-06"))
      .reduce((acc, curr) => acc + curr.grandTotal, 0);

    // Monthly Purchase Trend (group by Month YYYY-MM)
    const monthlyMap: Record<string, number> = {};
    invoiceList.forEach((inv) => {
      const month = inv.invoiceDate.substring(0, 7); // e.g. "2026-06"
      monthlyMap[month] = (monthlyMap[month] || 0) + inv.grandTotal;
    });

    const monthsOrder = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
    const monthlyTrends = monthsOrder.map((m) => {
      // Map to human readable month
      const parts = m.split("-");
      const monthName = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1).toLocaleString("default", { month: "short" });
      return {
        month: `${monthName} ${parts[0].substring(2)}`,
        amount: Math.round(monthlyMap[m] || 0)
      };
    });

    // Supplier Purchase Analysis (value per supplier)
    const supplierMap: Record<string, number> = {};
    invoiceList.forEach((inv) => {
      supplierMap[inv.supplierName] = (supplierMap[inv.supplierName] || 0) + inv.grandTotal;
    });
    const supplierAnalysis = Object.entries(supplierMap)
      .map(([supplierName, value]) => ({ supplierName, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5

    // PO Status Distribution
    const statusMap: Record<string, number> = {};
    poList.forEach((po) => {
      statusMap[po.status] = (statusMap[po.status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    // Recent Activities
    const recentActivities: PurchaseDashboardData["recentActivities"] = [];
    poList.slice(0, 5).forEach((po) => {
      recentActivities.push({
        id: `ACT-PO-${po.id}`,
        type: "PO",
        code: po.poNumber,
        title: `Purchase Order Issued to ${po.supplierName}`,
        date: po.orderDate,
        status: po.status
      });
    });

    store.grns.slice(0, 5).forEach((grn) => {
      recentActivities.push({
        id: `ACT-GRN-${grn.id}`,
        type: "GRN",
        code: grn.grnNumber,
        title: `Goods Received from ${grn.supplierName}`,
        date: grn.receiveDate,
        status: grn.status
      });
    });

    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalSuppliers,
      openPOs,
      receivedOrders,
      pendingDeliveries,
      todayPurchasesAmount,
      monthlyPurchasesAmount,
      totalPurchaseValue,
      monthlyTrends,
      supplierAnalysis,
      statusDistribution,
      recentActivities: recentActivities.slice(0, 7)
    };
  },

  // 2. Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await delay(300);
    return useProcurementStore.getState().purchaseOrders;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    await delay(200);
    return useProcurementStore.getState().purchaseOrders.find((x) => x.id === id);
  },

  async createPurchaseOrder(po: PurchaseOrder): Promise<PurchaseOrder> {
    await delay(400);
    useProcurementStore.getState().createPurchaseOrder(po);
    return po;
  },

  async updatePurchaseOrder(po: PurchaseOrder): Promise<PurchaseOrder> {
    await delay(400);
    useProcurementStore.getState().updatePurchaseOrder(po);
    return po;
  },

  async deletePurchaseOrder(id: string): Promise<string> {
    await delay(300);
    useProcurementStore.getState().deletePurchaseOrder(id);
    return id;
  },

  // 3. Goods Receive Notes (GRN)
  async getGRNs(): Promise<GRN[]> {
    await delay(300);
    return useProcurementStore.getState().grns;
  },

  async createGRN(grn: GRN): Promise<GRN> {
    await delay(400);
    useProcurementStore.getState().createGRN(grn);
    return grn;
  },

  // 4. Invoices
  async getInvoices(): Promise<PurchaseInvoice[]> {
    await delay(300);
    return useProcurementStore.getState().invoices;
  },

  async createInvoice(inv: PurchaseInvoice): Promise<PurchaseInvoice> {
    await delay(400);
    useProcurementStore.getState().createInvoice(inv);
    return inv;
  },

  // 5. Supplier Ledger Book
  async getSupplierLedger(): Promise<SupplierLedgerTransaction[]> {
    await delay(300);
    return useProcurementStore.getState().ledgerTransactions;
  }
};
