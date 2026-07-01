import { create } from "zustand";
import { persist } from "zustand/middleware";
import { numberToWords } from "./use-tana-store";

// ----------------------------------------------------
// BANA INTERFACES (Weft Yarn)
// ----------------------------------------------------

export interface BanaPO {
  id: string;
  poNumber: string; // BANA-PO-2026-0001
  poDate: string;
  materialType: "Bana";
  purchaseFromId: string;
  purchaseFromName: string;
  purchaseToId: string;
  purchaseToName: string;
  deliveryAddress: string;
  expectedDeliveryDate?: string;
  paymentTerms: string;
  remarks?: string;
  itemName: string;
  hsnCode: string;
  totalBagsOrdered: number;
  perBagWeightKg: number;
  totalWeightKg: number;
  ratePerKg: number;
  grossAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
  netPayable: number;
  amountInWords: string;
  bagsReceivedSoFar: number;
  status: "Open" | "Partially Received" | "Closed";
}

export interface BanaGRN {
  id: string;
  grnNumber: string; // BANA-GRN-2026-0001
  grnDate: string;
  linkedPOId: string;
  linkedPONumber: string;
  supplierName: string;
  vehicleNo?: string;
  lrNo?: string;
  bagsOrdered: number;
  bagsPreviouslyReceived: number;
  bagsPending: number;
  bagsReceivedThisGRN: number;
  perBagWeightKg: number;
  totalWeightReceived: number;
  conditionCheck: "Good" | "Damaged" | "Rejected";
  receivedBy: string;
  remarks?: string;
  status: "Pending" | "Partial" | "Completed";
}

export interface BanaPI {
  id: string;
  piNumber: string; // BANA-PI-2026-0001
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

// ----------------------------------------------------
// STORE STATE
// ----------------------------------------------------

interface BanaState {
  isHydrated: boolean;
  purchaseOrders: BanaPO[];
  grns: BanaGRN[];
  invoices: BanaPI[];
  stockBags: number;
  stockWeightKg: number;

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  createPO: (po: BanaPO) => void;
  updatePO: (po: BanaPO) => void;
  deletePO: (id: string) => void;

  createGRN: (grn: BanaGRN) => void;
  updateGRN: (grn: BanaGRN) => void;

  createPI: (pi: BanaPI) => void;
  updatePI: (pi: BanaPI) => void;

  deductStock: (bags: number, weightKg: number) => void;

