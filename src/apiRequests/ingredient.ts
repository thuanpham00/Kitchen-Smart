import {
  CreateIngredientBodyType,
  IngredientListResType,
  IngredientQueryType,
  IngredientResType,
  UpdateIngredientBodyType,
} from "@/schemaValidations/ingredient.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const ingredientApiRequests = {
  list: (params: IngredientQueryType) => {
    return http.get<IngredientListResType>("/ingredients?" + queryString.stringify(params));
  },
  addIngredient: (body: CreateIngredientBodyType) => {
    return http.post<IngredientResType>("/ingredients", body);
  },
  updateIngredient: (id: number, body: UpdateIngredientBodyType) => {
    return http.put<IngredientResType>(`/ingredients/${id}`, body);
  },
  deleteIngredient: (id: number) => {
    return http.delete<IngredientResType>(`/ingredients/${id}`);
  },
  getIngredientById: (id: number) => {
    return http.get<IngredientResType>(`/ingredients/${id}`);
  },
};
