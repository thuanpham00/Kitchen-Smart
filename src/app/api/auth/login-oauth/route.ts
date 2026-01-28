/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { EntityError } from "@/utils/http";

export type OauthLoginBodyType = {
  accessToken: string;
  refreshToken: string;
};

export const POST = async (request: Request) => {
  const body  = await request.json() as OauthLoginBodyType;                                
  const cookieStore = await cookies();
  try {
  
    const decodedAccessToken = jwt.decode(body.accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(body.refreshToken) as { exp: number };

    // set cookie vào next client
    cookieStore.set("accessToken", body.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", body.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });
    return Response.json(body);
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
