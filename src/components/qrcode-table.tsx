"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { getTableLink } from "@/lib/utils";

export default function QrCodeTable({
  token,
  tableNumber,
  width = 250,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // tạo 1 cái canvas ảo để thư viện QRCode vẽ lên đó
    // và chúng ta edit thẻ canvas thật
    // cuối cùng thì chúng ta đưa cái thẻ canvas ảo chứa QR code ở trên vào thẻ canvas thật
    const canvas = canvasRef.current!;
    canvas.height = width + 70;
    canvas.width = width;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "20px Arial";
    canvasContext.fillStyle = "black";
    canvasContext.textAlign = "center";
    canvasContext.fillText(`Bàn ${tableNumber}`, canvas.width / 2, canvas.width + 20);
    canvasContext.fillText(`Quét để gọi món`, canvas.width / 2, canvas.width + 50);

    const virtualCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({
        token: token,
        tableNumber: tableNumber,
      }),
      { width },
      (error) => {
        if (error) console.error(error);
        canvasContext.drawImage(virtualCanvas, 0, 0, width, width);
      }
    );
  }, [token, tableNumber, width]);
  return <canvas ref={canvasRef} />;
}
