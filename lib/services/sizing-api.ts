// Sizing API Service
import { useSizingStore, SizingBatch } from "@/lib/store/use-sizing-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sizingApiService = {
  async getBatches(): Promise<SizingBatch[]> {
    await delay(200);
    return useSizingStore.getState().batches;
  },
  async createBatch(batch: SizingBatch): Promise<SizingBatch> {
    await delay(350);
    useSizingStore.getState().createBatch(batch);
    return batch;
  },
  async updateBatch(batch: SizingBatch): Promise<SizingBatch> {
    await delay(300);
    useSizingStore.getState().updateBatch(batch);
    return batch;
  },
  async completeBatch(batchId: string, bagsBack: number, weightBack: number, chargesRs?: number): Promise<void> {
    await delay(400);
    useSizingStore.getState().completeBatch(batchId, bagsBack, weightBack, chargesRs);
  },
  getStock() {
    const state = useSizingStore.getState();
    return {
      rawTanaBags: state.rawTanaBagsAvailable,
      sizedTanaBags: state.sizedTanaBags,
      sizedTanaWeightKg: state.sizedTanaWeightKg
    };
  }
};
