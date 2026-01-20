import {
  AddDishToMenuType,
  MenuItemListResType,
  MenuListResType,
  MenuQueryType,
  MenuResType,
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
  addMenu: (body: UpdateMenuBodyType) => {
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

  addMenuItem: (body: AddDishToMenuType) => {
    return http.post<MenuResType>(`/menus/add-menu-item`, body);
  },
};
