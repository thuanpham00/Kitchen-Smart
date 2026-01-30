import {
  AddIngredientToDishType,
  CreateDishBodyType,
  DishIngredientListResType,
  DishIngredientResType,
  DishListResType,
  DishQueryType,
  DishResType,
  UpdateDishBodyType,
  UpdateIngredientInDishType,
} from "@/schemaValidations/dish.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const dishApiRequests = {
  // note Next.js 15 mặc định fetch là { cache: "auto-no-cache" } // ko ảnh hưởng static hay dynamic rendering
  // còn nếu next.js 14 cũ thì mặc định fetch là { cache: "force-cache" } // có cache - static rendering page
  /** Chú ý về cache trong fetch ở Next.js 15: 
    - Không dùng cache option: Không cache khi build. Không ảnh hưởng đến việc render static hay dynamic
    - Dùng cache: 'no-store': Không cache khi build. Bắt buộc page thành dynamic rendering
    - Dùng cache: 'force-cache: Cache khi build. Có thể khiến page thành Static Rendering nếu các điều kiện xung quanh cho phép (ví dụ không dùng dynamic function như cookies()...)
   */
  list: (params: DishQueryType) => {
    return http.get<DishListResType>("/dishes?" + queryString.stringify(params));
  },
  addDish: (body: CreateDishBodyType) => {
    return http.post<DishResType>("/dishes", body);
  },
  updateDish: (id: number, body: UpdateDishBodyType) => {
    return http.put<DishResType>(`/dishes/${id}`, body);
  },
  deleteDish: (id: number) => {
    return http.delete<DishResType>(`/dishes/${id}`);
  },
  getDishById: (id: number) => {
    return http.get<DishResType>(`/dishes/${id}`);
  },

  // ingredient in dish
  listIngredientDish: (idDish: number) => {
    return http.get<DishIngredientListResType>(`/dishes/${idDish}/ingredients`);
  },
  dishIngredientItem: (idDishIngredient: number) => {
    return http.get<DishIngredientResType>(`/dishes/ingredient-item/${idDishIngredient}`);
  },
  addIngredientDish: (body: AddIngredientToDishType) => {
    return http.post<DishIngredientListResType>(`/dishes/ingredient-item`, body);
  },
  updateIngredientDish: (idDishIngredient: number, body: UpdateIngredientInDishType) => {
    return http.put<DishIngredientListResType>(`/dishes/ingredient-item/${idDishIngredient}`, body);
  },
  deleteIngredientDish: (idDishIngredient: number) => {
    return http.delete<DishIngredientListResType>(`/dishes/ingredient-item/${idDishIngredient}`);
  },
};
