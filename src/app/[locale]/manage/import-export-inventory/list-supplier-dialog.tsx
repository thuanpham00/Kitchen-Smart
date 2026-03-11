/* eslint-disable react-hooks/incompatible-library */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn, simpleMatchText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useGetListSupplierQuery } from "@/queries/useSupplier";
import { SupplierListResType } from "@/schemaValidations/supplier.schema";

type SupplierItem = SupplierListResType["data"][0];

const getColumns = (t: (key: string) => string): ColumnDef<SupplierItem>[] => [
  {
    accessorKey: "code",
    header: t("supplierCode"),
    cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "name",
    header: t("supplierName"),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.original.name), String(filterValue));
    },
  },
  {
    accessorKey: "phone",
    header: t("phone"),
    cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
  },
  {
    accessorKey: "address",
    header: t("address"),
    cell: ({ row }) => (
      <div className="max-w-50 truncate" title={row.getValue("address")}>
        {row.getValue("address") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "ingredientCount",
    header: t("ingredientCount"),
    cell: ({ row }) => <div className="text-center">{row.getValue("ingredientCount") || 0}</div>,
  },
];

const PAGE_SIZE = 10;

export function SupplierListDialog({ onChoose }: { onChoose: (supplier: SupplierItem) => void }) {
  const t = useTranslations("ManageImportReceipts");
  const columns = getColumns(t as (key: string) => string);
  const [open, setOpen] = useState(false);
  const listTableQuery = useGetListSupplierQuery({
    page: 1,
    limit: 5, // ko phân trang, lấy hết bàn
    pagination: "false",
  });
  const data: SupplierListResType["data"] = listTableQuery.data?.payload.data || [];
  const dataFiltered = data.filter((supplier) => supplier.status !== "Inactive");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data: dataFiltered,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  useEffect(() => {
    table.setPagination({
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    });
  }, [table]);

  const choose = (supplier: SupplierItem) => {
    onChoose(supplier); // chuyển dữ liệu từ child lên parent thông qua hàm onChoose (props)
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("chooseSupplier")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("chooseSupplier")}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder={t("filterSupplierName")}
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
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
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {
                          if (row.original.status === "Active") {
                            choose(row.original);
                          }
                        }}
                        className={cn({
                          "cursor-pointer": row.original.status === "Active",
                          "cursor-not-allowed opacity-50": row.original.status === "Inactive",
                        })}
                      >
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
                        {t("noSuppliers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-xs text-muted-foreground py-4 flex-1 ">
                {t("showingOf", {
                  count: table.getPaginationRowModel().rows.length,
                  total: dataFiltered.length,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {t("previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {t("next")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
