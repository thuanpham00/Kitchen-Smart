import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";
import { MessageResType } from "@/schemaValidations/common.schema";
import http from "@/utils/http";

export const authRequests = {
  login_nextjs: async (data: LoginBodyType) => {
    return http.post<LoginResType>("/api/auth/login", data, {
      baseUrl: "", // sử dụng baseUrl trống để gọi API nội bộ của Next.js
    });
  },
  login_backend: async (data: LoginBodyType) => {
    return http.post<LoginResType>(`/auth/login`, data);
  },

  logout_nextjs: async () => {
    return http.post<MessageResType>("/api/auth/logout", null, {
      baseUrl: "", // sử dụng baseUrl trống để gọi API nội bộ của Next.js
    });
  },
  logout_backend: async (
    body: LogoutBodyType & {
      accessToken: string;
    }
  ) => {
    return http.post<MessageResType>(
      `/auth/logout`,
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`, // vì ở server nên http sẽ ko tự động gán AT cần set thủ công
        },
      }
    );
  },

  refreshToken_nextjs: async () => {
    return http.post<LoginResType>("/api/auth/refresh-token", null, {
      baseUrl: "", // sử dụng baseUrl trống để gọi API nội bộ của Next.js
    });
  },
  refreshToken_backend: async (data: RefreshTokenBodyType) => {
    return http.post<RefreshTokenResType>(`/auth/refresh-token`, data);
  },
};
