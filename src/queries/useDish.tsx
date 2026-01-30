import { dishApiRequests } from "@/apiRequests/dish";
import {
  AddIngredientToDishType,
  CreateDishBodyType,
  DishQueryType,
  UpdateDishBodyType,
  UpdateIngredientInDishType,
} from "@/schemaValidations/dish.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListDishQuery = (params: DishQueryType) => {
  return useQuery({
    queryKey: ["dishes", params],
    queryFn: () => {
      return dishApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetDishDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["dish-detail", id],
    queryFn: () => {
      return dishApiRequests.getDishById(id);
    },
    enabled,
  });
};

export const useGetDishIngredientItem = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["dish-ingredient-item", id],
    queryFn: () => {
      return dishApiRequests.dishIngredientItem(id);
    },
    enabled,
  });
};

export const useAddDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDishBodyType) => {
      return dishApiRequests.addDish(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
};

export const useUpdateDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateDishBodyType }) => {
      return dishApiRequests.updateDish(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
};

export const useDeleteDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return dishApiRequests.deleteDish(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
};

export const useGetListDishIngredient = (idDish: number) => {
  return useQuery({
    queryKey: ["dish-ingredients", idDish],
    queryFn: () => {
      return dishApiRequests.listIngredientDish(idDish);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useAddIngredientToDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddIngredientToDishType) => {
      return dishApiRequests.addIngredientDish(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-ingredients"] });
    },
  });
};

export const useEditIngredientToDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idDishIngredient,
      body,
    }: {
      idDishIngredient: number;
      body: UpdateIngredientInDishType;
    }) => {
      return dishApiRequests.updateIngredientDish(idDishIngredient, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-ingredients"] });
    },
  });
};

export const useDeleteDishIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idDishIngredient: number) => {
      return dishApiRequests.deleteIngredientDish(idDishIngredient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-ingredients"] });
    },
  });
};
