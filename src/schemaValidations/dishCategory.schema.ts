import z from 'zod'

export const DishCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  countDish: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishCategoryRes = z.object({
  data: DishCategorySchema,
  message: z.string()
})

export type DishCategoryResType = z.TypeOf<typeof DishCategoryRes>

export const DishCategoryListRes = z.object({
  data: z.array(DishCategorySchema), // ← Array thay vì object
  message: z.string()
})

export type DishCategoryListResType = z.TypeOf<typeof DishCategoryListRes>
