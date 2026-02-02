"use client";
import RefreshToken from "@/components/refresh-token";
import { Fragment, useEffect } from "react";
import {
  decodeToken,
  generateSocket,
  getAccessTokenFromLocalStorage,
  getTableNumberFromLocalStorage,
  removeTokenFromLocalStorage,
} from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import LogoutSocket from "@/components/logout-socketed";
import { useCountPendingGuestCallQuery } from "@/queries/useGuestCall";
import { endOfDay, startOfDay } from "date-fns";

type InfoGuestType = {
  tokenGuestId: string;
  tableNumber: string;
};

type AppStoreType = {
  isAuth: boolean;
  isRole: RoleType | undefined;
  setIsRole: (isRole: RoleType | undefined) => void;
  socket: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;

  infoGuest: InfoGuestType | undefined;
  setInfoGuest: (infoGuest: InfoGuestType | undefined) => void;

  countGuestCalls: number;
  setCountGuestCalls: (countGuestCalls: number) => void;
};

// dùng zustand
export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  isRole: undefined as RoleType | undefined,
  setIsRole: (isRole: RoleType | undefined) => {
    set({ isRole: isRole, isAuth: Boolean(isRole) });
    if (!isRole) {
      removeTokenFromLocalStorage();
    }
  },
  socket: undefined,
  setSocket: (socket: Socket | undefined) => set({ socket }),

  infoGuest: undefined,
  setInfoGuest: (infoGuest: InfoGuestType | undefined) => set({ infoGuest }),

  countGuestCalls: 0,
  setCountGuestCalls: (countGuestCalls: number) => set({ countGuestCalls }),
}));

// setup React Query ở cấp cao nhất của ứng dụng
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const isRole = useAppStore((state) => state.isRole);
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const setInfoGuest = useAppStore((state) => state.setInfoGuest);
  const setCountGuestCalls = useAppStore((state) => state.setCountGuestCalls);

  const socket = useAppStore((state) => state.socket);

  const countPending = useCountPendingGuestCallQuery(
    {
      fromDate: initFromDate,
      toDate: initToDate,
    },
    {
      enabled: Boolean(isRole) && Boolean(socket), // có nghĩa là chỉ chạy khi đã login
    },
  );

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    const tableNumber = getTableNumberFromLocalStorage();
    if (accessToken) {
      const { role } = decodeToken(accessToken);
      setIsRole(role);
      setSocket(generateSocket(accessToken)); // khởi tạo socket khi login thành công

      if (tableNumber) {
        // nếu có tableNumber thì mới set
        setInfoGuest({
          tableNumber: tableNumber,
          tokenGuestId: accessToken,
        });
      }
    }
  }, [setIsRole, setSocket, setInfoGuest, setCountGuestCalls]);

  useEffect(() => {
    if (countPending.data?.payload.data !== undefined) {
      setCountGuestCalls(countPending.data.payload.data);
    }
  }, [countPending?.data?.payload.data, setCountGuestCalls]);

  useEffect(() => {
    if (!socket) return;

    function onGuestCallListener() {
      // setCountGuestCalls(data.countPending);
      countPending.refetch();
    }

    // đếm số cuộc gọi phục vụ từ khách (global toàn app)
    socket.on("count-call-waiter", onGuestCallListener);
    return () => {
      socket.off("count-call-waiter", onGuestCallListener);
    };
  }, [socket, setCountGuestCalls, countPending]);

  return (
    <Fragment>
      <LogoutSocket />
      <RefreshToken />
      {children}
    </Fragment>
  );
}
