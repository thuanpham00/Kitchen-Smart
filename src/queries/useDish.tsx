import { dishApiRequests } from "@/apiRequests/dish";
import { CreateDishBodyType, UpdateDishBodyType } from "@/schemaValidations/dish.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListDishQuery = () => {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: () => {
      return dishApiRequests.list();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDishDetailQuery = ({ id, enabled }: { id: number, enabled: boolean }) => {
  return useQuery({
    queryKey: ["dish-detail", id],
    queryFn: () => {
      return dishApiRequests.getDishById(id);
    },
    enabled
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
