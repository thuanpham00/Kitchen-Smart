import guestApiRequest from "@/apiRequests/guest";
import { GuestCreateOrdersBodyType, GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGuestLoginMutation = () => {
  return useMutation({
    mutationFn: (body: GuestLoginBodyType) => {
      return guestApiRequest.login_nextjs(body);
    },
  });
};

export const useGuestLogoutMutation = () => {
  return useMutation({
    mutationFn: () => {
      return guestApiRequest.logout_nextjs();
    },
  });
};

export const useGuestOrderQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return guestApiRequest.getOrderList();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGuestOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GuestCreateOrdersBodyType) => {
      return guestApiRequest.order(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
