import OrdersCart from "@/app/guest/orders/orders-cart";

export default function OrderPage() {
  return (
    <div className="max-w-150 w-full mx-auto space-y-4 p-4 md:p-8">
      <h1 className="text-center text-xl font-bold">Đơn hàng</h1>
      <OrdersCart />
    </div>
  );
}
