import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMastersStore, Party } from "@/lib/store/use-masters-store";

// ----------------------------------------------------
// TRANSACTIONAL INTERFACES
// ----------------------------------------------------

export interface PurchaseOrderItem {
  id: string;
  yarnId: string;
  yarnName: string;
  count: string;
  color: string;
  brand: string;
  quantity: number; // in KG
  unit: string;
  rate: number;
  gst: number; // percentage
  discount: number; // percentage
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  orderDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  transporter: string;
  broker: string;
  warehouseId: string;
  warehouseName: string;
  currency: string;
  remarks?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  gstTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: "Draft" | "Pending" | "Approved" | "Partially Received" | "Completed" | "Cancelled";
}

export interface GRNItem {
  id: string;
  yarnId: string;
  yarnName: string;
  count: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  acceptedQty: number;
  unit: string;
  remarks?: string;
}

export interface GRN {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  vehicleNumber: string;
  transporter: string;
  invoiceNumber?: string;
  receiveDate: string;
  warehouseId: string;
  warehouseName: string;
  remarks?: string;
  items: GRNItem[];
  status: "Pending" | "Partial" | "Completed";
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  grnId: string;
  grnNumber: string;
  invoiceAmount: number; // acceptedQty * rate (subtotal)
  gst: number; // GST amount
  freight: number;
  otherCharges: number;
  grandTotal: number;
  status: "Paid" | "Pending" | "Partial";
}

export interface SupplierLedgerTransaction {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  voucherType: "Purchase Invoice" | "Payment" | "Opening Balance";
  voucherNumber: string;
  reference: string;
  debit: number; // payment offset
  credit: number; // invoice addition
  balance: number; // rolling outstanding balance
}

interface ProcurementState {
  isHydrated: boolean;
  purchaseOrders: PurchaseOrder[];
  grns: GRN[];
  invoices: PurchaseInvoice[];
  ledgerTransactions: SupplierLedgerTransaction[];

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  // Purchase Order CRUD
  createPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;

  // GRN CRUD
  createGRN: (grn: GRN) => void;
  updateGRN: (grn: GRN) => void;

  // Invoice CRUD
  createInvoice: (inv: PurchaseInvoice) => void;
  updateInvoice: (inv: PurchaseInvoice) => void;
}

// ----------------------------------------------------
// DETERMINISTIC DATA SEED GENERATOR
// ----------------------------------------------------

