"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useLanguage } from "@/lib/language/language-context";

interface DashboardSummary {
  monthlyRevenue: number;
  weeklyRevenue: number;
  totalRevenue: number;
  outstandingBalance: number;
  revenueGrowth: number;
}

interface FinanceCardsProps {
  summary: DashboardSummary;
}

export function FinanceCards({ summary }: FinanceCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            {t("dashboard.monthlyRevenue")}
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
            {t("dashboard.weeklyRevenue")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">
            {formatCurrency(summary.weeklyRevenue)}
          </div>
          <p className="text-xs text-blue-600">Paid invoices, last 7 days</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">
            {t("dashboard.totalRevenue")}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <p className="text-xs text-amber-600">All paid invoices</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">
            {t("dashboard.outstandingBalance")}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">
            {formatCurrency(summary.outstandingBalance)}
          </div>
          <p className="text-xs text-orange-600">Due invoices</p>
        </CardContent>
      </Card>
    </div>
  );
}
