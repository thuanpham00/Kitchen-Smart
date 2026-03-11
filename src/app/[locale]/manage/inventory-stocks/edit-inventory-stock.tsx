/* eslint-disable @typescript-eslint/no-explicit-any */
import { InventoryStockTableContext } from "@/app/[locale]/manage/inventory-stocks/inventory-stock-table";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  UpdateInventoryStockBody,
  UpdateInventoryStockBodyType,
} from "@/schemaValidations/inventory-stock.schema";
import {
  useGetInventoryStockDetailQuery,
  useUpdateInventoryStockMutation,
} from "@/queries/useInventoryStock";
import Image from "next/image";

export default function EditInventoryStock({
  showModal,
  setShowModal,
}: {
  showModal: number | null;
  setShowModal: (id: number | null) => void;
}) {
  const t = useTranslations("ManageInventoryStocks");
  const { inventoryStockIdEdit, setInventoryStockIdEdit } = useContext(InventoryStockTableContext);

  const inventoryStockDetail = useGetInventoryStockDetailQuery({
    id: inventoryStockIdEdit as number,
    enabled: Boolean(inventoryStockIdEdit),
  });
  const dataInventoryStockDetail = inventoryStockDetail.data?.payload.data;
  const updateInventoryStockMutation = useUpdateInventoryStockMutation();

  const form = useForm<UpdateInventoryStockBodyType>({
    resolver: zodResolver(UpdateInventoryStockBody),
    defaultValues: {
      maxStock: 0,
      minStock: 0,
    },
  });

  useEffect(() => {
    if (dataInventoryStockDetail) {
      form.reset({
        maxStock: dataInventoryStockDetail.maxStock || 0,
        minStock: dataInventoryStockDetail.minStock || 0,
      });
    }
  }, [dataInventoryStockDetail, form]);

  const reset = () => {
    setInventoryStockIdEdit(undefined);
    form.reset();
    setShowModal(null);
  };

  const submit = async (values: UpdateInventoryStockBodyType) => {
    if (updateInventoryStockMutation.isPending) return;
    const body = values;
    try {
      const {
        payload: { message },
      } = await updateInventoryStockMutation.mutateAsync({
        id: inventoryStockIdEdit as number,
        body: body,
      });

      toast.success(message, {
        duration: 2000,
      });

      reset();
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  return (
    <Dialog
      open={showModal === 1 ? true : false}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-100 max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("updateInventoryStock")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-ingredient-form"
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4 py-4">
              {dataInventoryStockDetail && (
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="maxStock">{t("maxStock")}</Label>
                  <div className="col-span-3 w-full flex items-center gap-2">
                    <Image
                      src={dataInventoryStockDetail?.ingredientImage as string}
                      alt={dataInventoryStockDetail?.ingredientName || "Ingredient Image"}
                      className="w-16 h-16 object-cover rounded-xl"
                      width={60}
                      height={60}
                    />
                    <span>{dataInventoryStockDetail?.ingredientName}</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="maxStock">{t("maxStock")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="maxStock"
                          className="w-full"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FormMessage>
                          {Boolean(errors.maxStock?.message) && t(errors.maxStock?.message as any)}
                        </FormMessage>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="minStock">{t("minStock")}</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="minStock"
                          className="w-full"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FormMessage>
                          {Boolean(errors.minStock?.message) && t(errors.minStock?.message as any)}
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
          <Button type="submit" form="edit-ingredient-form">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
