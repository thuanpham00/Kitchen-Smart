import { DishCategoryListResType } from "@/schemaValidations/dishCategory.schema";
import http from "@/utils/http";

export const dishCategoryApiRequests = {
  list: () => {
    return http.get<DishCategoryListResType>("/dish-categories", {
      next: {
        tags: ["dish-categories"],
      },
    });
  },
  // addDish: (body: CreateDishBodyType) => {
  //   return http.post<DishResType>("/dishes", body);
  // },
  // updateDish: (id: number, body: UpdateDishBodyType) => {
  //   return http.put<DishResType>(`/dishes/${id}`, body);
  // },
  // deleteDish: (id: number) => {
  //   return http.delete<DishResType>(`/dishes/${id}`);
  // },
  // getDishById: (id: number) => {
  //   return http.get<DishResType>(`/dishes/${id}`);
  // },
};