const getInitialSeeds = () => {
  // Try loading master arrays for linking.
  // Fallbacks are set to maintain validation if masters are not loaded yet.
  const masterState = useMastersStore.getState();
  
  const suppliers = masterState.parties?.length > 0
    ? masterState.parties.filter(p => p.partyType === "Supplier")
    : [
        { id: "ADD-0", partyName: "Jakhotiya Spinners Pvt Ltd", contactPerson: "Amit Khairnar", mobileNumber: "+91 98230 45678" },
        { id: "ADD-1", partyName: "Om Yarn Traders", contactPerson: "Sanjay Patil", mobileNumber: "+91 98341 56789" },
        { id: "ADD-2", partyName: "Shree Ganesh Yarn", contactPerson: "Rahul Shinde", mobileNumber: "+91 91234 56789" },
        { id: "ADD-3", partyName: "Universal Fibres", contactPerson: "Vijay Deshmukh", mobileNumber: "+91 95456 78912" }
      ] as Pick<Party, "id" | "partyName" | "contactPerson" | "mobileNumber">[];

  const yarns = masterState.yarns?.length > 0
    ? masterState.yarns
    : [
        { id: "YRN-01", yarnName: "40s Cotton Warp", count: "40s", brand: "Sangam Brand", rate: 240, gst: 5, unit: "KG" },
        { id: "YRN-02", yarnName: "30s Cotton Weft", count: "30s", brand: "Ganesh Mills", rate: 220, gst: 5, unit: "KG" },
        { id: "YRN-03", yarnName: "60s Combed Warp", count: "60s", brand: "Vardhman", rate: 310, gst: 5, unit: "KG" }
      ];

  const warehouses = masterState.warehouses?.length > 0
    ? masterState.warehouses
    : [
        { id: "WH-001", warehouseName: "Yarn Raw Godown" },
        { id: "WH-002", warehouseName: "Sized Beams Rack" }
      ];

  const transporters = ["Kolhapur Textile Freight", "Ghatge Patil Logistics", "Safexpress", "Mhatre Transport"];
  const brokers = ["Vijay Jakhotiya Brokerage", "Sushil Cotton Brokers", "Direct Deal"];

  const seededPOs: PurchaseOrder[] = [];
  const seededGRNs: GRN[] = [];
  const seededInvoices: PurchaseInvoice[] = [];
  const seededLedgers: SupplierLedgerTransaction[] = [];

  let seed = 98765;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(random() * arr.length)];
  const getRandomRange = (min: number, max: number) => min + random() * (max - min);

  // Helper to generate dates spanning back 6 months
  const getDateNDaysAgo = (n: number) => {
    const d = new Date("2026-06-24");
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  };

  // Step 1: Generate 200 Purchase Orders
  for (let i = 200; i >= 1; i--) {
    const supplier = getRandomElement(suppliers);
    const warehouse = getRandomElement(warehouses);
    const poDate = getDateNDaysAgo(i + Math.floor(getRandomRange(0, 5)));
    const deliveryDate = getDateNDaysAgo(i - Math.floor(getRandomRange(3, 8)));
    
    // Choose status
    let status: PurchaseOrder["status"] = "Completed";
    if (i <= 10) status = "Draft";
    else if (i <= 20) status = "Pending";
    else if (i <= 35) status = "Approved";
    else if (i <= 60) status = "Partially Received";
    else if (i <= 195) status = "Completed";
    else status = "Cancelled";

    // 1 to 3 items per PO
    const itemsCount = Math.floor(getRandomRange(1, 4));
    const items: PurchaseOrderItem[] = [];
    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;

    for (let k = 0; k < itemsCount; k++) {
      const yarn = yarns[(i + k) % yarns.length];
      const qty = Math.round(getRandomRange(10, 50)) * 100; // 1,000 to 5,000 KG
      const rate = yarn.rate + Math.round(getRandomRange(-15, 25));
      const gstPercent = yarn.gst || 5;
      const discountPercent = i % 5 === 0 ? 2 : 0; // occasional 2% discount
      
      const itemSubtotal = qty * rate;
      const itemDiscount = itemSubtotal * (discountPercent / 100);
      const netSubtotal = itemSubtotal - itemDiscount;
      const itemGst = netSubtotal * (gstPercent / 100);
      const itemTotal = netSubtotal + itemGst;

      subtotal += itemSubtotal;
      discountTotal += itemDiscount;
      gstTotal += itemGst;

      items.push({
        id: `POI-${i}-${k}`,
        yarnId: yarn.id,
        yarnName: yarn.yarnName,
        count: yarn.count,
        color: "Raw White",
        brand: yarn.brand || "Standard Brand",
        quantity: qty,
        unit: "KG",
        rate,
        gst: gstPercent,
        discount: discountPercent,
        total: parseFloat(itemTotal.toFixed(2))
      });
    }

    const grandTotal = subtotal - discountTotal + gstTotal;
    const poId = `PO-ID-${String(i).padStart(4, "0")}`;
    const poNumber = `PO-2026-${String(i).padStart(3, "0")}`;

    const po: PurchaseOrder = {
      id: poId,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.partyName,
      supplierContact: supplier.mobileNumber,
      orderDate: poDate,
      expectedDelivery: deliveryDate,
      paymentTerms: "30 Days Credit",
      transporter: getRandomElement(transporters),
      broker: getRandomElement(brokers),
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      currency: "INR",
      remarks: i % 10 === 0 ? "Urgent yarn procurement for active loom runs" : undefined,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gstTotal: parseFloat(gstTotal.toFixed(2)),
      discountTotal: parseFloat(discountTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      status
    };

    seededPOs.push(po);

    // Step 2: Generate Goods Receive Notes (GRN) for Completed and Partially Received POs
    if (status === "Completed" || status === "Partially Received") {
      const grnDate = getDateNDaysAgo(i - Math.floor(getRandomRange(2, 4)));
      const grnItems: GRNItem[] = po.items.map((item, idx) => {
        const ordered = item.quantity;
        let received = ordered;
        let rejected = 0;

        if (status === "Partially Received") {
          received = Math.round(ordered * getRandomRange(0.4, 0.8));
          rejected = idx % 2 === 0 ? Math.round(received * 0.05) : 0; // 5% rejected occasionally
        } else {
          rejected = idx % 3 === 0 ? Math.round(received * 0.02) : 0; // 2% rejected occasionally
        }

        const accepted = received - rejected;

        return {
          id: `GRNI-${i}-${idx}`,
          yarnId: item.yarnId,
          yarnName: item.yarnName,
          count: item.count,
          orderedQty: ordered,
          receivedQty: received,
          rejectedQty: rejected,
          acceptedQty: accepted,
          unit: item.unit,
          remarks: rejected > 0 ? "Cones damaged during freight transit" : undefined
        };
      });

      const grnId = `GRN-ID-${String(i).padStart(4, "0")}`;
      const grnNumber = `GRN-2026-${String(i).padStart(3, "0")}`;

      const grn: GRN = {
        id: grnId,
        grnNumber,
        poId,
        poNumber,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        vehicleNumber: `MH-09-${String(Math.floor(getRandomRange(1000, 9999)))}`,
        transporter: po.transporter,
        invoiceNumber: `CHALLAN-${String(i).padStart(3, "0")}`,
        receiveDate: grnDate,
        warehouseId: po.warehouseId,
        warehouseName: po.warehouseName,
        items: grnItems,
        status: status === "Completed" ? "Completed" : "Partial"
      };

      seededGRNs.push(grn);

      // Step 3: Generate Purchase Invoice
      const invoiceDate = getDateNDaysAgo(i - Math.floor(getRandomRange(1, 3)));
      let invoiceAmount = 0;
      let gstAmount = 0;

      grn.items.forEach((item) => {
        const poItem = po.items.find((x) => x.yarnId === item.yarnId) || po.items[0];
        const itemSubtotal = item.acceptedQty * poItem.rate;
        const discountAmount = itemSubtotal * (poItem.discount / 100);
        const netSub = itemSubtotal - discountAmount;
        const itemGst = netSub * (poItem.gst / 100);
        
        invoiceAmount += netSub;
        gstAmount += itemGst;
      });

      const freight = Math.round(getRandomRange(2, 6)) * 500; // 1,000 to 3,000 INR
      const otherCharges = i % 10 === 0 ? 500 : 0;
      const invGrandTotal = invoiceAmount + gstAmount + freight + otherCharges;
      
      const invId = `INV-ID-${String(i).padStart(4, "0")}`;
      const invNumber = `PINV-2026-${String(i).padStart(3, "0")}`;

      const invoice: PurchaseInvoice = {
        id: invId,
        invoiceNumber: invNumber,
        invoiceDate,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        poId,
        poNumber,
        grnId,
        grnNumber,
        invoiceAmount: parseFloat(invoiceAmount.toFixed(2)),
        gst: parseFloat(gstAmount.toFixed(2)),
        freight,
        otherCharges,
        grandTotal: parseFloat(invGrandTotal.toFixed(2)),
        status: i % 8 === 0 ? "Pending" : i % 12 === 0 ? "Partial" : "Paid"
      };

      seededInvoices.push(invoice);

      // Step 4: Write transactions to Supplier Ledger
      // Credit: Purchase Invoice increases outstanding liability
      seededLedgers.push({
        id: `LEDG-CR-${i}`,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        date: invoiceDate,
        voucherType: "Purchase Invoice",
        voucherNumber: invNumber,
        reference: poNumber,
        debit: 0,
        credit: parseFloat(invGrandTotal.toFixed(2)),
        balance: 0 // Will compute rolling balance later
      });

      // Debit: Payment decreases outstanding liability
      if (invoice.status === "Paid") {
        const paymentDate = getDateNDaysAgo(i - Math.floor(getRandomRange(-1, 2)));
        seededLedgers.push({
          id: `LEDG-DR-${i}`,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          date: paymentDate,
          voucherType: "Payment",
          voucherNumber: `PAY-2026-${String(i).padStart(3, "0")}`,
          reference: invNumber,
          debit: parseFloat(invGrandTotal.toFixed(2)),
          credit: 0,
          balance: 0
        });
      } else if (invoice.status === "Partial") {
        const paymentDate = getDateNDaysAgo(i - Math.floor(getRandomRange(-1, 2)));
        const partialAmt = parseFloat((invGrandTotal * 0.5).toFixed(2));
        seededLedgers.push({
          id: `LEDG-DR-PART-${i}`,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          date: paymentDate,
          voucherType: "Payment",
          voucherNumber: `PAY-2026-${String(i).padStart(3, "0")}`,
          reference: invNumber,
          debit: partialAmt,
          credit: 0,
          balance: 0
        });
      }
    }
  }

  // Sort ledgers chronologically to compute running outstanding balance correctly
  suppliers.forEach((sup) => {
    const supId = sup.id;
    // Add opening balance transaction
    seededLedgers.push({
      id: `LEDG-OB-${supId}`,
      supplierId: supId,
      supplierName: sup.partyName,
      date: "2026-01-01",
      voucherType: "Opening Balance",
      voucherNumber: "OB-2026",
      reference: "Prior Ledger Balances",
      debit: 0,
      credit: (sup as any).openingBalance || 150000,
      balance: (sup as any).openingBalance || 150000
    });
  });

  seededLedgers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute rolling balance per supplier
  const balanceTracker: Record<string, number> = {};
  seededLedgers.forEach((tx) => {
    if (!balanceTracker[tx.supplierId]) {
      balanceTracker[tx.supplierId] = 0;
    }
    balanceTracker[tx.supplierId] += (tx.credit - tx.debit);
    tx.balance = parseFloat(balanceTracker[tx.supplierId].toFixed(2));
  });

  return {
    purchaseOrders: seededPOs.reverse(), // latest first in lists
    grns: seededGRNs.reverse(),
    invoices: seededInvoices.reverse(),
    ledgerTransactions: seededLedgers
  };
};

