import {
  InventoryStockListNoPaginationResType,
  InventoryStockListResType,
  InventoryStockQueryType,
  InventoryStockResType,
  UpdateInventoryStockBodyType,
} from "@/schemaValidations/inventory-stock.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const inventoryStockApiRequests = {
  list: (params: InventoryStockQueryType) => {
    return http.get<InventoryStockListResType>("/inventory-stocks?" + queryString.stringify(params));
  },
  listNoPagination: () => {
    return http.get<InventoryStockListNoPaginationResType>("/inventory-stocks/all");
  },
  updateInventoryStock: (id: number, body: UpdateInventoryStockBodyType) => {
    return http.put<InventoryStockResType>(`/inventory-stocks/${id}`, body);
  },
  getInventoryStockById: (id: number) => {
    return http.get<InventoryStockResType>(`/inventory-stocks/${id}`);
  },
};
