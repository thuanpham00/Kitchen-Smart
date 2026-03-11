/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  CreateImportReceiptBody,
  CreateImportReceiptBodyType,
} from "@/schemaValidations/import-receipt.schema";
import { useAddImportReceiptMutation } from "@/queries/useImportReceipt";
import { PlusCircle } from "lucide-react";
import { SupplierListDialog } from "@/app/[locale]/manage/import-export-inventory/list-supplier-dialog";
import { Input } from "@/components/ui/input";

export default function AddImport() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("ManageImportReceipts");
  const addImportReceiptMutation = useAddImportReceiptMutation();

  const [selectedSupplier, setSelectedSupplier] = useState<{ id: number; name: string } | null>(null);

  const form = useForm<CreateImportReceiptBodyType>({
    resolver: zodResolver(CreateImportReceiptBody),
    defaultValues: {
      supplierId: 0,
      importDate: undefined,
      note: "",
      items: [],
    },
  });

  const reset = () => {
    form.reset();
  };

  const submit = async (values: CreateImportReceiptBodyType) => {
    if (addImportReceiptMutation.isPending) return;
    try {
      const {
        payload: { message },
      } = await addImportReceiptMutation.mutateAsync(values);

      toast.success(message, {
        duration: 2000,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Dialog open={Boolean(open)} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{t("createImportReceipt")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("createImportReceipt")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-dish-form"
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="supplierId">{t("supplier")}</Label>
                      <div className="col-span-3 flex items-center gap-2 w-full">
                        {selectedSupplier ? (
                          <Input className="w-[80%]" value={selectedSupplier.name || ""} disabled />
                        ) : (
                          <Input className="w-[80%]" value={""} disabled />
                        )}

                        <SupplierListDialog
                          onChoose={(supplier) => {
                            field.onChange(supplier.id);
                            setSelectedSupplier(supplier);
                          }}
                        />
                        <FormMessage>
                          {Boolean(errors.supplierId?.message) && t(errors.supplierId?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-dish-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
