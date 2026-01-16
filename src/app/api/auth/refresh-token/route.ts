/* eslint-disable @typescript-eslint/no-explicit-any */
import { authRequests } from "@/apiRequests/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { EntityError } from "@/utils/http";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = async (request: Request) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return Response.json(
      {
        message: "Không tìm thấy Refresh Token",
      },
      {
        status: 401, // nó sẽ nhảy vào http lỗi 401 xử lý logout ở client
      }
    );
  }
  try {
    const { payload } = await authRequests.refreshToken_backend({
      refreshToken: refreshToken,
    });

    const decodedAccessToken = jwt.decode(payload.data.accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as { exp: number };
    // trả về 1 cặp AT và RT mới và set lại cookie
    // set cookie vào next client
    cookieStore.set("accessToken", payload.data.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", payload.data.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });
    return Response.json(payload);
  } catch (error: any) {
    if (error instanceof EntityError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json(
        {
          message: "Đã có lỗi xảy ra, vui lòng thử lại sau",
        },
        {
          status: 401,
        }
      );
    }
  }
};
