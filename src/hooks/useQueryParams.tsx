"use client";
import { useSearchParams } from "next/navigation";

export default function useQueryParams() {
  const searchParams = useSearchParams();
  return Object.fromEntries(searchParams); // searchParams đã là iterable
}
