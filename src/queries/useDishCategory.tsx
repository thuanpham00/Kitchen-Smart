import { dishCategoryApiRequests } from "@/apiRequests/category";
import {
  CreateDishCategoryBodyType,
  DishCategoryQueryType,
  UpdateDishCategoryBodyType,
} from "@/schemaValidations/dishCategory.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListDishCategoryQuery = (params: DishCategoryQueryType) => {
  return useQuery({
    queryKey: ["dish-categories", params],
    queryFn: () => {
      return dishCategoryApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetListDishCategoryNameQuery = () => {
  return useQuery({
    queryKey: ["dish-categories-name"],
    queryFn: () => {
      return dishCategoryApiRequests.allName();
    },
  });
};

export const useGetDishCategoryDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["dish-category-detail", id],
    queryFn: () => {
      return dishCategoryApiRequests.getDishCategoryById(id);
    },
    enabled,
  });
};

export const useAddDishCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDishCategoryBodyType) => {
      return dishCategoryApiRequests.addDishCategory(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-categories"] });
    },
  });
};

export const useUpdateDishCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateDishCategoryBodyType }) => {
      return dishCategoryApiRequests.updateDishCategory(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-categories"] });
    },
  });
};

export const useDeleteDishCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return dishCategoryApiRequests.deleteDishCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-categories"] });
    },
  });
};
