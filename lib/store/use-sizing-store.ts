import { create } from "zustand";
import { persist } from "zustand/middleware";

// ----------------------------------------------------
// INTERFACES
// ----------------------------------------------------

export interface OpeningStockEntry {
  id: string;
  date: string;
  sizingName: string; // Sizing Mill Name
  materialOwner: string; // "Konacha Maal Aahe" (e.g. DKS Textiles, Party A)
  poNumber: string; // Linked PO
  tanaNumber: string;
  itemName: string;
  totalBags: number;
  totalWeightKg: number;
  setNumber: string;
  totalTaar: number; // e.g. 2800 ends
  totalPipes: number;
  weightPerPipeKg: number;
  totalSetWeightKg: number; // auto: pipes × weightPerPipe
  materialUsedKg: number;
  sizingChemicalAddedKg?: number; // Extra sizing material/chemical added (e.g. +25 kg)
  remainingStockKg: number; // auto: totalWeightKg - materialUsedKg
  remarks?: string;
}

export interface FactoryReceivingEntry {
  id: string;
  date: string;
  sizingName: string;
  poNumber: string;
  setNumber: string;
  bhimReceived: number;
  pipesReceived: number;
  remarks?: string;
  status: "Received" | "Partial" | "Pending";
}

export interface PipeItem {
  id: string;
  pipeNumber: string; // e.g. PIPE-001
  setNumber: string;
  poNumber: string;
  tanaNumber: string;
  itemName: string;
  weightKg: number;
  status: "Available" | "Mounted on Loom" | "Empty Pipe" | "In Transit";
  currentLocation: string;
  date: string;
}

export interface SizingBatch {
  id: string;
  batchNumber: string; // SZ-2026-0001
  dateIssuedToSizing: string;
  bagsIssued: number;
  weightIssuedKg: number; // auto: bags × per-bag weight
  dateReceivedFromSizing?: string;
  bagsReceivedBack?: number;
  weightReceivedKg?: number;
  bhimCount: number; // e.g. 11
  cutPerBhim: number; // e.g. 15
  totalCuts: number; // auto: bhimCount × cutPerBhim = 165
  totalPipes: number; // e.g. 11
  materialUsedKg: number; // e.g. 500 kg
  sizingChemicalAddedKg?: number; // e.g. +25 kg added chemical/material
  ratePerKg: number; // e.g. ₹5 / kg
  sizingChargesRs: number; // auto: materialUsedKg × ratePerKg = ₹2500
  sizingLossKg?: number;
  lossPercent?: number;
  gainPercent?: number; // e.g. +5.0% Gain
  sizingDoneBy: "In-house" | "Outsourced";
  outsourcedPartyName?: string;
  status: "Issued" | "In Process" | "Completed";
  remarks?: string;
}

// ----------------------------------------------------
// STORE STATE INTERFACE
// ----------------------------------------------------

interface SizingState {
  isHydrated: boolean;
  batches: SizingBatch[];
  openingStocks: OpeningStockEntry[];
  factoryReceivings: FactoryReceivingEntry[];
  pipes: PipeItem[];

  // Stock totals
  totalMaterialReceivedKg: number;
  totalMaterialUsedKg: number;
  remainingStockKg: number;
  rawTanaBagsAvailable: number;
  sizedTanaBags: number;
  sizedTanaWeightKg: number;

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  // Actions
  createBatch: (batch: SizingBatch) => void;
  updateBatch: (batch: SizingBatch) => void;
  completeBatch: (batchId: string, bagsBack: number, weightBack: number, chargesRs?: number) => void;

  createOpeningStock: (entry: OpeningStockEntry) => void;
  updateOpeningStock: (entry: OpeningStockEntry) => void;

  createFactoryReceiving: (entry: FactoryReceivingEntry) => void;
  updateFactoryReceiving: (entry: FactoryReceivingEntry) => void;

  createPipeItem: (pipe: PipeItem) => void;
  updatePipeStatus: (id: string, status: PipeItem["status"], location?: string) => void;

  getNextSequence: () => number;
}

// ----------------------------------------------------
// SEED DATA
// ----------------------------------------------------

