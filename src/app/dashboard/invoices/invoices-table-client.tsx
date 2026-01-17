"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileX } from "lucide-react";
import type { Tables } from "@/types/database";
import { InvoiceModal } from "./invoice-modal";

interface InvoicesTableClientProps {
  invoices: (Tables<"invoices"> & {
    items: Tables<"invoice_items">[];
  })[];
  isSuperAdmin: boolean;
  hasFilters: boolean;
}

export function InvoicesTableClient({ invoices, isSuperAdmin, hasFilters }: InvoicesTableClientProps) {
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
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Total</TableHead>}
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
                    {formatCurrency(invoice.total)}
                  </TableCell>
                )}
                <TableCell className="text-slate-500">
                  {formatDate(invoice.created_at)}
                </TableCell>
                <TableCell>
                  <InvoiceModal
                    invoice={invoice}
                    items={invoice.items}
                    isSuperAdmin={isSuperAdmin}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-lg border bg-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm font-medium">{invoice.invoice_number}</p>
                <p className="text-sm font-medium text-slate-900">{invoice.customer_name}</p>
              </div>
              <InvoiceModal
                invoice={invoice}
                items={invoice.items}
                isSuperAdmin={isSuperAdmin}
              />
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
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
