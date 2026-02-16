import { Fragment } from "react";
import { Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { OrderStatusIcon, cn, getVietnameseOrderStatus } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrderModeType, OrderStatus, TableStatus } from "@/constants/type";
import { TableListResType } from "@/schemaValidations/table.schema";
import { ServingGuestByTableNumber, Statics, StatusCountObject } from "@/app/manage/orders/order-table";
import Link from "next/link";
import { useAppStore } from "@/components/app-provider";

// Ví dụ:
// const statics: Statics = {
//   status: {
//     Pending: 1,
//     Processing: 2,
//     Delivered: 3,
//     Paid: 5,
//     Rejected: 0
//   },
//   table: {
//     1: { // Bàn số 1
//       20: { // Guest 20
//         Pending: 1,
//         Processing: 2,
//         Delivered: 3,
//         Paid: 5,
//         Rejected: 0
//       },
//       21: { // Guest 21
//         Pending: 1,
//         Processing: 2,
//         Delivered: 3,
//         Paid: 5,
//         Rejected: 0
//       }
//     }
//   }
// }
export default function OrderStatics({
  statics,
  tableList,
  servingGuestByTableNumber,
}: {
  statics: Statics;
  tableList: TableListResType["data"];
  servingGuestByTableNumber: ServingGuestByTableNumber;
}) {
  const setSelectedTableGuests = useAppStore((state) => state.setSelectedTableGuests);

  const handleTableClick = (tableNumber: number) => {
    setSelectedTableGuests(servingGuestByTableNumber[tableNumber]);
  };

  return (
    <Fragment>
      <div className="grid grid-cols-5 gap-4 py-4">
        {tableList.map((table) => {
          const tableNumber: number = table.number;
          const statusTable = table.status;
          const typeTable = table.typeQR;
          const tableStatics: Record<number, StatusCountObject> | undefined = statics.table[tableNumber];
          let isEmptyTable = true;
          let countObject: StatusCountObject = {
            Pending: 0,
            Processing: 0,
            Delivered: 0,
            Paid: 0,
            Rejected: 0,
          };
          const servingGuestCount = Object.values(servingGuestByTableNumber[tableNumber] ?? []).length;
          if (tableStatics) {
            for (const guestId in tableStatics) {
              const guestStatics = tableStatics[Number(guestId)];
              if (
                [guestStatics.Pending, guestStatics.Processing, guestStatics.Delivered].some(
                  (status) => status !== 0 && status !== undefined,
                )
              ) {
                isEmptyTable = false;
              }
              countObject = {
                Pending: countObject.Pending + (guestStatics.Pending ?? 0),
                Processing: countObject.Processing + (guestStatics.Processing ?? 0),
                Delivered: countObject.Delivered + (guestStatics.Delivered ?? 0),
                Paid: countObject.Paid + (guestStatics.Paid ?? 0),
                Rejected: countObject.Rejected + (guestStatics.Rejected ?? 0),
              };
            }
          }
          return (
            <Link
              key={tableNumber}
              className={cn(`text-sm flex items-stretch gap-2 border p-2 rounded-md`, {
                "bg-orange-400": !isEmptyTable && typeTable === OrderModeType.DINE_IN,
                "bg-red-500": !isEmptyTable && typeTable === OrderModeType.TAKE_OUT,
                "border-transparent": !isEmptyTable,
              })}
              href={`/manage/orders/tables/${tableNumber}`}
              onClick={() => handleTableClick(tableNumber)}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="font-semibold text-center text-lg">
                  {typeTable === OrderModeType.DINE_IN ? `Bàn ${tableNumber} ` : `Mang đi`}
                </div>
              </div>
              <Separator
                orientation="vertical"
                className={cn("shrink-0 h-auto mx-2", {
                  "bg-white": !isEmptyTable,
                })}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{servingGuestCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Đang phục vụ: {servingGuestCount} khách</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Separator
                orientation="vertical"
                className={cn("shrink-0 h-auto mx-2", {
                  "bg-white": !isEmptyTable,
                })}
              />

              {statusTable === TableStatus.Hidden && (
                <div className="flex justify-between items-center text-sm">Ẩn</div>
              )}
              {isEmptyTable && statusTable !== TableStatus.Hidden && <div className="flex justify-between items-center text-sm">Trống</div>}
              {!isEmptyTable && (
                <div className="flex flex-col gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Pending className="w-4 h-4" />
                          <span>{countObject[OrderStatus.Pending] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Pending)}:{" "}
                        {countObject[OrderStatus.Pending] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Processing className="w-4 h-4" />
                          <span>{countObject[OrderStatus.Processing] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Processing)}:{" "}
                        {countObject[OrderStatus.Processing] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex gap-2 items-center">
                          <OrderStatusIcon.Delivered className="w-4 h-4" />
                          <span>{countObject[OrderStatus.Delivered] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Delivered)}:{" "}
                        {countObject[OrderStatus.Delivered] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </Fragment>
  );
}
