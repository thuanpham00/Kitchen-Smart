"use client";
import Quantity from "@/app/guest/menu/quantity";
import { Button } from "@/components/ui/button";
import { MenuItemStatus } from "@/constants/type";
import { formatCurrency, handleErrorApi } from "@/lib/utils";
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
import { useGetMenuActiveQuery } from "@/queries/useMenu";
import { Badge } from "@/components/ui/badge";

type OrderList = (GuestCreateOrdersBodyType[number] & {
  price: number;
})[];

export default function MenuOrder() {
  const orderMutation = useGuestOrderMutation();
  const { data } = useGetMenuActiveQuery();

  const menuActive = data?.payload.data;
  const menuItems = menuActive?.menuItems || [];
  const [orders, setOrders] = useState<OrderList>([]);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  // Group menu items by category
  const groupedByCategory = menuItems
    .filter((item) => item.status !== MenuItemStatus.HIDDEN)
    .reduce(
      (acc, menuItem) => {
        const categoryName = menuItem.dish.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(menuItem);
        return acc;
      },
      {} as Record<string, typeof menuItems>,
    );

  const handleChangeQuantity = (menuItemId: number, quantity: number, price: number) => {
    if (quantity === 0) {
      // Xóa món khỏi orders khi quantity = 0
      setOrders(orders.filter((order) => order.menuItemId !== menuItemId));
      return;
    }

    const checkOrderExits = orders.find((order) => order.menuItemId === menuItemId);
    if (checkOrderExits) {
      // cập nhật số lượng
      const updatedOrders = orders.map((order) => {
        if (order.menuItemId === menuItemId) {
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
      setOrders([...orders, { menuItemId: menuItemId, quantity: quantity, price: price }]);
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
      const body = orders.map((order) => ({ menuItemId: order.menuItemId, quantity: order.quantity }));
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
      <h1 className="text-center text-xl font-bold">
        {menuActive?.name ? menuActive.name : "Menu quán"} -{" "}
        <Badge variant="default">{menuActive?.menuItems.length} món ăn</Badge>
      </h1>
      <div className="flex flex-col h-[calc(100vh-240px)] overflow-y-auto gap-6 py-2 mb-2">
        {Object.entries(groupedByCategory).map(([categoryName, items]) => (
          <div key={categoryName} className="space-y-3">
            {/* Category Header */}
            <div className="bg-background/95 backdrop-blur-sm z-10 pb-2 border-b">
              <h3 className="text-base font-bold text-primary">{categoryName}</h3>
              <p className="text-xs text-muted-foreground">{items.length} món</p>
            </div>

            {/* Category Items */}
            <div className="space-y-3">
              {items.map((menuItem) => {
                const dish = menuItem.dish;
                const hasDiscount = menuItem.price < dish.price;
                const isOutOfStock = menuItem.status === MenuItemStatus.OUT_OF_STOCK;

                return (
                  <div key={menuItem.id} className="flex gap-4">
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
                      {isOutOfStock && (
                        <div>
                          <div className="absolute inset-0 z-40 bg-gray-200 opacity-25 rounded-md"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-md w-full">
                            <span className="p-1 rounded-lg font-semibold text-sm bg-white text-black w-full block text-center">
                              Hết hàng
                            </span>
                          </div>
                        </div>
                      )}
                      {hasDiscount && !isOutOfStock && (
                        <div className="absolute top-1 left-1 z-10">
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                            Giảm giá
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-[15px] font-semibold line-clamp-1">{dish.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{dish.description}</p>
                      {menuItem.notes && (
                        <p className="text-xs text-orange-500 italic">💡 {menuItem.notes}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(dish.price)}
                          </span>
                        )}
                        <div className="text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 inline-block px-3 py-1 rounded-lg shadow-lg">
                          {formatCurrency(menuItem.price)}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-auto flex justify-center items-center">
                      <Quantity
                        value={orders.find((order) => order.menuItemId === menuItem.id)?.quantity || 0}
                        onChange={(quantity) => handleChangeQuantity(menuItem.id, quantity, menuItem.price)}
                        status={menuItem.status}
                      />
                    </div>
                  </div>
                );
              })}
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
                    const menuItem = menuItems.find((item) => item.id === order.menuItemId);
                    const dish = menuItem?.dish;
                    return (
                      <div
                        key={order.menuItemId}
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
