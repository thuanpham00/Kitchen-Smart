import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

const authPath = ["/login"];
const managePath = ["/manage"];
const guestPath = ["/guest"];

const onlyOwnerPath = ["/manage/accounts"];
const privatePath = [...managePath, ...guestPath];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 1. Chưa đăng nhập
  // trường hợp chưa đăng nhập thì ko vào được privatePath
  // cũng dành cho trường hợp đã đăng nhập nhưng RT hết hạn rồi
  if (privatePath.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }

  // 2. Đã đăng nhập
  if (refreshToken) {
    // 2.1 trường hợp đăng nhập rồi thì ko vào được login nữa
    if (authPath.some((path) => pathname.startsWith(path)) && refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2.2 trường hợp đăng nhập rồi và AT trong cookie hết hạn
    if (privatePath.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
      const url = new URL("/refresh-token", request.url);
      // xử lý case AT tại cookie bị xóa redirect sang /refresh-token để lấy AT mới
      url.searchParams.set("refreshToken", refreshToken ?? "");
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role;
    // ko phải owner mà vào các trang chỉ dành cho owner
    const isNotOwnerPath = role !== Role.Owner && onlyOwnerPath.some((path) => pathname.startsWith(path));
    if (
      (role === Role.Guest && managePath.some((path) => pathname.startsWith(path))) ||
      (role !== Role.Guest && guestPath.some((path) => pathname.startsWith(path))) ||
      isNotOwnerPath
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// luôn chạy trên phía Next (server/edge runtime),
// mỗi lần có request vào, trước khi tới route/page tương ứng.

export const config = {
  matcher: ["/manage/:path*", "/login", "/guest/:path*"],
};
