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
import { useRouter, useSearchParams } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { useDeleteDishMutation, useGetListDishQuery } from "@/queries/useDish";
import { toast } from "sonner";
import AddDishCategory from "@/app/manage/categories/add-dish-category";
import EditDishCategory from "@/app/manage/categories/edit-dish-category";
import { useDeleteDishCategoryMutation, useGetListDishCategoryQuery } from "@/queries/useDishCategory";
import { DishCategoryListResType, DishCategoryQueryType } from "@/schemaValidations/dishCategory.schema";
import { Eye } from "lucide-react";
import useQueryParams from "@/hooks/useQueryParams";
import useDebounceInput from "@/hooks/useDebounceInput";
import { isUndefined, omitBy } from "lodash";
import Link from "next/link";
import { handleErrorApi } from "@/lib/utils";

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
        <Link href={`/manage/dishes?categoryId=${row.original.id}`} className="text-blue-500 hover:underline">
          <Eye />
        </Link>
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

function AlertDialogDeleteDishCategory({
  dishCategoryDelete,
  setDishCategoryDelete,
}: {
  dishCategoryDelete: DishCategoryItem | null;
  setDishCategoryDelete: (value: DishCategoryItem | null) => void;
}) {
  const deleteDishCategoryMutation = useDeleteDishCategoryMutation();

  const handleDelete = async () => {
    if (dishCategoryDelete) {
      try {
        const {
          payload: { message },
        } = await deleteDishCategoryMutation.mutateAsync(dishCategoryDelete.id);
        toast.success(message, {
          duration: 2000,
        });
        setDishCategoryDelete(null);
      } catch (error) {
        handleErrorApi({
          errors: error,
        });
      }
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
          <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
          <AlertDialogDescription>
            Danh mục{" "}
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
export default function DishCategoryTable() {
  const router = useRouter();
  const queryParams = useQueryParams();

  const [searchName, setSearchName] = useState<string>(queryParams.name || "");
  const searchValue = useDebounceInput({ value: searchName, delay: 1000 });

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: DishCategoryQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name ? queryParams.name : undefined,
    },
    isUndefined,
  ) as DishCategoryQueryType;

  useEffect(() => {
    const params = new URLSearchParams(
      Object.entries({
        page: 1, // Reset về trang 1 khi search
        limit,
        name: searchValue || undefined,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/categories?${params.toString()}`);
  }, [searchValue, limit, router]);

  const [dishCategoryIdEdit, setDishCategoryIdEdit] = useState<number | undefined>();
  const [dishCategoryDelete, setDishCategoryDelete] = useState<DishCategoryItem | null>(null);

  const listDishCategory = useGetListDishCategoryQuery(queryConfig);
  const data: DishCategoryListResType["data"] = listDishCategory.data?.payload.data || [];
  const currentPage = listDishCategory.data?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listDishCategory.data?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listDishCategory.data?.payload.pagination.total || 0; // tổng số item

  const pagination = {
    pageIndex: queryConfig.page ? queryConfig.page - 1 : 0,
    pageSize: queryConfig.limit,
  };

  const table = useReactTable({
    data,
    columns,
    manualPagination: true, // phân trang thủ công
    manualFiltering: true, // filter thủ công
    manualSorting: true, // sort thủ công
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
  });

  return (
    <DishCategoryTableContext.Provider
      value={{ dishCategoryIdEdit, setDishCategoryIdEdit, dishCategoryDelete, setDishCategoryDelete }}
    >
      <div className="w-full">
        <EditDishCategory id={dishCategoryIdEdit} setId={setDishCategoryIdEdit} />
        <AlertDialogDeleteDishCategory
          dishCategoryDelete={dishCategoryDelete}
          setDishCategoryDelete={setDishCategoryDelete}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder="Lọc tên"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
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
            Hiển thị <strong>{data.length}</strong> trong <strong>{total}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              queryConfig={queryConfig}
              page={currentPage} // trang hiện tại
              totalPages={totalPages} // tổng số trang
              pathname="/manage/categories"
            />
          </div>
        </div>
      </div>
    </DishCategoryTableContext.Provider>
  );
}
