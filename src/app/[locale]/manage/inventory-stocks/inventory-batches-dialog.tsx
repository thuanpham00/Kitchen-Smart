import { InventoryStockTableContext } from "@/app/[locale]/manage/inventory-stocks/inventory-stock-table";
import { useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useGetInventoryBatchDetailQuery } from "@/queries/useInventoryBatches";
import { InventoryBatchListResType } from "@/schemaValidations/inventory-batch.schema";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, TrendingUp } from "lucide-react";

export default function InventoryBatchesDialog({
  showModal,
  setShowModal,
}: {
  showModal: number | null;
  setShowModal: (id: number | null) => void;
}) {
  const t = useTranslations("ManageInventoryStocks");
  const { inventoryStockIdEdit, setInventoryStockIdEdit } = useContext(InventoryStockTableContext);
  const inventoryBatchDetail = useGetInventoryBatchDetailQuery({
    id: inventoryStockIdEdit as number,
    enabled: Boolean(inventoryStockIdEdit),
  });
  const dataInventoryBatchDetail = inventoryBatchDetail.data?.payload
    .data as InventoryBatchListResType["data"];

  const reset = () => {
    setShowModal(null);
    setInventoryStockIdEdit(undefined);
  };

  if (!dataInventoryBatchDetail || dataInventoryBatchDetail.length === 0) return null;

  const inventoryStock = dataInventoryBatchDetail[0].inventoryStock;
  const ingredient = inventoryStock?.ingredient;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500 text-white font-medium">{t("statusAvailable")}</Badge>;
      case "Low":
        return <Badge className="bg-yellow-500 text-white font-medium">{t("statusLow")}</Badge>;
      case "Empty":
        return <Badge className="bg-red-500 text-white font-medium">{t("statusEmpty")}</Badge>;
      case "Expired":
        return <Badge className="bg-gray-500">{t("statusExpired")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog
      open={showModal === 2 ? true : false}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-6xl max-h-[calc(100vh-50px)] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("listBatches", {
              name: ingredient?.name || "",
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Block bên trái: Thông tin Inventory Stock */}
          <div className="md:col-span-1 space-y-4">
            <div className="border rounded-lg p-4 bg-linear-to-br from-blue-50 to-white max-h-130 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <Package className="w-5 h-5" />
                {t("stockInformation")}
              </h3>

              {ingredient?.image && (
                <div className="mb-4">
                  <Image
                    src={ingredient.image}
                    alt={ingredient.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t("ingredientName")}</p>
                  <p className="font-semibold text-lg text-black">{ingredient?.name}</p>
                </div>

                {ingredient?.category && (
                  <div>
                    <p className="text-sm text-gray-600">{t("category")}</p>
                    <p className="font-medium text-black">{ingredient.category}</p>
                  </div>
                )}

                {ingredient?.description && (
                  <div>
                    <p className="text-sm text-gray-600">{t("description2")}</p>
                    <p className="text-sm text-gray-700">{ingredient.description}</p>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">{t("currentQuantity")}</p>
                      <p className="font-bold text-blue-600 text-lg">
                        {inventoryStock?.quantity || 0} {ingredient?.unit || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t("totalBatches")}</p>
                      <p className="font-bold text-lg text-black">{dataInventoryBatchDetail.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-green-600 font-semibold">{t("minStock")}</p>
                    <p className="font-medium text-black">{inventoryStock?.minStock ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-semibold">{t("maxStock")}</p>
                    <p className="font-medium text-black">{inventoryStock?.maxStock ?? "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600">{t("avgUnitPrice")}</p>
                  <p className="font-semibold text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(inventoryStock?.avgUnitPrice || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">{t("totalValue")}</p>
                  <p className="font-bold text-lg text-green-700">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(inventoryStock?.totalValue || 0)}
                  </p>
                </div>

                {inventoryStock?.lastImport && (
                  <div>
                    <p className="text-xs text-gray-600">{t("lastImport")}</p>
                    <p className="text-sm flex items-center gap-1 text-black">
                      <Calendar className="w-3 h-3" />
                      {new Date(inventoryStock.lastImport).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Block bên phải: Danh sách Batches */}
          <div className="md:col-span-2">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t("batchList")} ({dataInventoryBatchDetail.length})
              </h3>

              <div className="space-y-3 max-h-110 overflow-y-auto pr-2">
                {dataInventoryBatchDetail.map((batch) => (
                  <div
                    key={batch.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white text-black"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600">{t("batchNumber")}</p>
                        <p className="font-bold text-lg">{batch.batchNumber}</p>
                      </div>
                      <div>{getStatusBadge(batch.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">{t("quantity")}</p>
                        <p className="font-semibold text-blue-600">
                          {batch.quantity} {inventoryStock?.ingredient.unit || ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">{t("unitPrice")}</p>
                        <p className="font-semibold">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(batch.unitPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">{t("batchValue")}</p>
                        <p className="font-semibold text-green-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(batch.quantity * batch.unitPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="text-green-600 font-semibold">{t("importDate")}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(batch.importDate).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-red-600 font-semibold">{t("expiryDate")}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {batch.expiryDate
                            ? new Date(batch.expiryDate).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : t("noExpiryDate")}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">{t("createdAt")}</p>
                        <p className="text-xs">
                          {new Date(batch.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
