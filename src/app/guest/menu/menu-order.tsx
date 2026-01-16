"use client";
import Quantity from "@/app/guest/menu/quantity";
import { Button } from "@/components/ui/button";
import { DishStatus } from "@/constants/type";
import { formatCurrency, handleErrorApi } from "@/lib/utils";
import { useGetListDishQuery } from "@/queries/useDish";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type OrderList = (GuestCreateOrdersBodyType[number] & {
  price: number;
})[];

export default function MenuOrder() {
  const orderMutation = useGuestOrderMutation();
  const data = useGetListDishQuery();
  const dishes = data?.data?.payload.data || [];
  const [orders, setOrders] = useState<OrderList>([]);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const handleChangeQuantity = (dishId: number, quantity: number, price: number) => {
    const checkOrderExits = orders.find((order) => order.dishId === dishId);
    if (checkOrderExits) {
      // cập nhật số lượng
      const updatedOrders = orders.map((order) => {
        if (order.dishId === dishId) {
          return {
            ...order,
            quantity: quantity,
            price: price,
          };
        }
        return order;
      });
      setOrders(updatedOrders);
    } else {
      // thêm món mới
      setOrders([...orders, { dishId: dishId, quantity: quantity, price: price }]);
    }
  };

  const totalPriceOrder = orders.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (orders.length === 0) {
      toast.error("Vui lòng chọn món ăn trước khi gọi món");
      return;
    }
    if (orderMutation.isPending) return;
    try {
      const body = orders.map((order) => ({ dishId: order.dishId, quantity: order.quantity }));
      const {
        payload: { message },
      } = await orderMutation.mutateAsync(body);
      setOrders([]);
      toast.success(message, {
        duration: 2000,
      });
      router.push("/guest/orders");
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col h-[calc(100vh-240px)] overflow-y-auto gap-4 py-2 mb-2">
        {dishes
          .filter((item) => item.status !== DishStatus.Hidden)
          .map((dish) => (
            <div key={dish.id} className="flex gap-4">
              <div className="shrink-0 relative">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  height={100}
                  width={100}
                  quality={100}
                  unoptimized
                  className="object-cover w-24 h-24 rounded-md"
                />
                {dish.status === DishStatus.Unavailable && (
                  <div>
                    <div className="absolute inset-0 z-40 bg-gray-200 opacity-25 rounded-md"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-md w-full">
                      <span className="p-1 rounded-lg font-semibold text-sm bg-white text-black w-full block text-center">
                        Tạm ngưng
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold">{dish.name}</h3>
                <p className="text-xs">{dish.description}</p>
                <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 inline-block px-3 py-1 rounded-lg shadow-lg">
                  {formatCurrency(dish.price)}{" "}
                </div>
              </div>
              <div className="shrink-0 ml-auto flex justify-center items-center">
                <Quantity
                  value={orders.find((order) => order.dishId === dish.id)?.quantity || 0}
                  onChange={(quantity) => handleChangeQuantity(dish.id, quantity, dish.price)}
                  status={dish.status}
                />
              </div>
            </div>
          ))}
      </div>
      <div className="sticky bottom-0 border-t-2 pt-2">
        <Button
          className="w-full justify-between"
          onClick={() => {
            if (orders.length === 0) {
              toast.error("Vui lòng chọn món ăn trước khi gọi món");
              return;
            }
            setOpen(true);
          }}
        >
          <span>Gọi món · {orders.length} món</span>
          <span>{formatCurrency(totalPriceOrder)} </span>
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đơn hàng món ăn?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Bạn đang đặt {orders.length} món với tổng giá trị:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orders.map((order) => {
                    const dish = dishes.find((d) => d.id === order.dishId);
                    return (
                      <div
                        key={order.dishId}
                        className="flex justify-between items-center text-sm bg-gray-200 dark:bg-card p-2 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-black dark:text-white">{dish?.name}</span>
                          <span className="text-muted-foreground"> x{order.quantity}</span>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(order.price * order.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(totalPriceOrder)}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleOrder}>Xác nhận đặt món</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
