/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import FormEditMenu from "@/app/manage/menus/[id]/form-edit-menu";
import { useParams } from "next/navigation";
import { createContext, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useGetListItemMenuFromMenu } from "@/queries/useMenu";
import { MenuItemListResType } from "@/schemaValidations/menu.schema";
import { formatCurrency, formatDateTimeToLocaleString } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AddDishToMenuForm from "@/app/manage/menus/[id]/add-dish-to-menu";

// sử dụng trong phạm vị component AccountTable và các component con của nó
const MenuTableContext = createContext<{
  setMenuIdEdit: (value: number) => void;
  menuIdEdit: number | undefined;
  menuDelete: MenuItem | null;
  setMenuDelete: (value: MenuItem | null) => void;
}>({
  setMenuIdEdit: (value: number | undefined) => {},
  menuIdEdit: undefined,
  menuDelete: null,
  setMenuDelete: (value: MenuItem | null) => {},
});

type MenuItem = MenuItemListResType["data"]["itemList"][0];
const columns: ColumnDef<MenuItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
  },
  {
    id: "dishImage",
    header: () => <div className="text-center">Hình ảnh</div>,
    cell: ({ row }) => {
      const dish = row.original.dish;
      return (
        <div className="flex justify-center">
          <Image
            src={dish.image}
            alt={dish.name}
            width={60}
            height={60}
            className="rounded-md object-cover w-15 h-15"
          />
        </div>
      );
    },
  },
  {
    id: "dishName",
    header: "Tên món ăn",
    cell: ({ row }) => {
      const dish = row.original.dish;
      return (
        <div>
          <div className="font-medium">{dish.name}</div>
          <p className="text-sm text-muted-foreground max-w-75 whitespace-normal">{dish.description}</p>
        </div>
      );
    },
  },
  {
    id: "price",
    header: "Giá menu",
    cell: ({ row }) => {
      const dish = row.original.dish;
      const menuItemPrice = row.original.price;
      const isDiscounted = menuItemPrice < dish.price;

      return (
        <div className="space-y-1">
          {isDiscounted && (
            <div className="text-sm text-muted-foreground line-through">{formatCurrency(dish.price)}</div>
          )}
          <div className={`font-medium ${isDiscounted ? "text-red-500" : ""}`}>
            {formatCurrency(menuItemPrice)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) => {
      const dish = row.original.dish;
      return <div className="underline font-semibold">{dish.category.name}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: Record<string, { label: string; variant: string }> = {
        AVAILABLE: { label: "Có sẵn", variant: "default" },
        OUT_OF_STOCK: { label: "Hết hàng", variant: "destructive" },
        HIDDEN: { label: "Ẩn", variant: "secondary" },
      };
      const statusInfo = statusMap[status] || { label: status, variant: "default" };

      return (
        <div className="flex justify-center">
          <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
        </div>
      );
    },
  },
  {
    id: "notes",
    header: "Ghi chú",
    cell: ({ row }) => {
      const notes = row.original.notes;
      return <div className="max-w-50 truncate">{notes || "-"}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <div className="text-sm">{formatDateTimeToLocaleString(row.getValue("createdAt"))}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Hành động</div>,
    cell: function Actions({ row }) {
      return (
        <div className="flex justify-center">
          <Button size="sm" className="bg-red-500 hover:bg-red-400 text-white">
            Xóa khỏi menu
          </Button>
        </div>
      );
    },
  },
];

const PAGE_SIZE = 10;
const pageIndex = 0;
export default function MenuDetail() {
  const params = useParams();
  const id = params.id as string;
  const listMenuItemQuery = useGetListItemMenuFromMenu(Number(id));
  const data = listMenuItemQuery.data?.payload.data.itemList || [];

  // state mặc định của table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const table = useReactTable({
    data,
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

  return (
    <div>
      <FormEditMenu idMenu={Number(id)} />
      <div>
        <div className="w-full h-px bg-[#2e2f2f] my-8"></div>
        <div className="flex items-center mb-6">
          <div className="text-lg font-semibold">Danh sách món ăn trong menu</div>
          <div className="ml-auto">
            <AddDishToMenuForm idMenu={Number(id)} dataMenuItemsCurrent={data} />
          </div>
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
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{" "}
            <strong>{data.length}</strong> kết quả
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
