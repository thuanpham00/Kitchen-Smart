"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuestLoginBody, GuestLoginBodyType } from "@/schemaValidations/guest.schema";
import { useGuestLoginMutation } from "@/queries/useGuest";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/components/app-provider";

export default function GuestLoginForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const tokenTable = searchParams.get("token");
  const tableNumber = Number(params.number);
  const router = useRouter();
  const setIsRole = useAppStore((state) => state.setIsRole);
  const useGuestLogin = useGuestLoginMutation();
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: "",
      token: "",
      tableNumber: 1,
    },
  });

  const submit = async (values: GuestLoginBodyType) => {
    if (useGuestLogin.isPending) return;
    let body = values;
    body = {
      ...body,
      token: tokenTable || values.tableNumber.toString(),
      tableNumber: tableNumber || values.tableNumber,
    };
    try {
      const result = await useGuestLogin.mutateAsync(body);
      toast.success(result.payload.message, {
        duration: 2000,
      });
      setIsRole(result.payload.data.guest.role);
      router.push("/guest/menu");
    } catch (error) {
      handleErrorApi({
        errors: error,
        setError: form.setError,
      });
    }
  };

  useEffect(() => {
    if (!tokenTable) {
      router.push("/");
    }
  }, [router, tokenTable]);

  return (
    <Card className="mx-auto max-w-100 w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log(err);
            })}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên khách hàng</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
