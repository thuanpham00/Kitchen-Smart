import { dishCategoryApiRequests } from "@/apiRequests/category";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetListDishCategoryQuery = () => {
  return useQuery({
    queryKey: ["dish-categories"],
    queryFn: () => {
      return dishCategoryApiRequests.list();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
