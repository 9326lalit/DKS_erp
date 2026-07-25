// Bana Procurement API Service
import { useBanaStore, BanaPO, BanaGRN, BanaPI } from "@/lib/store/use-bana-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const banaApiService = {
  async getPOs(): Promise<BanaPO[]> {
    await delay(200);
    return useBanaStore.getState().purchaseOrders;
  },
  async createPO(po: BanaPO): Promise<BanaPO> {
    await delay(350);
    useBanaStore.getState().createPO(po);
    return po;
  },
  async updatePO(po: BanaPO): Promise<BanaPO> {
    await delay(300);
    useBanaStore.getState().updatePO(po);
    return po;
  },
  async deletePO(id: string): Promise<void> {
    await delay(200);
    useBanaStore.getState().deletePO(id);
  },

  async getGRNs(): Promise<BanaGRN[]> {
    await delay(200);
    return useBanaStore.getState().grns;
  },
  async createGRN(grn: BanaGRN): Promise<BanaGRN> {
    await delay(350);
    useBanaStore.getState().createGRN(grn);
    return grn;
  },
  async updateGRN(grn: BanaGRN): Promise<BanaGRN> {
    await delay(300);
    useBanaStore.getState().updateGRN(grn);
    return grn;
  },
  async deleteGRN(id: string): Promise<void> {
    await delay(200);
    useBanaStore.getState().deleteGRN(id);
  },

  async getPIs(): Promise<BanaPI[]> {
    await delay(200);
    return useBanaStore.getState().invoices;
  },
  async createPI(pi: BanaPI): Promise<BanaPI> {
    await delay(350);
    useBanaStore.getState().createPI(pi);
    return pi;
  },
  async updatePI(pi: BanaPI): Promise<BanaPI> {
    await delay(300);
    useBanaStore.getState().updatePI(pi);
    return pi;
  },
  async deletePI(id: string): Promise<void> {
    await delay(200);
    useBanaStore.getState().deletePI(id);
  },

  getStock() {
    const state = useBanaStore.getState();
    return { bags: state.stockBags, weightKg: state.stockWeightKg };
  }
};
