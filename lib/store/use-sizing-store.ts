import { create } from "zustand";
import { persist } from "zustand/middleware";

// ----------------------------------------------------
// SIZING BATCH INTERFACE
// ----------------------------------------------------

export interface SizingBatch {
  id: string;
  batchNumber: string; // SZ-2026-0001
  dateIssuedToSizing: string;
  bagsIssued: number;
  weightIssuedKg: number; // auto: bags × tana per-bag weight (set on creation)
  dateReceivedFromSizing?: string;
  bagsReceivedBack?: number;
  weightReceivedKg?: number;
  sizingLossBags?: number; // auto: issued - received
  sizingLossKg?: number; // auto: issued weight - received weight
  lossPercent?: number; // auto: (lossKg / issuedKg) × 100
  sizingChargesRs?: number; // job work charges if outsourced
  sizingDoneBy: "In-house" | "Outsourced";
  outsourcedPartyName?: string; // if outsourced
  status: "Issued" | "In Process" | "Completed";
  remarks?: string;
}

// ----------------------------------------------------
// STOCK TRACKING
// ----------------------------------------------------

interface SizingState {
  isHydrated: boolean;
  batches: SizingBatch[];
  // Tana stock references (mirrored from useTanaStore for display)
  rawTanaBagsAvailable: number; // maintained by tana store
  sizedTanaBags: number; // grows when batches are completed
  sizedTanaWeightKg: number;

  setHydrated: (val: boolean) => void;
  initializeSeeds: () => void;

  createBatch: (batch: SizingBatch) => void;
  updateBatch: (batch: SizingBatch) => void;
  completeBatch: (batchId: string, bagsBack: number, weightBack: number, chargesRs?: number) => void;

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
      bagsIssued: 30,
      weightIssuedKg: 1500,
      dateReceivedFromSizing: "2026-04-17",
      bagsReceivedBack: 30,
      weightReceivedKg: 1462,
      sizingLossBags: 0,
      sizingLossKg: 38,
      lossPercent: 2.53,
      sizingChargesRs: 4500,
      sizingDoneBy: "Outsourced",
      outsourcedPartyName: "D.K. Warping & Sizing",
      status: "Completed",
      remarks: "Starch applied successfully. Minor weight loss due to moisture absorption."
    },
    {
      id: "SZ-ID-0002",
      batchNumber: "SZ-2026-0002",
      dateIssuedToSizing: "2026-05-05",
      bagsIssued: 20,
      weightIssuedKg: 1000,
      dateReceivedFromSizing: "2026-05-08",
      bagsReceivedBack: 20,
      weightReceivedKg: 975,
      sizingLossBags: 0,
      sizingLossKg: 25,
      lossPercent: 2.5,
      sizingChargesRs: 3000,
      sizingDoneBy: "Outsourced",
      outsourcedPartyName: "D.K. Warping & Sizing",
      status: "Completed"
    },
    {
      id: "SZ-ID-0003",
      batchNumber: "SZ-2026-0003",
      dateIssuedToSizing: "2026-06-20",
      bagsIssued: 15,
      weightIssuedKg: 750,
      sizingDoneBy: "In-house",
      status: "In Process",
      remarks: "Chemical starch bath in progress."
    }
  ];

  return {
    batches: seededBatches,
    rawTanaBagsAvailable: 70,
    sizedTanaBags: 50, // 30 + 20 from completed batches
    sizedTanaWeightKg: 2437 // 1462 + 975
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
        set((state) => ({
          batches: [batch, ...state.batches]
          // Note: Raw tana deduction is triggered from tana store
        }));
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
          const lossBags = batch.bagsIssued - bagsBack;

          const updatedBatch: SizingBatch = {
            ...batch,
            dateReceivedFromSizing: new Date().toISOString().split("T")[0],
            bagsReceivedBack: bagsBack,
            weightReceivedKg: weightBack,
            sizingLossBags: lossBags,
            sizingLossKg: parseFloat(lossKg.toFixed(2)),
            lossPercent,
            sizingChargesRs: chargesRs ?? batch.sizingChargesRs,
            status: "Completed"
          };

          return {
            batches: state.batches.map((b) => (b.id === batchId ? updatedBatch : b)),
            sizedTanaBags: state.sizedTanaBags + bagsBack,
            sizedTanaWeightKg: parseFloat((state.sizedTanaWeightKg + weightBack).toFixed(2))
          };
        });
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
