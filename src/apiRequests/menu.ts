import {
  AddDishToMenuType,
  CreateMenuBodyType,
  MenuActiveResType,
  MenuItemListResType,
  MenuItemResType,
  MenuListResType,
  MenuQueryType,
  MenuResType,
  UpdateDishInMenuType,
  UpdateMenuBodyType,
} from "@/schemaValidations/menu.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const menuApiRequests = {
  list: (params: MenuQueryType) => {
    return http.get<MenuListResType>("/menus?" + queryString.stringify(params), {
      next: {
        tags: ["menus"],
      },
    });
  },
  menuActive: () => {
    return http.get<MenuActiveResType>("/menus/active", {
      next: {
        tags: ["menus"],
      },
    });
  },
  addMenu: (body: CreateMenuBodyType) => {
    return http.post<MenuResType>("/menus", body);
  },
  updateMenu: (id: number, body: UpdateMenuBodyType) => {
    return http.put<MenuResType>(`/menus/${id}`, body);
  },
  deleteMenu: (id: number) => {
    return http.delete<MenuResType>(`/menus/${id}`);
  },
  getMenuById: (id: number) => {
    return http.get<MenuResType>(`/menus/${id}`);
  },

  // menuItem
  listMenuItem: (idMenu: number) => {
    return http.get<MenuItemListResType>(`/menus/${idMenu}/items`, {
      next: {
        tags: ["menus"],
      },
    });
  },

  // menuItem
  menuItem: (idMenu: number) => {
    return http.get<MenuItemResType>(`/menus/menu-item/${idMenu}`, {
      next: {
        tags: ["menus"],
      },
    });
  },

  addMenuItem: (body: AddDishToMenuType) => {
    return http.post<MenuResType>(`/menus/menu-item`, body);
  },

  editMenuItem: (idMenuItem: number, body: UpdateDishInMenuType) => {
    return http.put<MenuResType>(`/menus/menu-item/${idMenuItem}`, body);
  },

  deleteMenuItem: (idMenuItem: number) => {
    return http.delete<MenuResType>(`/menus/menu-item/${idMenuItem}`);
  },
};
