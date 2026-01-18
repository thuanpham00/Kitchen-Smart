"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetListDishCategoryNameQuery } from "@/queries/useDishCategory";
import { DishQueryType } from "@/schemaValidations/dish.schema";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react/jsx-runtime";

export default function SelectCategory({ queryConfig }: { queryConfig: DishQueryType }) {
  const listNameDishCategory = useGetListDishCategoryNameQuery();
  const dishCategories = listNameDishCategory.data?.payload.data || [];
  const router = useRouter();

  return (
    <Fragment>
      <Select
        onValueChange={(val) => {
          const params = new URLSearchParams(
            Object.entries({ ...queryConfig, categoryId: val }).map(([key, value]) => [key, String(value)]),
          );
          router.push(`/manage/dishes?${params.toString()}`);
        }}
        value={queryConfig.categoryId?.toString() || ""}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Chọn danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Danh mục</SelectLabel>
            {dishCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const params = new URLSearchParams(
            Object.entries({ ...queryConfig, categoryId: undefined })
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, String(value)]),
          );
          router.push(`/manage/dishes?${params.toString()}`);
        }}
      >
        <X />
      </Button>
    </Fragment>
  );
}
