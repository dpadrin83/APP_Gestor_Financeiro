"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TypeFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== "all") {
      params.set("type", next);
    } else {
      params.delete("type");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value || "all"} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        <SelectItem value="receita">Receita</SelectItem>
        <SelectItem value="despesa">Despesa</SelectItem>
      </SelectContent>
    </Select>
  );
}
