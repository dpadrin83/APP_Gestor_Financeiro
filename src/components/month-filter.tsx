"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MonthFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("month", next);
    } else {
      params.delete("month");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-40"
    />
  );
}
