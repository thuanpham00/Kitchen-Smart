/* eslint-disable react-hooks/incompatible-library */
import { ExportReceiptTableContext } from "@/app/[locale]/manage/import-export-inventory/export-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetExportReceiptDetailQuery } from "@/queries/useExportReceipt";
import { ExportReceiptResType, ExportReceiptItemSchemaType } from "@/schemaValidations/export-receipt.schema";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getExportReceiptItemColumns = (t: any): ColumnDef<ExportReceiptItemSchemaType>[] => [
  {
    accessorKey: "id",
    header: t("itemId"),
  },
  {
    accessorKey: "ingredientImage",
    header: t("image"),
    cell: ({ row }) => {
      const imageUrl = row.getValue("ingredientImage") as string | undefined;
      return (
        <div className="relative w-16 h-16">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={row.original.ingredientName || "Ingredient"}
              fill
              className="object-cover rounded-md"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              N/A
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "ingredientName",
    header: t("ingredientName"),
    cell: ({ row }) => <div className="font-medium">{row.getValue("ingredientName") || "-"}</div>,
  },
  {
    accessorKey: "quantity",
    header: t("quantity"),
  },
  {
    accessorKey: "ingredientUnit",
    header: t("unit"),
    cell: ({ row }) => <div>{row.getValue("ingredientUnit") || "-"}</div>,
  },
  {
    accessorKey: "unitPrice",
    header: t("unitPrice"),
    cell: ({ row }) => (
      <div>
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          row.getValue("unitPrice"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: t("totalPrice"),
    cell: ({ row }) => (
      <div className="font-semibold">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          row.getValue("totalPrice"),
        )}
      </div>
    ),
  },
  {
    accessorKey: "batchNumber",
    header: t("batchNumber"),
    cell: ({ row }) => <div>{row.getValue("batchNumber") || "-"}</div>,
  },
  {
    accessorKey: "note",
    header: t("note"),
    cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("note") || "-"}</div>,
  },
];

export default function ListExportReceiptItemDialog() {
  const t = useTranslations("ManageExportReceipts");
  const { exportReceiptIdViewItems, setExportReceiptIdViewItems } = useContext(ExportReceiptTableContext);

  const listExportReceiptItem = useGetExportReceiptDetailQuery({
    id: exportReceiptIdViewItems!,
    enabled: !!exportReceiptIdViewItems,
  });
  const data = listExportReceiptItem.data?.payload.data as ExportReceiptResType["data"];

  const columns = getExportReceiptItemColumns(t);
  const items = data?.items || [];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Dialog
      open={Boolean(exportReceiptIdViewItems)}
      onOpenChange={(open) => {
        if (!open) {
          setExportReceiptIdViewItems(undefined);
        }
      }}
    >
      <DialogContent className="max-w-5xl! max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("exportReceiptItems")} - {data?.code}
          </DialogTitle>
          <DialogDescription>{t("exportReceiptItemsDescription")}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
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
                        {t("noItems")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t("noItems")}</div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setExportReceiptIdViewItems(undefined)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
