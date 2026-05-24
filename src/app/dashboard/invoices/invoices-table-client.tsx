"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileX, Eye } from "lucide-react";
import type { Tables } from "@/types/database";
import Link from "next/link";

interface InvoicesTableClientProps {
  invoices: (Tables<"invoices"> & {
    items: Tables<"invoice_items">[];
  })[];
  isSuperAdmin: boolean;
  hasFilters: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export function InvoicesTableClient({
  invoices,
  isSuperAdmin,
  hasFilters,
  total,
  page,
  pageSize,
}: InvoicesTableClientProps) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        {hasFilters ? (
          <>
            <FileX className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No invoices found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search criteria
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-500">No invoices yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first invoice to get started
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Total</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono text-sm">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.customer_name}
                </TableCell>
                <TableCell className="text-slate-500">
                  {invoice.vehicle_make} {invoice.vehicle_model}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell className="text-right font-medium">
                    <div>{formatCurrency(invoice.total)}</div>
                    {invoice.status === "due" && (invoice.advance_amount || 0) > 0 && (
                      <div className="text-xs text-orange-600 mt-0.5">
                        Due: {formatCurrency(invoice.total - (invoice.advance_amount || 0))}
                      </div>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={invoice.status === "paid" ? "default" : "secondary"}
                    className={
                      invoice.status === "paid"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-orange-500 hover:bg-orange-600"
                    }
                  >
                    {invoice.status === "paid" ? "Paid" : "Due"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500">
                  {formatDate(invoice.created_at)}
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/dashboard/invoices/${invoice.id}`}
            className="block rounded-lg border bg-white p-4 space-y-3 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm font-medium">{invoice.invoice_number}</p>
                <p className="text-sm font-medium text-slate-900">{invoice.customer_name}</p>
              </div>
              <Badge
                variant={invoice.status === "paid" ? "default" : "secondary"}
                className={
                  invoice.status === "paid"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-500 hover:bg-orange-600"
                }
              >
                {invoice.status === "paid" ? "Paid" : "Due"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {invoice.vehicle_make} {invoice.vehicle_model}
              </span>
              <span className="text-slate-500">{formatDate(invoice.created_at)}</span>
            </div>
            {isSuperAdmin && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-right font-semibold text-slate-900">
                  {formatCurrency(invoice.total)}
                </p>
                {invoice.status === "due" && (invoice.advance_amount || 0) > 0 && (
                  <p className="text-right text-xs text-orange-600 mt-0.5">
                    Due: {formatCurrency(invoice.total - (invoice.advance_amount || 0))}
                  </p>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  );
}

