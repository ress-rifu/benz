"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language/language-context";

export function InvoicesHeader() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("invoices.title")}</h1>
        <p className="text-sm text-slate-500">{t("invoices.createNew")}</p>
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/dashboard/invoices/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("invoices.createNew")}
        </Link>
      </Button>
    </div>
  );
}

