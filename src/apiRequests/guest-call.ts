import { GuestCallCountResType, GuestCallListResType, GuestCallResType } from "@/schemaValidations/guest-call.schema";
import http from "@/utils/http";

const guestCallApiRequest = {
  getGuestCalls: () => http.get<GuestCallListResType>("/guest-calls"),
  changeStatusGuestCall: (idGuestCall: string, status: string) =>
    http.put<GuestCallResType>(`/guest-calls/${idGuestCall}`, { status }),
  getCountPendingGuestCall: () => http.get<GuestCallCountResType>("/guest-calls/count-pending"),
};

export default guestCallApiRequest;
