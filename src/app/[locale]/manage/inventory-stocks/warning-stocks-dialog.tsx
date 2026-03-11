import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InventoryStockListNoPaginationResType } from "@/schemaValidations/inventory-stock.schema";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AlertTriangle, PackageX } from "lucide-react";

export default function WarningStocksDialog({
  data,
}: {
  data: InventoryStockListNoPaginationResType["data"];
}) {
  const t = useTranslations("ManageInventoryStocks");

  const lowStockItems = data.filter((item) => item.minStock && item.quantity < item.minStock) || [];
  const overstockItems = data.filter((item) => item.maxStock && item.quantity > item.maxStock) || [];

  const [selectedTabPage, setSelectedTabPage] = useState<string>("lowStock");

  const hasWarnings = lowStockItems.length > 0 || overstockItems.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {t("stockWarnings")}
          {hasWarnings && (
            <Badge variant="destructive" className="ml-2">
              {lowStockItems.length + overstockItems.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {t("stockWarningsTitle")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTabPage} onValueChange={(val) => setSelectedTabPage(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lowStock" className="relative">
              <PackageX className="w-4 h-4 mr-2" />
              {t("lowStockWarning")}
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {lowStockItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overstock" className="relative">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t("overstockWarning")}
              {overstockItems.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">
                  {overstockItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lowStock" className="mt-4">
            <div className="h-100 overflow-y-auto pr-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PackageX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t("noLowStockItems")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Image
                        src={item.ingredientImage as string}
                        alt={item.ingredientName as string}
                        width={60}
                        height={60}
                        className="w-16 h-16 rounded-md object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {item.ingredientName}
                        </h4>
                        {item.ingredientCategory && (
                          <p className="text-xs text-gray-600 mb-1">{item.ingredientCategory}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("currentQuantity")}:</span>
                            <span className="font-bold text-red-600">{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("minStock")}:</span>
                            <span className="font-semibold text-gray-900">{item.minStock}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("needed")}:</span>
                            <span className="font-semibold text-orange-600">
                              {(item.minStock || 0) - item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="overstock" className="mt-4">
            <div className="h-100 overflow-y-auto pr-4">
              {overstockItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t("noOverstockItems")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overstockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                    >
                      <Image
                        src={item.ingredientImage as string}
                        alt={item.ingredientName as string}
                        width={60}
                        height={60}
                        className="w-16 h-16 rounded-md object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {item.ingredientName}
                        </h4>
                        {item.ingredientCategory && (
                          <p className="text-xs text-gray-600 mb-1">{item.ingredientCategory}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("currentQuantity")}:</span>
                            <span className="font-bold text-orange-600">{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("maxStock")}:</span>
                            <span className="font-semibold text-gray-900">{item.maxStock}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t("excess")}:</span>
                            <span className="font-semibold text-red-600">
                              {item.quantity - (item.maxStock || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
