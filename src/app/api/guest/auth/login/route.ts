/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { EntityError } from "@/utils/http";
import { GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import guestApiRequest from "@/apiRequests/guest";

export const POST = async (request: Request) => {
  const body = (await request.json()) as GuestLoginBodyType;
  const cookieStore = await cookies();
  try {
    const { payload } = await guestApiRequest.login_backend(body);
    const {
      data: { accessToken, refreshToken },
    } = payload;
    const decodedAccessToken = jwt.decode(accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number };

    // set cookie vào next client
    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", refreshToken, {
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
          status: error.status ?? 500,
        }
      );
    }
  }
};
