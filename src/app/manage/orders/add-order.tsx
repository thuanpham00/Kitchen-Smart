/* eslint-disable react-hooks/incompatible-library */
"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestLoginBody, GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TablesDialog } from "@/app/manage/orders/tables-dialog";
import { GetListGuestsResType } from "@/schemaValidations/account.schema";
import { Switch } from "@/components/ui/switch";
import GuestsDialog from "@/app/manage/orders/guests-dialog";
import { CreateOrdersBodyType } from "@/schemaValidations/order.schema";
import Quantity from "@/app/guest/menu/quantity";
import Image from "next/image";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import { DishStatus } from "@/constants/type";
import { DishListResType } from "@/schemaValidations/dish.schema";
import { useGetListDishQuery } from "@/queries/useDish";
import { useCreateOrderMutation } from "@/queries/useOrder";
import { useCreateGuestMutation } from "@/queries/useAccount";
import { toast } from "sonner";

export default function AddOrder() {
  const createOrderMutation = useCreateOrderMutation();
  const createGuestMutation = useCreateGuestMutation();

  const [open, setOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GetListGuestsResType["data"][0] | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [orders, setOrders] = useState<CreateOrdersBodyType["orders"]>([]);
  const listDishQuery = useGetListDishQuery();
  const dishes: DishListResType["data"] = listDishQuery.data?.payload.data || [];

  const totalPrice = dishes.reduce((result, dish) => {
    const order = orders.find((order) => order.dishId === dish.id);
    if (!order) return result;
    return result + order.quantity * dish.price;
  }, 0);

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      tableNumber: 0,
    },
  });

  const name = form.watch("name");
  const tableNumber = form.watch("tableNumber");

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      if (isNewGuest && (form.getValues("name") === "" || form.getValues("tableNumber") === 0)) {
        toast.error("Vui lòng nhập tên và chọn bàn cho khách mới trước khi tạo đơn hàng.");
        return;
      }
      if (!isNewGuest && selectedGuest === null) {
        toast.error("Vui lòng chọn khách hàng trước khi tạo đơn hàng.");
        return;
      }
      let guestId = selectedGuest?.id;
      if (isNewGuest) {
        const guest = await createGuestMutation.mutateAsync({ name, tableNumber }); // tạo khách mới rồi mới tạo order
        guestId = guest.payload.data.id;
      }
      const {
        payload: { message },
      } = await createOrderMutation.mutateAsync({
        guestId: guestId!,
        orders,
      });
      reset();
      setOpen(false);
      toast.success(message, {
        duration: 4000,
      });
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  const reset = () => {
    form.reset();
    setOrders([]);
    setIsNewGuest(true);
    setSelectedGuest(null);
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          reset();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tạo đơn hàng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
          <Label htmlFor="isNewGuest">Khách hàng mới</Label>
          <div className="col-span-3 flex items-center">
            <Switch id="isNewGuest" checked={isNewGuest} onCheckedChange={setIsNewGuest} />
          </div>
        </div>
        {isNewGuest && (
          <Form {...form}>
            <form noValidate className="grid auto-rows-max items-start gap-4 md:gap-8" id="add-employee-form">
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="name">Tên khách hàng</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input id="name" className="w-full" {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableNumber"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="tableNumber">Chọn bàn</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <div className="flex items-center gap-4">
                            <div>{field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                field.onChange(table.number);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest);
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className="grid grid-cols-4 items-center justify-items-start gap-4">
            <Label htmlFor="selectedGuest">Khách đã chọn</Label>
            <div className="col-span-3 w-full gap-4 flex items-center">
              <div>
                {selectedGuest.name} (#{selectedGuest.id})
              </div>
              <div>Bàn: {selectedGuest.tableNumber}</div>
            </div>
          </div>
        )}
        <div className="h-87.5 overflow-auto flex gap-2 flex-col">
          {dishes
            .filter((dish) => dish.status !== DishStatus.Hidden)
            .map((dish) => (
              <div
                key={dish.id}
                className={cn("flex gap-4", {
                  "pointer-events-none": dish.status === DishStatus.Unavailable,
                })}
              >
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
                  <p className="text-sm font-semibold">{formatCurrency(dish.price)}</p>
                </div>
                <div className="shrink-0 ml-auto flex justify-center items-center">
                  <Quantity
                    status={dish.status}
                    onChange={(value) => handleQuantityChange(dish.id, value)}
                    value={orders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
                  />
                </div>
              </div>
            ))}
        </div>
        <DialogFooter>
          <Button className="w-full justify-between" onClick={handleOrder} disabled={orders.length === 0}>
            <span>Đặt hàng · {orders.length} món</span>
            <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
