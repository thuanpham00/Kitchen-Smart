/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useState } from "react";
import { formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import AutoPagination from "@/components/auto-pagination";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import { Badge } from "@/components/ui/badge";
import {
  GetPaymentsQueryType,
  PaymentListResType,
  SearchPayment,
  SearchPaymentType,
} from "@/schemaValidations/payment.schema";
import { useGetListPaymentQuery } from "@/queries/usePayment";
import FormPaymentDetail from "@/app/manage/payments/form-payment-detail";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { FieldErrors, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PaymentItem = PaymentListResType["data"][0];

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Failed":
      return "bg-red-100 text-red-800 border-red-300";
    case "Cancelled":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getVietnamesePaymentStatus = (status: string) => {
  switch (status) {
    case "Paid":
      return "Đã thanh toán";
    case "Pending":
      return "Chờ thanh toán";
    case "Failed":
      return "Thất bại";
    case "Cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case "CASH":
      return "💵 Tiền mặt";
    case "SEPAY":
      return "🏦 SeePay";
    default:
      return method;
  }
};

// sử dụng trong phạm vị component AccountTable và các component con của nó
const PaymentTableContext = createContext<{
  setPaymentIdEdit: (value: number) => void;
  paymentIdEdit: number | undefined;
}>({
  setPaymentIdEdit: (value: number | undefined) => {},
  paymentIdEdit: undefined,
});

export const columns: ColumnDef<PaymentItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-mono">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "tableNumber",
    header: "Bàn / Khách",
    cell: ({ row }) => {
      const tableNumber = row.original.tableNumber;
      const guest = row.original.guest;

      if (tableNumber) {
        return (
          <div className="space-y-1">
            <div className="font-semibold">Bàn {tableNumber}</div>
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
  },
  {
    accessorKey: "totalAmount",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <div className="font-semibold text-orange-600">{formatCurrency(row.getValue("totalAmount"))}</div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Phương thức",
    cell: ({ row }) => <div className="text-sm">{getPaymentMethodLabel(row.getValue("paymentMethod"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={getPaymentStatusColor(status)}>
          {getVietnamesePaymentStatus(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "orders",
    header: "Đơn hàng",
    cell: ({ row }) => {
      const orders = row.original.orders;
      const totalQuantity = orders.reduce((acc, order) => acc + order.quantity, 0);
      return (
        <div className="text-center">
          <div className="font-semibold">{orders.length} đơn</div>
          <div className="text-xs text-muted-foreground">{totalQuantity} món</div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Người tạo",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return (
        <div className="text-sm">
          <div>{createdBy.name}</div>
          <div className="text-xs text-muted-foreground">#{createdBy.id}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Thời gian",
    cell: ({ row }) => (
      <div className="text-xs whitespace-nowrap">
        {formatDateTimeToLocaleString(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    accessorKey: "note",
    header: "Ghi chú",
    cell: ({ row }) => {
      const note = row.getValue("note") as string | null;
      return <div className="max-w-50 truncate text-xs text-muted-foreground">{note || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: "Hành động",
    cell: function Actions({ row }) {
      const { setPaymentIdEdit } = useContext(PaymentTableContext);
      return (
        <div>
          <button
            onClick={() => setPaymentIdEdit(row.original.id)}
            className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-400 text-white text-sm"
          >
            Chi tiết
          </button>
        </div>
      );
    },
  },
];

export default function PaymentTable() {
  const router = useRouter();
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

  const reset = () => {
    const params = new URLSearchParams(
      Object.entries({
        page: 1,
        limit: queryConfig.limit,
        fromDate: undefined,
        toDate: undefined,
        paymentMethod: undefined,
        numberTable: undefined,
      })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset({ fromDate: undefined, toDate: undefined, paymentMethod: undefined, numberTable: undefined });
    router.push(`/manage/payments?${params.toString()}`);
  };

  const submit = (data: SearchPaymentType) => {
    const params = new URLSearchParams(
      Object.entries({
        ...queryConfig,
        page: 1,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
        paymentMethod: data.paymentMethod ? data.paymentMethod : undefined,
        numberTable: data.numberTable ? data.numberTable : undefined,
      })
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/payments?${params.toString()}`);
  };

  const invalidSubmit = (err: FieldErrors<SearchPaymentType>) => {
    console.log(err);
    if (err.fromDate) {
      toast.error(err.fromDate.message || "Ngày tháng không hợp lệ", {
        duration: 4000,
      });
    }
    if (err.toDate) {
      toast.error(err.toDate.message || "Ngày tháng không hợp lệ", {
        duration: 4000,
      });
    }
  };

  const [paymentIdEdit, setPaymentIdEdit] = useState<number | undefined>();

  const listPayment = useGetListPaymentQuery(queryConfig);

  const data: PaymentListResType["data"] = listPayment.data?.payload.data || [];
  const currentPage =
    (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.page) || 0;
  const totalPages =
    (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.totalPages) || 0;
  const total = (listPayment.data?.payload.pagination && listPayment.data?.payload.pagination.total) || 0;

  const pagination = {
    pageIndex: queryConfig.page ? queryConfig.page - 1 : 0,
    pageSize: queryConfig.limit,
  };

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
  });

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
            <div className="grid grid-cols-4 items-center">
              <div className="col-span-3 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2">Từ</span>
                          <Input
                            type="datetime-local"
                            placeholder="Từ ngày"
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
                          <span className="mr-2">Đến</span>
                          <Input
                            type="datetime-local"
                            placeholder="Đến ngày"
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
                </div>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <span className="mr-2">Phương thức thanh toán</span>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASH">💵 Tiền mặt</SelectItem>
                              <SelectItem value="SEPAY">💳 Sepay</SelectItem>
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
                          <span className="mr-2">Số bàn</span>
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
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button className="" variant={"outline"} type="reset">
                  Reset
                </Button>
                <Button className="bg-blue-500!" variant={"outline"} type="submit">
                  <Search />
                </Button>
              </div>
            </div>
          </form>
        </Form>
        <div className="rounded-md border">
          <FormPaymentDetail id={paymentIdEdit} setId={setPaymentIdEdit} />

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            Hiển thị <strong>{data.length}</strong> trong <strong>{total}</strong> kết quả
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
