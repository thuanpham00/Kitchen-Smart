import { authRequests } from "@/apiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (body: LoginBodyType) => {
      return authRequests.login_nextjs(body);
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => {
      return authRequests.logout_nextjs();
    },
  });
};
