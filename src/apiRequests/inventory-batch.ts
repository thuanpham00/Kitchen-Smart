import { InventoryBatchListResType } from "@/schemaValidations/inventory-batch.schema";
import http from "@/utils/http";

export const inventoryBatchApiRequests = {
  listBatchesById: (id: number) => {
    return http.get<InventoryBatchListResType>(`/inventory-batches/${id}`);
  },
};
