import { accountApiRequests } from "@/apiRequests/account";
import {
  AccountQueryType,
  ChangePasswordV2BodyType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  GetGuestListQueryParamsType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetMeQuery = ({ queryKey }: { queryKey: string }) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: () => {
      return accountApiRequests.me().then((res) => {
        return res;
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: (body: UpdateMeBodyType) => {
      return accountApiRequests.updateMe(body);
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (body: ChangePasswordV2BodyType) => {
      return accountApiRequests.changePassword_nextjs(body);
    },
  });
};

export const useGetListEmployeeQuery = (params: AccountQueryType) => {
  return useQuery({
    queryKey: ["accounts", params],
    queryFn: () => {
      return accountApiRequests.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetEmployeeDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["account-detail", id],
    queryFn: () => {
      return accountApiRequests.getEmployeeById(id);
    },
    enabled,
  });
};

export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEmployeeAccountBodyType) => {
      return accountApiRequests.addEmployee(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateEmployeeAccountBodyType }) => {
      return accountApiRequests.updateEmployee(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return accountApiRequests.deleteEmployee(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useGetGuestListQuery = (queryParams: GetGuestListQueryParamsType) => {
  return useQuery({
    queryKey: ["guests", queryParams],
    queryFn: () => accountApiRequests.guestList(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateGuestMutation = () => {
  return useMutation({
    mutationFn: (body: CreateGuestBodyType) => {
      return accountApiRequests.createGuest(body);
    },
  });
};
