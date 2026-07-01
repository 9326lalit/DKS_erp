import { create } from "zustand";
import { persist } from "zustand/middleware";

// ----------------------------------------------------
// UTILITY: Amount in Indian Words
// ----------------------------------------------------
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const n = Math.round(num);
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };

  return "Rupees " + convert(n) + " Only";
}

export { numberToWords };

// ----------------------------------------------------
// DOCUMENT NUMBER GENERATOR
// ----------------------------------------------------
export function generateDocNumber(type: "TANA-PO" | "TANA-GRN" | "TANA-PI", sequence: number): string {
  const year = new Date().getFullYear();
  return `${type}-${year}-${String(sequence).padStart(4, "0")}`;
}

// ----------------------------------------------------
// TANA INTERFACES
// ----------------------------------------------------

export interface TanaPO {
  id: string;
  poNumber: string; // TANA-PO-2026-0001
  poDate: string;
  materialType: "Tana";
  purchaseFromId: string; // Supplier party
  purchaseFromName: string;
  purchaseToId: string; // Buyer party (own firm)
  purchaseToName: string;
  deliveryAddress: string;
  expectedDeliveryDate?: string;
  paymentTerms: string;
  remarks?: string;
  // Line Item fields
  itemName: string;
  hsnCode: string;
  totalBagsOrdered: number;
  perBagWeightKg: number;
  totalWeightKg: number; // auto: bags × weight
  ratePerKg: number;
  grossAmount: number; // auto: totalWeight × rate
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number; // auto
  sgstAmount: number; // auto
  totalTaxAmount: number; // auto
  netPayable: number; // auto: gross + tax
  amountInWords: string; // auto
  // Status
  bagsReceivedSoFar: number; // sum of GRNs
  status: "Open" | "Partially Received" | "Closed";
}

export interface TanaGRN {
  id: string;
  grnNumber: string; // TANA-GRN-2026-0001
  grnDate: string;
  linkedPOId: string;
  linkedPONumber: string;
  supplierName: string;
  vehicleNo?: string;
  lrNo?: string;
  bagsOrdered: number; // from PO
  bagsPreviouslyReceived: number; // sum of prior GRNs
  bagsPending: number; // auto: ordered - previously
  bagsReceivedThisGRN: number;
  perBagWeightKg: number;
  totalWeightReceived: number; // auto: bags × weight
  conditionCheck: "Good" | "Damaged" | "Rejected";
  receivedBy: string;
  remarks?: string;
  status: "Pending" | "Partial" | "Completed";
}

export interface TanaPI {
  id: string;
  piNumber: string; // TANA-PI-2026-0001
  piDate: string;
  linkedGRNId: string;
  linkedGRNNumber: string;
  linkedPOId: string;
  linkedPONumber: string;
  supplierInvoiceNo: string;
  supplierInvoiceDate: string;
  supplierName: string;
  itemDescription: string;
  totalWeightKg: number;
  ratePerKg: number;
  taxableAmount: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  roundOff: number;
  netPayable: number;
  amountInWords: string;
  dueDate: string;
  paymentStatus: "Pending" | "Partially Paid" | "Paid";
  paymentTermsDays: number;
}

// Stock tracking
export interface TanaStockEntry {
  id: string;
  date: string;
  type: "GRN_RECEIPT" | "SIZING_ISSUE" | "ADJUSTMENT";
  referenceId: string;
  referenceNumber: string;
  bagsIn: number;
  bagsOut: number;
  weightIn: number;
  weightOut: number;
  rawBagsBalance: number;
  rawWeightBalance: number;
}

// ----------------------------------------------------
// STORE STATE
// ----------------------------------------------------

interface TanaState {
  isHydrated: boolean;
  purchaseOrders: TanaPO[];
  grns: TanaGRN[];
  invoices: TanaPI[];
  rawStockBags: number; // current raw tana bags
  rawStockWeightKg: number;

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  // PO CRUD
  createPO: (po: TanaPO) => void;
  updatePO: (po: TanaPO) => void;
  deletePO: (id: string) => void;

  // GRN CRUD
  createGRN: (grn: TanaGRN) => void;
  updateGRN: (grn: TanaGRN) => void;

  // PI CRUD
  createPI: (pi: TanaPI) => void;
  updatePI: (pi: TanaPI) => void;

  // Stock management
  deductRawStock: (bags: number, weightKg: number) => void;
  addRawStock: (bags: number, weightKg: number) => void;
  
