// Tana Procurement API Service
import { useTanaStore, TanaPO, TanaGRN, TanaPI } from "@/lib/store/use-tana-store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tanaApiService = {
  // Purchase Orders
  async getPOs(): Promise<TanaPO[]> {
    await delay(200);
    return useTanaStore.getState().purchaseOrders;
  },
  async createPO(po: TanaPO): Promise<TanaPO> {
    await delay(350);
    useTanaStore.getState().createPO(po);
    return po;
  },
  async updatePO(po: TanaPO): Promise<TanaPO> {
    await delay(300);
    useTanaStore.getState().updatePO(po);
    return po;
  },
  async deletePO(id: string): Promise<void> {
    await delay(200);
    useTanaStore.getState().deletePO(id);
  },

  // GRNs
  async getGRNs(): Promise<TanaGRN[]> {
    await delay(200);
    return useTanaStore.getState().grns;
  },
  async createGRN(grn: TanaGRN): Promise<TanaGRN> {
    await delay(350);
    useTanaStore.getState().createGRN(grn);
    return grn;
  },
  async updateGRN(grn: TanaGRN): Promise<TanaGRN> {
    await delay(300);
    useTanaStore.getState().updateGRN(grn);
    return grn;
  },

  // Purchase Invoices
  async getPIs(): Promise<TanaPI[]> {
    await delay(200);
    return useTanaStore.getState().invoices;
  },
  async createPI(pi: TanaPI): Promise<TanaPI> {
    await delay(350);
    useTanaStore.getState().createPI(pi);
    return pi;
  },
  async updatePI(pi: TanaPI): Promise<TanaPI> {
    await delay(300);
    useTanaStore.getState().updatePI(pi);
    return pi;
  },

  // Stock
  getStock() {
    const state = useTanaStore.getState();
    return { bags: state.rawStockBags, weightKg: state.rawStockWeightKg };
  },
  async deductRawStock(bags: number, weightKg: number) {
    await delay(100);
    useTanaStore.getState().deductRawStock(bags, weightKg);
  }
};
