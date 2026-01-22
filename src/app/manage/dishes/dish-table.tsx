/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatCurrency, getVietnameseDishStatus, handleErrorApi } from "@/lib/utils";
import { useRouter } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { DishListResType, DishQueryType } from "@/schemaValidations/dish.schema";
import EditDish from "@/app/manage/dishes/edit-dish";
import AddDish from "@/app/manage/dishes/add-dish";
import { useDeleteDishMutation, useGetListDishQuery } from "@/queries/useDish";
import { toast } from "sonner";
import useQueryParams from "@/hooks/useQueryParams";
import { isUndefined, omitBy } from "lodash";
import useDebounceInput from "@/hooks/useDebounceInput";
import { DishStatus } from "@/constants/type";
import { Badge } from "@/components/ui/badge";
import SelectCategory from "@/app/manage/dishes/SelectCategory";

type DishItem = DishListResType["data"][0];

const getDishStatusColor = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Active:
      return "bg-green-500 text-white hover:bg-green-600";
    case DishStatus.Discontinued:
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    default:
      return "bg-yellow-500 text-white hover:bg-yellow-600";
  }
};

// sử dụng trong phạm vị component AccountTable và các component con của nó
const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void;
  dishIdEdit: number | undefined;
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: DishItem | null) => {},
});

export const columns: ColumnDef<DishItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "image",
    header: "Ảnh",
    cell: ({ row }) => (
      <div>
        <Avatar className="aspect-square w-28 h-25 rounded-md object-cover">
          <AvatarImage src={row.getValue("image")} />
          <AvatarFallback className="rounded-none">{row.original.name}</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) => {
      const category = row.getValue("category") as { name: string };
      return <div className="capitalize underline font-semibold">{category.name}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Giá gốc",
    cell: ({ row }) => <div className="capitalize">{formatCurrency(row.getValue("price"))}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = row.getValue("status") as any;
      return <Badge className={getDishStatusColor(status)}>{getVietnameseDishStatus(status)}</Badge>;
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{ __html: row.getValue("description") }}
        className="whitespace-pre-line w-full max-w-75"
      />
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: function Actions({ row }) {
      const { setDishIdEdit, setDishDelete } = useContext(DishTableContext);
      const openEditDish = () => {
        setDishIdEdit(row.original.id);
      };

      const openDeleteDish = () => {
        setDishDelete(row.original);
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
  dishDelete,
  setDishDelete,
}: {
  dishDelete: DishItem | null;
  setDishDelete: (value: DishItem | null) => void;
}) {
  const deleteDishMutation = useDeleteDishMutation();

  const handleDelete = async () => {
    if (dishDelete) {
      try {
        const {
          payload: { message },
        } = await deleteDishMutation.mutateAsync(dishDelete.id);
        toast.success(message, {
          duration: 2000,
        });
        setDishDelete(null);
      } catch (error) {
        handleErrorApi({ errors: error });
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món <span className="bg-foreground text-primary-foreground rounded px-1">{dishDelete?.name}</span>{" "}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDishDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function DishTable() {
  const router = useRouter();
  const queryParams = useQueryParams();

  const [searchName, setSearchName] = useState<string>(queryParams.name || "");
  const searchValue = useDebounceInput({ value: searchName, delay: 1000 });

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: DishQueryType = omitBy(
    {
      page,
      limit,
      name: queryParams.name ? queryParams.name : undefined,
      categoryId: queryParams.categoryId || undefined,
    },
    isUndefined,
  ) as DishQueryType;

  useEffect(() => {
    const params = new URLSearchParams(
      Object.entries({
        page: 1, // Reset về trang 1 khi search
        limit,
        categoryId: queryConfig.categoryId,
        name: searchValue || undefined,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/dishes?${params.toString()}`);
  }, [searchValue, limit, queryConfig.categoryId, router]);

  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null);

  const listDish = useGetListDishQuery(queryConfig);

  const data: DishListResType["data"] = listDish.data?.payload.data || [];
  const currentPage = (listDish.data?.payload.pagination && listDish.data?.payload.pagination.page) || 0; // trang hiện tại
  const totalPages = (listDish.data?.payload.pagination && listDish.data?.payload.pagination.totalPages) || 0; // tổng số trang
  const total = (listDish.data?.payload.pagination && listDish.data?.payload.pagination.total) || 0; // tổng số item

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
    <DishTableContext.Provider value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish dishDelete={dishDelete} setDishDelete={setDishDelete} />
        <div className="flex items-center gap-2 py-4">
          <Input
            placeholder="Lọc tên"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="max-w-sm"
          />
          <SelectCategory queryConfig={queryConfig} />

          <div className="ml-auto flex items-center gap-2">
            <AddDish />
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
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  );
}
