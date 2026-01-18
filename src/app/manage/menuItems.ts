import { Home, ShoppingCart, Users2, Salad, Table, CookingPot, List } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    Icon: Home,
    href: "/manage/dashboard",
  },
  {
    title: "Đơn hàng",
    Icon: ShoppingCart,
    href: "/manage/orders",
  },
  {
    title: "Bàn ăn",
    Icon: Table,
    href: "/manage/tables",
  },
  {
    title: "Món ăn",
    Icon: Salad,
    href: "/manage/dishes",
  },
  {
    title: "Danh mục món",
    Icon: List,
    href: "/manage/categories",
  },
  {
    title: "Menu món ăn",
    Icon: CookingPot,
    href: "/manage/menus",
  },
  {
    title: "Nhân viên",
    Icon: Users2,
    href: "/manage/accounts",
  },
];

export default menuItems;
