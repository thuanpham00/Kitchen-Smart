import { paymentRequestApi } from "@/apiRequests/payment";
import {
  CreatePaymentBodyType,
  CreatePaymentByTableBodyType,
  GetPaymentsQueryType,
} from "@/schemaValidations/payment.schema";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

export const usePayOrderByGuestMutation = () => {
  return useMutation({
    mutationFn: (body: CreatePaymentBodyType) => {
      return paymentRequestApi.createPayment(body); // thanh toán theo guestID
    },
  });
};

export const usePayOrderByTableMutation = () => {
  return useMutation({
    mutationFn: (body: CreatePaymentByTableBodyType) => {
      return paymentRequestApi.createPaymentByTable(body); // thanh toán theo table
    },
  });
};

export const useGetListPaymentQuery = (params: GetPaymentsQueryType) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => {
      return paymentRequestApi.list(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetDetailPayment = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["payment-detail", id],
    queryFn: () => {
      return paymentRequestApi.detail(id);
    },
    enabled,
  });
};
