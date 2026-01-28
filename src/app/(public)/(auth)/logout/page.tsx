"use client";
import { useAppStore } from "@/components/app-provider";
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// dành cho xử lý case bị lỗi 401 chạy trên server component - case 401 client thì xử lý luôn ở axios interceptor
// sẽ redirect sang /logout để xử lý (xóa token trong LS và xóa token trong cookie) và redirect về /login
function Logout() {
  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const setIsRole = useAppStore((state) => state.setIsRole);

  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromURL = searchParams.get("refreshToken");
  const accessTokenFromURL = searchParams.get("accessToken");

  useEffect(() => {
    if (
      (refreshTokenFromURL && refreshTokenFromURL === getRefreshTokenFromLocalStorage()) ||
      (accessTokenFromURL && accessTokenFromURL === getAccessTokenFromLocalStorage())
    ) {
      mutateAsync().then(() => {
        router.push("/login");
        setIsRole(undefined);
        setSocket(undefined);
        socket?.disconnect();
      });
    } else {
      router.push("/"); // nếu url ko đúng thì về trang chủ
    }
  }, [accessTokenFromURL, mutateAsync, refreshTokenFromURL, router, setIsRole, setSocket, socket]);
  return <div>Logout page</div>;
}

// để fix lỗi useSearchParams từ nextjs thì dùng suspense bao ngoài
export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Logout />
    </Suspense>
  );
}
