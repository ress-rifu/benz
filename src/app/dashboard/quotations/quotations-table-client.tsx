"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileX, Eye, Pencil } from "lucide-react";
import type { Tables } from "@/types/database";
import Link from "next/link";

interface QuotationsTableClientProps {
  quotations: (Tables<"quotations"> & {
    items: Tables<"quotation_items">[];
  })[];
  isSuperAdmin: boolean;
  hasFilters: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export function QuotationsTableClient({
  quotations,
  isSuperAdmin,
  hasFilters,
  total,
  page,
  pageSize,
}: QuotationsTableClientProps) {
  if (quotations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        {hasFilters ? (
          <>
            <FileX className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No quotations found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search criteria
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-500">No quotations yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first quotation to get started
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
              <TableHead>Quotation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Total</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-mono text-sm">
                  {quotation.quotation_number}
                </TableCell>
                <TableCell className="font-medium">
                  {quotation.customer_name}
                </TableCell>
                <TableCell className="text-slate-500">
                  {quotation.vehicle_make} {quotation.vehicle_model}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell className="text-right font-medium">
                    {formatCurrency(quotation.total)}
                  </TableCell>
                )}
                <TableCell className="text-slate-500">
                  {formatDate(quotation.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/quotations/${quotation.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {quotations.map((quotation) => (
          <div
            key={quotation.id}
            className="block rounded-lg border bg-white p-4 space-y-3 hover:border-slate-400 transition-colors cursor-pointer"
            onClick={() => window.location.href = `/dashboard/quotations/${quotation.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm font-medium">{quotation.quotation_number}</p>
                <p className="text-sm font-medium text-slate-900">{quotation.customer_name}</p>
              </div>
              <Button asChild variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {quotation.vehicle_make} {quotation.vehicle_model}
              </span>
              <span className="text-slate-500">{formatDate(quotation.created_at)}</span>
            </div>
            {isSuperAdmin && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-right font-semibold text-slate-900">
                  {formatCurrency(quotation.total)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination total={total} page={page} pageSize={pageSize} />
    </div>
  );
}
