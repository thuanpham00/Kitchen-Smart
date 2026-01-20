import { orderApiRequest } from "@/apiRequests/order";
import {
  CreateOrdersBodyType,
  GetOrdersQueryParamsType,
  PayGuestOrdersBodyType,
  UpdateOrderBodyType,
} from "@/schemaValidations/order.schema";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useGetOrderQuery = (params: GetOrdersQueryParamsType) => {
  return useQuery({
    queryKey: ["manage-orders", params],
    queryFn: () => {
      return orderApiRequest.getOrderList(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};
export const useGetOrderDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => {
      return orderApiRequest.getOrderDetail(id);
    },
    enabled,
  });
};

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) => {
      return orderApiRequest.updateOrder(orderId, body);
    },
  });
};

export const usePayOrderMutation = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => {
      return orderApiRequest.pay(body);
    },
  });
};

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (body: CreateOrdersBodyType) => {
      return orderApiRequest.createOrders(body);
    },
  });
};
