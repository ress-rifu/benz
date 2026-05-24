"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  Users,
  Wrench,
} from "lucide-react";
import { FinanceCards } from "./finance-cards";
import { useLanguage } from "@/lib/language/language-context";
import dynamic from "next/dynamic";

const RevenueBarChart = dynamic(
  () => import("./revenue-charts").then((mod) => mod.RevenueBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-center animate-pulse">
        <div className="h-6 w-32 bg-slate-200/80 rounded-md" />
      </div>
    ),
  }
);

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

interface DashboardContentClientProps {
  isSuperAdmin: boolean;
  summary: DashboardSummary;
}

export function DashboardContentClient({ isSuperAdmin, summary }: DashboardContentClientProps) {
  const { t } = useLanguage();

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
          totalInventoryValue: summary.totalInventoryValue,
        }} />
      )}

      {/* Secondary Metrics - Visible to all */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t("dashboard.customers")}
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t("dashboard.services")}
            </CardTitle>
            <Wrench className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t("dashboard.parts")}
            </CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{summary.totalParts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t("dashboard.lowStockAlert")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.lowStockItems}</div>
          </CardContent>
        </Card>

        {!isSuperAdmin && (
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                {t("dashboard.invoices")}
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {summary.totalInvoices}
              </div>
              <p className="text-xs text-purple-600">{t("dashboard.allTime")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts - Only for super admin */}
      {isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueBarChart
            data={summary.weeklyRevenueData}
            title={t("dashboard.revenueLast7Days")}
          />
        </div>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentInvoices")}</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentInvoices.length === 0 ? (
            <p className="text-sm text-slate-500">{t("dashboard.noInvoices")}</p>
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
