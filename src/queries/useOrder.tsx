import { orderApiRequest } from "@/apiRequests/order";
import {
  CreateOrdersBodyType,
  GetOrdersQueryParamsType,
  UpdateOrderBodyType,
} from "@/schemaValidations/order.schema";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const useGetOrderQuery = (params: GetOrdersQueryParamsType) => {
  return useQuery({
    queryKey: ["manage-orders", params],
    queryFn: () => {
      return orderApiRequest.getOrderList(params);
    },
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

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (body: CreateOrdersBodyType) => {
      return orderApiRequest.createOrders(body);
    },
  });
};

export const useCountOrderTodayQuery = (
  params: GetOrdersQueryParamsType,
  { enabled }: { enabled: boolean },
) => {
  return useQuery({
    queryKey: ["count-order-today", params],
    queryFn: () => {
      return orderApiRequest.getCountOrderToday(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute,
    enabled: enabled,
  });
};
