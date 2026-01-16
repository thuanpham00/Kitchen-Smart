import { accountApiRequests } from "@/apiRequests/account";
import { ChangePasswordV2BodyType } from "@/schemaValidations/account.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { EntityError } from "@/utils/http";

export const PUT = async (request: Request) => {
  const cookieStore = await cookies();
  const body = (await request.json()) as ChangePasswordV2BodyType;
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return Response.json(
      {
        message: "Không tìm thấy Access Token",
      },
      {
        status: 200,
      }
    );
  }
  try {
    const { payload } = await accountApiRequests.changePassword_backend({
      oldPassword: body.oldPassword,
      password: body.password,
      confirmPassword: body.confirmPassword,
      accessToken: accessToken,
    });
    const decodedAccessToken = jwt.decode(payload.data.accessToken) as { exp: number };
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as { exp: number };

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
          message: error.message ?? "Đã có lỗi xảy ra, vui lòng thử lại sau",
        },
        {
          status: error.status ?? 500,
        }
      );
    }
  }
};
