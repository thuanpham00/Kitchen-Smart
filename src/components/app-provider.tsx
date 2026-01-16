/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RefreshToken from "@/components/refresh-token";
import { useEffect, useState } from "react";
import { decodeToken, getAccessTokenFromLocalStorage, removeTokenFromLocalStorage } from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import { create } from "zustand";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// const AppContext = createContext({
//   isRole: undefined as RoleType | undefined,
//   setIsRole: (isRole: RoleType | undefined) => {},
//   isAuth: false,
// });

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

type AppStoreType = {
  isAuth: boolean;
  isRole: RoleType | undefined;
  setIsRole: (isRole: RoleType | undefined) => void;
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
}));

// setup React Query ở cấp cao nhất của ứng dụng
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const setIsRole = useAppStore((state) => state.setIsRole);
  // const [isRole, setIsRoleState] = useState<RoleType | undefined>(undefined);

  // const setIsRole = (isRole?: RoleType | undefined) => {
  //   setIsRoleState(isRole);
  //   if (!isRole) {
  //     removeTokenFromLocalStorage();
  //   }
  // };

  // const isAuth = Boolean(isRole); // có role thì đã đăng nhập - ko có role thì chưa đăng nhập

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      const { role } = decodeToken(accessToken);
      setIsRole(role);
    }
  }, [setIsRole]);

  return (
    // <AppContext.Provider value={{ isRole, setIsRole, isAuth }}>
    <QueryClientProvider client={queryClient}>
      <RefreshToken />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext.Provider>
  );
}
