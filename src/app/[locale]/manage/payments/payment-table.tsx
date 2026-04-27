/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { createContext, useState } from "react";
import AutoPagination from "@/components/auto-pagination";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import {
  GetPaymentsQueryType,
  PaymentListResType,
  SearchPayment,
  SearchPaymentType,
} from "@/schemaValidations/payment.schema";
import { useGetListPaymentQuery } from "@/queries/usePayment";
import FormPaymentDetail from "@/app/[locale]/manage/payments/form-payment-detail";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RefreshCcw, Search } from "lucide-react";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  getGroupColor,
  getPaymentMethodLabel,
  getPaymentStatusColor,
  getVietnamesePaymentStatus,
} from "@/app/[locale]/manage/payments/payment-item";
import { formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import useSearchForm from "@/hooks/useSearchForm";
import { Table } from "antd";

export type PaymentItemType = PaymentListResType["data"][0];

type PaymentRow = {
  key: string;
  type: "group" | "item";
  groupId?: string;
  totalAmountGroup?: number;
  payment?: PaymentItemType;
  indexForGroup?: number;
  isGrouped?: boolean;
  groupColor?: string;
};

// sử dụng trong phạm vị component AccountTable và các component con của nó
export const PaymentTableContext = createContext<{
  setPaymentIdEdit: (value: number) => void;
  paymentIdEdit: number | undefined;
}>({
  setPaymentIdEdit: (value: number | undefined) => {},
  paymentIdEdit: undefined,
});

export default function PaymentTable() {
  const t = useTranslations("ManagePayments");

  const queryParams = useQueryParams();

  const limit = queryParams.limit ? Number(queryParams.limit) : 10;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: GetPaymentsQueryType = omitBy(
    {
      page,
      limit,
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      paymentMethod: queryParams.paymentMethod ? queryParams.paymentMethod : undefined,
      numberTable: queryParams.numberTable ? Number(queryParams.numberTable) : undefined,
    },
    isUndefined,
  ) as GetPaymentsQueryType;

  const form = useForm<SearchPaymentType>({
    resolver: zodResolver(SearchPayment),
    defaultValues: {
      fromDate: queryParams.fromDate ? new Date(queryParams.fromDate as string).toISOString() : undefined,
      toDate: queryParams.toDate ? new Date(queryParams.toDate as string).toISOString() : undefined,
      paymentMethod: queryParams.paymentMethod as "CASH" | "SEPAY" | undefined,
      numberTable: queryParams.numberTable ? Number(queryParams.numberTable) : undefined,
    },
  });

  const { reset, submit } = useSearchForm(form, queryConfig, "/manage/payments");

  const invalidSubmit = (err: FieldErrors<SearchPaymentType>) => {
    console.log(err);
    if (err.fromDate) {
      toast.error(err.fromDate.message || t("invalidDate"), {
        duration: 4000,
      });
    }
    if (err.toDate) {
      toast.error(err.toDate.message || t("invalidDate"), {
        duration: 4000,
      });
    }
  };

  const [paymentIdEdit, setPaymentIdEdit] = useState<number | undefined>();

  const { data: listPayment, refetch, isFetching } = useGetListPaymentQuery(queryConfig);

  const data: PaymentListResType["data"] = listPayment?.payload.data || [];
  const currentPage = (listPayment?.payload.pagination && listPayment?.payload.pagination.page) || 0;
  const totalPages = (listPayment?.payload.pagination && listPayment?.payload.pagination.totalPages) || 0;
  const total = (listPayment?.payload.pagination && listPayment?.payload.pagination.total) || 0;

  // Tạo map để track các payment group và đếm số lượng payment trong mỗi group
  const paymentGroups: Record<string, PaymentItemType[]> = {};
  data.forEach((payment) => {
    if (payment.paymentGroup) {
      const groupId = payment.paymentGroup.id;
      if (!paymentGroups[groupId]) paymentGroups[groupId] = [];
      paymentGroups[groupId].push(payment);
    } else {
      if (!paymentGroups[`no-group`]) paymentGroups[`no-group`] = [];
      paymentGroups[`no-group`].push(payment);
    }
  });

  //Đúng, bill chung (paymentGroup) nên dùng cho admin để quản lý, theo dõi nhóm thanh toán và biết nhóm đó gồm những bill lẻ của khách nào.
  //Còn khách thì chỉ nên thấy bill lẻ của mình để biết chi tiết đã order món nào, số tiền từng lần thanh toán, lịch sử cá nhân.
  return (
    <PaymentTableContext.Provider value={{ paymentIdEdit, setPaymentIdEdit }}>
      <div className="w-full">
        <Form {...form}>
          <form
            noValidate
            className="py-4"
            onReset={reset}
            onSubmit={form.handleSubmit(submit, invalidSubmit)}
          >
            <div className="flex justify-between flex-wrap items-center gap-2">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{t("from")}</span>
                      <Input
                        type="datetime-local"
                        placeholder={t("fromDate")}
                        className="text-sm"
                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                        onChange={(event) =>
                          field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                        }
                      />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{t("to")}</span>
                      <Input
                        type="datetime-local"
                        placeholder={t("toDate")}
                        className="text-sm"
                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                        onChange={(event) =>
                          field.onChange(event.target.value ? new Date(event.target.value) : undefined)
                        }
                      />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{t("paymentMethodLabel")}</span>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("chooseOption")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">{t("cash")}</SelectItem>
                          <SelectItem value="SEPAY">{t("sepay")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberTable"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{t("tableNumberLabel")}</span>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : Number(value));
                        }}
                      />
                    </div>
                  </FormItem>
                )}
              />
              <div className="ml-auto flex items-center gap-2">
                <Button className="" variant={"outline"} type="reset">
                  Reset
                </Button>
                <Button className="bg-blue-500!" variant={"outline"} type="submit">
                  <Search color="white" />
                </Button>
                <Button variant="outline" className="bg-red-500! hover:bg-red-600!" onClick={() => refetch()}>
                  <RefreshCcw color="white"/>
                </Button>
              </div>
            </div>
          </form>
        </Form>
        <div className="rounded-md border">
          <FormPaymentDetail id={paymentIdEdit} setId={setPaymentIdEdit} />

          <Table<PaymentRow>
            bordered
            pagination={false}
            loading={isFetching}
            rowClassName={(record) => {
              if (record.type === "group" && record.groupId) {
                return `border-l-4 ${getGroupColor(Number(record.groupId))}`;
              }
              if (record.type === "item" && record.isGrouped && record.groupColor) {
                return `border-l-4 ${record.groupColor}`;
              }
              return "";
            }}
            columns={[
              {
                title: "Type",
                key: "type",
                render: (_, record) => {
                  if (record.type === "group") {
                    return (
                      <span className="text-sm">{t("billGroup", { id: record.groupId as string })}</span>
                    );
                  }
                  const payment = record.payment;
                  if (!payment) return null;
                  if (record.isGrouped) {
                    return (
                      <Badge variant="outline" className="text-xs">
                        {record.indexForGroup}
                      </Badge>
                    );
                  }
                  return (
                    <Badge variant="outline" className="text-xs">
                      {t("billInvidiual", { id: payment.id })}
                    </Badge>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 2 } : {}),
              },
              {
                title: t("tableGuest"),
                key: "tableGuest",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  const tableNumber = payment.tableNumber;
                  const guest = payment.guest;
                  if (tableNumber) {
                    return (
                      <div className="space-y-1">
                        <div className="font-semibold">{t("tableLabel", { number: tableNumber })}</div>
                        {guest && (
                          <div className="text-xs text-muted-foreground">
                            {guest.name}{" "}
                            <Badge variant="outline" className="text-xs">
                              #{guest.id}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (guest) {
                    return (
                      <div className="space-y-1">
                        <div className="font-semibold">{guest.name}</div>
                        <Badge variant="outline" className="text-xs">
                          #{guest.id}
                        </Badge>
                      </div>
                    );
                  }
                  return <span className="text-muted-foreground">-</span>;
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("totalAmount"),
                key: "totalAmount",
                render: (_, record) => {
                  if (record.type === "group") {
                    return (
                      <div className="text-sm font-semibold text-orange-600">
                        {formatCurrency(record.totalAmountGroup || 0)}
                      </div>
                    );
                  }
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <div className="font-semibold text-orange-600">{formatCurrency(payment.totalAmount)}</div>
                  );
                },
              },
              {
                title: t("paymentMethod"),
                key: "paymentMethod",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return <div className="text-sm">{getPaymentMethodLabel(payment.paymentMethod, t)}</div>;
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("status"),
                key: "status",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <Badge className={getPaymentStatusColor(payment.status)}>
                      {getVietnamesePaymentStatus(payment.status, t)}
                    </Badge>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("orders"),
                key: "orders",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  const totalQuantity = payment.orders.reduce((acc, order) => acc + order.quantity, 0);
                  return (
                    <div className="text-left">
                      <div className="font-semibold">{t("orderCount", { count: payment.orders.length })}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("itemCount", { count: totalQuantity })}
                      </div>
                    </div>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("createdBy"),
                key: "createdBy",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <div className="text-sm">
                      <div>{payment.createdBy.name}</div>
                      <div className="text-xs text-muted-foreground">#{payment.createdBy.id}</div>
                    </div>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("createdAt"),
                key: "createdAt",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <div className="text-xs whitespace-nowrap">
                      {formatDateTimeToLocaleString(payment.createdAt)}
                    </div>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("note"),
                key: "note",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <div className="max-w-50 truncate text-xs text-muted-foreground">
                      {payment.note || "-"}
                    </div>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
              {
                title: t("actions"),
                key: "actions",
                render: (_, record) => {
                  if (record.type === "group") return null;
                  const payment = record.payment;
                  if (!payment) return null;
                  return (
                    <button
                      onClick={() => setPaymentIdEdit(payment.id)}
                      className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-400 text-white text-sm"
                    >
                      {t("detail")}
                    </button>
                  );
                },
                onCell: (record) => (record.type === "group" ? { colSpan: 0 } : {}),
              },
            ]}
            dataSource={Object.entries(paymentGroups)
              .sort(([, paymentsA], [, paymentsB]) => {
                const maxA = Math.max(...paymentsA.map((p) => new Date(p.createdAt).getTime()));
                const maxB = Math.max(...paymentsB.map((p) => new Date(p.createdAt).getTime()));
                return maxB - maxA;
              })
              .flatMap(([groupId, payments]) => {
                const rows: PaymentRow[] = [];
                const totalAmountGroup = payments.reduce((acc, payment) => acc + payment.totalAmount, 0);
                if (groupId !== "no-group") {
                  rows.push({
                    key: `group-${groupId}`,
                    type: "group",
                    groupId,
                    totalAmountGroup,
                  });
                }
                const groupSize = payments.length;
                payments.forEach((payment, index) => {
                  const groupColor = payment.paymentGroup
                    ? getGroupColor(payment.paymentGroup.id)
                    : undefined;
                  rows.push({
                    key: `payment-${payment.id}`,
                    type: "item",
                    payment,
                    indexForGroup: index + 1,
                    isGrouped: Boolean(payment.paymentGroup && groupSize > 1),
                    groupColor,
                  });
                });
                return rows;
              })}
          />
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            {t("showingOf", { count: data.length, total })}
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage}
              totalPages={totalPages}
              pathname="/manage/payments"
            />
          </div>
        </div>
      </div>
    </PaymentTableContext.Provider>
  );
}
