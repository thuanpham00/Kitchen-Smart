import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const orderApiRequest = {
  createOrders: (body: CreateOrdersBodyType) => {
    return http.post<CreateOrdersResType>("/orders", body);
  },

  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      "/orders?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    ),

  updateOrder: (orderId: number, body: UpdateOrderBodyType) => {
    return http.put<UpdateOrderResType>(`/orders/${orderId}`, body);
  },

  getOrderDetail: (orderId: number) => {
    return http.get<GetOrderDetailResType>(`/orders/${orderId}`);
  },

  pay: (body: PayGuestOrdersBodyType) => {
    return http.post<PayGuestOrdersResType>(`/orders/pay`, body);
  },
};
