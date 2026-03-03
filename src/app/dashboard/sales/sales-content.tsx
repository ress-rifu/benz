"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText, Package, Wrench, X } from "lucide-react";
import { SalesHeader } from "./sales-header";
import { SalesTable } from "./sales-table";
import { SalesSearch } from "./sales-search";
import type { TimeFilter, DateRange, SalesData, ItemFilter } from "./actions";
import { getSalesData } from "./actions";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language/language-context";
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select";

interface SalesContentProps {
  initialData: SalesData;
  initialFilter: TimeFilter;
  initialSearch?: string;
  parts: { id: string; name: string }[];
  services: { id: string; name: string }[];
}

export function SalesContent({
  initialData,
  initialFilter,
  initialSearch,
  parts,
  services,
}: SalesContentProps) {
  const [salesData, setSalesData] = useState<SalesData>(initialData);
  const [currentFilter, setCurrentFilter] = useState<TimeFilter>(initialFilter);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { t } = useLanguage();

  // Build options for searchable selects
  const partOptions = useMemo(
    () => parts.map((p) => ({ value: p.id, label: p.name })),
    [parts]
  );
  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.name, label: s.name })),
    [services]
  );

  const hasItemFilter = selectedPartIds.length > 0 || selectedServiceNames.length > 0;

  // Build the item filter object
  const itemFilter: ItemFilter | undefined = hasItemFilter
    ? {
      partIds: selectedPartIds.length > 0 ? selectedPartIds : undefined,
      serviceNames: selectedServiceNames.length > 0 ? selectedServiceNames : undefined,
    }
    : undefined;

  // Refetch data when any filter changes
  useEffect(() => {
    startTransition(async () => {
      const data = await getSalesData(currentFilter, customDateRange, searchQuery, itemFilter);
      setSalesData(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentFilter, customDateRange, selectedPartIds, selectedServiceNames]);

  const handleFilterChange = (filter: TimeFilter, customRange?: DateRange) => {
    setCurrentFilter(filter);
    setCustomDateRange(customRange);
    startTransition(async () => {
      const data = await getSalesData(filter, customRange, searchQuery, itemFilter);
      setSalesData(data);
    });
  };

  const clearItemFilters = () => {
    setSelectedPartIds([]);
    setSelectedServiceNames([]);
  };

  const averageInvoiceValue =
    salesData.invoices.length > 0
      ? salesData.totalRevenue / salesData.invoices.length
      : 0;

  // Label for the filtered revenue card
  const filterLabel = [
    selectedPartIds.length > 0 ? `${selectedPartIds.length} Part${selectedPartIds.length > 1 ? "s" : ""}` : "",
    selectedServiceNames.length > 0 ? `${selectedServiceNames.length} Service${selectedServiceNames.length > 1 ? "s" : ""}` : "",
  ].filter(Boolean).join(" & ");

  return (
    <div className="space-y-6">
      <SalesHeader
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

      <SalesSearch />

      {/* Part & Service Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Filter by Parts
          </label>
          <MultiSearchableSelect
            options={partOptions}
            values={selectedPartIds}
            onValuesChange={setSelectedPartIds}
            placeholder="All Parts"
            searchPlaceholder="Search parts..."
            emptyMessage="No parts found."
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Filter by Services
          </label>
          <MultiSearchableSelect
            options={serviceOptions}
            values={selectedServiceNames}
            onValuesChange={setSelectedServiceNames}
            placeholder="All Services"
            searchPlaceholder="Search services..."
            emptyMessage="No services found."
          />
        </div>
        {hasItemFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearItemFilters}
            className="gap-1.5 shrink-0"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
              {isPending ? t("common.loading") : hasItemFilter ? "Invoices containing selected items" : t("sales.forPeriod")}
            </p>
          </CardContent>
        </Card>

        {/* Filtered item revenue — only visible when a filter is active */}
        {hasItemFilter && salesData.filteredItemRevenue !== null && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                {filterLabel} Revenue
              </CardTitle>
              {selectedPartIds.length > 0 && selectedServiceNames.length === 0 ? (
                <Package className="h-4 w-4 text-blue-500" />
              ) : selectedServiceNames.length > 0 && selectedPartIds.length === 0 ? (
                <Wrench className="h-4 w-4 text-blue-500" />
              ) : (
                <DollarSign className="h-4 w-4 text-blue-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                ${salesData.filteredItemRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-blue-600">
                {salesData.filteredItemQuantity ?? 0} units sold
              </p>
            </CardContent>
          </Card>
        )}

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