  getNextPOSequence: () => number;
  getNextGRNSequence: () => number;
  getNextPISequence: () => number;
}

// ----------------------------------------------------
// SEED DATA
// ----------------------------------------------------

const buildBanaSeeds = () => {
  const seededPOs: BanaPO[] = [
    {
      id: "BANA-PO-ID-0001",
      poNumber: "BANA-PO-2026-0001",
      poDate: "2026-04-08",
      materialType: "Bana",
      purchaseFromId: "PRT-ID-003",
      purchaseFromName: "Shree Ganesh Yarn Depot",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-04-16",
      paymentTerms: "30 Days Credit",
      itemName: "30s Cotton Weft Yarn",
      hsnCode: "5205",
      totalBagsOrdered: 40,
      perBagWeightKg: 50,
      totalWeightKg: 2000,
      ratePerKg: 220,
      grossAmount: 440000,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 26400,
      sgstAmount: 26400,
      totalTaxAmount: 52800,
      netPayable: 492800,
      amountInWords: "Rupees Four Lakh Ninety Two Thousand Eight Hundred Only",
      bagsReceivedSoFar: 40,
      status: "Closed"
    },
    {
      id: "BANA-PO-ID-0002",
      poNumber: "BANA-PO-2026-0002",
      poDate: "2026-05-02",
      materialType: "Bana",
      purchaseFromId: "PRT-ID-002",
      purchaseFromName: "Om Yarn Traders",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-05-10",
      paymentTerms: "30 Days Credit",
      itemName: "40s Cotton Weft Yarn",
      hsnCode: "5205",
      totalBagsOrdered: 25,
      perBagWeightKg: 50,
      totalWeightKg: 1250,
      ratePerKg: 235,
      grossAmount: 293750,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 17625,
      sgstAmount: 17625,
      totalTaxAmount: 35250,
      netPayable: 329000,
      amountInWords: "Rupees Three Lakh Twenty Nine Thousand Only",
      bagsReceivedSoFar: 15,
      status: "Partially Received"
    },
    {
      id: "BANA-PO-ID-0003",
      poNumber: "BANA-PO-2026-0003",
      poDate: "2026-06-01",
      materialType: "Bana",
      purchaseFromId: "PRT-ID-003",
      purchaseFromName: "Shree Ganesh Yarn Depot",
      purchaseToId: "PRT-ID-004",
      purchaseToName: "Shivaji Khairnar (Own Firm)",
      deliveryAddress: "Plot No. 45-A, MIDC, Ichalkaranji - 416115",
      expectedDeliveryDate: "2026-06-10",
      paymentTerms: "45 Days Credit",
      itemName: "20s Cotton Weft Yarn",
      hsnCode: "5205",
      totalBagsOrdered: 35,
      perBagWeightKg: 50,
      totalWeightKg: 1750,
      ratePerKg: 200,
      grossAmount: 350000,
      cgstPercent: 6,
      sgstPercent: 6,
      cgstAmount: 21000,
      sgstAmount: 21000,
      totalTaxAmount: 42000,
      netPayable: 392000,
      amountInWords: "Rupees Three Lakh Ninety Two Thousand Only",
      bagsReceivedSoFar: 0,
      status: "Open"
    }
  ];

  const seededGRNs: BanaGRN[] = [
    {
      id: "BANA-GRN-ID-0001",
      grnNumber: "BANA-GRN-2026-0001",
      grnDate: "2026-04-15",
      linkedPOId: "BANA-PO-ID-0001",
      linkedPONumber: "BANA-PO-2026-0001",
      supplierName: "Shree Ganesh Yarn Depot",
      vehicleNo: "MH-09-XY-4321",
      bagsOrdered: 40,
      bagsPreviouslyReceived: 0,
      bagsPending: 40,
      bagsReceivedThisGRN: 40,
      perBagWeightKg: 50,
      totalWeightReceived: 2000,
      conditionCheck: "Good",
      receivedBy: "Ganesh Mane",
      status: "Completed"
    },
    {
      id: "BANA-GRN-ID-0002",
      grnNumber: "BANA-GRN-2026-0002",
      grnDate: "2026-05-06",
      linkedPOId: "BANA-PO-ID-0002",
      linkedPONumber: "BANA-PO-2026-0002",
      supplierName: "Om Yarn Traders",
      vehicleNo: "MH-09-PQ-7890",
      bagsOrdered: 25,
      bagsPreviouslyReceived: 0,
      bagsPending: 25,
      bagsReceivedThisGRN: 15,
      perBagWeightKg: 50,
      totalWeightReceived: 750,
      conditionCheck: "Good",
      receivedBy: "Mahadev Koli",
      status: "Partial"
    }
  ];

  const seededPIs: BanaPI[] = [
    {
      id: "BANA-PI-ID-0001",
      piNumber: "BANA-PI-2026-0001",
      piDate: "2026-04-16",
      linkedGRNId: "BANA-GRN-ID-0001",
      linkedGRNNumber: "BANA-GRN-2026-0001",
      linkedPOId: "BANA-PO-ID-0001",
      linkedPONumber: "BANA-PO-2026-0001",
      supplierInvoiceNo: "SGY/2026/0018",
      supplierInvoiceDate: "2026-04-15",
      supplierName: "Shree Ganesh Yarn Depot",
      itemDescription: "30s Cotton Weft Yarn — 2000 KG (40 Bags)",
      totalWeightKg: 2000,
      ratePerKg: 220,
      taxableAmount: 440000,
      cgstPercent: 6,
      cgstAmount: 26400,
      sgstPercent: 6,
      sgstAmount: 26400,
      roundOff: 0,
      netPayable: 492800,
      amountInWords: "Rupees Four Lakh Ninety Two Thousand Eight Hundred Only",
      dueDate: "2026-05-16",
      paymentStatus: "Paid",
      paymentTermsDays: 30
    }
  ];

  return {
    purchaseOrders: seededPOs,
    grns: seededGRNs,
    invoices: seededPIs,
    stockBags: 55,
    stockWeightKg: 2750
  };
};

// ----------------------------------------------------
// ZUSTAND STORE
// ----------------------------------------------------

export const useBanaStore = create<BanaState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      purchaseOrders: [],
      grns: [],
      invoices: [],
      stockBags: 0,
      stockWeightKg: 0,

      setHydrated: (val) => set({ isHydrated: val }),

      initializeSeeds: () => {
        const seeds = buildBanaSeeds();
        set({ ...seeds });
      },

      getNextPOSequence: () => get().purchaseOrders.length + 1,
      getNextGRNSequence: () => get().grns.length + 1,
      getNextPISequence: () => get().invoices.length + 1,

      createPO: (po) => set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] })),
      updatePO: (po) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((x) => (x.id === po.id ? po : x))
        })),
      deletePO: (id) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((x) => x.id !== id)
        })),

      createGRN: (grn) => {
        set((state) => {
          const updatedPOs = state.purchaseOrders.map((po) => {
            if (po.id === grn.linkedPOId) {
              const newTotal = po.bagsReceivedSoFar + grn.bagsReceivedThisGRN;
              const newStatus: BanaPO["status"] =
                newTotal >= po.totalBagsOrdered ? "Closed" :
                newTotal > 0 ? "Partially Received" : "Open";
              return { ...po, bagsReceivedSoFar: newTotal, status: newStatus };
            }
            return po;
          });
          return {
            grns: [grn, ...state.grns],
            purchaseOrders: updatedPOs,
            stockBags: state.stockBags + grn.bagsReceivedThisGRN,
            stockWeightKg: state.stockWeightKg + grn.totalWeightReceived
          };
        });
      },

      updateGRN: (grn) =>
        set((state) => ({
          grns: state.grns.map((x) => (x.id === grn.id ? grn : x))
        })),

      createPI: (pi) => set((state) => ({ invoices: [pi, ...state.invoices] })),
      updatePI: (pi) =>
        set((state) => ({
          invoices: state.invoices.map((x) => (x.id === pi.id ? pi : x))
        })),

      deductStock: (bags, weightKg) =>
        set((state) => ({
          stockBags: Math.max(0, state.stockBags - bags),
          stockWeightKg: Math.max(0, state.stockWeightKg - weightKg)
        }))
    }),
    {
      name: "dks-textile-erp-bana",
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
