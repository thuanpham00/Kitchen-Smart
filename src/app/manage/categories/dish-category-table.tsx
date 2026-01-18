/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSearchParams } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { useDeleteDishMutation, useGetListDishQuery } from "@/queries/useDish";
import { toast } from "sonner";
import AddDishCategory from "@/app/manage/categories/add-dish-category";
import EditDishCategory from "@/app/manage/categories/edit-dish-category";
import { useGetListDishCategoryQuery } from "@/queries/useDishCategory";
import { DishCategoryListResType } from "@/schemaValidations/dishCategory.schema";
import { Eye } from "lucide-react";

type DishCategoryItem = DishCategoryListResType["data"][0];

// sử dụng trong phạm vị component AccountTable và các component con của nó
const DishCategoryTableContext = createContext<{
  setDishCategoryIdEdit: (value: number) => void;
  dishCategoryIdEdit: number | undefined;
  dishCategoryDelete: DishCategoryItem | null;
  setDishCategoryDelete: (value: DishCategoryItem | null) => void;
}>({
  setDishCategoryIdEdit: (value: number | undefined) => {},
  dishCategoryIdEdit: undefined,
  dishCategoryDelete: null,
  setDishCategoryDelete: (value: DishCategoryItem | null) => {},
});

export const columns: ColumnDef<DishCategoryItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{ __html: row.getValue("description") }}
        className="whitespace-pre-line"
      />
    ),
  },
  {
    accessorKey: "countDish",
    header: "Số lượng món",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.getValue("countDish")}
        <Button variant={"ghost"}>
          <Eye />
        </Button>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: function Actions({ row }) {
      const { setDishCategoryIdEdit, setDishCategoryDelete } = useContext(DishCategoryTableContext);
      const openEditDish = () => {
        setDishCategoryIdEdit(row.original.id);
      };

      const openDeleteDish = () => {
        setDishCategoryDelete(row.original);
      };
      return (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openEditDish} className="bg-blue-500 hover:bg-blue-400 text-white">
            Sửa
          </Button>
          <Button size="sm" onClick={openDeleteDish} className="bg-red-500 hover:bg-red-400 text-white">
            Xóa
          </Button>
        </div>
      );
    },
  },
];

function AlertDialogDeleteDish({
  dishCategoryDelete,
  setDishCategoryDelete,
}: {
  dishCategoryDelete: DishCategoryItem | null;
  setDishCategoryDelete: (value: DishCategoryItem | null) => void;
}) {
  const deleteDishMutation = useDeleteDishMutation();

  const handleDelete = async () => {
    if (dishCategoryDelete) {
      const {
        payload: { message },
      } = await deleteDishMutation.mutateAsync(dishCategoryDelete.id);
      toast.success(message, {
        duration: 2000,
      });
      setDishCategoryDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(dishCategoryDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishCategoryDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {dishCategoryDelete?.name}
            </span>{" "}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDishCategoryDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function DishCategoryTable() {
  const searchParam = useSearchParams();
  const page = searchParam.get("page") ? Number(searchParam.get("page")) : 1;
  const pageIndex = page - 1;
  const [dishCategoryIdEdit, setDishCategoryIdEdit] = useState<number | undefined>();
  const [dishCategoryDelete, setDishCategoryDelete] = useState<DishCategoryItem | null>(null);

  const listDishCategory = useGetListDishCategoryQuery();
  const data: DishCategoryListResType["data"] = listDishCategory.data?.payload.data || [];

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

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  return (
    <DishCategoryTableContext.Provider
      value={{ dishCategoryIdEdit, setDishCategoryIdEdit, dishCategoryDelete, setDishCategoryDelete }}
    >
      <div className="w-full">
        <EditDishCategory id={dishCategoryIdEdit} setId={setDishCategoryIdEdit} />
        <AlertDialogDeleteDish
          dishCategoryDelete={dishCategoryDelete}
          setDishCategoryDelete={setDishCategoryDelete}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder="Lọc tên"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddDishCategory />
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
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishCategoryTableContext.Provider>
  );
}
