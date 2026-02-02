import { Role } from "@/constants/type";
import {
  Home,
  ShoppingCart,
  Users2,
  Salad,
  Table,
  List,
  Columns3,
  Headset,
  ShoppingBasket,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    Icon: Home,
    href: "/manage/dashboard",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Đơn hàng",
    Icon: ShoppingCart,
    href: "/manage/orders",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Gọi phục vụ",
    Icon: Headset,
    href: "/manage/call-waiters",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Bàn ăn",
    Icon: Table,
    href: "/manage/tables",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Menu món ăn",
    Icon: List,
    href: "/manage/menus",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Danh mục món",
    Icon: Columns3,
    href: "/manage/categories",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Món ăn",
    Icon: Salad,
    href: "/manage/dishes",
    roles: [Role.Owner, Role.Employee],
  },
  {
    title: "Nguyên liệu",
    Icon: ShoppingBasket,
    href: "/manage/ingredients",
    roles: [Role.Owner, Role.Employee],
  },

  {
    title: "Nhân viên",
    Icon: Users2,
    href: "/manage/accounts",
    roles: [Role.Owner],
  },
];

export default menuItems;