  // Helpers
  getNextPOSequence: () => number;
  getNextGRNSequence: () => number;
  getNextPISequence: () => number;
}

// ----------------------------------------------------
// SEED DATA
// ----------------------------------------------------

const buildSeeds = () => {
  const year = 2026;
  const seededPOs: TanaPO[] = [
    {
      id: "TANA-PO-ID-0001",
      poNumber: "TANA-PO-2026-0001",
      poDate: "2026-04-05",
      materialType: "Tana",
      purchaseFromId: "PRT-ID-001",
      purchaseFromName: "Yogesh Jakhotya Spinners",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-04-12",
      paymentTerms: "30 Days Credit",
      itemName: "40s Cotton Warp Yarn",
      hsnCode: "5402",
      totalBagsOrdered: 50,
      perBagWeightKg: 50,
      totalWeightKg: 2500,
      ratePerKg: 245,
      grossAmount: 612500,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 36750,
      sgstAmount: 36750,
      totalTaxAmount: 73500,
      netPayable: 686000,
      amountInWords: "Rupees Six Lakh Eighty Six Thousand Only",
      bagsReceivedSoFar: 50,
      status: "Closed"
    },
    {
      id: "TANA-PO-ID-0002",
      poNumber: "TANA-PO-2026-0002",
      poDate: "2026-04-20",
      materialType: "Tana",
      purchaseFromId: "PRT-ID-002",
      purchaseFromName: "Om Yarn Traders",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-04-28",
      paymentTerms: "30 Days Credit",
      itemName: "60s Combed Warp Yarn",
      hsnCode: "5402",
      totalBagsOrdered: 30,
      perBagWeightKg: 50,
      totalWeightKg: 1500,
      ratePerKg: 310,
      grossAmount: 465000,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 27900,
      sgstAmount: 27900,
      totalTaxAmount: 55800,
      netPayable: 520800,
      amountInWords: "Rupees Five Lakh Twenty Thousand Eight Hundred Only",
      bagsReceivedSoFar: 20,
      status: "Partially Received"
    },
    {
      id: "TANA-PO-ID-0003",
      poNumber: "TANA-PO-2026-0003",
      poDate: "2026-05-10",
      materialType: "Tana",
      purchaseFromId: "PRT-ID-001",
      purchaseFromName: "Yogesh Jakhotya Spinners",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-05-18",
      paymentTerms: "45 Days Credit",
      itemName: "40s Cotton Warp Yarn",
      hsnCode: "5402",
      totalBagsOrdered: 40,
      perBagWeightKg: 50,
      totalWeightKg: 2000,
      ratePerKg: 248,
      grossAmount: 496000,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 29760,
      sgstAmount: 29760,
      totalTaxAmount: 59520,
      netPayable: 555520,
      amountInWords: "Rupees Five Lakh Fifty Five Thousand Five Hundred Twenty Only",
      bagsReceivedSoFar: 0,
      status: "Open"
    }
  ];

  const seededGRNs: TanaGRN[] = [
    {
      id: "TANA-GRN-ID-0001",
      grnNumber: "TANA-GRN-2026-0001",
      grnDate: "2026-04-10",
      linkedPOId: "TANA-PO-ID-0001",
      linkedPONumber: "TANA-PO-2026-0001",
      supplierName: "Yogesh Jakhotya Spinners",
      vehicleNo: "MH-09-AB-1234",
      lrNo: "LR-20260410",
      bagsOrdered: 50,
      bagsPreviouslyReceived: 0,
      bagsPending: 50,
      bagsReceivedThisGRN: 50,
      perBagWeightKg: 50,
      totalWeightReceived: 2500,
      conditionCheck: "Good",
      receivedBy: "Mahadev Koli",
      status: "Completed"
    },
    {
      id: "TANA-GRN-ID-0002",
      grnNumber: "TANA-GRN-2026-0002",
      grnDate: "2026-04-25",
      linkedPOId: "TANA-PO-ID-0002",
      linkedPONumber: "TANA-PO-2026-0002",
      supplierName: "Om Yarn Traders",
      vehicleNo: "MH-09-CD-5678",
      bagsOrdered: 30,
      bagsPreviouslyReceived: 0,
      bagsPending: 30,
      bagsReceivedThisGRN: 20,
      perBagWeightKg: 50,
      totalWeightReceived: 1000,
      conditionCheck: "Good",
      receivedBy: "Ganesh Mane",
      status: "Partial"
    }
  ];

  const seededPIs: TanaPI[] = [
    {
      id: "TANA-PI-ID-0001",
      piNumber: "TANA-PI-2026-0001",
      piDate: "2026-04-11",
      linkedGRNId: "TANA-GRN-ID-0001",
      linkedGRNNumber: "TANA-GRN-2026-0001",
      linkedPOId: "TANA-PO-ID-0001",
      linkedPONumber: "TANA-PO-2026-0001",
      supplierInvoiceNo: "YJS/2026/0042",
      supplierInvoiceDate: "2026-04-10",
      supplierName: "Yogesh Jakhotya Spinners",
      itemDescription: "40s Cotton Warp Yarn — 2500 KG (50 Bags)",
      totalWeightKg: 2500,
      ratePerKg: 245,
      taxableAmount: 612500,
      cgstPercent: 6,
      cgstAmount: 36750,
      sgstPercent: 6,
      sgstAmount: 36750,
      roundOff: 0,
      netPayable: 686000,
      amountInWords: "Rupees Six Lakh Eighty Six Thousand Only",
      dueDate: "2026-05-11",
      paymentStatus: "Paid",
      paymentTermsDays: 30
    }
  ];

  return {
    purchaseOrders: seededPOs,
    grns: seededGRNs,
    invoices: seededPIs,
    rawStockBags: 70, // initial stock: 50 received - 30 issued to sizing = 20, + 20 from GRN-2 = 40... simplified to 70 for demo
    rawStockWeightKg: 3500
  };
};

