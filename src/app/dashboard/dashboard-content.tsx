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

interface DashboardContentProps {
  isSuperAdmin: boolean;
}

interface DashboardSummary {
  lowStockItems: number;
  totalInvoices: number;
  totalRevenue: number;
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
        revenueResult,
        weeklyRevenueResult,
        monthlyRevenueResult,
        prevMonthRevenueResult,
        customersResult,
        servicesResult,
        partsResult,
        recentResult,
        dailyRevenueResult,
      ] = await Promise.all([
        // Low stock: parts where quantity is below min_stock_level
        supabase.from("parts").select("id, quantity, min_stock_level").eq("is_active", true),
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        // All invoices count as revenue (no status filter - invoices are created when paid)
        supabase.from("invoices").select("total"),
        supabase.from("invoices").select("total").gte("created_at", startOfWeek.toISOString()),
        supabase.from("invoices").select("total").gte("created_at", startOfMonth.toISOString()),
        supabase.from("invoices").select("total")
          .gte("created_at", startOfPrevMonth.toISOString())
          .lte("created_at", endOfPrevMonth.toISOString()),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("parts").select("*", { count: "exact", head: true }),
        supabase.from("invoices")
          .select("id, invoice_number, customer_name, total, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("invoices")
          .select("total, created_at")
          .gte("created_at", startOfWeek.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const weeklyRevenue = weeklyRevenueResult.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const monthlyRevenue = monthlyRevenueResult.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      const previousMonthRevenue = prevMonthRevenueResult.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

      const revenueGrowth = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Process daily revenue for last 7 days
      const dailyData: { [key: string]: { revenue: number; invoices: number } } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        dailyData[key] = { revenue: 0, invoices: 0 };
      }

      dailyRevenueResult.data?.forEach((inv) => {
        const d = new Date(inv.created_at);
        const key = d.toLocaleDateString("en-US", { weekday: "short" });
        if (dailyData[key]) {
          dailyData[key].revenue += Number(inv.total);
          dailyData[key].invoices += 1;
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                This Month Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(summary.monthlyRevenue)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {summary.revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{summary.revenueGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">{summary.revenueGrowth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-slate-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                This Week Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {formatCurrency(summary.weeklyRevenue)}
              </div>
              <p className="text-xs text-blue-600">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-amber-600">All time</p>
            </CardContent>
          </Card>

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
        </div>
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
