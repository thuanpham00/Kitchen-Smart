/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAppStore } from "@/components/app-provider";
import OrderGuestSummary from "@/app/manage/orders/order-guest-summary";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency, getVietnameseOrderStatus, handleErrorApi } from "@/lib/utils";
import { OrderStatus } from "@/constants/type";
import { Badge } from "@/components/ui/badge";
import { Users, UtensilsCrossed, Printer } from "lucide-react";
import { GetOrdersResType } from "@/schemaValidations/order.schema";
import { usePayOrderByTableMutation } from "@/queries/usePayment";
import { useState, useEffect } from "react";
import { CreatePaymentResType } from "@/schemaValidations/payment.schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

export default function AllOrderByTablePage() {
  const router = useRouter();
  const params = useParams();
  const tableNumber = Number(params.id);
  const queryClient = useQueryClient();
  const socket = useAppStore((state) => state.socket);

  const selectedTableGuests = useAppStore((state) => state.selectedTableGuests);
  const guestIds = selectedTableGuests ? Object.keys(selectedTableGuests).map((id) => Number(id)) : [];
  console.log("selectedTableGuests", guestIds);

  const payOrderTableMutation = usePayOrderByTableMutation();

  const [showModalSelectPaymentMethod, setShowModalSelectPaymentMethod] = useState(false);
  const [showModalSeePay, setShowModalSeePay] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"CASH" | "SEPAY" | null>(null);
  const [cashReceived, setCashReceived] = useState(false);
  const [paymentExists, setPaymentExists] = useState<CreatePaymentResType["data"] | null>(null);
  const [showModalPaymentSepayCompleted, setShowModalPaymentSepayCompleted] = useState<{
    paymentGroupId: number;
    status: string;
    amount: number;
  } | null>(null);

  const handlePayTable = async () => {
    // Kiểm tra tất cả orders đã delivered chưa
    const allOrders = Object.values(selectedTableGuests || {}).flat() as GetOrdersResType["data"];
    const ordersToPaythực = allOrders.filter(
      (order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Rejected,
    );

    const checkAllOrderDelivery = ordersToPaythực.every((item) => item.status === OrderStatus.Delivered);

    if (!checkAllOrderDelivery) {
      toast.error("Chỉ có thể thanh toán khi tất cả các món đều ở trạng thái Đã phục vụ!", {
        duration: 4000,
      });
      return;
    }

    setShowModalSelectPaymentMethod(true);
    setSelectedPaymentMethod(null);
    setCashReceived(false);
  };

  const handleConfirmCashPayment = () => {
    if (!cashReceived) {
      toast.error("Vui lòng xác nhận đã nhận tiền mặt!", {
        duration: 3000,
      });
      return;
    }
    handlePayWithMethod("CASH");
  };

  const handlePayWithMethod = async (paymentMethod: "CASH" | "SEPAY") => {
    if (payOrderTableMutation.isPending) return;

    try {
      const {
        payload: { data },
      } = await payOrderTableMutation.mutateAsync({
        tableNumber,
        paymentMethod,
        guestIds,
      });

      if (paymentMethod === "SEPAY") {
        setPaymentExists(data as any);
        setShowModalSelectPaymentMethod(false);
        setShowModalSeePay(true);
      }

      if (paymentMethod === "CASH") {
        setShowModalSelectPaymentMethod(false);
        setShowModalSeePay(false);
        setSelectedPaymentMethod(null);
        setCashReceived(false);
        setPaymentExists(null);

        queryClient.invalidateQueries({ queryKey: ["tables"] });
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        router.push("/manage/payments");
      }
    } catch (error) {
      handleErrorApi({
        errors: error,
      });
    }
  };

  const handlePrintBill = () => {
    const allOrders = Object.values(selectedTableGuests || {}).flat() as GetOrdersResType["data"];
    const ordersToPaythực = allOrders.filter(
      (order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Rejected,
    );

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn thanh toán</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .info {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
          .text-right {
            text-align: right;
          }
          .total {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .grand-total {
            font-size: 20px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN THANH TOÁN</h1>
          <p>${new Date().toLocaleString("vi-VN")}</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span>Bàn số:</span>
            <strong>${tableNumber}</strong>
          </div>
          <div class="info-row">
            <span>Số khách:</span>
            <strong>${guestCount}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Món ăn</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th class="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToPaythực
              .map(
                (order, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${order.dishSnapshot.name}</td>
                <td>${formatCurrency(order.dishSnapshot.price)}</td>
                <td>${order.quantity}</td>
                <td class="text-right">${formatCurrency(order.dishSnapshot.price * order.quantity)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total">
          <div class="total-row">
            <span>Tạm tính:</span>
            <strong>${formatCurrency(totalTableUnpaid)}</strong>
          </div>
          <div class="total-row">
            <span>Giảm giá:</span>
            <strong>0 ₫</strong>
          </div>
          <div class="grand-total">
            <span>TỔNG CỘNG:</span>
            <strong>${formatCurrency(totalTableUnpaid)}</strong>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; font-size: 14px;">
          <p>Cảm ơn quý khách!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  useEffect(() => {
    if (!socket) return;

    async function onUpdatePayment(data: { paymentGroupId: number; status: string; amount: number }) {
      setShowModalPaymentSepayCompleted(data);
      setShowModalSeePay(false);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    }

    socket?.on("payment-group-completed", onUpdatePayment);

    return () => {
      socket?.off("payment-group-completed", onUpdatePayment);
    };
  }, [socket, queryClient]);

  if (!selectedTableGuests || Object.keys(selectedTableGuests).length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground py-8">
          Không có dữ liệu cho bàn này. Vui lòng quay lại trang quản lý orders.
        </div>
      </div>
    );
  }

  const guestCount = Object.keys(selectedTableGuests).length;

  // Tính tổng toàn bộ bàn
  let totalTableUnpaid = 0;
  let totalTablePaid = 0;
  let totalOrders = 0;

  // Gộp tất cả orders từ các guests
  const allOrders = Object.values(selectedTableGuests).flat() as GetOrdersResType["data"];
  const ordersFilterToPurchase = allOrders.filter(
    (order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Rejected,
  );

  Object.keys(selectedTableGuests).forEach((guestId) => {
    const orders = selectedTableGuests[Number(guestId)];
    totalOrders += orders.length;
    orders.forEach((order: GetOrdersResType["data"][0]) => {
      const amount = order.quantity * order.dishSnapshot.price;
      if (order.status === OrderStatus.Paid) {
        totalTablePaid += amount;
      } else if (order.status !== OrderStatus.Rejected) {
        totalTableUnpaid += amount;
      }
    });
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bàn số {tableNumber}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {guestCount} khách
              </span>
              <span className="flex items-center gap-1">
                <UtensilsCrossed className="w-4 h-4" />
                {totalOrders} món
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={handlePayTable}
          disabled={payOrderTableMutation.isPending || totalTableUnpaid === 0}
          size="lg"
          className="gap-2"
        >
          🏦 Thanh toán toàn bộ bàn
        </Button>
      </div>

      {/* Tổng quan bàn */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-border dark:bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Tổng chưa thanh toán</div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalTableUnpaid)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Tổng đã thanh toán</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalTablePaid)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Tổng cộng</div>
          <div className="text-2xl font-bold">{formatCurrency(totalTableUnpaid + totalTablePaid)}</div>
        </div>
      </div>

      {/* Danh sách guests */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.keys(selectedTableGuests).map((guestId, index) => {
          const orders = selectedTableGuests[Number(guestId)]; // ds order của guest này
          return (
            <div key={guestId} className="border rounded-lg p-4 bg-card shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Khách {index + 1}/{guestCount}
                </Badge>
              </div>
              <OrderGuestSummary guest={orders[0].guest} orders={orders} />
            </div>
          );
        })}
      </div>

      <Dialog
        open={showModalSelectPaymentMethod}
        onOpenChange={(open) => {
          setShowModalSelectPaymentMethod(open);
          if (!open) {
            setSelectedPaymentMethod(null);
            setCashReceived(false);
            setShowModalSeePay(false);
            setPaymentExists(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Hóa đơn thanh toán</DialogTitle>
            <DialogDescription>
              Bàn số: <span className="font-semibold">{tableNumber}</span> - Số khách:{" "}
              <span className="font-semibold">{guestCount}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 py-4 flex-1 overflow-hidden">
            {/* Cột trái: Bill/Hóa đơn */}
            <div className="col-span-2 border rounded-lg p-4 bg-muted/10 space-y-4 overflow-y-auto">
              <div className="text-center space-y-1 pb-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1"></div>
                  <div className="text-lg font-bold">HÓA ĐƠN THANH TOÁN</div>
                  <div className="flex-1 flex justify-end">
                    <Button variant="outline" size="sm" onClick={handlePrintBill} className="gap-2">
                      <Printer className="h-4 w-4" />
                      In hóa đơn
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date().toLocaleString("vi-VN")}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bàn số:</span>
                  <span className="font-semibold">{tableNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số khách:</span>
                  <span className="font-semibold">{guestCount}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="font-semibold text-sm">Chi tiết món ({ordersFilterToPurchase.length}):</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ordersFilterToPurchase.map((order, index) => (
                    <div
                      key={order.id}
                      className="flex items-start gap-3 p-3 rounded-md bg-background border"
                    >
                      <div className="text-sm text-muted-foreground">{index + 1}.</div>
                      <Image
                        src={order.dishSnapshot.image}
                        alt={order.dishSnapshot.name}
                        width={50}
                        height={50}
                        className="rounded object-cover"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-medium text-sm">{order.dishSnapshot.name}</div>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-800 border-green-300"
                          >
                            {getVietnameseOrderStatus(order.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="text-muted-foreground">
                            {formatCurrency(order.dishSnapshot.price)} x {order.quantity}
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(order.dishSnapshot.price * order.quantity)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Khách: {order.guest?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-semibold">{formatCurrency(totalTableUnpaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giảm giá:</span>
                  <span className="font-semibold">0 ₫</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totalTableUnpaid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: Phương thức thanh toán */}
            <div className="col-span-1 space-y-4">
              <div className="text-base font-semibold border-b pb-2">Phương thức thanh toán</div>

              {/* Option 1: Tiền mặt */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === "CASH"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => {
                  if (!payOrderTableMutation.isPending) {
                    setSelectedPaymentMethod("CASH");
                    setCashReceived(false);
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">💵</div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">Tiền mặt</div>
                    <div className="text-xs text-muted-foreground">Thanh toán trực tiếp</div>
                  </div>
                  {selectedPaymentMethod === "CASH" && (
                    <div className="text-primary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Form xác nhận tiền mặt */}
                {selectedPaymentMethod === "CASH" && (
                  <div className="space-y-3 pt-3 border-t animate-in slide-in-from-top-2">
                    <div
                      className="flex items-start space-x-3 p-3 border rounded-lg bg-background"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        id="cash-received"
                        checked={cashReceived}
                        onCheckedChange={(checked) => {
                          setCashReceived(checked === true);
                        }}
                      />
                      <Label
                        htmlFor="cash-received"
                        className="text-sm font-medium cursor-pointer leading-tight"
                      >
                        Xác nhận đã nhận tiền mặt từ khách
                      </Label>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleConfirmCashPayment}
                      disabled={payOrderTableMutation.isPending || !cashReceived}
                    >
                      {payOrderTableMutation.isPending ? "Đang xử lý..." : "💰 Xác nhận thanh toán"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Option 2: SeePay */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === "SEPAY"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => {
                  if (!payOrderTableMutation.isPending) {
                    setSelectedPaymentMethod("SEPAY");
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">🏦</div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">SeePay</div>
                    <div className="text-xs text-muted-foreground">Chuyển khoản ngân hàng</div>
                  </div>
                  {selectedPaymentMethod === "SEPAY" && (
                    <div className="text-primary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Form xác nhận SeePay */}
                {selectedPaymentMethod === "SEPAY" && (
                  <div className="space-y-3 pt-3 border-t animate-in slide-in-from-top-2">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        handlePayWithMethod("SEPAY");
                      }}
                      disabled={payOrderTableMutation.isPending}
                    >
                      {payOrderTableMutation.isPending ? "Đang xử lý..." : "🏦 Xác nhận thanh toán"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Hint text */}
              {!selectedPaymentMethod && (
                <div className="text-center text-sm text-muted-foreground py-4 border rounded-lg bg-muted/20">
                  👆 Chọn phương thức thanh toán để tiếp tục
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showModalSeePay}
        onOpenChange={(open) => {
          setShowModalSeePay(open);
          if (!open) {
            setPaymentExists(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Hướng dẫn thanh toán qua chuyển khoản ngân hàng
            </DialogTitle>
          </DialogHeader>

          {paymentExists && (
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Cột trái: QR Code */}
              <div className="space-y-4 flex flex-col items-center border-r pr-6">
                <div className="text-center">
                  <div className="font-semibold text-base mb-2">Cách 1: Mở app ngân hàng và quét mã QR</div>
                </div>

                {/* SeePay Logo */}
                <div className="w-32 h-12 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 240 80" fill="none">
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#1e40af"
                      fontSize="36"
                      fontWeight="bold"
                    >
                      SePay
                    </text>
                  </svg>
                </div>

                {/* QR Code */}
                {paymentExists.qrCodeUrl && (
                  <div className="relative bg-white p-4 rounded-lg border-2 border-gray-200">
                    <Image
                      src={paymentExists.qrCodeUrl}
                      alt="QR Code thanh toán"
                      className="w-64 h-64"
                      width={256}
                      height={256}
                      unoptimized
                    />
                  </div>
                )}

                {/* Payment Gateway Logos */}
                <div className="flex items-center gap-4 justify-center">
                  <div className="text-xs text-gray-500 font-semibold">napas 24/7</div>
                  <div className="text-red-600 font-bold text-lg">⭐ MB</div>
                  <div className="text-red-600 font-bold text-sm">VIETQR™</div>
                </div>

                {/* Download QR Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (paymentExists.qrCodeUrl) {
                      const link = document.createElement("a");
                      link.href = paymentExists.qrCodeUrl;
                      link.download = `QR-Payment-${paymentExists.paymentId}.png`;
                      link.click();
                    }
                  }}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Tải ảnh QR
                </Button>

                {/* Payment Status */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className="font-medium text-orange-600 flex items-center gap-2">
                    Chờ thanh toán...
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Cột phải: Thông tin chuyển khoản */}
              {paymentExists.bankInfo && (
                <div className="space-y-4 pl-6">
                  <div className="text-center">
                    <div className="font-semibold text-base mb-4">
                      Cách 2: Chuyển khoản thủ công theo thông tin
                    </div>
                  </div>

                  {/* Bank Logo */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="text-red-600 text-2xl">⭐</div>
                    <div className="font-bold text-lg">MB</div>
                  </div>

                  <div className="text-center text-sm font-semibold mb-6">Ngân hàng MBBank</div>

                  {/* Bank Information */}
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Chủ tài khoản:</span>
                      <span className="font-semibold">{paymentExists.bankInfo.accountName}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Số TK:</span>
                      <span className="font-semibold">{paymentExists.bankInfo.accountNumber}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Số tiền:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(paymentExists.bankInfo.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Nội dung CK:</span>
                      <span className="font-bold text-primary">{paymentExists.bankInfo.content}</span>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                    <div className="flex gap-2 text-xs text-amber-800">
                      <span className="font-semibold shrink-0">Lưu ý:</span>
                      <span>
                        Vui lòng giữ nguyên nội dung chuyển khoản{" "}
                        <span className="font-bold">{paymentExists.bankInfo.content}</span> để hệ thống tự
                        động xác nhận thanh toán
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(showModalPaymentSepayCompleted?.paymentGroupId)}
        onOpenChange={() => setShowModalPaymentSepayCompleted(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thanh toán hoàn tất</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-3xl">✅</div>
              <div className="text-lg font-semibold mt-2">Thanh toán thành công!</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Payment Group ID:</span>
                <span className="font-medium">#{showModalPaymentSepayCompleted?.paymentGroupId}</span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(Number(showModalPaymentSepayCompleted?.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-medium text-green-600">{showModalPaymentSepayCompleted?.status}</span>
              </div>
            </div>
            <div className="text-center">
              <Button
                onClick={() => {
                  setShowModalPaymentSepayCompleted(null);
                  setShowModalSelectPaymentMethod(false);
                  setShowModalSeePay(false);
                  setSelectedPaymentMethod(null);
                  setCashReceived(false);
                  setPaymentExists(null);
                  router.push("/manage/payments");
                }}
              >
                Quay về danh sách thanh toán
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
