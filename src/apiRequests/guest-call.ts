import {
  GuestCallCountResType,
  GuestCallListResType,
  GuestCallResType,
} from "@/schemaValidations/guest-call.schema";
import { GetOrdersQueryParamsType } from "@/schemaValidations/order.schema";
import http from "@/utils/http";
import queryString from "query-string";

const guestCallApiRequest = {
  getGuestCalls: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GuestCallListResType>(
      "/guest-calls?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
  changeStatusGuestCall: (idGuestCall: string, status: string) =>
    http.put<GuestCallResType>(`/guest-calls/${idGuestCall}`, { status }),
  getCountPendingGuestCall: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GuestCallCountResType>(
      "/guest-calls/count-pending-today?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
};

export default guestCallApiRequest;
