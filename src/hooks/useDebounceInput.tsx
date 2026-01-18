"use client";

import { useEffect, useState } from "react";

export default function useDebounceInput({ value, delay = 1000 }: { value: string; delay: number }) {
  const [inputSearch, setInputSearch] = useState<string>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setInputSearch(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return inputSearch;
}
