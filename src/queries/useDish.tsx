import { dishApiRequests } from "@/apiRequests/dish";
import { CreateDishBodyType, DishQueryType, UpdateDishBodyType } from "@/schemaValidations/dish.schema";
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