export const useProcurementStore = create<ProcurementState>()(
  persist(
    (set) => ({
      isHydrated: false,
      purchaseOrders: [],
      grns: [],
      invoices: [],
      ledgerTransactions: [],

      setHydrated: (val) => set({ isHydrated: val }),

      initializeSeeds: () => {
        const seeds = getInitialSeeds();
        set({ ...seeds });
      },

      // Purchase Orders CRUD
      createPurchaseOrder: (po) =>
        set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] })),
      
      updatePurchaseOrder: (po) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((x) => (x.id === po.id ? po : x))
        })),
      
      deletePurchaseOrder: (id) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((x) => x.id !== id)
        })),

      // GRN CRUD
      createGRN: (grn) => {
        set((state) => {
          // Find PO and update status
          const po = state.purchaseOrders.find((p) => p.id === grn.poId);
          let updatedPOs = state.purchaseOrders;
          
          if (po) {
            const hasPartial = grn.status === "Partial";
            const updatedPO: PurchaseOrder = {
              ...po,
              status: hasPartial ? "Partially Received" : "Completed"
            };
            updatedPOs = state.purchaseOrders.map((p) => (p.id === po.id ? updatedPO : p));
          }

          return {
            grns: [grn, ...state.grns],
            purchaseOrders: updatedPOs
          };
        });
      },

      updateGRN: (grn) =>
        set((state) => ({
          grns: state.grns.map((x) => (x.id === grn.id ? grn : x))
        })),

      // Invoices CRUD
      createInvoice: (inv) => {
        set((state) => {
          // Add credit ledger transaction immediately
          const creditTx: SupplierLedgerTransaction = {
            id: `LEDG-CR-${Date.now()}`,
            supplierId: inv.supplierId,
            supplierName: inv.supplierName,
            date: inv.invoiceDate,
            voucherType: "Purchase Invoice",
            voucherNumber: inv.invoiceNumber,
            reference: inv.poNumber,
            debit: 0,
            credit: inv.grandTotal,
            balance: 0 // calculated next
          };

          const allTxs = [...state.ledgerTransactions, creditTx];
          
          // Re-calculate rolling balance for this supplier
          let bal = 0;
          allTxs
            .filter((x) => x.supplierId === inv.supplierId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach((x) => {
              bal += (x.credit - x.debit);
              x.balance = parseFloat(bal.toFixed(2));
            });

          return {
            invoices: [inv, ...state.invoices],
            ledgerTransactions: allTxs
          };
        });
      },

      updateInvoice: (inv) =>
        set((state) => ({
          invoices: state.invoices.map((x) => (x.id === inv.id ? inv : x))
        }))
    }),
    {
      name: "dks-textile-erp-procurement",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          // Auto-seed if list is empty
          if (state.purchaseOrders.length === 0) {
            state.initializeSeeds();
          }
        }
      }
    }
  )
);
