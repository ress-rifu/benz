"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type TimeFilter = "today" | "week" | "month" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export interface SalesData {
  invoices: (Omit<Tables<"invoices">, "status"> & { status: "Paid" | "Due" })[];
  totalRevenue: number;
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
 * Fetch sales data (invoices) with time-based filtering
 * Only includes PAID invoices in revenue calculations
 */
export async function getSalesData(
  filter: TimeFilter,
  customRange?: DateRange,
  searchQuery?: string
): Promise<SalesData> {
  const supabase = await createClient();
  const dateRange = getDateRange(filter, customRange);

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
