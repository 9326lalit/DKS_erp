import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mastersApiService } from "@/lib/services/masters-api";
import { useMastersStore } from "@/lib/store/use-masters-store";
import { Factory, Loom, SizingMill, Party, Labour } from "../types";

export function useMasters() {
  const queryClient = useQueryClient();
  const store = useMastersStore();

  const factoriesQuery = useQuery({
    queryKey: ["factories"],
    queryFn: () => mastersApiService.getFactories()
  });

  const loomsQuery = useQuery({
    queryKey: ["looms"],
    queryFn: () => mastersApiService.getLooms()
  });

  const sizingMillsQuery = useQuery({
    queryKey: ["sizingMills"],
    queryFn: () => mastersApiService.getSizingMills()
  });

  const partiesQuery = useQuery({
    queryKey: ["parties"],
    queryFn: () => mastersApiService.getParties()
  });

  const labourQuery = useQuery({
    queryKey: ["labour"],
    queryFn: () => mastersApiService.getLabour()
  });

  const createLoomMutation = useMutation({
    mutationFn: async (loom: Loom) => {
      store.createLoom(loom);
      return loom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["looms"] });
    }
  });

  return {
    factories: factoriesQuery.data || store.factories,
    looms: loomsQuery.data || store.looms,
    sizingMills: sizingMillsQuery.data || store.sizingMills,
    parties: partiesQuery.data || store.parties,
    labour: labourQuery.data || store.labour,
    isLoading:
      factoriesQuery.isLoading ||
      loomsQuery.isLoading ||
      sizingMillsQuery.isLoading ||
      partiesQuery.isLoading ||
      labourQuery.isLoading,
    createLoom: createLoomMutation.mutateAsync,
    isCreatingLoom: createLoomMutation.isPending
  };
}