// ----------------------------------------------------
// ZUSTAND STORE
// ----------------------------------------------------

export const useTanaStore = create<TanaState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      purchaseOrders: [],
      grns: [],
      invoices: [],
      rawStockBags: 0,
      rawStockWeightKg: 0,

      setHydrated: (val) => set({ isHydrated: val }),

      initializeSeeds: () => {
        const seeds = buildSeeds();
        set({ ...seeds });
      },

      getNextPOSequence: () => get().purchaseOrders.length + 1,
      getNextGRNSequence: () => get().grns.length + 1,
      getNextPISequence: () => get().invoices.length + 1,

      // PO CRUD
      createPO: (po) => set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] })),
      updatePO: (po) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((x) => (x.id === po.id ? po : x))
        })),
      deletePO: (id) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((x) => x.id !== id)
        })),

      // GRN CRUD — updates PO status and stock
      createGRN: (grn) => {
        set((state) => {
          // Update PO bags received
          const updatedPOs = state.purchaseOrders.map((po) => {
            if (po.id === grn.linkedPOId) {
              const newTotal = po.bagsReceivedSoFar + grn.bagsReceivedThisGRN;
              const newStatus: TanaPO["status"] =
                newTotal >= po.totalBagsOrdered ? "Closed" :
                newTotal > 0 ? "Partially Received" : "Open";
              return { ...po, bagsReceivedSoFar: newTotal, status: newStatus };
            }
            return po;
          });

          return {
            grns: [grn, ...state.grns],
            purchaseOrders: updatedPOs,
            rawStockBags: state.rawStockBags + grn.bagsReceivedThisGRN,
            rawStockWeightKg: state.rawStockWeightKg + grn.totalWeightReceived
          };
        });
      },

      updateGRN: (grn) =>
        set((state) => ({
          grns: state.grns.map((x) => (x.id === grn.id ? grn : x))
        })),

      // PI CRUD
      createPI: (pi) => set((state) => ({ invoices: [pi, ...state.invoices] })),
      updatePI: (pi) =>
        set((state) => ({
          invoices: state.invoices.map((x) => (x.id === pi.id ? pi : x))
        })),

      // Stock
      deductRawStock: (bags, weightKg) =>
        set((state) => ({
          rawStockBags: Math.max(0, state.rawStockBags - bags),
          rawStockWeightKg: Math.max(0, state.rawStockWeightKg - weightKg)
        })),
      addRawStock: (bags, weightKg) =>
        set((state) => ({
          rawStockBags: state.rawStockBags + bags,
          rawStockWeightKg: state.rawStockWeightKg + weightKg
        }))
    }),
    {
      name: "dks-textile-erp-tana",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.purchaseOrders.length === 0) {
            state.initializeSeeds();
          }
        }
      }
    }
  )
);
