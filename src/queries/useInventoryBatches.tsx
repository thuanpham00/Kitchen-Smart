import { inventoryBatchApiRequests } from "@/apiRequests/inventory-batch";
import { useQuery } from "@tanstack/react-query";

export const useGetInventoryBatchDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["inventory-batch-detail", id],
    queryFn: () => {
      return inventoryBatchApiRequests.listBatchesById(id);
    },
    enabled,
  });
};
