/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "@/i18n/routing";
import { UseFormReturn } from "react-hook-form";

export default function useSearchForm(
  form: UseFormReturn,
  queryConfig: Record<string, string | number | boolean | Date>,
  link: string,
) {
  const router = useRouter();
  const filterKeys = ["page", "limit", "type"];
  const queryParamsFilter = Object.keys(queryConfig).filter((key) => !filterKeys.includes(key));

  const reset = () => {
    const resetObject = Object.fromEntries(queryParamsFilter.map((key) => [key, undefined]));

    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, ...resetObject })
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    form.reset();
    router.push(`${link}?${params.toString()}`);
  };

  // const addType = link === "/manage/inventory-stocks" ? {type: export} : "exportReceipt";
  const submit = (data: Record<string, string | number | boolean | Date>) => {
    const mappedData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value]));
    console.log(mappedData);

    const params = new URLSearchParams(
      Object.entries({ ...queryConfig, page: 1, ...mappedData })
        .filter(([key, value]) => value !== undefined && String(value) !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    router.push(`${link}?${params.toString()}`);
  };
  return { reset, submit };
}
