import { menuApiRequests } from "@/apiRequests/menu";
import {
  AddDishToMenuType,
  CreateMenuBodyType,
  MenuQueryType,
  UpdateDishInMenuType,
  UpdateMenuBodyType,
} from "@/schemaValidations/menu.schema";
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

export const useGetMenuActiveQuery = () => {
  return useQuery({
    queryKey: ["menu-active"],
    queryFn: () => {
      return menuApiRequests.menuActive();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

export const useGetMenuSuggestedQuery = () => {
  return useQuery({
    queryKey: ["menu-suggested"],
    queryFn: () => {
      return menuApiRequests.getMenuSuggested();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
};


export const useAddMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMenuBodyType) => {
      return menuApiRequests.addMenu(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};

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

export const useDeleteMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return menuApiRequests.deleteMenu(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};

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

export const useGetMenuItemDetail = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["menu-item", id],
    queryFn: () => {
      return menuApiRequests.menuItem(id);
    },
    enabled,
  });
};

export const useAddMenuItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddDishToMenuType) => {
      return menuApiRequests.addMenuItem(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menu-active"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useEditMenuItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idMenuItem, body }: { idMenuItem: number; body: UpdateDishInMenuType }) => {
      return menuApiRequests.editMenuItem(idMenuItem, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menu-active"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useDeleteMenuItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idMenuItem: number) => {
      return menuApiRequests.deleteMenuItem(idMenuItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menu-active"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};
