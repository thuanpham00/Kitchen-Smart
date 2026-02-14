import {
  CreatePaymentBodyType,
  CreatePaymentByTableBodyType,
  CreatePaymentResType,
  GetPaymentsQueryType,
  PaymentListResByTableType,
  PaymentListResType,
  PaymentResType,
} from "@/schemaValidations/payment.schema";
import http from "@/utils/http";
import queryString from "query-string";

export const paymentRequestApi = {
  createPayment: (body: CreatePaymentBodyType) => {
    return http.post<CreatePaymentResType>("/payments", body);
  },

  createPaymentByTable: (body: CreatePaymentByTableBodyType) => {
    return http.post<PaymentListResByTableType>("/payments/table", body);
  },

  list: (params: GetPaymentsQueryType) => {
    return http.get<PaymentListResType>("/payments?" + queryString.stringify(params));
  },

  detail: (paymentId: number) => {
    return http.get<PaymentResType>(`/payments/${paymentId}`);
  },
};
