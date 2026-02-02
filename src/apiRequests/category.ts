import {
  CreateDishCategoryBodyType,
  DishCategoryListResType,
  DishCategoryNameListResType,
  DishCategoryQueryType,
  DishCategoryResType,
  UpdateDishCategoryBodyType,
} from "@/schemaValidations/dishCategory.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const dishCategoryApiRequests = {
  list: (params: DishCategoryQueryType) => {
    return http.get<DishCategoryListResType>("/dish-categories?" + queryString.stringify(params));
  },

  addDishCategory: (body: CreateDishCategoryBodyType) => {
    return http.post<DishCategoryResType>("/dish-categories", body);
  },
  updateDishCategory: (id: number, body: UpdateDishCategoryBodyType) => {
    return http.put<DishCategoryResType>(`/dish-categories/${id}`, body);
  },
  deleteDishCategory: (id: number) => {
    return http.delete<DishCategoryResType>(`/dish-categories/${id}`);
  },
  getDishCategoryById: (id: number) => {
    return http.get<DishCategoryResType>(`/dish-categories/${id}`);
  },

  allName: () => {
    return http.get<DishCategoryNameListResType>("/dish-categories/names");
  },
};
