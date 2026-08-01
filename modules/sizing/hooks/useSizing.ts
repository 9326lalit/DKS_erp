import { useSizingStore } from "@/lib/store/use-sizing-store";

export function useSizing() {
  const store = useSizingStore();

  const totalMaterialReceivedKg = store.openingStocks.reduce((acc, curr) => acc + curr.totalWeightKg, 0);
  const totalMaterialUsedKg = store.openingStocks.reduce((acc, curr) => acc + curr.materialUsedKg, 0);
  const remainingStockKg = Math.max(0, totalMaterialReceivedKg - totalMaterialUsedKg);

  const availablePipesCount = store.pipes.filter((p) => p.status === "Available").length;
  const mountedPipesCount = store.pipes.filter((p) => p.status === "Mounted on Loom").length;
  const emptyPipesCount = store.pipes.filter((p) => p.status === "Empty Pipe").length;

  return {
    batches: store.batches,
    openingStocks: store.openingStocks,
    pipes: store.pipes,
    factoryReceivings: store.factoryReceivings,
    totalMaterialReceivedKg,
    totalMaterialUsedKg,
    remainingStockKg,
    availablePipesCount,
    mountedPipesCount,
    emptyPipesCount,
    createBatch: store.createBatch,
    createOpeningStock: store.createOpeningStock,
    createPipeItem: store.createPipeItem,
    updatePipeStatus: store.updatePipeStatus,
    createFactoryReceiving: store.createFactoryReceiving
  };
}
