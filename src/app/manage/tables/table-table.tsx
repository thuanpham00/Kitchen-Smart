/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { getVietnameseTableStatus } from "@/lib/utils";
import { useRouter } from "next/navigation";
import AutoPagination from "@/components/auto-pagination";
import { TableListResType, TableQueryType } from "@/schemaValidations/table.schema";
import EditTable from "@/app/manage/tables/edit-table";
import AddTable from "@/app/manage/tables/add-table";
import { useDeleteTableMutation, useGetListTableQuery } from "@/queries/useTable";
import QrCodeTable from "@/components/qrcode-table";
import { toast } from "sonner";
import useQueryParams from "@/hooks/useQueryParams";
import useDebounceInput from "@/hooks/useDebounceInput";
import { isUndefined, omitBy } from "lodash";
import { OrderModeType } from "@/constants/type";

type TableItem = TableListResType["data"][0];

const TableTableContext = createContext<{
  setTableIdEdit: (value: number) => void;
  tableIdEdit: number | undefined;
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}>({
  setTableIdEdit: (value: number | undefined) => {},
  tableIdEdit: undefined,
  tableDelete: null,
  setTableDelete: (value: TableItem | null) => {},
});

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: "number",
    header: "Số bàn",
    cell: ({ row }) => <div className="capitalize">{row.getValue("number")}</div>,
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true;
      return String(filterValue) === String(row.getValue("number"));
    },
  },
  {
    accessorKey: "capacity",
    header: "Sức chứa",
    cell: ({ row }) => <div className="capitalize">{row.getValue("capacity")}</div>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <div>{getVietnameseTableStatus(row.getValue("status"))}</div>,
  },
  {
    accessorKey: "token",
    header: "QR Code",
    cell: ({ row }) => (
      <div>
        <QrCodeTable
          token={row.getValue("token")}
          tableNumber={row.getValue("number")}
          type={row.original.typeQR}
        />
      </div>
    ),
  },
  {
    accessorKey: "typeQR",
    header: "Loại mã QR",
    cell: ({ row }) => (
      <div>
        {row.original.typeQR === OrderModeType.DINE_IN ? (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            QR dành cho tại bàn
          </Badge>
        ) : (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            QR dành cho mang về
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Ghi chú",
    cell: ({ row }) => <div>{row.getValue("notes")}</div>,
  },
  {
    id: "actions",
    header: "Hành động",
    cell: function Actions({ row }) {
      const { setTableIdEdit, setTableDelete } = useContext(TableTableContext);
      const openEditTable = () => {
        setTableIdEdit(row.original.number);
      };

      const openDeleteTable = () => {
        setTableDelete(row.original);
      };

      return (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openEditTable} className="bg-blue-500 hover:bg-blue-400 text-white">
            Sửa
          </Button>
          <Button size="sm" onClick={openDeleteTable} className="bg-red-500 hover:bg-red-400 text-white">
            Xóa
          </Button>
        </div>
      );
    },
  },
];

function AlertDialogDeleteTable({
  tableDelete,
  setTableDelete,
}: {
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}) {
  const deleteTableMutation = useDeleteTableMutation();

  const handleDelete = async () => {
    if (tableDelete) {
      const {
        payload: { message },
      } = await deleteTableMutation.mutateAsync(tableDelete.number);
      toast.success(message, {
        duration: 2000,
      });
      setTableDelete(null);
    }
  };

  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bàn ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Bàn{" "}
            <span className="bg-foreground text-primary-foreground rounded px-1">{tableDelete?.number}</span>{" "}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTableDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default function TableTable() {
  const router = useRouter();
  const queryParams = useQueryParams();

  const [searchNumberTable, setSearchNumberTable] = useState<string>(queryParams.number || "");
  const searchValue = useDebounceInput({ value: searchNumberTable, delay: 1000 });

  const limit = queryParams.limit ? Number(queryParams.limit) : 5;
  const page = queryParams.page ? Number(queryParams.page) : 1;

  const queryConfig: TableQueryType = omitBy(
    {
      page,
      limit,
      number: queryParams.number ? queryParams.number : undefined,
    },
    isUndefined,
  ) as TableQueryType;

  useEffect(() => {
    const params = new URLSearchParams(
      Object.entries({
        page: 1, // Reset về trang 1 khi search
        limit,
        number: searchValue || undefined,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`/manage/tables?${params.toString()}`);
  }, [searchValue, limit, router]);

  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>();
  const [tableDelete, setTableDelete] = useState<TableItem | null>(null);

  const listTable = useGetListTableQuery(queryConfig);
  const data: TableListResType["data"] = listTable.data?.payload.data || [];
  const currentPage = listTable.data?.payload.pagination.page || 0; // trang hiện tại
  const totalPages = listTable.data?.payload.pagination.totalPages || 0; // tổng số trang
  const total = listTable.data?.payload.pagination.total || 0; // tổng số item

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
    <TableTableContext.Provider value={{ tableIdEdit, setTableIdEdit, tableDelete, setTableDelete }}>
      <div className="w-full">
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogDeleteTable tableDelete={tableDelete} setTableDelete={setTableDelete} />
        <div className="flex items-center py-4">
          <Input
            placeholder="Lọc số bàn"
            value={searchNumberTable}
            onChange={(event) => {
              setSearchNumberTable(event.target.value);
            }}
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddTable />
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
              pathname="/manage/tables"
            />
          </div>
        </div>
      </div>
    </TableTableContext.Provider>
  );
}
