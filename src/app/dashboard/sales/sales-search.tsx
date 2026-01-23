"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language/language-context";

export function SalesSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const q = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "month";

  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`/dashboard/sales?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    startTransition(() => {
      router.push(`/dashboard/sales?filter=${filter}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={t("sales.searchPlaceholder")}
          defaultValue={q}
          onChange={(e) => updateSearchParams(e.target.value)}
          className="pl-10"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        )}
      </div>
      {q && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          {t("common.clear")}
        </Button>
      )}
    </div>
  );
}
