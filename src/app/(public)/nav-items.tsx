"use client";
import { useAppStore } from "@/components/app-provider";
import { Role } from "@/constants/type";
import { RoleType } from "@/types/jwt.types";
import Link from "next/link";

const menuItems = [
  {
    title: "Trang chủ",
    href: "/",
    roles: [Role.Guest, Role.Employee, Role.Owner], // ko yêu cầu login và 3 role đều xem được
  },
  {
    title: "Menu",
    href: "/guest/menu",
    authRequired: true,
    roles: [Role.Guest], // ko yêu cầu login và chỉ role khách xem được
  },
  {
    title: "Đơn hàng",
    href: "/guest/orders",
    authRequired: true,
    roles: [Role.Guest], // ko yêu cầu login và chỉ role khách xem được
  },
  {
    title: "Đăng nhập",
    href: "/login",
    authRequired: false,
    roles: [Role.Guest, Role.Employee, Role.Owner], // ko yêu cầu login và 3 role đều xem được
  },
  {
    title: "Đơn hàng",
    href: "/orders",
    authRequired: true,
    roles: [Role.Employee, Role.Owner], // yêu cầu login và dành cho nhân viên và quản trị viên
  },
  {
    title: "Quản lý",
    href: "/manage/dashboard",
    authRequired: true,
    roles: [Role.Employee, Role.Owner], // yêu cầu login và dành cho nhân viên và quản trị viên
  },
];

const checkRole = (role: RoleType | undefined) => {
  if (!role) {
    return menuItems;
  }
  return menuItems.filter((item) => item.roles.includes(role as RoleType));
};

// server: trả về món ăn + đăng nhập do server ko biết trạng thái login
// client: đầu tiên client sẽ hiển thị món ăn + đăng nhập
// nhưng sau đó thì client render ra là món ăn + đơn hàng + quản lý do đã check được trạng thái login
// 'Text content does not match server-rendered HTML' - do sự khác biệt giữa server và client -> dùng state (chớp giật ui)

// hoặc là chuyển nav-items thành server component (cookie - mất static) sẽ không bị chớp giật UI

export default function NavItems({ className }: { className?: string }) {
  const isAuth = useAppStore((state) => state.isAuth)
  const isRole = useAppStore((state) => state.isRole)
  // nếu check login ở server thì chỉ check bằng cookies() nhưng cookies() thì page sẽ thành dynamic function
  // dẫn đến các trang thành dynamic page hết
  // nếu là tránh việc này check ở client bằng localStorage như trên và chỉ chạy đoạn này ở client nếu chạy ở server thì null (dành cho build page)
  // nó sẽ tránh được việc page thành dynamic page -> static page vẫn ok

  return checkRole(isRole).map((item) => {
    if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null;
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    );
  });
}
