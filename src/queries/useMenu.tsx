import { menuApiRequests } from "@/apiRequests/menu";
import { AddDishToMenuType, MenuQueryType, UpdateMenuBodyType } from "@/schemaValidations/menu.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListMenuQuery = (params: MenuQueryType) => {
  return useQuery({
    queryKey: ["menus", params],
    queryFn: () => {
      return menuApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetMenuDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["menu-detail", id],
    queryFn: () => {
      return menuApiRequests.getMenuById(id);
    },
    enabled,
  });
};

// export const useAddDishMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (body: CreateDishBodyType) => {
//       return dishApiRequests.addDish(body);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["dishes"] });
//     },
//   });
// };

export const useUpdateMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateMenuBodyType }) => {
      return menuApiRequests.updateMenu(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};

// export const useDeleteDishMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: number) => {
//       return dishApiRequests.deleteDish(id);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["dishes"] });
//     },
//   });
// };

export const useGetListItemMenuFromMenu = (idMenu: number) => {
  return useQuery({
    queryKey: ["menu-items", idMenu],
    queryFn: () => {
      return menuApiRequests.listMenuItem(idMenu);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useAddMenuItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddDishToMenuType) => {
      return menuApiRequests.addMenuItem(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};
