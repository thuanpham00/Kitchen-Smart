import {
  AccountListResType,
  AccountResType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const accountApiRequests = {
  me: () => {
    return http.get<AccountResType>("/accounts/me");
  },
  me_next_server: (accessToken: string) => {
    return http.get<AccountResType>("/accounts/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`, // vì ở server nên http sẽ ko tự động gán AT cần set thủ công
      },
    });
  },

  updateMe: (body: UpdateMeBodyType) => {
    return http.put<AccountResType>("/accounts/me", body);
  },

  changePassword_nextjs: (body: ChangePasswordV2BodyType) => {
    return http.put<ChangePasswordV2ResType>("/api/accounts/change-password-v2", body, {
      baseUrl: "",
    });
  },
  changePassword_backend: (
    body: ChangePasswordV2BodyType & {
      accessToken: string;
    }
  ) => {
    return http.put<ChangePasswordV2ResType>(
      "/accounts/change-password-v2",
      { password: body.password, oldPassword: body.oldPassword, confirmPassword: body.confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`, // vì ở server nên http sẽ ko tự động gán AT cần set thủ công
        },
      }
    );
  },

  list: () => {
    return http.get<AccountListResType>("/accounts");
  },
  addEmployee: (body: CreateEmployeeAccountBodyType) => {
    return http.post<AccountResType>("/accounts", body);
  },
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) => {
    return http.put<AccountResType>(`/accounts/detail/${id}`, body);
  },
  deleteEmployee: (id: number) => {
    return http.delete<AccountResType>(`/accounts/detail/${id}`);
  },
  getEmployeeById: (id: number) => {
    return http.get<AccountResType>(`/accounts/detail/${id}`);
  },

  guestList: (queryParams: GetGuestListQueryParamsType) => {
    return http.get<GetListGuestsResType>(
      `/accounts/guests?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    );
  },
  createGuest: (body: CreateGuestBodyType) => {
    return http.post<CreateGuestResType>(`/accounts/guests`, body);
  },
};
