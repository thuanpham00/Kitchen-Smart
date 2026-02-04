import guestCallApiRequest from "@/apiRequests/guest-call";
import { GetOrdersQueryParamsType } from "@/schemaValidations/order.schema";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useGetGuestCallListQuery = (params: GetOrdersQueryParamsType) => {
  return useQuery({
    queryKey: ["manage-guest-calls", params],
    queryFn: () => {
      return guestCallApiRequest.getGuestCalls(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useUpdateStatusGuestCallMutation = () => {
  return useMutation({
    mutationFn: (payload: { idGuestCall: string; status: string }) => {
      return guestCallApiRequest.changeStatusGuestCall(payload.idGuestCall, payload.status);
    },
  });
};

export const useCountPendingGuestCallTodayQuery = (
  params: GetOrdersQueryParamsType,
  { enabled }: { enabled: boolean },
) => {
  return useQuery({
    queryKey: ["count-pending-guest-calls", params],
    queryFn: () => {
      return guestCallApiRequest.getCountPendingGuestCall(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute,
    enabled: enabled,
  });
};
