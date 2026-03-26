import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchExportReceipt = z
  .object({
    fromDate: z.union([z.string(), z.date()]).optional(),
    toDate: z.union([z.string(), z.date()]).optional(),
  })
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) return true;
      const from = typeof data.fromDate === "string" ? new Date(data.fromDate) : data.fromDate;
      const to = typeof data.toDate === "string" ? new Date(data.toDate) : data.toDate;
      return from <= to;
    },
    {
      message: "validFromDate",
      path: ["fromDate"],
    },
  );

export type SearchExportReceiptType = z.TypeOf<typeof SearchExportReceipt>;

// Query params cho list ExportReceipt
export const ExportReceiptQuery = BaseQuery.and(
  z.object({
    fromDate: z.union([z.string(), z.date()]).optional(),
    toDate: z.union([z.string(), z.date()]).optional(),
  }),
);

export type ExportReceiptQueryType = z.TypeOf<typeof ExportReceiptQuery>;

// Schema cho ExportReceiptItem
export const ExportReceiptItemSchema = z.object({
  id: z.number(),
  exportReceiptId: z.number(),
  ingredientId: z.number(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  batchNumber: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ingredientName: z.string().optional(),
  ingredientUnit: z.string().optional(),
  ingredientImage: z.string().optional(),
});

export type ExportReceiptItemSchemaType = z.TypeOf<typeof ExportReceiptItemSchema>;

// Schema cho ExportReceipt (với items)
export const ExportReceiptSchema = z.object({
  id: z.number(),
  code: z.string(),
  exportDate: z.date(),
  exportType: z.string(),
  totalAmount: z.number(),
  status: z.string(),
  relatedOrderId: z.number().nullable(),
  note: z.string().nullable(),
  createdBy: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdByName: z.string().optional(),
  items: z.array(ExportReceiptItemSchema).optional(),
});

export type ExportReceiptSchemaType = z.TypeOf<typeof ExportReceiptSchema>;

// Response cho single ExportReceipt
export const ExportReceiptRes = z.object({
  data: ExportReceiptSchema,
  message: z.string(),
});

export type ExportReceiptResType = z.TypeOf<typeof ExportReceiptRes>;

// Response cho list ExportReceipt (có pagination)
export const ExportReceiptListRes = z.object({
  data: z.array(ExportReceiptSchema),
  pagination: PaginationRes,
  message: z.string(),
});

export type ExportReceiptListResType = z.TypeOf<typeof ExportReceiptListRes>;

// Params cho get detail
export const ExportReceiptParams = z.object({
  id: z.coerce.number(),
});

export type ExportReceiptParamsType = z.TypeOf<typeof ExportReceiptParams>;
