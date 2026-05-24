"use client";

import { useLanguage } from "@/lib/language/language-context";

export function DashboardHeader() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t("dashboard.title")}</h1>
      <p className="text-slate-500 font-medium">
        {t("dashboard.welcome")}
      </p>
    </div>
  );
}