const buildSizingSeeds = () => {
  const seededBatches: SizingBatch[] = [
    {
      id: "SZ-ID-0001",
      batchNumber: "SZ-2026-0001",
      dateIssuedToSizing: "2026-04-14",
      bagsIssued: 10,
      weightIssuedKg: 500,
      dateReceivedFromSizing: "2026-04-17",
      bagsReceivedBack: 10,
      weightReceivedKg: 490,
      bhimCount: 11,
      cutPerBhim: 15,
      totalCuts: 165,
      totalPipes: 11,
      materialUsedKg: 500,
      ratePerKg: 5,
      sizingChargesRs: 2500,
      sizingLossKg: 10,
      lossPercent: 2.0,
      sizingDoneBy: "Outsourced",
      outsourcedPartyName: "Kolhapur Sizing Mill Unit-1",
      status: "Completed",
      remarks: "11 Bhim, 165 cuts completed cleanly."
    },
    {
      id: "SZ-ID-0002",
      batchNumber: "SZ-2026-0002",
      dateIssuedToSizing: "2026-05-05",
      bagsIssued: 20,
      weightIssuedKg: 1000,
      dateReceivedFromSizing: "2026-05-08",
      bagsReceivedBack: 20,
      weightReceivedKg: 980,
      bhimCount: 18,
      cutPerBhim: 12,
      totalCuts: 216,
      totalPipes: 18,
      materialUsedKg: 950,
      ratePerKg: 5.5,
      sizingChargesRs: 5225,
      sizingLossKg: 20,
      lossPercent: 2.0,
      sizingDoneBy: "Outsourced",
      outsourcedPartyName: "Sumit Sizing Works",
      status: "Completed"
    }
  ];

  const seededOpeningStocks: OpeningStockEntry[] = [
    {
      id: "OP-STOCK-001",
      date: "2026-07-20",
      sizingName: "Sumit Sizing Works",
      materialOwner: "Dhandai Textiles (Own Firm)",
      poNumber: "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      totalBags: 10,
      totalWeightKg: 500,
      setNumber: "SET-100",
      totalTaar: 2800,
      totalPipes: 11,
      weightPerPipeKg: 45,
      totalSetWeightKg: 495,
      materialUsedKg: 400,
      remainingStockKg: 100,
      remarks: "Opening stock verified."
    }
  ];

  const seededReceivings: FactoryReceivingEntry[] = [
    {
      id: "RCV-001",
      date: "2026-07-22",
      sizingName: "Sumit Sizing Works",
      poNumber: "TANA/PO/2026/04/05/0001",
      setNumber: "SET-100",
      bhimReceived: 11,
      pipesReceived: 11,
      remarks: "All 11 Bhims received in good condition.",
      status: "Received"
    }
  ];

  const seededPipes: PipeItem[] = [
    {
      id: "PIPE-001",
      pipeNumber: "PIPE-2026-001",
      setNumber: "SET-2026-001",
      poNumber: "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      weightKg: 45,
      status: "Mounted on Loom",
      currentLocation: "Ichalkaranji Unit-I (Loom #3)",
      date: "2026-07-22"
    },
    {
      id: "PIPE-002",
      pipeNumber: "PIPE-2026-002",
      setNumber: "SET-2026-001",
      poNumber: "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      weightKg: 45,
      status: "Available",
      currentLocation: "Factory Main Store",
      date: "2026-07-22"
    },
    {
      id: "PIPE-003",
      pipeNumber: "PIPE-2026-003",
      setNumber: "SET-2026-001",
      poNumber: "TANA/PO/2026/04/05/0001",
      tanaNumber: "TN-40S-001",
      itemName: "40s Cotton Warp Yarn",
      weightKg: 45,
      status: "Available",
      currentLocation: "Factory Main Store",
      date: "2026-07-22"
    }
  ];

  return {
    batches: seededBatches,
    openingStocks: seededOpeningStocks,
    factoryReceivings: seededReceivings,
    pipes: seededPipes,
    totalMaterialReceivedKg: 1500,
    totalMaterialUsedKg: 1350,
    remainingStockKg: 150,
    rawTanaBagsAvailable: 30,
    sizedTanaBags: 30,
    sizedTanaWeightKg: 1470
  };
};

// ----------------------------------------------------
// ZUSTAND STORE
// ----------------------------------------------------

