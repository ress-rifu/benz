"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type TimeFilter = "today" | "week" | "month" | "all" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export interface ItemFilter {
  partIds?: string[];
  serviceNames?: string[];
}

export interface SalesData {
  invoices: (Omit<Tables<"invoices">, "status"> & { status: "Paid" | "Due" })[];
  totalRevenue: number;
  /** Revenue from only the filtered item lines (set when part/service filters are active) */
  filteredItemRevenue: number | null;
  /** Total quantity sold for the filtered items */
  filteredItemQuantity: number | null;
}

/**
 * Get date range boundaries based on filter type
 */
function getDateRange(filter: TimeFilter, customRange?: DateRange): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return {
        from: today.toISOString(),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };

    case "week": {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      return {
        from: monday.toISOString(),
        to: sunday.toISOString(),
      };
    }

    case "month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        from: firstDay.toISOString(),
        to: lastDay.toISOString(),
      };
    }

    case "all":
      return {
        from: new Date("2000-01-01").toISOString(),
        to: new Date("2099-12-31").toISOString(),
      };

    case "custom":
      if (!customRange) {
        throw new Error("Custom range requires from and to dates");
      }
      return customRange;

    default:
      throw new Error(`Invalid filter: ${filter}`);
  }
}

/**
 * Fetch sales data (invoices) with time-based filtering and optional part/service filtering.
 * Only includes PAID invoices in revenue calculations.
 */
export async function getSalesData(
  filter: TimeFilter,
  customRange?: DateRange,
  searchQuery?: string,
  itemFilter?: ItemFilter
): Promise<SalesData> {
  const supabase = await createClient();
  const dateRange = getDateRange(filter, customRange);

  const hasPartFilter = itemFilter?.partIds && itemFilter.partIds.length > 0;
  const hasServiceFilter = itemFilter?.serviceNames && itemFilter.serviceNames.length > 0;
  const hasItemFilter = hasPartFilter || hasServiceFilter;

  // If filtering by parts or services, find matching invoice IDs
  let filteredInvoiceIds: string[] | null = null;
  let filteredItemRevenue: number | null = null;
  let filteredItemQuantity: number | null = null;

  if (hasItemFilter) {
    // First get all invoice IDs in the date range
    const { data: dateInvoices } = await supabase
      .from("invoices")
      .select("id")
      .gte("created_at", dateRange.from)
      .lt("created_at", dateRange.to);

    const dateInvoiceIds = (dateInvoices || []).map((inv) => inv.id);

    if (dateInvoiceIds.length > 0) {
      // Build queries for parts and services separately, then merge results
      const allMatchingItems: { invoice_id: string; total: number; quantity: number }[] = [];

      if (hasPartFilter) {
        const { data: partItems } = await supabase
          .from("invoice_items")
          .select("invoice_id, total, quantity")
          .in("invoice_id", dateInvoiceIds)
          .in("part_id", itemFilter!.partIds!);
        if (partItems) allMatchingItems.push(...partItems);
      }

      if (hasServiceFilter) {
        const { data: serviceItems } = await supabase
          .from("invoice_items")
          .select("invoice_id, total, quantity")
          .in("invoice_id", dateInvoiceIds)
          .eq("type", "service")
          .in("description", itemFilter!.serviceNames!);
        if (serviceItems) allMatchingItems.push(...serviceItems);
      }

      // Get unique invoice IDs and calculate filtered item revenue
      const uniqueIds = new Set<string>();
      let itemRevenue = 0;
      let itemQuantity = 0;
      allMatchingItems.forEach((item) => {
        uniqueIds.add(item.invoice_id);
        itemRevenue += Number(item.total);
        itemQuantity += Number(item.quantity);
      });

      filteredInvoiceIds = Array.from(uniqueIds);
      filteredItemRevenue = itemRevenue;
      filteredItemQuantity = itemQuantity;
    } else {
      filteredInvoiceIds = [];
      filteredItemRevenue = 0;
      filteredItemQuantity = 0;
    }
  }

  // Fetch all invoices within the date range (both paid and due for display)
  let query = supabase
    .from("invoices")
    .select("*")
    .gte("created_at", dateRange.from)
    .lt("created_at", dateRange.to)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `invoice_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%`
    );
  }

  // Apply item filter — only show invoices containing the selected part/service
  if (filteredInvoiceIds !== null) {
    if (filteredInvoiceIds.length === 0) {
      // No matching invoices
      return {
        invoices: [],
        totalRevenue: 0,
        filteredItemRevenue: 0,
        filteredItemQuantity: 0,
      };
    }
    query = query.in("id", filteredInvoiceIds);
  }

  const { data: allInvoices, error } = await query;

  if (error) {
    console.error("Error fetching sales data:", error);
    throw new Error("Failed to fetch sales data");
  }

  // Calculate total revenue from PAID invoices only
  const totalRevenue = (allInvoices || [])
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);

  // Map invoices to include status as-is (no hardcoding to "Paid")
  const invoicesWithStatus = (allInvoices || []).map((invoice) => ({
    ...invoice,
    status: invoice.status === "paid" ? ("Paid" as const) : ("Due" as const),
  }));

  return {
    invoices: invoicesWithStatus,
    totalRevenue,
    filteredItemRevenue,
    filteredItemQuantity,
  };
}

/**
 * Get summary statistics for sales
 */
export async function getSalesSummary(
  filter: TimeFilter,
  customRange?: DateRange,
  searchQuery?: string
) {
  const { invoices, totalRevenue } = await getSalesData(filter, customRange, searchQuery);

  return {
    totalRevenue,
    invoiceCount: invoices.length,
    averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
  };
}
