import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getOrSet } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
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
  const supabase = await createClient();

  // Date calculations
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  return getOrSet(
    CACHE_KEYS.DASHBOARD_SUMMARY,
    async () => {
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
        // Low stock: parts where quantity is below min_stock_level
        supabase.from("parts").select("id, quantity, min_stock_level").eq("is_active", true),
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        // All invoices with status for revenue and outstanding calculations
        supabase.from("invoices").select("total, status"),
        supabase.from("invoices").select("total, status").gte("created_at", startOfWeek.toISOString()),
        supabase.from("invoices").select("total, status").gte("created_at", startOfMonth.toISOString()),
        supabase.from("invoices").select("total, status")
          .gte("created_at", startOfPrevMonth.toISOString())
          .lte("created_at", endOfPrevMonth.toISOString()),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("parts").select("*", { count: "exact", head: true }),
        supabase.from("invoices")
          .select("id, invoice_number, customer_name, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("invoices")
          .select("total, status, created_at")
          .gte("created_at", startOfWeek.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      // Calculate revenue from PAID invoices only
      const totalRevenue = allInvoicesResult.data?.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      
      // Calculate outstanding balance from DUE invoices
      const outstandingBalance = allInvoicesResult.data?.filter(inv => inv.status === "due")
        .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      
      const weeklyRevenue = weeklyInvoicesResult.data?.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      
      const monthlyRevenue = monthlyInvoicesResult.data?.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      
      const previousMonthRevenue = prevMonthInvoicesResult.data?.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

      const revenueGrowth = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Process daily revenue for last 7 days (paid invoices only)
      const dailyData: { [key: string]: { revenue: number; invoices: number } } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        dailyData[key] = { revenue: 0, invoices: 0 };
      }

      dailyInvoicesResult.data?.forEach((inv) => {
        if (inv.status === "paid") {
          const d = new Date(inv.created_at);
          const key = d.toLocaleDateString("en-US", { weekday: "short" });
          if (dailyData[key]) {
            dailyData[key].revenue += Number(inv.total);
            dailyData[key].invoices += 1;
          }
        }
      });

      const weeklyRevenueData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        invoices: data.invoices,
      }));

      // Calculate low stock items: parts where quantity < min_stock_level
      const lowStockItems = lowStockPartsResult.data?.filter(
        (part) => part.quantity < (part.min_stock_level || 5)
      ).length || 0;

      return {
        lowStockItems,
        totalInvoices: invoicesResult.count || 0,
        totalRevenue,
        outstandingBalance,
        totalCustomers: customersResult.count || 0,
        totalServices: servicesResult.count || 0,
        totalParts: partsResult.count || 0,
        weeklyRevenue,
        monthlyRevenue,
        previousMonthRevenue,
        revenueGrowth,
        recentInvoices: recentResult.data || [],
        weeklyRevenueData,
      };
    },
    CACHE_TTL.SHORT
  );
}

export async function DashboardContent({ isSuperAdmin }: DashboardContentProps) {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-6">
      {/* Key Metrics - Finance cards only for super admin */}
      {isSuperAdmin && (
        <FinanceCards summary={{
          monthlyRevenue: summary.monthlyRevenue,
          weeklyRevenue: summary.weeklyRevenue,
          totalRevenue: summary.totalRevenue,
          outstandingBalance: summary.outstandingBalance,
          revenueGrowth: summary.revenueGrowth,
        }} />
      )}

      {/* Secondary Metrics - Visible to all */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Services</CardTitle>
            <Wrench className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Parts</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalParts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.lowStockItems}</div>
          </CardContent>
        </Card>

        {!isSuperAdmin && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Total Invoices
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {summary.totalInvoices}
              </div>
              <p className="text-xs text-purple-600">All time</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts - Only for super admin */}
      {isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueBarChart
            data={summary.weeklyRevenueData}
            title="Revenue (Last 7 Days)"
          />
        </div>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentInvoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices yet</p>
          ) : (
            <div className="space-y-4">
              {summary.recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">
                      {invoice.invoice_number}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {invoice.customer_name}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col gap-2 sm:gap-0">
                    {isSuperAdmin && (
                      <p className="font-medium text-slate-900">
                        {formatCurrency(invoice.total)}
                      </p>
                    )}
                    <span className="text-xs text-slate-500">
                      {formatDate(invoice.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
