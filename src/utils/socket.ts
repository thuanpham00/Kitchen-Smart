import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import { envConfig } from "@/utils/config";
import { io } from "socket.io-client";

const socket = io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
  auth: {
    Authorization: `Bearer ${getAccessTokenFromLocalStorage()}`,
  },
});

export default socket; // chạy ở client