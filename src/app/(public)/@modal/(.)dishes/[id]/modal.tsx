"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function ModalDishIntercepting({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent className="max-w-225! w-full!">{children}</DialogContent>
    </Dialog>
  );
}
