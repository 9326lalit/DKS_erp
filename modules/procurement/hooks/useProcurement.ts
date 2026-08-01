import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tanaApiService } from "@/lib/services/tana-api";
import { banaApiService } from "@/lib/services/bana-api";
import { PurchaseOrder, GoodsReceiptNote, PurchaseInvoice } from "../types";

export function useProcurement(materialType: "Tana" | "Bana" = "Tana") {
  const queryClient = useQueryClient();

  const queryKeyPrefix = materialType === "Tana" ? "tana" : "bana";

  const posQuery = useQuery({
    queryKey: [`${queryKeyPrefix}-pos`],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      if (materialType === "Tana") {
        return (await tanaApiService.getPOs()) as unknown as PurchaseOrder[];
      }
      return (await banaApiService.getPOs()) as unknown as PurchaseOrder[];
    }
  });

  const grnsQuery = useQuery({
    queryKey: [`${queryKeyPrefix}-grns`],
    queryFn: async (): Promise<GoodsReceiptNote[]> => {
      if (materialType === "Tana") {
        return (await tanaApiService.getGRNs()) as unknown as GoodsReceiptNote[];
      }
      return (await banaApiService.getGRNs()) as unknown as GoodsReceiptNote[];
    }
  });

  const pisQuery = useQuery({
    queryKey: [`${queryKeyPrefix}-pis`],
    queryFn: async (): Promise<PurchaseInvoice[]> => {
      if (materialType === "Tana") {
        return (await tanaApiService.getPIs()) as unknown as PurchaseInvoice[];
      }
      return (await banaApiService.getPIs()) as unknown as PurchaseInvoice[];
    }
  });

  const createPOMutation = useMutation({
    mutationFn: async (po: PurchaseOrder) => {
      if (materialType === "Tana") {
        return await tanaApiService.createPO(po as any);
      }
      return await banaApiService.createPO(po as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-pos`] });
    }
  });

  const createGRNMutation = useMutation({
    mutationFn: async (grn: GoodsReceiptNote) => {
      if (materialType === "Tana") {
        return await tanaApiService.createGRN(grn as any);
      }
      return await banaApiService.createGRN(grn as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-grns`] });
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-pos`] });
    }
  });

  const createPIMutation = useMutation({
    mutationFn: async (pi: PurchaseInvoice) => {
      if (materialType === "Tana") {
        return await tanaApiService.createPI(pi as any);
      }
      return await banaApiService.createPI(pi as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKeyPrefix}-pis`] });
    }
  });

  return {
    purchaseOrders: posQuery.data || [],
    goodsReceipts: grnsQuery.data || [],
    purchaseInvoices: pisQuery.data || [],
    isLoading: posQuery.isLoading || grnsQuery.isLoading || pisQuery.isLoading,
    createPO: createPOMutation.mutateAsync,
    createGRN: createGRNMutation.mutateAsync,
    createPI: createPIMutation.mutateAsync
  };
}
