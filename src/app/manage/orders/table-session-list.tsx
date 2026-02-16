import OrderStatics from "@/app/manage/orders/order-statics";
import { ServingGuestByTableNumber, Statics } from "@/app/manage/orders/order-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableListResType } from "@/schemaValidations/table.schema";

export default function TableSessionList({
  tableListSortedByNumber,
  servingGuestByTableNumber,
  statics,
}: {
  tableListSortedByNumber: TableListResType["data"];
  servingGuestByTableNumber: ServingGuestByTableNumber;
  statics: Statics;
}) {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle className="text-xl">Phiên bàn</CardTitle>
        <CardDescription>Quản lý phiên bàn</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />
      </CardContent>
    </Card>
  );
}
