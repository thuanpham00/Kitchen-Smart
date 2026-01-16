/* eslint-disable @typescript-eslint/no-unused-vars */
import { authRequests } from "@/apiRequests/auth";
import { cookies } from "next/headers";

export const POST = async () => {
  // cookie set httpOnly chỉ xài được ở server -> nên xóa cookie ở next server
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!accessToken || !refreshToken) {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return Response.json(
      {
        message: "Không tìm thấy Access Token hoặc Refresh Token",
      },
      {
        status: 200,
      }
    );
  }

  try {
    const { payload } = await authRequests.logout_backend({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return Response.json(payload);
  } catch (error) {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return Response.json(
      {
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau",
      },
      {
        status: 200,
      }
    );
  }
};
