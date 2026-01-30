import { ingredientApiRequests } from "@/apiRequests/ingredient";
import {
  CreateIngredientBodyType,
  IngredientQueryType,
  UpdateIngredientBodyType,
} from "@/schemaValidations/ingredient.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListIngredientQuery = (params: IngredientQueryType) => {
  return useQuery({
    queryKey: ["ingredients", params],
    queryFn: () => {
      return ingredientApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetIngredientDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["ingredient-detail", id],
    queryFn: () => {
      return ingredientApiRequests.getIngredientById(id);
    },
    enabled,
  });
};

export const useAddIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateIngredientBodyType) => {
      return ingredientApiRequests.addIngredient(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateIngredientBodyType }) => {
      return ingredientApiRequests.updateIngredient(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return ingredientApiRequests.deleteIngredient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};
