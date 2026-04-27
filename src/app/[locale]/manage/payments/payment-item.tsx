/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentItemType, PaymentTableContext } from "@/app/[locale]/manage/payments/payment-table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import { PaymentListResType } from "@/schemaValidations/payment.schema";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { Fragment } from "react/jsx-runtime";

export const getGroupColor = (groupId: number) => {
  const colors = [
    "bg-blue-50 dark:bg-blue-950/30 border-l-blue-400",
    "bg-green-50 dark:bg-green-950/30 border-l-green-400",
    "bg-purple-50 dark:bg-purple-950/30 border-l-purple-400",
    "bg-pink-50 dark:bg-pink-950/30 border-l-pink-400",
    "bg-yellow-50 dark:bg-yellow-950/30 border-l-yellow-400",
    "bg-indigo-50 dark:bg-indigo-950/30 border-l-indigo-400",
    "bg-orange-50 dark:bg-orange-950/30 border-l-orange-400",
    "bg-teal-50 dark:bg-teal-950/30 border-l-teal-400",
  ];
  return colors[groupId % colors.length];
};

export const getPaymentMethodLabel = (method: string, t: any) => {
  switch (method) {
    case "CASH":
      return `${t("cash")}`;
    case "SEPAY":
      return `${t("sepay")}`;
    default:
      return method;
  }
};

export const getVietnamesePaymentStatus = (status: string, t: any) => {
  switch (status) {
    case "Paid":
      return t("paid");
    case "Pending":
      return t("pending");
    case "Failed":
      return t("failed");
    case "Cancelled":
      return t("cancelled");
    default:
      return status;
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Failed":
      return "bg-red-400 text-red-800 border-red-300";
    case "Cancelled":
      return "bg-red-500 text-white border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export default function PaymentItem({
  data,
  paymentGroups,
  indexForGroup,
}: {
  data: PaymentListResType["data"][0];
  paymentGroups: Record<string, PaymentItemType[]>;
  indexForGroup: number;
}) {
  const { setPaymentIdEdit } = useContext(PaymentTableContext);

  const t = useTranslations("ManagePayments");
  const paymentGroup = data.paymentGroup;
  const groupSize = paymentGroup ? paymentGroups[paymentGroup.id]?.length : 0;
  const isGrouped = groupSize && groupSize > 1;

  const tableNumber = data.tableNumber;
  const guest = data.guest;

  const orders = data.orders;
  const totalQuantity = orders.reduce((acc, order) => acc + order.quantity, 0);

  return (
    <div
      className={cn("grid grid-cols-10 gap-2 items-center p-2", {
        [`border-l-4 ${paymentGroup ? getGroupColor(paymentGroup.id) : ""}`]: isGrouped,
        [``]: !isGrouped,
      })}
    >
      <div className="col-span-1">
        {isGrouped && paymentGroup ? (
          <Badge variant="outline" className="text-xs">
            {indexForGroup}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {t("billInvidiual", { id: data.id })}
          </Badge>
        )}
      </div>
      <div className="col-span-1 space-y-1">
        {tableNumber ? (
          <Fragment>
            <div className="font-semibold">{t("tableLabel", { number: data.tableNumber as number })}</div>
            {data.guest && (
              <div className="text-xs text-muted-foreground">
                {data.guest.name}{" "}
                <Badge variant="outline" className="text-xs">
                  #{data.guest.id}
                </Badge>
              </div>
            )}
          </Fragment>
        ) : guest ? (
          <div className="space-y-1">
            <div className="font-semibold">{guest.name}</div>
            <Badge variant="outline" className="text-xs">
              #{guest.id}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
      <div className="col-span-1">
        <div className="font-semibold text-orange-600">{formatCurrency(data.totalAmount)}</div>
      </div>
      <div className="col-span-1">
        <div className="text-sm">{getPaymentMethodLabel(data.paymentMethod, t)}</div>
      </div>
      <div className="col-span-1">
        <Badge className={getPaymentStatusColor(data.status)}>
          {getVietnamesePaymentStatus(data.status, t)}
        </Badge>
      </div>
      <div className="col-span-1">
        <div className="text-left">
          <div className="font-semibold">{t("orderCount", { count: orders.length })}</div>
          <div className="text-xs text-muted-foreground">{t("itemCount", { count: totalQuantity })}</div>
        </div>
      </div>
      <div className="col-span-1 text-sm">
        <div>{data.createdBy.name}</div>
        <div className="text-xs text-muted-foreground">#{data.createdBy.id}</div>
      </div>
      <div className="col-span-1">
        <div className="text-xs whitespace-nowrap">{formatDateTimeToLocaleString(data.createdAt)}</div>
      </div>
      <div className="col-span-1">
        <div className="max-w-50 truncate text-xs text-muted-foreground">{data.note || "-"}</div>
      </div>
      <div className="col-span-1">
        <button
          onClick={() => setPaymentIdEdit(data.id)}
          className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-400 text-white text-sm"
        >
          {t("detail")}
        </button>
      </div>
    </div>
  );
}
