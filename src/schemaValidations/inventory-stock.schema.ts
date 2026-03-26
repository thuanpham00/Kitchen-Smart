import { BaseQuery, PaginationRes } from "@/schemaValidations/util.schema";
import z from "zod";

export const SearchInventoryStock = z.object({
  ingredientName: z.string().max(256).optional(),
  lowStock: z.string().optional(), // Lọc hàng tồn kho thấp (quantity < minStock)
});

export type SearchInventoryStockType = z.TypeOf<typeof SearchInventoryStock>;

export const InventoryStockQuery = BaseQuery.and(
  z.object({
    ingredientName: z.string().trim().max(256).optional(),
    lowStock: z.string().optional(), // Lọc hàng tồn kho thấp (quantity < minStock)
  }),
);

export type InventoryStockQueryType = z.TypeOf<typeof InventoryStockQuery>;

export const InventoryStockSchema = z.object({
  id: z.number(),
  ingredientId: z.number(),
  quantity: z.number(),
  minStock: z.number().nullable(),
  maxStock: z.number().nullable(),
  avgUnitPrice: z.number(),
  totalValue: z.number(),
  lastImport: z.date().nullable(),
  lastExport: z.date().nullable(),
  updatedAt: z.date(),
  ingredientName: z.string().optional(),
  ingredientImage: z.string().optional(),
  ingredientCategory: z.string().optional(),
  ingredientUnit: z.string().optional(),
  batchCount: z.number().optional(),
});

export const InventoryStockRes = z.object({
  data: InventoryStockSchema,
  message: z.string(),
});

export type InventoryStockResType = z.TypeOf<typeof InventoryStockRes>;

export const InventoryStockListRes = z.object({
  data: z.array(InventoryStockSchema),
  pagination: PaginationRes,
  message: z.string(),
});

export type InventoryStockListResType = z.TypeOf<typeof InventoryStockListRes>;

export const InventoryStockListNoPaginationRes = z.object({
  data: z.array(InventoryStockSchema),
  message: z.string(),
});

export type InventoryStockListNoPaginationResType = z.TypeOf<typeof InventoryStockListNoPaginationRes>;

export const UpdateInventoryStockBody = z
  .object({
    minStock: z.number().min(0, { message: "minStockMin" }).optional(),
    maxStock: z.number().min(0, { message: "maxStockMin" }).optional(),
    // Chỉ cho phép update ngưỡng cảnh báo
  })
  .refine(
    (data) => {
      // Nếu cả 2 đều có giá trị, maxStock phải >= minStock
      if (
        data.minStock !== null &&
        data.minStock !== undefined &&
        data.maxStock !== null &&
        data.maxStock !== undefined
      ) {
        return data.maxStock >= data.minStock;
      }
      return true;
    },
    {
      message: "maxStockGreaterThanMin",
      path: ["maxStock"],
    },
  );

export type UpdateInventoryStockBodyType = z.TypeOf<typeof UpdateInventoryStockBody>;

export const InventoryStockParams = z.object({
  id: z.coerce.number(),
});

export type InventoryStockParamsType = z.TypeOf<typeof InventoryStockParams>;
