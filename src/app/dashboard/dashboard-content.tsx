import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
} from "lucide-react";
import { RevenueBarChart } from "./components/revenue-charts";
import { FinanceCards } from "./components/finance-cards";
import {
  getLast7DaysRange,
  getMonthRange,
  getPreviousMonthRange,
  getBusinessWeekdayKey,
  getLastNWeekdayKeys,
} from "@/lib/timezone";

interface DashboardContentProps {
  isSuperAdmin: boolean;
}

interface DashboardSummary {
  lowStockItems: number;
  totalInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  totalCustomers: number;
  totalServices: number;
  totalParts: number;
  totalInventoryValue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  recentInvoices: {
    id: string;
    invoice_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
  weeklyRevenueData: { date: string; revenue: number; invoices: number }[];
}

async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const supabase = await createClient();

    // Date boundaries computed in the business timezone (Asia/Dhaka) so they
    // are correct regardless of the server's local timezone (Vercel = UTC).
    const last7Days = getLast7DaysRange();
    const thisMonth = getMonthRange();
    const prevMonth = getPreviousMonthRange();

    const [
      lowStockPartsResult,
      invoicesResult,
      allInvoicesResult,
      weeklyInvoicesResult,
      monthlyInvoicesResult,
      prevMonthInvoicesResult,
      customersResult,
      servicesResult,
      partsResult,
      recentResult,
      dailyInvoicesResult,
    ] = await Promise.all([
      supabase.from("parts").select("id, quantity, min_stock_level").eq("is_active", true),
      supabase.from("invoices").select("*", { count: "exact", head: true }),
      supabase.from("invoices").select("total, status, advance_amount"),
      supabase.from("invoices").select("total, status, advance_amount")
        .gte("created_at", last7Days.from)
        .lt("created_at", last7Days.to),
      supabase.from("invoices").select("total, status, advance_amount")
        .gte("created_at", thisMonth.from)
        .lt("created_at", thisMonth.to),
      supabase.from("invoices").select("total, status, advance_amount")
        .gte("created_at", prevMonth.from)
        .lt("created_at", prevMonth.to),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("parts").select("quantity, cost_price").eq("is_active", true),
      supabase.from("invoices")
        .select("id, invoice_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("invoices")
        .select("total, status, advance_amount, created_at")
        .gte("created_at", last7Days.from)
        .lt("created_at", last7Days.to)
        .order("created_at", { ascending: true }),
    ]);

    // Calculate revenue from PAID invoices (total) + DUE invoices (advance_amount)
    const totalRevenue = (allInvoicesResult.data?.filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.total), 0) || 0) +
      (allInvoicesResult.data?.filter(inv => inv.status === "due")
      .reduce((sum, inv) => sum + Number((inv as any).advance_amount || 0), 0) || 0);

    // Calculate outstanding balance from DUE invoices (total - advance)
    const outstandingBalance = allInvoicesResult.data?.filter(inv => inv.status === "due")
      .reduce((sum, inv) => sum + Number(inv.total) - Number((inv as any).advance_amount || 0), 0) || 0;

    const weeklyRevenue = (weeklyInvoicesResult.data?.filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.total), 0) || 0) +
      (weeklyInvoicesResult.data?.filter(inv => inv.status === "due")
      .reduce((sum, inv) => sum + Number((inv as any).advance_amount || 0), 0) || 0);

    const monthlyRevenue = (monthlyInvoicesResult.data?.filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.total), 0) || 0) +
      (monthlyInvoicesResult.data?.filter(inv => inv.status === "due")
      .reduce((sum, inv) => sum + Number((inv as any).advance_amount || 0), 0) || 0);

    const previousMonthRevenue = (prevMonthInvoicesResult.data?.filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.total), 0) || 0) +
      (prevMonthInvoicesResult.data?.filter(inv => inv.status === "due")
      .reduce((sum, inv) => sum + Number((inv as any).advance_amount || 0), 0) || 0);

    const revenueGrowth = previousMonthRevenue > 0
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // Process daily revenue for last 7 days (paid invoices total + due invoices advance_amount).
    // Keys come from the business TZ so an invoice created at e.g. 1 AM Dhaka
    // doesn't get bucketed into the previous weekday in UTC.
    const orderedKeys = getLastNWeekdayKeys(7);
    const dailyData: { [key: string]: { revenue: number; invoices: number } } = {};
    for (const key of orderedKeys) {
      dailyData[key] = { revenue: 0, invoices: 0 };
    }

    dailyInvoicesResult.data?.forEach((inv) => {
      let revenueContrib = 0;
      if (inv.status === "paid") {
        revenueContrib = Number(inv.total);
      } else if (inv.status === "due" && (inv as any).advance_amount) {
        revenueContrib = Number((inv as any).advance_amount);
      }

      if (revenueContrib > 0) {
        const key = getBusinessWeekdayKey(inv.created_at);
        if (dailyData[key]) {
          dailyData[key].revenue += revenueContrib;
          dailyData[key].invoices += 1;
        }
      }
    });

    const weeklyRevenueData = orderedKeys.map((date) => ({
      date,
      revenue: dailyData[date].revenue,
      invoices: dailyData[date].invoices,
    }));

    // Calculate low stock items: parts where quantity < min_stock_level
    const lowStockItems = lowStockPartsResult.data?.filter(
      (part) => part.quantity < (part.min_stock_level || 5)
    ).length || 0;

    const totalParts = partsResult.data?.length || 0;
    const totalInventoryValue = partsResult.data?.reduce(
      (sum, part) => sum + (Number(part.cost_price || 0) * Number(part.quantity || 0)),
      0
    ) || 0;

    return {
      lowStockItems,
      totalInvoices: invoicesResult.count || 0,
      totalRevenue,
      outstandingBalance,
      totalCustomers: customersResult.count || 0,
      totalServices: servicesResult.count || 0,
      totalParts,
      totalInventoryValue,
      weeklyRevenue,
      monthlyRevenue,
      previousMonthRevenue,
      revenueGrowth,
      recentInvoices: recentResult.data || [],
      weeklyRevenueData,
    };
  } catch (error) {
    console.error("Dashboard summary error:", error);
    // Return safe defaults on error
    return {
      lowStockItems: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      totalCustomers: 0,
      totalServices: 0,
      totalParts: 0,
      totalInventoryValue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      previousMonthRevenue: 0,
      revenueGrowth: 0,
      recentInvoices: [],
      weeklyRevenueData: [],
    };
  }
}

import { DashboardContentClient } from "./components/dashboard-content-client";
import { getOrSet } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";

export async function DashboardContent({ isSuperAdmin }: DashboardContentProps) {
  const summary = await getOrSet(
    CACHE_KEYS.DASHBOARD_SUMMARY,
    () => getDashboardSummary(),
    CACHE_TTL.SHORT
  );

  return <DashboardContentClient isSuperAdmin={isSuperAdmin} summary={summary} />;
}
