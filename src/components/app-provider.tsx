"use client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RefreshToken from "@/components/refresh-token";
import { useEffect } from "react";
import {
  decodeToken,
  generateSocket,
  getAccessTokenFromLocalStorage,
  removeTokenFromLocalStorage,
} from "@/lib/utils";
import { RoleType } from "@/types/jwt.types";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import LogoutSocket from "@/components/logout-socketed";

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
  socket: Socket | undefined;
  setSocket: (socket: Socket | undefined) => void;
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
}));

// setup React Query ở cấp cao nhất của ứng dụng
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const setIsRole = useAppStore((state) => state.setIsRole);
  const setSocket = useAppStore((state) => state.setSocket);
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
      setSocket(generateSocket(accessToken)); // khởi tạo socket khi login thành công
    }
  }, [setIsRole, setSocket]);

  return (
    // <AppContext.Provider value={{ isRole, setIsRole, isAuth }}>
    <QueryClientProvider client={queryClient}>
      <LogoutSocket />
      <RefreshToken />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    // </AppContext.Provider>
  );
}
