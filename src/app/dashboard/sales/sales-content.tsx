"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, FileText } from "lucide-react";
import { SalesHeader } from "./sales-header";
import { SalesTable } from "./sales-table";
import { SalesSearch } from "./sales-search";
import type { TimeFilter, DateRange, SalesData } from "./actions";
import { getSalesData } from "./actions";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language/language-context";

interface SalesContentProps {
  initialData: SalesData;
  initialFilter: TimeFilter;
  initialSearch?: string;
}

export function SalesContent({ initialData, initialFilter, initialSearch }: SalesContentProps) {
  const [salesData, setSalesData] = useState<SalesData>(initialData);
  const [currentFilter, setCurrentFilter] = useState<TimeFilter>(initialFilter);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { t } = useLanguage();

  // Refetch data when search query changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getSalesData(currentFilter, undefined, searchQuery);
      setSalesData(data);
    });
  }, [searchQuery, currentFilter]);

  const handleFilterChange = (filter: TimeFilter, customRange?: DateRange) => {
    setCurrentFilter(filter);
    startTransition(async () => {
      const data = await getSalesData(filter, customRange, searchQuery);
      setSalesData(data);
    });
  };

  const averageInvoiceValue =
    salesData.invoices.length > 0
      ? salesData.totalRevenue / salesData.invoices.length
      : 0;

  return (
    <div className="space-y-6">
      <SalesHeader
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

      <SalesSearch />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPending ? t("common.loading") : t("sales.forPeriod")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales.totalSales")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("sales.invoicesGenerated")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("sales.averageInvoice")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageInvoiceValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t("sales.perInvoice")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("sales.salesListing")}</h2>
        {isPending ? (
          <div className="flex h-64 items-center justify-center rounded-md border">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : (
          <SalesTable invoices={salesData.invoices} />
        )}
      </div>
    </div>
  );
}
