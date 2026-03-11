import { exportInventoryApiRequests } from "@/apiRequests/export-inventory";
import { ExportReceiptQueryType } from "@/schemaValidations/export-receipt.schema";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetListExportReceiptQuery = (params: ExportReceiptQueryType) => {
  return useQuery({
    queryKey: ["export-receipts", params],
    queryFn: () => {
      return exportInventoryApiRequests.listExportInventory(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetExportReceiptDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["export-receipt-detail", id],
    queryFn: () => {
      return exportInventoryApiRequests.getExportInventoryById(id);
    },
    enabled,
  });
};
