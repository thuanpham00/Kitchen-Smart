import { ExportReceiptListResType, ExportReceiptQueryType, ExportReceiptResType } from "@/schemaValidations/export-receipt.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const exportInventoryApiRequests = {
  listExportInventory: (params: ExportReceiptQueryType) => {
    return http.get<ExportReceiptListResType>(`/export-receipts?` + queryString.stringify(params));
  },
  getExportInventoryById: (id: number) => {
    return http.get<ExportReceiptResType>(`/export-receipts/${id}`);
  },
};