export const useSizingStore = create<SizingState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      batches: [],
      openingStocks: [],
      factoryReceivings: [],
      pipes: [],

      totalMaterialReceivedKg: 0,
      totalMaterialUsedKg: 0,
      remainingStockKg: 0,
      rawTanaBagsAvailable: 0,
      sizedTanaBags: 0,
      sizedTanaWeightKg: 0,

      setHydrated: (val) => set({ isHydrated: val }),

      initializeSeeds: () => {
        const seeds = buildSizingSeeds();
        set({ ...seeds });
      },

      getNextSequence: () => get().batches.length + 1,

      createBatch: (batch) => {
        set((state) => {
          const used = state.totalMaterialUsedKg + batch.materialUsedKg;
          const remaining = Math.max(0, state.totalMaterialReceivedKg - used);
          return {
            batches: [batch, ...state.batches],
            totalMaterialUsedKg: used,
            remainingStockKg: remaining
          };
        });
      },

      updateBatch: (batch) =>
        set((state) => ({
          batches: state.batches.map((b) => (b.id === batch.id ? batch : b))
        })),

      completeBatch: (batchId, bagsBack, weightBack, chargesRs) => {
        set((state) => {
          const batch = state.batches.find((b) => b.id === batchId);
          if (!batch) return state;

          const lossKg = batch.weightIssuedKg - weightBack;
          const lossPercent = parseFloat(((lossKg / batch.weightIssuedKg) * 100).toFixed(2));

          const updatedBatch: SizingBatch = {
            ...batch,
            dateReceivedFromSizing: new Date().toISOString().split("T")[0],
            bagsReceivedBack: bagsBack,
            weightReceivedKg: weightBack,
            sizingLossKg: parseFloat(lossKg.toFixed(2)),
            lossPercent,
            sizingChargesRs: chargesRs ?? batch.sizingChargesRs,
            status: "Completed"
          };

          return {
            batches: state.batches.map((b) => (b.id === batchId ? updatedBatch : b))
          };
        });
      },

      createOpeningStock: (entry) => {
        set((state) => {
          const newReceived = state.totalMaterialReceivedKg + entry.totalWeightKg;
          const newUsed = state.totalMaterialUsedKg + entry.materialUsedKg;
          const newRemaining = Math.max(0, newReceived - newUsed);

          // Auto-generate Pipe items (Pipes 1 to N)
          const newPipes: PipeItem[] = [];
          const pipeCount = entry.totalPipes || 1;
          const weightPerPipe = entry.weightPerPipeKg || parseFloat((entry.totalWeightKg / pipeCount).toFixed(2));

          for (let i = 1; i <= pipeCount; i++) {
            newPipes.push({
              id: `PIPE-AUTO-${Date.now()}-${i}`,
              pipeNumber: `PIPE-${entry.setNumber}-${String(i).padStart(2, "0")}`,
              setNumber: entry.setNumber,
              poNumber: entry.poNumber,
              tanaNumber: entry.tanaNumber,
              itemName: entry.itemName,
              weightKg: weightPerPipe,
              status: "Available",
              currentLocation: entry.sizingName,
              date: entry.date
            });
          }

          return {
            openingStocks: [entry, ...state.openingStocks],
            pipes: [...newPipes, ...state.pipes],
            totalMaterialReceivedKg: newReceived,
            totalMaterialUsedKg: newUsed,
            remainingStockKg: newRemaining
          };
        });
      },

      updateOpeningStock: (entry) => {
        set((state) => ({
          openingStocks: state.openingStocks.map((o) => (o.id === entry.id ? entry : o))
        }));
      },

      createFactoryReceiving: (entry) => {
        set((state) => ({
          factoryReceivings: [entry, ...state.factoryReceivings]
        }));
      },

      updateFactoryReceiving: (entry) => {
        set((state) => ({
          factoryReceivings: state.factoryReceivings.map((r) => (r.id === entry.id ? entry : r))
        }));
      },

      createPipeItem: (pipe) => {
        set((state) => ({
          pipes: [pipe, ...state.pipes]
        }));
      },

      updatePipeStatus: (id, status, location) => {
        set((state) => ({
          pipes: state.pipes.map((p) =>
            p.id === id ? { ...p, status, currentLocation: location || p.currentLocation } : p
          )
        }));
      }
    }),
    {
      name: "dks-textile-erp-sizing",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          if (state.batches.length === 0) {
            state.initializeSeeds();
          }
        }
      }
    }
  )
);
